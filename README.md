# Ledger

A lightweight two-person ledger app built with Expo, React Native, and TypeScript. Track shared purchases, categorize entries by source, and keep totals synced through Firebase when configured.

## Objective

This project was built as a personal small practical app for tracking money between two people without spreadsheet overhead. It is also an exploration of using Expo with a minimal TypeScript codebas and Firebase-backed persistance. 

## Features

- **Purchase entries** — record amount, note, date, user, and purchase source
- **Firebase sync** — persist entries to Firestore when Expo public Firebase variables are configured
- **Delete confirmation** — review entry details before removing a purchase

## Tech Stack

| Technology                                                   | Version | Role                    |
| ------------------------------------------------------------ | :-----: | ----------------------- |
| [Expo](https://expo.dev/)                                    | ~54.0.33 | App runtime and tooling |
| [React](https://react.dev/)                                  | 19.1.0  | UI library              |
| [React Native](https://reactnative.dev/)                     | 0.81.5  | Native UI framework     |
| [React Native Web](https://necolas.github.io/react-native-web/) | ^0.21.0 | Web rendering           |
| [TypeScript](https://www.typescriptlang.org/)                | ~5.9.2  | Language                |
| [Firebase](https://firebase.google.com/)                     | ^12.13.0 | Firestore persistence   |

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

4. Run a specific target:

   ```bash
   npm run ios
   npm run android
   npm run web
   ```

## Firebase

Create a `.env` file from `.env.example` to enable Firestore sync:

```bash
cp .env.example .env
```

The app reads `EXPO_PUBLIC_FIREBASE_*` variables and stores entries in Firestore ledger collections.
