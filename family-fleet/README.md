# Family Fleet

Flutter app for coordinating family cars and shared assignments, with iOS and browser builds.

## Run it

```sh
flutter pub get
flutter run -d ios
```

For browser development, first add `http://localhost` and `http://localhost:7357` to the Google web OAuth client's **Authorized JavaScript origins**, then run:

```sh
flutter run -d chrome --web-hostname localhost --web-port 7357
```

The web OAuth client ID is public app configuration and is included in `web/index.html`. Do not add a client secret to the app.

## GitHub Pages

The repository workflow builds this app from `family-fleet/` and deploys it at `https://casper412.github.io/haunted-house/` after a push to `master`. In the repository's **Settings → Pages**, set the source to **GitHub Actions**. The web OAuth client must list `https://casper412.github.io` under **Authorized JavaScript origins** (no path). Google OAuth apps in Testing mode also require each family member's Google account to be added as a test user.

## Google Calendar setup

The app starts in Sample data mode, so first launch does not trigger OAuth. To enable Google Calendar:

1. In Google Cloud, create an OAuth client of type **iOS** for bundle ID `com.familyfleet.familyFleet`, enable the Google Calendar API, and add your Google account as a test user if the consent screen is in Testing mode.
2. Copy `ios/Flutter/GoogleSignIn.xcconfig.example` to `ios/Flutter/GoogleSignIn.xcconfig`. Set `GOOGLE_IOS_CLIENT_ID` to the iOS OAuth client ID and `GOOGLE_REVERSED_CLIENT_ID` to that client ID reversed (Google shows this in the client details). The real config file is git-ignored.
3. Run `flutter run -d Matt --dart-define=GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com`.
4. In Family Fleet, open Settings → **Connect Google account**, approve Calendar access, then choose a writable calendar for each car and tap **Use these calendars**.

The app remembers the calendar mapping on that browser/device. It uses Google Calendar events as its schedule and writes app changes back to those calendars. Browser users first sign in, then separately grant Calendar access. Google's browser OAuth tokens expire after about an hour, so a browser session may need to grant Calendar access again. No client secret belongs in the app.

On an upcoming assignment, the calendar icon opens Apple Calendar at that date. Apple Calendar must already have the relevant Google calendars enabled in iOS Calendar settings. iOS does not provide a documented public deep link to a specific Calendar event.

## Current foundation

- Three sample cars and five family members populate the dashboard.
- The demo assigns Rachel to Ravalicious and leaves Taos unassigned; the kids get vehicles through scheduled assignments.
- The dashboard shows today's drivers, upcoming assignments, and assignment history.
- Quick add requires a title and supports one-time, daily, weekly, and monthly assignments, weekday selection, durations up to 24 hours, all-day events, and an optional recurrence end date.
- Upcoming and current views expand recurring assignments into dated occurrences.
- Assignments can be edited or deleted, and the domain layer detects overlapping car or family-member assignments.
- `CalendarRepository` separates the UI from storage. `MockCalendarRepository` remains available for sample mode, and `GoogleCalendarRepository` reads and writes Google Calendar events.

Sample assignments are in memory and reset when the app restarts. Google calendar assignments live in Google Calendar; the selected calendar mapping is stored on the device.
