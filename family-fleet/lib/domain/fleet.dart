enum Recurrence { once, daily, weekly, monthly }

enum AssignmentKind { defaultAssignment, recurring, oneTime, override }

class FamilyMember {
  const FamilyMember({required this.id, required this.name});
  final String id;
  final String name;
}

class FleetCar {
  const FleetCar({
    required this.id,
    required this.name,
    required this.shortName,
  });
  final String id;
  final String name;
  final String shortName;
}

const familyRoster = <FamilyMember>[
  FamilyMember(id: 'rachel', name: 'Rachel'),
  FamilyMember(id: 'matt', name: 'Matt'),
  FamilyMember(id: 'jayden', name: 'Jayden'),
  FamilyMember(id: 'chris', name: 'Chris'),
  FamilyMember(id: 'mc', name: 'MC'),
];

const fleetVehicles = <FleetCar>[
  FleetCar(id: 'taos', name: 'Taos', shortName: 'Taos'),
  FleetCar(id: 'penny', name: 'Penny', shortName: 'Penny'),
  FleetCar(id: 'ravalicious', name: 'Ravalicious', shortName: 'Ravalicious'),
];

const unassignedDriverId = 'unassigned';

/// Default driver for cars without an active scheduled assignment.
const defaultMemberByCar = <String, String>{'ravalicious': 'rachel'};

class Assignment {
  const Assignment({
    required this.id,
    required this.carId,
    required this.memberId,
    required this.title,
    required this.start,
    required this.end,
    this.kind = AssignmentKind.oneTime,
    this.recurrence = Recurrence.once,
    this.weekdays = const {},
    this.recurrenceEnd,
    this.allDay = false,
    this.excludedOccurrenceDates = const {},
    this.externalEventId,
    this.externalCalendarId,
  });

  final String id;
  final String carId;
  final String memberId;
  final String title;
  final DateTime start;
  final DateTime end;
  final AssignmentKind kind;
  final Recurrence recurrence;
  final Set<int> weekdays;
  final DateTime? recurrenceEnd;
  final bool allDay;
  final Set<DateTime> excludedOccurrenceDates;
  final String? externalEventId;
  final String? externalCalendarId;

  bool overlaps(Assignment other) =>
      start.isBefore(other.end) && other.start.isBefore(end);

  bool occursOn(DateTime date) {
    final day = DateTime(date.year, date.month, date.day);
    final firstDay = DateTime(start.year, start.month, start.day);
    final lastDay = recurrenceEnd == null
        ? null
        : DateTime(
            recurrenceEnd!.year,
            recurrenceEnd!.month,
            recurrenceEnd!.day,
          );
    if (day.isBefore(firstDay) || (lastDay != null && day.isAfter(lastDay))) {
      return false;
    }
    if (excludedOccurrenceDates.any(
      (excluded) =>
          excluded.year == day.year &&
          excluded.month == day.month &&
          excluded.day == day.day,
    )) {
      return false;
    }
    return switch (recurrence) {
      Recurrence.once => day == firstDay,
      Recurrence.daily => true,
      Recurrence.weekly =>
        (weekdays.isEmpty ? {start.weekday} : weekdays).contains(day.weekday),
      Recurrence.monthly => day.day == start.day,
    };
  }

  Assignment? occurrenceOn(DateTime date) {
    if (!occursOn(date)) return null;
    final occurrenceStart = DateTime(
      date.year,
      date.month,
      date.day,
      start.hour,
      start.minute,
    );
    final duration = end.difference(start);
    final occurrenceEnd = allDay
        ? DateTime(date.year, date.month, date.day + 1)
        : occurrenceStart.add(duration);
    return Assignment(
      id: id,
      carId: carId,
      memberId: memberId,
      title: title,
      start: occurrenceStart,
      end: occurrenceEnd,
      kind: kind,
      recurrence: recurrence,
      weekdays: weekdays,
      recurrenceEnd: recurrenceEnd,
      allDay: allDay,
      excludedOccurrenceDates: excludedOccurrenceDates,
      externalEventId: externalEventId,
      externalCalendarId: externalCalendarId,
    );
  }

  Assignment? nextOccurrenceAfter(DateTime instant, {int searchDays = 730}) {
    final firstDate =
        DateTime(
          instant.year,
          instant.month,
          instant.day,
        ).isBefore(DateTime(start.year, start.month, start.day))
        ? DateTime(start.year, start.month, start.day)
        : DateTime(instant.year, instant.month, instant.day);
    for (var offset = 0; offset <= searchDays; offset++) {
      final occurrence = occurrenceOn(firstDate.add(Duration(days: offset)));
      if (occurrence != null && occurrence.start.isAfter(instant)) {
        return occurrence;
      }
    }
    return null;
  }
}

class AssignmentConflict {
  const AssignmentConflict({required this.assignment, required this.reason});
  final Assignment assignment;
  final String reason;
}

/// Date source boundary keeps local/mock scheduling deterministic and makes a
/// future calendar-backed implementation free to provide its own clock.
abstract class CalendarRepository {
  Future<List<FamilyMember>> getMembers();
  Future<List<FleetCar>> getCars();
  Future<List<Assignment>> getAssignments();
  Future<void> saveAssignment(Assignment assignment);
  Future<void> deleteAssignment(String id);
}

List<AssignmentConflict> findConflicts(
  Assignment candidate,
  Iterable<Assignment> existing,
) {
  return existing
      .where((item) {
        if (item.id == candidate.id) return false;
        if (item.kind == AssignmentKind.defaultAssignment) return false;
        final sameCar = item.carId == candidate.carId;
        final sameDriver =
            candidate.memberId != unassignedDriverId &&
            item.memberId == candidate.memberId;
        return (sameCar || sameDriver) && _recurrencesOverlap(candidate, item);
      })
      .map(
        (item) => AssignmentConflict(
          assignment: item,
          reason: item.carId == candidate.carId
              ? 'This car is already assigned during that time.'
              : 'This person already has another car during that time.',
        ),
      )
      .toList(growable: false);
}

bool _recurrencesOverlap(Assignment first, Assignment second) {
  final firstDay = DateTime(
    first.start.year,
    first.start.month,
    first.start.day,
  );
  final secondDay = DateTime(
    second.start.year,
    second.start.month,
    second.start.day,
  );
  final scanStart = firstDay.isAfter(secondDay) ? firstDay : secondDay;
  final endings = <DateTime>[
    if (first.recurrence == Recurrence.once) firstDay,
    if (second.recurrence == Recurrence.once) secondDay,
    if (first.recurrenceEnd != null)
      DateTime(
        first.recurrenceEnd!.year,
        first.recurrenceEnd!.month,
        first.recurrenceEnd!.day,
      ),
    if (second.recurrenceEnd != null)
      DateTime(
        second.recurrenceEnd!.year,
        second.recurrenceEnd!.month,
        second.recurrenceEnd!.day,
      ),
  ];
  final scanEnd = endings.isEmpty
      ? scanStart.add(const Duration(days: 730))
      : endings.reduce((a, b) => a.isBefore(b) ? a : b);
  for (
    var day = scanStart;
    !day.isAfter(scanEnd);
    day = day.add(const Duration(days: 1))
  ) {
    final firstOccurrence = first.occurrenceOn(day);
    final secondOccurrence = second.occurrenceOn(day);
    if (firstOccurrence != null &&
        secondOccurrence != null &&
        firstOccurrence.overlaps(secondOccurrence)) {
      return true;
    }
  }
  return false;
}
