# Ledger

A lightweight shared ledger app built with Expo, React Native, and TypeScript. Track purchases, categorize entries by source, and keep totals synced through Firebase when configured.

## Objective

This project was built as a small practical app for tracking money between people without spreadsheet overhead. It is also an exploration of using Expo with a minimal TypeScript codebase and Firebase-backed persistence.

## Features

- **Purchase entries** — record amount, note, date, person, and purchase source
- **People and source management** — add or remove ledger people and purchase sources
- **Firebase sync** — persist entries to Firestore when Expo public Firebase variables are configured
- **Local fallback** — persist locally with browser `localStorage` on web or AsyncStorage on iOS/Android when Firebase is not configured
- **PDF sharing** — generate and share a ledger PDF from native devices
- **Delete confirmation** — review entry details before removing a purchase

## Tech Stack

| Technology                                                      | Version  | Role                    |
| --------------------------------------------------------------- | :------: | ----------------------- |
| [Expo](https://expo.dev/)                                       | ~54.0.33 | App runtime and tooling |
| [React](https://react.dev/)                                     |  19.1.0  | UI library              |
| [React Native](https://reactnative.dev/)                        |  0.81.5  | Native UI framework     |
| [React Native Web](https://necolas.github.io/react-native-web/) | ^0.21.0  | Web rendering           |
| [TypeScript](https://www.typescriptlang.org/)                   |  ~5.9.2  | Language                |
| [Firebase](https://firebase.google.com/)                        | ^12.13.0 | Firestore persistence   |
| [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) | 2.2.0 | Native local persistence |

## Getting Started

1. Use the project Node version:

   ```bash
   nvm use
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the Expo dev server:

   ```bash
   npm run start
   ```

## Firebase

Create a `.env` file from `.env.example` to enable Firestore sync:

```bash
cp .env.example .env
```

The app reads `EXPO_PUBLIC_FIREBASE_*` variables and stores entries in Firestore ledger collections keyed by stable person IDs. People are stored in the top-level `people` collection, and purchase source options are stored in `purchaseSources`.

The app does not create default people or sources. Add them through Settings, or pre-populate Firestore yourself.

If Firebase variables are not present, the app uses local persistence instead:

- Expo web: browser `localStorage`
- iOS/Android: `@react-native-async-storage/async-storage`

## Building for Your Own Use

To build this app for your Android phone, you'll need a Firebase project and an Expo account.

### 1. Set up Firebase

Create a Firebase project at https://console.firebase.google.com, then enable **Firestore Database**. Copy your project's Web App config values (apiKey, authDomain, projectId, etc.).

### 2. Set up EAS environment variables

The `.env` file is used for local development only — native builds use variables stored on EAS. Set your Firebase config:

```bash
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_API_KEY --value "your-api-key"
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN --value "your-auth-domain"
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_PROJECT_ID --value "your-project-id"
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET --value "your-storage-bucket"
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --value "your-sender-id"
npx eas-cli env:create production --scope project --visibility plaintext --force --name EXPO_PUBLIC_FIREBASE_APP_ID --value "your-app-id"
```

### 3. Build the APK

```bash
nvm use
npx eas-cli build --platform android --profile preview --non-interactive
```

Open the returned URL on your phone, or scan the QR code, to install the APK.

### CI/CD (optional)

On push to `main`, tests run automatically via GitHub Actions. If they pass, an EAS build is triggered. To enable this, add an `EXPO_TOKEN` secret to your GitHub repo (generate one at https://expo.dev/settings/access-tokens).
