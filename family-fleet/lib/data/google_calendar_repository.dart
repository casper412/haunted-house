import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/calendar/v3.dart' as gcal;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../config/google_calendar_config.dart';
import '../domain/fleet.dart';

const _calendarScopes = [
  gcal.CalendarApi.calendarCalendarlistReadonlyScope,
  gcal.CalendarApi.calendarEventsScope,
];

class GoogleCalendarConnection {
  GoogleCalendarConnection();

  final GoogleSignIn _signIn = GoogleSignIn.instance;
  Future<void>? _initializing;
  GoogleSignInAccount? _account;

  bool get isConfigured => isGoogleCalendarConfigured;
  GoogleSignInAccount? get account => _account;
  Stream<GoogleSignInAuthenticationEvent> get authenticationEvents =>
      _signIn.authenticationEvents;

  Future<void> initialize() {
    if (!isConfigured) {
      throw StateError(
        'Add the Google OAuth client ID for this platform first.',
      );
    }
    return _initializing ??= _signIn.initialize(
      clientId: kIsWeb ? googleWebClientId : googleIosClientId,
    );
  }

  Future<GoogleSignInAccount?> restoreAccount() async {
    if (!isConfigured) return null;
    await initialize();
    final restore = _signIn.attemptLightweightAuthentication();
    if (restore != null) _account = await restore;
    return _account;
  }

  Future<GoogleSignInAccount> connect() async {
    if (kIsWeb) {
      throw StateError('Use the Google sign-in button in your browser.');
    }
    await initialize();
    _account = await _signIn.authenticate();
    await _authorization(prompt: true);
    return _account!;
  }

  void acceptBrowserAccount(GoogleSignInAccount account) {
    _account = account;
  }

  Future<void> disconnect() async {
    if (!isConfigured) return;
    await initialize();
    await _signIn.signOut();
    _account = null;
  }

  Future<List<gcal.CalendarListEntry>> listWritableCalendars() async {
    final api = await calendarApi(promptForAuthorization: true);
    final calendars = <gcal.CalendarListEntry>[];
    String? pageToken;
    do {
      final page = await api.calendarList.list(
        minAccessRole: 'writer',
        maxResults: 250,
        pageToken: pageToken,
      );
      calendars.addAll(page.items ?? const []);
      pageToken = page.nextPageToken;
    } while (pageToken != null);
    return calendars;
  }

  Future<gcal.CalendarApi> calendarApi({
    bool promptForAuthorization = false,
  }) async {
    final auth = await _authorization(prompt: promptForAuthorization);
    return gcal.CalendarApi(_AuthorizedHttpClient(auth.accessToken));
  }

  Future<GoogleSignInClientAuthorization> _authorization({
    required bool prompt,
  }) async {
    if (_account == null) {
      if (!prompt) throw StateError('Connect a Google account first.');
      await connect();
    }
    final authorization = await _account!.authorizationClient
        .authorizationForScopes(_calendarScopes);
    if (authorization != null) return authorization;
    if (!prompt) {
      throw StateError('Calendar access needs to be approved in Settings.');
    }
    return _account!.authorizationClient.authorizeScopes(_calendarScopes);
  }
}

class GoogleCalendarRepository implements CalendarRepository {
  GoogleCalendarRepository({
    required this.connection,
    required this.calendarIds,
  });

  final GoogleCalendarConnection connection;
  final Map<String, String> calendarIds;

  @override
  Future<List<FamilyMember>> getMembers() async => familyRoster;

  @override
  Future<List<FleetCar>> getCars() async => fleetVehicles;

  @override
  Future<List<Assignment>> getAssignments() async {
    final api = await connection.calendarApi();
    final assignments = <Assignment>[];
    for (final car in fleetVehicles) {
      final calendarId = calendarIds[car.id];
      if (calendarId == null) continue;
      final events = await _eventsFor(api, calendarId);
      final exceptions = <String, Set<DateTime>>{};
      for (final event in events.where(
        (event) => event.recurringEventId != null,
      )) {
        final originalDay = _eventDate(event.originalStartTime);
        if (originalDay != null) {
          exceptions
              .putIfAbsent(event.recurringEventId!, () => {})
              .add(_day(originalDay));
        }
      }
      for (final event in events) {
        if (event.status == 'cancelled') continue;
        final start = _eventDate(event.start);
        final end = _eventDate(event.end);
        if (start == null || end == null || event.id == null) continue;
        assignments.add(
          _assignmentFromEvent(
            event,
            calendarId: calendarId,
            carId: car.id,
            start: start,
            end: end,
            exceptionDays: exceptions[event.id] ?? const {},
          ),
        );
      }
    }
    for (final entry in defaultMemberByCar.entries) {
      assignments.add(
        Assignment(
          id: 'default:${entry.key}',
          carId: entry.key,
          memberId: entry.value,
          title: 'Default car assignment',
          start: DateTime(2000),
          end: DateTime(2000, 1, 2),
          kind: AssignmentKind.defaultAssignment,
          recurrence: Recurrence.daily,
          allDay: true,
        ),
      );
    }
    return assignments;
  }

  @override
  Future<void> saveAssignment(Assignment assignment) async {
    final calendarId =
        assignment.externalCalendarId ?? calendarIds[assignment.carId];
    if (calendarId == null) {
      throw StateError(
        'Choose a Google Calendar for this vehicle in Settings.',
      );
    }
    final api = await connection.calendarApi();
    final driver = familyRoster.where(
      (member) => member.id == assignment.memberId,
    );
    final driverName = driver.isEmpty ? 'Unassigned' : driver.first.name;
    final existingEventId =
        assignment.externalEventId ??
        _eventIdFromAssignmentId(assignment.id, calendarId);
    final eventId = existingEventId ?? familyFleetGoogleEventId(assignment);
    final privateProperties = <String, String>{
      'familyFleet': 'true',
      'familyFleetCarId': assignment.carId,
      'familyFleetMemberId': assignment.memberId,
      'familyFleetAssignmentKind': assignment.kind.name,
    };
    final startDate = DateTime(
      assignment.start.year,
      assignment.start.month,
      assignment.start.day,
    );
    final endDate = DateTime(
      assignment.end.year,
      assignment.end.month,
      assignment.end.day,
    );
    final event = gcal.Event(
      id: eventId,
      summary: assignment.title,
      start: assignment.allDay
          ? gcal.EventDateTime(date: startDate)
          : gcal.EventDateTime(
              dateTime: assignment.start,
              timeZone: assignment.start.timeZoneName == 'UTC'
                  ? 'UTC'
                  : _ianaTimeZoneName(),
            ),
      end: assignment.allDay
          ? gcal.EventDateTime(date: endDate)
          : gcal.EventDateTime(
              dateTime: assignment.end,
              timeZone: assignment.start.timeZoneName == 'UTC'
                  ? 'UTC'
                  : _ianaTimeZoneName(),
            ),
      recurrence: _recurrenceRules(assignment) ?? const [],
      extendedProperties: gcal.EventExtendedProperties(
        private: privateProperties,
      ),
      description: assignment.externalEventId == null
          ? 'Driver: $driverName'
          : null,
    );
    if (existingEventId != null) {
      await api.events.patch(event, calendarId, existingEventId);
    } else {
      try {
        await api.events.insert(event, calendarId);
      } on gcal.DetailedApiRequestError catch (error) {
        if (error.status != 409) rethrow;
        // A repeated save uses the same content-derived ID. If its first
        // request reached Google but the response was lost, update that event.
        await api.events.patch(event, calendarId, eventId);
      }
    }
  }

  @override
  Future<void> deleteAssignment(String id) async {
    final assignments = await getAssignments();
    final assignment = assignments.where((item) => item.id == id).firstOrNull;
    if (assignment?.externalEventId == null ||
        assignment?.externalCalendarId == null) {
      return;
    }
    final api = await connection.calendarApi();
    await api.events.delete(
      assignment!.externalCalendarId!,
      assignment.externalEventId!,
    );
  }
}

String? _eventIdFromAssignmentId(String assignmentId, String calendarId) {
  final prefix = '$calendarId::';
  if (!assignmentId.startsWith(prefix)) return null;
  final eventId = assignmentId.substring(prefix.length);
  return eventId.isEmpty ? null : eventId;
}

String familyFleetGoogleEventId(Assignment assignment) {
  final key = [
    assignment.carId,
    assignment.memberId,
    assignment.title,
    assignment.start.toIso8601String(),
    assignment.end.toIso8601String(),
    assignment.allDay,
    assignment.recurrence.name,
    (assignment.weekdays.toList()..sort()).join(','),
    assignment.recurrenceEnd?.toIso8601String() ?? '',
  ].join('\u001f');
  final mask = (BigInt.one << 64) - BigInt.one;
  final prime = BigInt.parse('1099511628211');
  var hash = BigInt.parse('14695981039346656037');
  for (final codeUnit in key.codeUnits) {
    hash = ((hash ^ BigInt.from(codeUnit)) * prime) & mask;
  }
  // Google Calendar event IDs allow lowercase base32hex characters.
  return 'ff${hash.toRadixString(32)}';
}

Map<String, String> suggestCalendarMappings({
  required List<FleetCar> cars,
  required List<gcal.CalendarListEntry> calendars,
  required Map<String, String> current,
}) {
  final byId = {
    for (final calendar in calendars)
      if (calendar.id != null) calendar.id!: calendar,
  };
  final result = <String, String>{};
  final usedIds = <String>{};
  for (final car in cars) {
    final id = current[car.id];
    if (id != null && byId.containsKey(id) && usedIds.add(id)) {
      result[car.id] = id;
    }
  }
  for (final car in cars) {
    if (result.containsKey(car.id)) continue;
    final wanted = car.name.trim().toLowerCase();
    for (final calendar in calendars) {
      final id = calendar.id;
      if (id != null &&
          !usedIds.contains(id) &&
          calendar.summary?.trim().toLowerCase() == wanted) {
        result[car.id] = id;
        usedIds.add(id);
        break;
      }
    }
  }
  return result;
}

class GoogleCalendarMappingStore {
  static const _prefix = 'googleCalendarForCar.';
  static const _activeKey = 'googleCalendarActive';

  Future<bool> isActive() async =>
      (await SharedPreferences.getInstance()).getBool(_activeKey) ?? false;

  Future<void> setActive(bool active) async =>
      (await SharedPreferences.getInstance()).setBool(_activeKey, active);

  Future<Map<String, String>> load() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      for (final car in fleetVehicles)
        if (prefs.getString('$_prefix${car.id}') case final String value)
          car.id: value,
    };
  }

  Future<void> save(Map<String, String> mappings) async {
    final prefs = await SharedPreferences.getInstance();
    for (final car in fleetVehicles) {
      final calendarId = mappings[car.id];
      if (calendarId == null) {
        await prefs.remove('$_prefix${car.id}');
      } else {
        await prefs.setString('$_prefix${car.id}', calendarId);
      }
    }
  }
}

Future<List<gcal.Event>> _eventsFor(
  gcal.CalendarApi api,
  String calendarId,
) async {
  final events = <gcal.Event>[];
  String? pageToken;
  do {
    final page = await api.events.list(
      calendarId,
      maxResults: 2500,
      pageToken: pageToken,
      showDeleted: true,
      singleEvents: false,
    );
    events.addAll(page.items ?? const []);
    pageToken = page.nextPageToken;
  } while (pageToken != null);
  return events;
}

Assignment _assignmentFromEvent(
  gcal.Event event, {
  required String calendarId,
  required String carId,
  required DateTime start,
  required DateTime end,
  required Set<DateTime> exceptionDays,
}) {
  final private = event.extendedProperties?.private ?? const <String, String>{};
  final memberId =
      private['familyFleetMemberId'] ??
      _memberFromEventText(event.summary, event.description);
  final rule = event.recurrence?.firstWhere(
    (item) => item.startsWith('RRULE:'),
    orElse: () => '',
  );
  final recurrence = _recurrenceFromRule(rule ?? '');
  final originalDay = _eventDate(event.originalStartTime);
  final allDay = event.start?.date != null;
  final kind = event.recurringEventId != null
      ? AssignmentKind.override
      : _kindFromString(private['familyFleetAssignmentKind']) ??
            (recurrence == Recurrence.once
                ? AssignmentKind.oneTime
                : AssignmentKind.recurring);
  final excluded = {...exceptionDays, ..._exdates(event.recurrence)};
  final id = '$calendarId::${event.id}';
  return Assignment(
    id: id,
    carId: carId,
    memberId: memberId,
    title: event.summary?.trim().isNotEmpty == true
        ? event.summary!.trim()
        : 'Untitled assignment',
    start: start,
    end: end,
    kind: kind,
    recurrence: event.recurringEventId == null ? recurrence : Recurrence.once,
    weekdays: _weekdaysFromRule(rule ?? '', start.weekday),
    recurrenceEnd: _recurrenceEndFromRule(rule ?? ''),
    allDay: allDay,
    excludedOccurrenceDates: {
      ...excluded,
      if (event.recurringEventId != null && originalDay != null)
        _day(originalDay),
    },
    externalEventId: event.id,
    externalCalendarId: calendarId,
  );
}

String _memberFromEventText(String? summary, String? description) {
  final driverLabel = RegExp(
    r'(?:^|\n)\s*Driver\s*:\s*([^\r\n]+)',
    caseSensitive: false,
  ).firstMatch(description ?? '')?.group(1)?.trim();
  if (driverLabel != null && driverLabel.isNotEmpty) {
    for (final member in familyRoster) {
      if (member.name.toLowerCase() == driverLabel.toLowerCase()) {
        return member.id;
      }
    }
  }

  final content = '${summary ?? ''}\n${description ?? ''}';
  for (final member in familyRoster) {
    if (RegExp(
      '\\b${RegExp.escape(member.name)}\\b',
      caseSensitive: false,
    ).hasMatch(content)) {
      return member.id;
    }
  }
  return unassignedDriverId;
}

DateTime? _eventDate(gcal.EventDateTime? value) {
  if (value?.dateTime != null) return value!.dateTime!.toLocal();
  if (value?.date != null) {
    final date = value!.date!;
    return DateTime(date.year, date.month, date.day);
  }
  return null;
}

DateTime _day(DateTime value) => DateTime(value.year, value.month, value.day);

Recurrence _recurrenceFromRule(String rule) {
  if (rule.contains('FREQ=DAILY')) return Recurrence.daily;
  if (rule.contains('FREQ=WEEKLY')) return Recurrence.weekly;
  if (rule.contains('FREQ=MONTHLY')) return Recurrence.monthly;
  return Recurrence.once;
}

Set<int> _weekdaysFromRule(String rule, int defaultDay) {
  final byDay = RegExp(r'(?:^|;)BYDAY=([^;]+)').firstMatch(rule)?.group(1);
  if (byDay == null) return {defaultDay};
  const weekdays = {
    'MO': DateTime.monday,
    'TU': DateTime.tuesday,
    'WE': DateTime.wednesday,
    'TH': DateTime.thursday,
    'FR': DateTime.friday,
    'SA': DateTime.saturday,
    'SU': DateTime.sunday,
  };
  return byDay.split(',').map((day) => weekdays[day] ?? defaultDay).toSet();
}

DateTime? _recurrenceEndFromRule(String rule) {
  final until = RegExp(r'(?:^|;)UNTIL=([^;]+)').firstMatch(rule)?.group(1);
  if (until == null || until.length < 8) return null;
  return DateTime.tryParse(
    '${until.substring(0, 4)}-${until.substring(4, 6)}-${until.substring(6, 8)}',
  );
}

Set<DateTime> _exdates(List<String>? recurrence) {
  final dates = <DateTime>{};
  for (final line in recurrence ?? const <String>[]) {
    if (!line.startsWith('EXDATE')) continue;
    final values = line.split(':').last.split(',');
    for (final value in values) {
      if (value.length < 8) continue;
      final date = DateTime.tryParse(
        '${value.substring(0, 4)}-${value.substring(4, 6)}-${value.substring(6, 8)}',
      );
      if (date != null) dates.add(_day(date));
    }
  }
  return dates;
}

AssignmentKind? _kindFromString(String? value) {
  for (final kind in AssignmentKind.values) {
    if (kind.name == value) return kind;
  }
  return null;
}

List<String>? _recurrenceRules(Assignment assignment) {
  if (assignment.recurrence == Recurrence.once) return null;
  final frequency = switch (assignment.recurrence) {
    Recurrence.once => '',
    Recurrence.daily => 'DAILY',
    Recurrence.weekly => 'WEEKLY',
    Recurrence.monthly => 'MONTHLY',
  };
  final parts = <String>['FREQ=$frequency'];
  if (assignment.recurrence == Recurrence.weekly) {
    const weekdays = {
      DateTime.monday: 'MO',
      DateTime.tuesday: 'TU',
      DateTime.wednesday: 'WE',
      DateTime.thursday: 'TH',
      DateTime.friday: 'FR',
      DateTime.saturday: 'SA',
      DateTime.sunday: 'SU',
    };
    final days = assignment.weekdays.isEmpty
        ? {assignment.start.weekday}
        : assignment.weekdays;
    final ordered = days.toList()..sort();
    parts.add('BYDAY=${ordered.map((day) => weekdays[day]!).join(',')}');
  }
  if (assignment.recurrence == Recurrence.monthly) {
    parts.add('BYMONTHDAY=${assignment.start.day}');
  }
  final end = assignment.recurrenceEnd;
  if (end != null) {
    final until = DateTime.utc(end.year, end.month, end.day, 23, 59, 59);
    parts.add(
      'UNTIL=${until.toIso8601String().replaceAll('-', '').replaceAll(':', '').split('.').first}Z',
    );
  }
  return ['RRULE:${parts.join(';')}'];
}

String _ianaTimeZoneName() => familyFleetTimeZone;

class _AuthorizedHttpClient extends http.BaseClient {
  _AuthorizedHttpClient(this._accessToken);

  final String _accessToken;
  final http.Client _inner = http.Client();

  @override
  Future<http.StreamedResponse> send(http.BaseRequest request) {
    request.headers['Authorization'] = 'Bearer $_accessToken';
    return _inner.send(request);
  }

  @override
  void close() => _inner.close();
}
