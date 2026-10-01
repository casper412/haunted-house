import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:googleapis/calendar/v3.dart' as gcal;

import '../config/google_calendar_config.dart';
import '../data/google_calendar_repository.dart';
import '../data/mock_calendar_repository.dart';
import '../data/google_sign_in_button.dart';
import '../domain/fleet.dart';

class GoogleCalendarSetupPage extends StatefulWidget {
  const GoogleCalendarSetupPage({required this.connection, super.key});

  final GoogleCalendarConnection connection;

  @override
  State<GoogleCalendarSetupPage> createState() =>
      _GoogleCalendarSetupPageState();
}

class _GoogleCalendarSetupPageState extends State<GoogleCalendarSetupPage> {
  final _store = GoogleCalendarMappingStore();
  List<gcal.CalendarListEntry> _calendars = [];
  Map<String, String> _selected = {};
  String? _accountEmail;
  String? _error;
  bool _busy = false;
  StreamSubscription<GoogleSignInAuthenticationEvent>? _authSubscription;

  @override
  void initState() {
    super.initState();
    if (kIsWeb && widget.connection.isConfigured) {
      _authSubscription = widget.connection.authenticationEvents.listen(
        (event) {
          if (event is GoogleSignInAuthenticationEventSignIn) {
            widget.connection.acceptBrowserAccount(event.user);
            if (mounted) {
              setState(() {
                _accountEmail = event.user.email;
                _error = null;
              });
            }
          }
        },
        onError: (Object error) {
          if (mounted) setState(() => _error = _friendlyError(error));
        },
      );
    }
    _restore();
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  Future<void> _restore() async {
    _selected = await _store.load();
    if (widget.connection.isConfigured) {
      try {
        await widget.connection.initialize();
        final account = await widget.connection.restoreAccount();
        if (account != null && !kIsWeb) {
          _accountEmail = account.email;
          _calendars = await widget.connection.listWritableCalendars();
        }
      } catch (error) {
        _error = _friendlyError(error);
      }
    }
    if (mounted) setState(() {});
  }

  Future<void> _connect() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      final account = kIsWeb
          ? widget.connection.account
          : await widget.connection.connect();
      if (account == null) throw StateError('Sign in to Google first.');
      final calendars = await widget.connection.listWritableCalendars();
      if (!mounted) return;
      setState(() {
        _accountEmail = account.email;
        _calendars = calendars;
      });
    } catch (error) {
      if (mounted) setState(() => _error = _friendlyError(error));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _useGoogleCalendar() async {
    final repository = GoogleCalendarRepository(
      connection: widget.connection,
      calendarIds: Map.unmodifiable(_selected),
    );
    await _store.save(_selected);
    await _store.setActive(true);
    if (mounted) Navigator.pop(context, repository);
  }

  Future<void> _useSampleData() async {
    await _store.setActive(false);
    if (mounted) Navigator.pop(context, MockCalendarRepository.demo());
  }

  Future<void> _disconnect() async {
    setState(() => _busy = true);
    try {
      await widget.connection.disconnect();
      if (mounted) {
        setState(() {
          _accountEmail = null;
          _calendars = [];
          _selected = {};
        });
        await _store.save({});
      }
    } catch (error) {
      if (mounted) setState(() => _error = _friendlyError(error));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  String _friendlyError(Object error) {
    final message = error.toString();
    if (message.contains('Google OAuth client ID for this platform')) {
      return 'Google sign-in needs a web OAuth client ID in this browser build.';
    }
    return message.replaceFirst('Exception: ', '');
  }

  bool get _allMapped =>
      fleetVehicles.every((car) => (_selected[car.id] ?? '').isNotEmpty);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Google Calendar')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
        children: [
          const Text(
            'Connect one writable Google Calendar to each vehicle. Events in each calendar become that vehicle’s schedule.',
            style: TextStyle(fontSize: 16),
          ),
          const SizedBox(height: 20),
          if (!isGoogleCalendarConfigured)
            _configurationHelp()
          else ...[
            if (_accountEmail == null)
              if (kIsWeb)
                Center(child: buildGoogleSignInButton())
              else
                FilledButton.icon(
                  onPressed: _busy ? null : _connect,
                  icon: const Icon(Icons.login),
                  label: Text(_busy ? 'Connecting…' : 'Connect Google account'),
                )
            else ...[
              Card(
                child: ListTile(
                  leading: const Icon(Icons.account_circle_outlined),
                  title: const Text('Connected account'),
                  subtitle: Text(_accountEmail!),
                  trailing: IconButton(
                    tooltip: 'Disconnect',
                    onPressed: _busy ? null : _disconnect,
                    icon: const Icon(Icons.logout),
                  ),
                ),
              ),
              if (_calendars.isEmpty) ...[
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: _busy ? null : _connect,
                  icon: const Icon(Icons.verified_user_outlined),
                  label: Text(
                    _busy ? 'Loading calendars…' : 'Grant Calendar access',
                  ),
                ),
              ],
              const SizedBox(height: 12),
              for (final car in fleetVehicles) ...[
                Text(
                  car.name,
                  style: const TextStyle(fontWeight: FontWeight.w700),
                ),
                const SizedBox(height: 6),
                DropdownButtonFormField<String>(
                  initialValue:
                      _calendars.any(
                        (calendar) => calendar.id == _selected[car.id],
                      )
                      ? _selected[car.id]!
                      : '',
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    labelText: 'Calendar',
                  ),
                  items: [
                    const DropdownMenuItem<String>(
                      value: '',
                      child: Text('Choose a calendar'),
                    ),
                    for (final calendar in _calendars)
                      if (calendar.id != null &&
                          !_selected.entries.any(
                            (entry) =>
                                entry.key != car.id &&
                                entry.value == calendar.id,
                          ))
                        DropdownMenuItem(
                          value: calendar.id!,
                          child: Text(
                            '${calendar.summary ?? calendar.id}'
                            '${calendar.primary == true ? ' (primary)' : ''}',
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                  ],
                  onChanged: (value) => setState(() {
                    if (value == null || value.isEmpty) {
                      _selected.remove(car.id);
                    } else {
                      _selected[car.id] = value;
                    }
                  }),
                ),
                const SizedBox(height: 16),
              ],
              FilledButton.icon(
                onPressed: _allMapped && !_busy ? _useGoogleCalendar : null,
                icon: const Icon(Icons.sync),
                label: const Text('Use these calendars'),
              ),
              const SizedBox(height: 8),
              const Text(
                'Calendar events are read from Google and app changes are written back. Keep using Sample data until all three calendars are selected.',
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 8),
              const Text(
                'For existing Google events, include the driver’s name in the title or description. Events created in Family Fleet store the driver automatically.',
                style: TextStyle(color: Colors.black54),
              ),
            ],
          ],
          if (_error != null) ...[
            const SizedBox(height: 16),
            Text(_error!, style: const TextStyle(color: Colors.red)),
          ],
          const SizedBox(height: 20),
          TextButton(
            onPressed: _useSampleData,
            child: const Text('Use sample data'),
          ),
        ],
      ),
    );
  }

  Widget _configurationHelp() => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'One-time Google setup',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          SizedBox(height: 8),
          Text(
            'Create an OAuth client of type iOS in Google Cloud for bundle ID com.familyfleet.familyFleet, enable the Google Calendar API, then set the iOS client ID and its reversed client ID in ios/Flutter/GoogleSignIn.xcconfig. Rebuild with --dart-define=GOOGLE_IOS_CLIENT_ID=YOUR_CLIENT_ID. No client secret belongs in the app.',
          ),
          SizedBox(height: 8),
          Text(
            'Once configured, reopen this page and tap Connect Google account. It will ask for Calendar access, then let you assign a writable calendar to Taos, Penny, and Ravalicious.',
          ),
        ],
      ),
    ),
  );
}
