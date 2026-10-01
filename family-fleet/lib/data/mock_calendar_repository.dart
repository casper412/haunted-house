import '../domain/fleet.dart';

class MockCalendarRepository implements CalendarRepository {
  MockCalendarRepository({
    required this._members,
    required this._cars,
    required this._assignments,
  });

  final List<FamilyMember> _members;
  final List<FleetCar> _cars;
  final List<Assignment> _assignments;

  factory MockCalendarRepository.demo() {
    final today = DateTime.now();
    DateTime at(int dayOffset, int hour, [int minute = 0]) =>
        DateTime(today.year, today.month, today.day + dayOffset, hour, minute);

    return MockCalendarRepository(
      members: familyRoster,
      cars: fleetVehicles,
      assignments: [
        Assignment(
          id: 'yesterday-school-run',
          carId: 'taos',
          memberId: 'rachel',
          title: 'School run',
          start: at(-1, 7),
          end: at(-1, 8),
          kind: AssignmentKind.oneTime,
        ),
        Assignment(
          id: 'today-rachel',
          carId: 'ravalicious',
          memberId: 'rachel',
          title: 'Family car',
          start: at(0, 0),
          end: at(1, 0),
          kind: AssignmentKind.defaultAssignment,
        ),
        Assignment(
          id: 'practice',
          carId: 'ravalicious',
          memberId: 'chris',
          title: 'Chris practice',
          start: at(1, 15, 30),
          end: at(1, 17),
          kind: AssignmentKind.oneTime,
        ),
      ],
    );
  }

  @override
  Future<List<FamilyMember>> getMembers() async => List.unmodifiable(_members);

  @override
  Future<List<FleetCar>> getCars() async => List.unmodifiable(_cars);

  @override
  Future<List<Assignment>> getAssignments() async =>
      List.unmodifiable(_assignments);

  @override
  Future<void> saveAssignment(Assignment assignment) async {
    final index = _assignments.indexWhere((item) => item.id == assignment.id);
    if (index == -1) {
      _assignments.add(assignment);
    } else {
      _assignments[index] = assignment;
    }
  }

  @override
  Future<void> deleteAssignment(String id) async {
    _assignments.removeWhere((item) => item.id == id);
  }
}
