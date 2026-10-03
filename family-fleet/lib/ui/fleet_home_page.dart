import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../domain/fleet.dart';

class FleetHomePage extends StatefulWidget {
  const FleetHomePage({required this.repository, this.onSettings, super.key});
  final CalendarRepository repository;
  final VoidCallback? onSettings;

  @override
  State<FleetHomePage> createState() => _FleetHomePageState();
}

class _FleetHomePageState extends State<FleetHomePage> {
  late Future<_FleetData> _data;
  Timer? _refreshTimer;

  @override
  void initState() {
    super.initState();
    _reload();
    _refreshTimer = Timer.periodic(const Duration(minutes: 2), (_) {
      if (mounted) setState(_reload);
    });
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    super.dispose();
  }

  void _reload() {
    _data =
        Future.wait([
          widget.repository.getMembers(),
          widget.repository.getCars(),
          widget.repository.getAssignments(),
        ]).then(
          (values) => _FleetData(
            members: values[0] as List<FamilyMember>,
            cars: values[1] as List<FleetCar>,
            assignments: values[2] as List<Assignment>,
          ),
        );
  }

  @override
  void didUpdateWidget(covariant FleetHomePage oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.repository != widget.repository) _reload();
  }

  Future<void> _addAssignment(_FleetData data, {Assignment? editing}) async {
    final assignment = await showModalBottomSheet<Assignment>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => _AssignmentSheet(data: data, editing: editing),
    );
    if (assignment == null || !mounted) return;

    final conflicts = findConflicts(assignment, data.assignments);
    if (conflicts.isNotEmpty) {
      await showDialog<void>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Assignment conflict'),
          content: Text(conflicts.first.reason),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Got it'),
            ),
          ],
        ),
      );
      return;
    }

    try {
      await widget.repository.saveAssignment(assignment);
      if (mounted) setState(_reload);
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text('Could not save assignment: $error')),
        );
    }
  }

  Future<void> _delete(Assignment assignment) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete assignment?'),
        content: Text(
          '“${assignment.title}” will be removed from this schedule.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    await widget.repository.deleteAssignment(assignment.id);
    if (mounted) setState(_reload);
  }

  Future<void> _openCalendar(DateTime date) async {
    if (kIsWeb) {
      await launchUrl(
        Uri.parse('https://calendar.google.com/calendar/'),
        mode: LaunchMode.externalApplication,
      );
      return;
    }
    final secondsSinceAppleEpoch = date.difference(DateTime(2001)).inSeconds;
    final uri = Uri.parse('calshow:$secondsSinceAppleEpoch');
    final opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!opened && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Could not open Apple Calendar.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    return Scaffold(
      body: FutureBuilder<_FleetData>(
        future: _data,
        builder: (context, snapshot) {
          if (!snapshot.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final data = snapshot.data!;
          final activeToday = data.assignments
              .map((item) => item.occurrenceOn(now))
              .whereType<Assignment>()
              .where(
                (item) => !item.start.isAfter(now) && item.end.isAfter(now),
              )
              .toList();
          final scheduledToday = activeToday
              .where((item) => item.kind != AssignmentKind.defaultAssignment)
              .toList();
          final todays = <Assignment>[
            ...scheduledToday,
            ...activeToday.where(
              (item) =>
                  item.kind == AssignmentKind.defaultAssignment &&
                  !scheduledToday.any(
                    (scheduled) =>
                        scheduled.carId == item.carId ||
                        scheduled.memberId == item.memberId,
                  ),
            ),
          ];
          final todayCarCount = todays.map((item) => item.carId).toSet().length;
          final scheduledAssignments = data.assignments
              .where((item) => item.kind != AssignmentKind.defaultAssignment)
              .toList();
          final upcoming =
              scheduledAssignments
                  .map((item) => item.nextOccurrenceAfter(now))
                  .whereType<Assignment>()
                  .toList()
                ..sort((a, b) => a.start.compareTo(b.start));
          final history =
              scheduledAssignments
                  .where((item) => item.end.isBefore(now))
                  .toList()
                ..sort((a, b) => b.end.compareTo(a.end));
          return CustomScrollView(
            slivers: [
              SliverAppBar(
                pinned: true,
                expandedHeight: 118,
                backgroundColor: const Color(0xFFF7F7F2),
                title: const Text(
                  'Family Fleet',
                  style: TextStyle(fontWeight: FontWeight.w800),
                ),
                flexibleSpace: FlexibleSpaceBar(
                  background: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 82, 20, 12),
                    child: Text(
                      _dateLabel(now),
                      style: Theme.of(context).textTheme.bodyMedium
                          ?.copyWith(color: Colors.black54),
                    ),
                  ),
                ),
                actions: [
                  IconButton(
                    onPressed: widget.onSettings,
                    tooltip: 'Google Calendar settings',
                    icon: const Icon(Icons.settings_outlined),
                  ),
                  IconButton(
                    onPressed: () => _addAssignment(data),
                    tooltip: 'Add assignment',
                    icon: const Icon(Icons.add_circle_outline_rounded),
                  ),
                  const SizedBox(width: 8),
                ],
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(20, 12, 20, 28),
                sliver: SliverList.list(
                  children: [
                    _SectionHeading(
                      title: 'Today',
                      trailing: '$todayCarCount cars',
                    ),
                    const SizedBox(height: 12),
                    for (final car in data.cars)
                      _CarCard(
                        car: car,
                        assignment: _currentFor(car, todays),
                        member: _memberFor(car, todays, data.members),
                      ),
                    const SizedBox(height: 22),
                    _SectionHeading(title: 'Coming up', trailing: 'Schedule'),
                    const SizedBox(height: 12),
                    if (upcoming.isEmpty)
                      const _EmptyCard(message: 'Nothing scheduled yet.')
                    else
                      for (final assignment in upcoming.take(5))
                        _UpcomingCard(
                          assignment: assignment,
                          onOpenCalendar: () => _openCalendar(assignment.start),
                          car: data.cars.firstWhere(
                            (car) => car.id == assignment.carId,
                          ),
                          member: _memberFrom(
                            data.members,
                            assignment.memberId,
                          ),
                          onDelete:
                              assignment.kind ==
                                  AssignmentKind.defaultAssignment
                              ? null
                              : () => _delete(assignment),
                          onEdit:
                              assignment.kind ==
                                  AssignmentKind.defaultAssignment
                              ? null
                              : () => _addAssignment(data, editing: assignment),
                        ),
                    const SizedBox(height: 22),
                    _SectionHeading(
                      title: 'Assignment history',
                      trailing: '${history.length} total',
                    ),
                    const SizedBox(height: 12),
                    if (history.isEmpty)
                      const _EmptyCard(
                        message: 'Completed assignments will appear here.',
                      )
                    else
                      for (final assignment in history.take(4))
                        _HistoryRow(
                          assignment: assignment,
                          car: data.cars.firstWhere(
                            (car) => car.id == assignment.carId,
                          ),
                          member: _memberFrom(
                            data.members,
                            assignment.memberId,
                          ),
                        ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FutureBuilder<_FleetData>(
        future: _data,
        builder: (context, snapshot) => FloatingActionButton.extended(
          onPressed: snapshot.hasData
              ? () => _addAssignment(snapshot.data!)
              : null,
          icon: const Icon(Icons.add),
          label: const Text('Assignment'),
        ),
      ),
    );
  }

  Assignment? _currentFor(FleetCar car, Iterable<Assignment> assignments) {
    Assignment? defaultAssignment;
    for (final assignment in assignments) {
      if (assignment.carId != car.id) continue;
      if (assignment.kind != AssignmentKind.defaultAssignment) {
        return assignment;
      }
      defaultAssignment ??= assignment;
    }
    return defaultAssignment;
  }

  FamilyMember? _memberFor(
    FleetCar car,
    Iterable<Assignment> assignments,
    List<FamilyMember> members,
  ) {
    final assignment = _currentFor(car, assignments);
    if (assignment == null) return null;
    for (final member in members) {
      if (member.id == assignment.memberId) return member;
    }
    return null;
  }
}

FamilyMember _memberFrom(List<FamilyMember> members, String memberId) {
  for (final member in members) {
    if (member.id == memberId) return member;
  }
  return const FamilyMember(id: unassignedDriverId, name: 'Unassigned');
}

class _FleetData {
  const _FleetData({
    required this.members,
    required this.cars,
    required this.assignments,
  });
  final List<FamilyMember> members;
  final List<FleetCar> cars;
  final List<Assignment> assignments;
}

class _SectionHeading extends StatelessWidget {
  const _SectionHeading({required this.title, required this.trailing});
  final String title;
  final String trailing;
  @override
  Widget build(BuildContext context) => Row(
    mainAxisAlignment: MainAxisAlignment.spaceBetween,
    children: [
      Text(
        title,
        style: Theme.of(context).textTheme.titleLarge
            ?.copyWith(fontWeight: FontWeight.w800),
      ),
      Text(
        trailing,
        style: Theme.of(context).textTheme.labelMedium
            ?.copyWith(color: Colors.black54),
      ),
    ],
  );
}

class _CarCard extends StatelessWidget {
  const _CarCard({
    required this.car,
    required this.assignment,
    required this.member,
  });
  final FleetCar car;
  final Assignment? assignment;
  final FamilyMember? member;
  @override
  Widget build(BuildContext context) => Card(
    key: ValueKey('car-${car.id}'),
    margin: const EdgeInsets.only(bottom: 8),
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
    child: Padding(
      padding: const EdgeInsets.all(15),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF0EA),
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.directions_car_filled_outlined,
              color: Color(0xFF18352D),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  member?.name ?? 'Unassigned',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  car.shortName,
                  style: const TextStyle(color: Colors.black54),
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right, color: Colors.black38),
        ],
      ),
    ),
  );
}

class _UpcomingCard extends StatelessWidget {
  const _UpcomingCard({
    required this.assignment,
    required this.onOpenCalendar,
    required this.car,
    required this.member,
    this.onDelete,
    this.onEdit,
  });
  final Assignment assignment;
  final VoidCallback onOpenCalendar;
  final FleetCar car;
  final FamilyMember member;
  final VoidCallback? onDelete;
  final VoidCallback? onEdit;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 8),
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
    child: ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 7),
      onTap: onEdit,
      leading: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: const Color(0xFFF3EEE2),
          borderRadius: BorderRadius.circular(15),
        ),
        alignment: Alignment.center,
        child: Text(
          assignment.allDay ? 'ALL\nDAY' : _clockLabel(assignment.start),
          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700),
        ),
      ),
      title: Text(
        assignment.title,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        '${_dateLabel(assignment.start)} · ${assignment.allDay ? 'All day' : _clockLabel(assignment.start)}\n'
        '${member.name} · ${car.shortName}',
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            icon: const Icon(Icons.calendar_month_outlined),
            onPressed: onOpenCalendar,
            tooltip: kIsWeb
                ? 'Open Google Calendar'
                : 'Open this date in Apple Calendar',
          ),
          if (onDelete != null)
            IconButton(
              icon: const Icon(Icons.delete_outline),
              onPressed: onDelete,
              tooltip: 'Delete assignment',
            ),
        ],
      ),
    ),
  );
}

class _HistoryRow extends StatelessWidget {
  const _HistoryRow({
    required this.assignment,
    required this.car,
    required this.member,
  });
  final Assignment assignment;
  final FleetCar car;
  final FamilyMember member;
  @override
  Widget build(BuildContext context) => ListTile(
    contentPadding: EdgeInsets.zero,
    leading: const Icon(Icons.history_rounded, color: Color(0xFF687B70)),
    title: Text(
      '${member.name} · ${car.shortName}',
      style: const TextStyle(fontWeight: FontWeight.w600),
    ),
    subtitle: Text('${assignment.title} · ${_dateLabel(assignment.start)}'),
  );
}

class _EmptyCard extends StatelessWidget {
  const _EmptyCard({required this.message});
  final String message;
  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    child: Padding(padding: const EdgeInsets.all(18), child: Text(message)),
  );
}

class _AssignmentSheet extends StatefulWidget {
  const _AssignmentSheet({required this.data, this.editing});
  final _FleetData data;
  final Assignment? editing;
  @override
  State<_AssignmentSheet> createState() => _AssignmentSheetState();
}

class _AssignmentSheetState extends State<_AssignmentSheet> {
  final _titleController = TextEditingController();
  bool _showTitleError = false;
  bool _didSubmit = false;
  late String _carId = widget.editing?.carId ?? widget.data.cars.first.id;
  late String _memberId = widget.editing != null
      ? (widget.data.members.any(
              (member) => member.id == widget.editing!.memberId,
            )
            ? widget.editing!.memberId
            : unassignedDriverId)
      : defaultMemberByCar[_carId] ?? unassignedDriverId;
  late bool _memberManuallySelected = widget.editing != null;
  late DateTime _start = widget.editing?.start ?? _currentMinute();
  late DateTime? _recurrenceEnd = widget.editing?.recurrenceEnd;
  late bool _isAllDay = widget.editing?.allDay ?? false;
  late int _durationHours = widget.editing == null
      ? 1
      : widget.editing!.end
            .difference(widget.editing!.start)
            .inHours
            .clamp(1, 24);
  late Recurrence _recurrence = widget.editing?.recurrence ?? Recurrence.once;
  late Set<int> _weekdays =
      widget.editing?.weekdays.toSet() ?? {_start.weekday};

  @override
  void initState() {
    super.initState();
    _titleController.text = widget.editing?.title ?? '';
  }

  @override
  void dispose() {
    _titleController.dispose();
    super.dispose();
  }

  Future<void> _chooseDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _start,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 730)),
    );
    if (date == null || !mounted) return;
    if (_isAllDay) {
      setState(() => _start = DateTime(date.year, date.month, date.day));
      return;
    }
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_start),
    );
    if (time == null || !mounted) return;
    setState(
      () => _start = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      ),
    );
  }

  Future<void> _chooseRecurrenceEnd() async {
    final date = await showDatePicker(
      context: context,
      initialDate: _recurrenceEnd ?? _start.add(const Duration(days: 30)),
      firstDate: DateTime(_start.year, _start.month, _start.day),
      lastDate: _start.add(const Duration(days: 3650)),
    );
    if (date != null && mounted) setState(() => _recurrenceEnd = date);
  }

  void _save() {
    if (_didSubmit) return;
    final title = _titleController.text.trim();
    if (title.isEmpty) {
      setState(() => _showTitleError = true);
      return;
    }
    final start = _isAllDay
        ? DateTime(_start.year, _start.month, _start.day)
        : _start;
    final end = _isAllDay
        ? DateTime(start.year, start.month, start.day + 1)
        : start.add(Duration(hours: _durationHours));
    _didSubmit = true;
    Navigator.pop(
      context,
      Assignment(
        id:
            widget.editing?.id ??
            DateTime.now().microsecondsSinceEpoch.toString(),
        carId: _carId,
        memberId: _memberId,
        title: title,
        start: start,
        end: end,
        kind: _recurrence == Recurrence.once
            ? AssignmentKind.oneTime
            : AssignmentKind.recurring,
        recurrence: _recurrence,
        weekdays: _recurrence == Recurrence.weekly ? _weekdays : const {},
        recurrenceEnd: _recurrenceEnd,
        allDay: _isAllDay,
        externalEventId: widget.editing?.externalEventId,
        externalCalendarId: widget.editing?.externalCalendarId,
      ),
    );
  }

  @override
  Widget build(BuildContext context) => Padding(
    padding: EdgeInsets.fromLTRB(
      20,
      12,
      20,
      MediaQuery.viewInsetsOf(context).bottom + 20,
    ),
    child: SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Text(
            widget.editing == null ? 'New assignment' : 'Edit assignment',
            style: Theme.of(context).textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 18),
          TextField(
            controller: _titleController,
            autofocus: true,
            decoration: InputDecoration(
              labelText: 'What is it for *',
              helperText: 'Required',
              errorText: _showTitleError
                  ? 'Enter a title to save this assignment.'
                  : null,
              hintText: 'School pickup, practice…',
              border: OutlineInputBorder(),
            ),
            onChanged: (value) {
              if (_showTitleError && value.trim().isNotEmpty) {
                setState(() => _showTitleError = false);
              }
            },
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _memberId,
            decoration: const InputDecoration(
              labelText: 'Family member',
              border: OutlineInputBorder(),
            ),
            items: [
              const DropdownMenuItem(
                value: unassignedDriverId,
                child: Text('Unassigned'),
              ),
              for (final member in widget.data.members)
                DropdownMenuItem(value: member.id, child: Text(member.name)),
            ],
            onChanged: (value) => setState(() {
              _memberId = value!;
              _memberManuallySelected = true;
            }),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            initialValue: _carId,
            decoration: const InputDecoration(
              labelText: 'Car',
              border: OutlineInputBorder(),
            ),
            items: [
              for (final car in widget.data.cars)
                DropdownMenuItem(value: car.id, child: Text(car.name)),
            ],
            onChanged: (value) => setState(() {
              _carId = value!;
              if (!_memberManuallySelected) {
                _memberId = defaultMemberByCar[_carId] ?? unassignedDriverId;
              }
            }),
          ),
          const SizedBox(height: 12),
          SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: const Text('All day'),
            subtitle: const Text('Runs from midnight to midnight'),
            value: _isAllDay,
            onChanged: (value) => setState(() {
              _isAllDay = value;
              if (value) {
                _start = DateTime(_start.year, _start.month, _start.day);
              } else if (_start.hour == 0 && _start.minute == 0) {
                _start = DateTime(_start.year, _start.month, _start.day, 9);
              }
            }),
          ),
          OutlinedButton.icon(
            onPressed: _chooseDate,
            icon: const Icon(Icons.calendar_today_outlined),
            label: Text(
              _isAllDay
                  ? 'All day · ${_dateLabel(_start)}'
                  : '${_dateLabel(_start)} · ${_clockLabel(_start)}',
            ),
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<Recurrence>(
            initialValue: _recurrence,
            decoration: const InputDecoration(
              labelText: 'Repeats',
              border: OutlineInputBorder(),
            ),
            items: const [
              DropdownMenuItem(
                value: Recurrence.once,
                child: Text('Does not repeat'),
              ),
              DropdownMenuItem(value: Recurrence.daily, child: Text('Daily')),
              DropdownMenuItem(value: Recurrence.weekly, child: Text('Weekly')),
              DropdownMenuItem(
                value: Recurrence.monthly,
                child: Text('Monthly'),
              ),
            ],
            onChanged: (value) => setState(() {
              _recurrence = value!;
              if (_recurrence == Recurrence.weekly && _weekdays.isEmpty) {
                _weekdays = {_start.weekday};
              }
              if (_recurrence == Recurrence.once) _recurrenceEnd = null;
            }),
          ),
          if (_recurrence == Recurrence.weekly) ...[
            const SizedBox(height: 12),
            const Text(
              'Repeat on',
              style: TextStyle(fontWeight: FontWeight.w600),
            ),
            Wrap(
              spacing: 4,
              children: [
                for (var day = 1; day <= 7; day++)
                  FilterChip(
                    label: Text(_weekday(day)),
                    selected: _weekdays.contains(day),
                    onSelected: (selected) => setState(() {
                      if (selected) {
                        _weekdays.add(day);
                      } else if (_weekdays.length > 1) {
                        _weekdays.remove(day);
                      }
                    }),
                  ),
              ],
            ),
          ],
          if (!_isAllDay) ...[
            const SizedBox(height: 12),
            DropdownButtonFormField<int>(
              initialValue: _durationHours,
              decoration: const InputDecoration(
                labelText: 'Duration',
                border: OutlineInputBorder(),
              ),
              items: [
                for (var hour = 1; hour <= 24; hour++)
                  DropdownMenuItem(
                    value: hour,
                    child: Text('$hour ${hour == 1 ? 'hour' : 'hours'}'),
                  ),
              ],
              onChanged: (value) => setState(() => _durationHours = value!),
            ),
          ],
          if (_recurrence != Recurrence.once) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: Text(
                    _recurrenceEnd == null
                        ? 'No end date'
                        : 'Ends ${_dateLabel(_recurrenceEnd!)}',
                  ),
                ),
                TextButton(
                  onPressed: _chooseRecurrenceEnd,
                  child: Text(_recurrenceEnd == null ? 'Set end' : 'Change'),
                ),
                if (_recurrenceEnd != null)
                  IconButton(
                    onPressed: () => setState(() => _recurrenceEnd = null),
                    icon: const Icon(Icons.close),
                    tooltip: 'Clear end date',
                  ),
              ],
            ),
          ],
          const SizedBox(height: 18),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _didSubmit ? null : _save,
              child: Text(
                widget.editing == null ? 'Save assignment' : 'Save changes',
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

String _dateLabel(DateTime date) =>
    '${_weekday(date.weekday)}, ${_month(date.month)} ${date.day}';
DateTime _currentMinute() {
  final now = DateTime.now();
  return DateTime(now.year, now.month, now.day, now.hour, now.minute);
}

String _clockLabel(DateTime date) {
  final hour = date.hour % 12 == 0 ? 12 : date.hour % 12;
  return '$hour:${date.minute.toString().padLeft(2, '0')} ${date.hour < 12 ? 'AM' : 'PM'}';
}

String _weekday(int day) =>
    const ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day - 1];
String _month(int month) => const [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
][month - 1];
