# Pinnacle Mobile App

The mobile frontend for the Pinnacle recruitment platform, built with Flutter.

## Getting Started

### Prerequisites

- **Flutter SDK**: Ensure you have Flutter installed and set up.
- **Backend Server**: The Pinnacle Backend must be running locally or on a server.
- **Android Studio / VS Code**: Recommended IDEs for Flutter development.

### Installation

1. Navigate to the project directory:
   ```bash
   cd frontend/app
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

## Configuration

### 1. Backend Connection Setup

To connect the mobile app to your local backend, configure the API base URL.

1. Open `lib/core/network/api_client.dart`
2. Locate the `baseUrl` inside the `ApiClient` class
3. Update the URL to point to your backend server (running on port 3000)

#### Android Emulator

If the backend is running on your computer and the app is on the Android Emulator, use:

```dart
baseUrl: 'http://10.0.2.2:3000',
```

#### Physical Device

If running on a physical device connected to the same Wi‑Fi, use your machine’s local IP address:

```dart
baseUrl: 'http://XXX.XXX.X.X:3000', // Replace XXX.XXX.X.X with your machine's IP
```

### 2. Authentication & Environment Variables

The mobile app currently handles API configuration directly in code.

For authentication to work correctly:

- Ensure the **backend `.env` file** is fully configured
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- The backend must be reachable by the mobile device to handle OAuth callback redirects.

## Project Structure

The project follows a feature‑first architecture:

```
lib/
├── core/
│   ├── components/       # Shared UI widgets
│   ├── constants/        # App-wide constants
│   ├── network/          # API client & Dio setup
│   ├── router/           # Navigation & routing
│   ├── storage/          # Local storage logic
│   └── theme/            # App theming
├── features/
│   ├── auth/             # Authentication
│   ├── dashboard/        # Main dashboard screens
│   └── splash/           # Splash screen
└── main.dart             # Application entry point
```

## Running the App

Run the app on a connected device or emulator:

```bash
flutter run
```

## Troubleshooting

- **Connection Refused**  
  Ensure the backend is running on port 3000 and the correct IP is used  
  (`10.0.2.2` for emulator, local IP for physical device).

- **Session Expired / 401 Error**  
  The app clears local storage automatically. Log in again if required.
