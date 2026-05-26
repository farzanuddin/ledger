import { Platform } from "react-native";

const legacyStorageKeys = [
  "ledger.demo.entries",
  "ledger.demo.people",
  "ledger.demo.sources",
];

export const clearLegacyDemoStorage = () => {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  legacyStorageKeys.forEach((key) => {
    window.localStorage.removeItem(key);
  });
};
