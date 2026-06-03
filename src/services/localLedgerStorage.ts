import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import type { Entry, Person, Source } from "../types";

const storageKey = "ledger.local.v1";

type StoredLedgerData = {
  entries: Array<Omit<Entry, "createdAt"> & { createdAt: string }>;
  people: Person[];
  purchaseSources?: Source[];
  sources?: Source[];
  selectedPersonId: string;
};

export type LocalLedgerData = {
  entries: Entry[];
  people: Person[];
  sources: Source[];
  selectedPersonId: string;
};

const emptyLedgerData: LocalLedgerData = {
  entries: [],
  people: [],
  sources: [],
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

const parseStoredEntry = (entry: StoredLedgerData["entries"][number]): Entry => ({
  ...entry,
  createdAt: new Date(entry.createdAt),
});

const serializeLedgerData = (data: LocalLedgerData): StoredLedgerData => ({
  entries: data.entries.map((entry) => ({
    ...entry,
    createdAt: entry.createdAt.toISOString(),
  })),
  people: data.people,
  purchaseSources: data.sources,
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
      sources: Array.isArray(parsedValue.purchaseSources)
        ? parsedValue.purchaseSources
        : Array.isArray(parsedValue.sources)
          ? parsedValue.sources
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
