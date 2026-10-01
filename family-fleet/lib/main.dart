import 'dart:async';

import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/material.dart';

import 'data/mock_calendar_repository.dart';
import 'data/google_calendar_repository.dart';
import 'domain/fleet.dart';
import 'config/google_calendar_config.dart';
import 'ui/fleet_home_page.dart';
import 'ui/google_calendar_setup_page.dart';

void main() {
  runApp(const FamilyFleetApp());
}

class FamilyFleetApp extends StatefulWidget {
  const FamilyFleetApp({this.repository, super.key});
  final CalendarRepository? repository;

  @override
  State<FamilyFleetApp> createState() => _FamilyFleetAppState();
}

class _FamilyFleetAppState extends State<FamilyFleetApp> {
  late CalendarRepository _repository =
      widget.repository ?? MockCalendarRepository.demo();
  final _connection = GoogleCalendarConnection();
  final _mappingStore = GoogleCalendarMappingStore();
  final _navigatorKey = GlobalKey<NavigatorState>();
  StreamSubscription<GoogleSignInAuthenticationEvent>? _authSubscription;

  @override
  void initState() {
    super.initState();
    if (widget.repository == null) {
      _authSubscription = _connection.authenticationEvents.listen((event) {
        if (event is GoogleSignInAuthenticationEventSignIn) {
          _connection.acceptBrowserAccount(event.user);
          _activateSavedGoogleCalendars();
        }
      });
      _restoreCalendarRepository();
    }
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  Future<void> _activateSavedGoogleCalendars() async {
    if (!await _mappingStore.isActive()) return;
    final mappings = await _mappingStore.load();
    if (mappings.length != fleetVehicles.length || !mounted) return;
    setState(
      () => _repository = GoogleCalendarRepository(
        connection: _connection,
        calendarIds: mappings,
      ),
    );
  }

  Future<void> _restoreCalendarRepository() async {
    if (!await _mappingStore.isActive()) return;
    final mappings = await _mappingStore.load();
    if (mappings.length != fleetVehicles.length ||
        !isGoogleCalendarConfigured) {
      return;
    }
    try {
      final account = await _connection.restoreAccount();
      if (account == null || !mounted) return;
      setState(
        () => _repository = GoogleCalendarRepository(
          connection: _connection,
          calendarIds: mappings,
        ),
      );
    } catch (_) {
      // Keep the sample dashboard available; the settings page shows the error.
    }
  }

  Future<void> _openGoogleCalendarSetup() async {
    final repository = await _navigatorKey.currentState
        ?.push<CalendarRepository>(
          MaterialPageRoute(
            builder: (_) => GoogleCalendarSetupPage(connection: _connection),
          ),
        );
    if (repository != null && mounted) {
      setState(() => _repository = repository);
    }
  }

  @override
  Widget build(BuildContext context) {
    const ink = Color(0xFF18352D);
    return MaterialApp(
      navigatorKey: _navigatorKey,
      title: 'Family Fleet',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: ink,
          primary: ink,
          surface: const Color(0xFFF7F7F2),
        ),
        scaffoldBackgroundColor: const Color(0xFFF7F7F2),
        fontFamily: 'Avenir Next',
      ),
      home: FleetHomePage(
        repository: _repository,
        onSettings: _openGoogleCalendarSetup,
      ),
    );
  }
}
