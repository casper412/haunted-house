import 'package:flutter/foundation.dart';

/// Set with `--dart-define=GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID`.
const googleIosClientId = String.fromEnvironment('GOOGLE_IOS_CLIENT_ID');

/// Public OAuth client ID for browser builds. Keep this in web/index.html too,
/// where Google's Identity Services SDK reads it.
const googleWebClientId = String.fromEnvironment(
  'GOOGLE_WEB_CLIENT_ID',
  defaultValue: '882958862555-sc1eg3f1u199mfpv54t1rqngaicsbm3q.apps.googleusercontent.com',
);
const familyFleetTimeZone = String.fromEnvironment(
  'FAMILY_FLEET_TIME_ZONE',
  defaultValue: 'America/Los_Angeles',
);

bool get isGoogleCalendarConfigured =>
    (kIsWeb ? googleWebClientId : googleIosClientId).trim().isNotEmpty;
