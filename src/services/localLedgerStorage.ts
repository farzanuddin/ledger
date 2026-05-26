import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { LedgerEntry, Person, PurchaseSource } from "../types";

const storageKey = "ledger.local.v1";

type StoredLedgerData = {
  entries: Array<Omit<LedgerEntry, "createdAt"> & { createdAt: string }>;
  people: Person[];
  purchaseSources: PurchaseSource[];
  selectedPersonId: string;
};

export type LocalLedgerData = {
  entries: LedgerEntry[];
  people: Person[];
  purchaseSources: PurchaseSource[];
  selectedPersonId: string;
};

const emptyLedgerData: LocalLedgerData = {
  entries: [],
  people: [],
  purchaseSources: [],
  selectedPersonId: "",
};

const canUseLocalStorage = () =>
  Platform.OS === "web" &&
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined";

const readStoredValue = async () => {
  if (canUseLocalStorage()) return window.localStorage.getItem(storageKey);
  return AsyncStorage.getItem(storageKey);
};

const writeStoredValue = async (value: string) => {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(storageKey, value);
    return;
  }

  await AsyncStorage.setItem(storageKey, value);
};

const parseStoredEntry = (
  entry: StoredLedgerData["entries"][number],
): LedgerEntry => ({
  ...entry,
  createdAt: new Date(entry.createdAt),
});

const serializeLedgerData = (data: LocalLedgerData): StoredLedgerData => ({
  entries: data.entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  })),
  people: data.people,
  purchaseSources: data.purchaseSources,
  selectedPersonId: data.selectedPersonId,
});

export const loadLocalLedgerData = async (): Promise<LocalLedgerData> => {
  const rawValue = await readStoredValue();
  if (!rawValue) return emptyLedgerData;

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredLedgerData>;

    return {
      entries: Array.isArray(parsedValue.entries)
        ? parsedValue.entries.map(parseStoredEntry)
        : [],
      people: Array.isArray(parsedValue.people) ? parsedValue.people : [],
      purchaseSources: Array.isArray(parsedValue.purchaseSources)
        ? parsedValue.purchaseSources
        : [],
      selectedPersonId:
        typeof parsedValue.selectedPersonId === "string"
          ? parsedValue.selectedPersonId
          : "",
    };
  } catch {
    return emptyLedgerData;
  }
};

export const saveLocalLedgerData = async (data: LocalLedgerData) => {
  await writeStoredValue(JSON.stringify(serializeLedgerData(data)));
};
