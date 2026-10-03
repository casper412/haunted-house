import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:googleapis/calendar/v3.dart' as gcal;
import 'package:family_fleet/data/mock_calendar_repository.dart';
import 'package:family_fleet/data/google_calendar_repository.dart';
import 'package:family_fleet/domain/fleet.dart';
import 'package:family_fleet/main.dart';

void main() {
  testWidgets('dashboard shows the family fleet and upcoming plans', (
    tester,
  ) async {
    await tester.pumpWidget(
      FamilyFleetApp(repository: MockCalendarRepository.demo()),
    );
    await tester.pumpAndSettle();

    expect(find.text('Family Fleet'), findsOneWidget);
    expect(find.text('Today'), findsOneWidget);
    expect(find.text('Taos'), findsOneWidget);
    expect(find.text('Penny'), findsOneWidget);
    expect(find.text('Ravalicious'), findsOneWidget);
    expect(
      find.descendant(
        of: find.byKey(const ValueKey('car-ravalicious')),
        matching: find.text('Rachel'),
      ),
      findsOneWidget,
    );
    expect(
      find.descendant(
        of: find.byKey(const ValueKey('car-taos')),
        matching: find.text('Unassigned'),
      ),
      findsOneWidget,
    );
    await tester.scrollUntilVisible(
      find.text('Assignment history'),
      300,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Assignment history'), findsOneWidget);
  });

  test('conflict detection finds an overlapping car reservation', () {
    final start = DateTime(2026, 10, 1, 10);
    final existing = Assignment(
      id: 'existing',
      carId: 'taos',
      memberId: 'rachel',
      title: 'Errand',
      start: start,
      end: start.add(const Duration(hours: 2)),
    );
    final candidate = Assignment(
      id: 'candidate',
      carId: 'taos',
      memberId: 'matt',
      title: 'Pickup',
      start: start.add(const Duration(hours: 1)),
      end: start.add(const Duration(hours: 3)),
    );

    expect(findConflicts(candidate, [existing]), hasLength(1));
    expect(findConflicts(candidate, [existing]).single.reason, contains('car'));
  });

  test('weekly assignments conflict on a later selected weekday', () {
    final monday = DateTime(2026, 10, 5, 10);
    final recurring = Assignment(
      id: 'weekly',
      carId: 'taos',
      memberId: 'rachel',
      title: 'Monday commute',
      start: monday,
      end: monday.add(const Duration(hours: 2)),
      recurrence: Recurrence.weekly,
      weekdays: const {DateTime.monday},
    );
    final laterMonday = DateTime(2026, 10, 12, 11);
    final oneTime = Assignment(
      id: 'pickup',
      carId: 'taos',
      memberId: 'matt',
      title: 'Pickup',
      start: laterMonday,
      end: laterMonday.add(const Duration(hours: 1)),
    );

    expect(findConflicts(oneTime, [recurring]), hasLength(1));
    expect(recurring.occursOn(DateTime(2026, 10, 12)), isTrue);
    expect(recurring.occursOn(DateTime(2026, 10, 13)), isFalse);
  });

  test('a repeating series returns its next dated occurrence', () {
    final start = DateTime(2026, 10, 5, 15, 30);
    final recurring = Assignment(
      id: 'practice',
      carId: 'ravalicious',
      memberId: 'matt',
      title: 'Practice',
      start: start,
      end: start.add(const Duration(hours: 2)),
      recurrence: Recurrence.weekly,
      weekdays: const {DateTime.monday},
      recurrenceEnd: DateTime(2026, 11, 30),
    );

    final next = recurring.nextOccurrenceAfter(DateTime(2026, 10, 6));
    expect(next?.start, DateTime(2026, 10, 12, 15, 30));
    expect(next?.id, recurring.id);
    expect(recurring.nextOccurrenceAfter(DateTime(2026, 12, 1)), isNull);
  });

  test('Penny defaults to Matt and Taos has no default driver', () {
    expect(defaultMemberByCar['penny'], 'matt');
    expect(defaultMemberByCar.containsKey('taos'), isFalse);
  });

  test('calendar suggestions match car names and preserve valid choices', () {
    final calendars = [
      gcal.CalendarListEntry(id: 'taos-calendar', summary: 'Taos'),
      gcal.CalendarListEntry(id: 'penny-calendar', summary: 'PENNY'),
      gcal.CalendarListEntry(id: 'family-calendar', summary: 'Family'),
      gcal.CalendarListEntry(
        id: 'ravalicious-calendar',
        summary: 'Ravalicious',
      ),
    ];
    final suggestions = suggestCalendarMappings(
      cars: fleetVehicles,
      calendars: calendars,
      current: {'taos': 'family-calendar', 'penny': 'removed-calendar'},
    );

    expect(suggestions, {
      'taos': 'family-calendar',
      'penny': 'penny-calendar',
      'ravalicious': 'ravalicious-calendar',
    });
  });

  test('new Google event IDs are stable and use allowed characters', () {
    Assignment assignment({required String id}) => Assignment(
      id: id,
      carId: 'penny',
      memberId: 'matt',
      title: 'School pickup',
      start: DateTime(2026, 10, 3, 15),
      end: DateTime(2026, 10, 3, 16),
    );
    final first = familyFleetGoogleEventId(assignment(id: 'one'));
    final retry = familyFleetGoogleEventId(assignment(id: 'retry'));

    expect(first, retry);
    expect(first, matches(RegExp(r'^[0-9a-v]{5,1024}$')));
  });
}
