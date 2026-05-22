import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import Svg, { Path } from "react-native-svg";

import { db, firebaseIsConfigured } from "./src/firebase";

type Person = {
  id: string;
  name: string;
};

type SettingsTab = "people" | "sources";

type PurchaseSource = {
  id: string;
  name: string;
};

type LedgerEntry = {
  id: string;
  amountCents: number;
  source: string;
  note: string;
  user: string;
  createdAt: Date;
};

const defaultPeople: Person[] = [
  { id: "dad", name: "Dad" },
  { id: "mom", name: "Mom" },
];

const ledgerId = (personName: string) =>
  `ledger-${sourceIdFromName(personName) || "default"}`;
const defaultPurchaseSources: PurchaseSource[] = [
  { id: "default", name: "Default" },
  { id: "aliexpress", name: "Aliexpress" },
  { id: "amazon", name: "Amazon" },
  { id: "careem", name: "Careem" },
  { id: "deliveroo", name: "Deliveroo" },
  { id: "keeta", name: "Keeta" },
  { id: "noon", name: "Noon" },
  { id: "temu", name: "Temu" },
];

const amountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatAmount = (amountCents: number) =>
  `${amountCents < 0 ? "(" : ""}AED ${amountFormatter.format(
    Math.abs(amountCents) / 100,
  )}${amountCents < 0 ? ")" : ""}`;

const formatEntryDate = (date: Date) =>
  date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sourceIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isDefaultSource = (sourceName: string) =>
  sourceName.trim().toLowerCase() === "default";

const numberWords: Record<number, string> = {
  0: "Zero",
  1: "One",
  2: "Two",
  3: "Three",
  4: "Four",
  5: "Five",
  6: "Six",
  7: "Seven",
  8: "Eight",
  9: "Nine",
  10: "Ten",
};

const formatPeopleCountLabel = (count: number) => {
  const countLabel = numberWords[count] ?? String(count);
  return `${countLabel}-Person Ledger`;
};

const buildLedgerReportHtml = ({
  balanceCents,
  entries,
  user,
}: {
  balanceCents: number;
  entries: LedgerEntry[];
  user: string;
}) => {
  const generatedAt = new Date();
  const rows = entries
    .map(
      (entry) => `
        <tr>
          <td>
            <strong>${escapeHtml(entry.note || "Untitled entry")}</strong>
            <span>${escapeHtml(entry.source)} · ${formatEntryDate(
              entry.createdAt,
            )}</span>
          </td>
          <td class="${entry.amountCents < 0 ? "negative" : "positive"}">
            ${formatAmount(entry.amountCents)}
          </td>
        </tr>
      `,
    )
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body {
            color: #172426;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            margin: 0;
            padding: 40px;
          }
          .kicker {
            color: #526062;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          h1 {
            font-size: 32px;
            margin: 6px 0 20px;
          }
          .summary {
            border: 1px solid #d9d6ca;
            border-radius: 12px;
            margin-bottom: 24px;
            padding: 18px;
          }
          .summary-label {
            color: #526062;
            font-size: 13px;
            font-weight: 700;
          }
          .summary-total {
            font-size: 34px;
            font-weight: 800;
            margin-top: 4px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th {
            border-bottom: 1px solid #d9d6ca;
            color: #526062;
            font-size: 12px;
            padding: 10px 0;
            text-align: left;
            text-transform: uppercase;
          }
          th:last-child,
          td:last-child {
            text-align: right;
          }
          td {
            border-bottom: 1px solid #ece8dd;
            padding: 14px 0;
            vertical-align: top;
          }
          td span {
            color: #687476;
            display: block;
            font-size: 12px;
            margin-top: 4px;
          }
          .positive { color: #2e766f; font-weight: 800; }
          .negative { color: #b14a3b; font-weight: 800; }
          .empty {
            color: #687476;
            padding: 24px 0;
          }
          .footer {
            color: #687476;
            font-size: 11px;
            margin-top: 28px;
          }
        </style>
      </head>
      <body>
        <div class="kicker">Ledger report</div>
        <h1>${user}</h1>
        <section class="summary">
          <div class="summary-label">Total purchases</div>
          <div class="summary-total">${formatAmount(balanceCents)}</div>
        </section>
        ${
          entries.length
            ? `<table>
                <thead>
                  <tr>
                    <th>Entry</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>`
            : `<div class="empty">No entries yet.</div>`
        }
        <div class="footer">Generated ${formatEntryDate(generatedAt)}</div>
      </body>
    </html>
  `;
};

const seedEntries: LedgerEntry[] = [
  {
    id: "demo-1",
    amountCents: 4250,
    source: "Default",
    note: "Dinner split",
    user: "Mom",
    createdAt: new Date(),
  },
  {
    id: "demo-2",
    amountCents: -1800,
    source: "Careem",
    note: "Coffee and parking",
    user: "Mom",
    createdAt: new Date(Date.now() - 86400000),
  },
  {
    id: "demo-3",
    amountCents: 3200,
    source: "Noon",
    note: "Groceries",
    user: "Dad",
    createdAt: new Date(),
  },
  {
    id: "demo-4",
    amountCents: -1500,
    source: "Amazon",
    note: "Phone charger",
    user: "Dad",
    createdAt: new Date(Date.now() - 86400000),
  },
];

const entriesFromDocs = (
  docs: Array<{ id: string; data: () => Record<string, unknown> }>,
): LedgerEntry[] =>
  docs.map((entryDoc) => {
    const data = entryDoc.data();
    const createdAt =
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : new Date();

    return {
      id: entryDoc.id,
      amountCents: typeof data.amountCents === "number" ? data.amountCents : 0,
      source: typeof data.source === "string" ? data.source : "Default",
      note: typeof data.note === "string" ? data.note : "",
      user: typeof data.user === "string" ? data.user : "Dad",
      createdAt,
    };
  });

const aedSymbolPath =
  "m88.3 1c0.4 0.6 2.6 3.3 4.7 5.9 15.3 18.2 26.8 47.8 33 85.1 4.1 24.5 4.3 32.2 4.3 125.6v87h-41.8c-38.2 0-42.6-0.2-50.1-1.7-11.8-2.5-24-9.2-32.2-17.8-6.5-6.9-6.3-7.3-5.9 13.6 0.5 17.3 0.7 19.2 3.2 28.6 4 14.9 9.5 26 17.8 35.9 11.3 13.6 22.8 21.2 39.2 26.3 3.5 1 10.9 1.4 37.1 1.6l32.7 0.5v43.3 43.4l-46.1-0.3-46.3-0.3-8-3.2c-9.5-3.8-13.8-6.6-23.1-14.9l-6.8-6.1 0.4 19.1c0.5 17.7 0.6 19.7 3.1 28.7 8.7 31.8 29.7 54.5 57.4 61.9 6.9 1.9 9.6 2 38.5 2.4l30.9 0.4v89.6c0 54.1-0.3 94-0.8 100.8-0.5 6.2-2.1 17.8-3.5 25.9-6.5 37.3-18.2 65.4-35 83.6l-3.4 3.7h169.1c101.1 0 176.7-0.4 187.8-0.9 19.5-1 63-5.3 72.8-7.4 3.1-0.6 8.9-1.5 12.7-2.1 8.1-1.2 21.5-4 40.8-8.9 27.2-6.8 52-15.3 76.3-26.1 7.6-3.4 29.4-14.5 35.2-18 3.1-1.8 6.8-4 8.2-4.7 3.9-2.1 10.4-6.3 19.9-13.1 4.7-3.4 9.4-6.7 10.4-7.4 4.2-2.8 18.7-14.9 25.3-21 25.1-23.1 46.1-48.8 62.4-76.3 2.3-4 5.3-9 6.6-11.1 3.3-5.6 16.9-33.6 18.2-37.8 0.6-1.9 1.4-3.9 1.8-4.3 2.6-3.4 17.6-50.6 19.4-60.9 0.6-3.3 0.9-3.8 3.4-4.3 1.6-0.3 24.9-0.3 51.8-0.1 53.8 0.4 53.8 0.4 65.7 5.9 6.7 3.1 8.7 4.5 16.1 11.2 9.7 8.7 8.8 10.1 8.2-11.7-0.4-12.8-0.9-20.7-1.8-23.9-3.4-12.3-4.2-14.9-7.2-21.1-9.8-21.4-26.2-36.7-47.2-44l-8.2-3-33.4-0.4-33.3-0.5 0.4-11.7c0.4-15.4 0.4-45.9-0.1-61.6l-0.4-12.6 44.6-0.2c38.2-0.2 45.3 0 49.5 1.1 12.6 3.5 21.1 8.3 31.5 17.8l5.8 5.4v-14.8c0-17.6-0.9-25.4-4.5-37-7.1-23.5-21.1-41-41.1-51.8-13-7-13.8-7.2-58.5-7.5-26.2-0.2-39.9-0.6-40.6-1.2-0.6-0.6-1.1-1.6-1.1-2.4 0-0.8-1.5-7.1-3.5-13.9-23.4-82.7-67.1-148.4-131-197.1-8.7-6.7-30-20.8-38.6-25.6-3.3-1.9-6.9-3.9-7.8-4.5-4.2-2.3-28.3-14.1-34.3-16.6-3.6-1.6-8.3-3.6-10.4-4.4-35.3-15.3-94.5-29.8-139.7-34.3-7.4-0.7-17.2-1.8-21.7-2.2-20.4-2.3-48.7-2.6-209.4-2.6-135.8 0-169.9 0.3-169.4 1zm330.7 43.3c33.8 2 54.6 4.6 78.9 10.5 74.2 17.6 126.4 54.8 164.3 117 3.5 5.8 18.3 36 20.5 42.1 10.5 28.3 15.6 45.1 20.1 67.3 1.1 5.4 2.6 12.6 3.3 16 0.7 3.3 1 6.4 0.7 6.7-0.5 0.4-100.9 0.6-223.3 0.5l-222.5-0.2-0.3-128.5c-0.1-70.6 0-129.3 0.3-130.4l0.4-1.9h71.1c39 0 78 0.4 86.5 0.9zm297.5 350.3c0.7 4.3 0.7 77.3 0 80.9l-0.6 2.7-227.5-0.2-227.4-0.3-0.2-42.4c-0.2-23.3 0-42.7 0.2-43.1 0.3-0.5 97.2-0.8 227.7-0.8h227.2zm-10.2 171.7c0.5 1.5-1.9 13.8-6.8 33.8-5.6 22.5-13.2 45.2-20.9 62-3.8 8.6-13.3 27.2-15.6 30.7-1.1 1.6-4.3 6.7-7.1 11.2-18 28.2-43.7 53.9-73 72.9-10.7 6.8-32.7 18.4-38.6 20.2-1.2 0.3-2.5 0.9-3 1.3-0.7 0.6-9.8 4-20.4 7.8-19.5 6.9-56.6 14.4-86.4 17.5-19.3 1.9-22.4 2-96.7 2h-76.9v-129.7-129.8l220.9-0.4c121.5-0.2 221.6-0.5 222.4-0.7 0.9-0.1 1.8 0.5 2.1 1.2z";

function AedSymbol({
  color = "#172426",
  size,
}: {
  color?: string;
  size: "large" | "small";
}) {
  const dimensions =
    size === "large" ? styles.aedSymbolLarge : styles.aedSymbolSmall;

  return (
    <View style={[styles.aedSymbolFrame, dimensions]}>
      <Svg
        accessibilityLabel="UAE dirham"
        height="100%"
        viewBox="0 0 1000 870"
        width="100%"
      >
        <Path d={aedSymbolPath} fill={color} />
      </Svg>
    </View>
  );
}

export default function App() {
  const [people, setPeople] = useState<Person[]>(
    firebaseIsConfigured ? [] : defaultPeople,
  );
  const [selectedUser, setSelectedUser] = useState(defaultPeople[0].name);
  const [entries, setEntries] = useState<LedgerEntry[]>(
    firebaseIsConfigured ? [] : seedEntries,
  );
  const [purchaseSources, setPurchaseSources] = useState<PurchaseSource[]>(
    firebaseIsConfigured ? [] : defaultPurchaseSources,
  );
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState(defaultPurchaseSources[0].name);
  const [newPersonName, setNewPersonName] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPerson, setIsSavingPerson] = useState(false);
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [addEntryModalVisible, setAddEntryModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("sources");
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [sourceDeleteConfirmVisible, setSourceDeleteConfirmVisible] =
    useState(false);
  const [personDeleteConfirmVisible, setPersonDeleteConfirmVisible] =
    useState(false);
  const [entryToDelete, setEntryToDelete] = useState<LedgerEntry | null>(null);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [sourceToDelete, setSourceToDelete] = useState<PurchaseSource | null>(
    null,
  );

  const addOverlayOpacity = useRef(new Animated.Value(0)).current;
  const addSlide = useRef(new Animated.Value(1)).current;
  const delOverlayOpacity = useRef(new Animated.Value(0)).current;
  const delSlide = useRef(new Animated.Value(1)).current;

  const animateIn = (opacity: Animated.Value, slide: Animated.Value) => {
    opacity.setValue(0);
    slide.setValue(1);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  useEffect(() => {
    if (addEntryModalVisible) animateIn(addOverlayOpacity, addSlide);
  }, [addEntryModalVisible]);
  useEffect(() => {
    if (deleteConfirmVisible) animateIn(delOverlayOpacity, delSlide);
  }, [deleteConfirmVisible]);

  const isFormValid =
    amount.trim().length > 0 &&
    note.trim().length > 0 &&
    source.trim().length > 0;

  const userEntries = useMemo(
    () => entries.filter((entry) => entry.user === selectedUser),
    [entries, selectedUser],
  );

  const editablePurchaseSources = useMemo(
    () => purchaseSources.filter((item) => !isDefaultSource(item.name)),
    [purchaseSources],
  );

  const peopleCountLabel = formatPeopleCountLabel(people.length);

  useEffect(() => {
    if (!db) {
      return;
    }

    const database = db;
    const peopleQuery = query(collection(database, "people"), orderBy("name"));

    return onSnapshot(
      peopleQuery,
      (snapshot) => {
        const nextPeople = snapshot.docs
          .map((personDoc) => {
            const data = personDoc.data();
            const name = typeof data.name === "string" ? data.name.trim() : "";

            return name ? { id: personDoc.id, name } : null;
          })
          .filter((item): item is Person => item !== null);

        if (!nextPeople.length) {
          Promise.all(
            defaultPeople.map((defaultPerson) =>
              setDoc(doc(database, "people", defaultPerson.id), {
                name: defaultPerson.name,
                createdAt: serverTimestamp(),
              }),
            ),
          ).catch((error) => {
            Alert.alert("Could not create default people", String(error));
          });
        }

        setPeople(nextPeople);
      },
      (error) => {
        Alert.alert("Could not sync people", error.message);
      },
    );
  }, []);

  useEffect(() => {
    if (!people.length) {
      return;
    }

    if (!people.some((item) => item.name === selectedUser)) {
      setSelectedUser(people[0].name);
    }
  }, [people, selectedUser]);

  useEffect(() => {
    if (!db) {
      return;
    }

    const database = db;
    const sourcesQuery = query(
      collection(database, "purchaseSources"),
      orderBy("name", "asc"),
    );

    return onSnapshot(
      sourcesQuery,
      (snapshot) => {
        const nextSources = snapshot.docs
          .map((sourceDoc) => {
            const data = sourceDoc.data();
            const name = typeof data.name === "string" ? data.name.trim() : "";

            return name ? { id: sourceDoc.id, name } : null;
          })
          .filter((item): item is PurchaseSource => item !== null);

        if (!nextSources.length) {
          Promise.all(
            defaultPurchaseSources.map((defaultSource) =>
              setDoc(doc(database, "purchaseSources", defaultSource.id), {
                name: defaultSource.name,
                createdAt: serverTimestamp(),
              }),
            ),
          ).catch((error) => {
            Alert.alert("Could not create default sources", String(error));
          });
        }

        setPurchaseSources(nextSources);
      },
      (error) => {
        Alert.alert("Could not sync sources", error.message);
      },
    );
  }, []);

  useEffect(() => {
    if (!purchaseSources.length) {
      return;
    }

    if (!purchaseSources.some((item) => item.name === source)) {
      setSource(purchaseSources[0].name);
    }
  }, [purchaseSources, source]);

  useEffect(() => {
    if (!db) {
      return;
    }

    const userLedgerId = ledgerId(selectedUser);
    const entriesQuery = query(
      collection(db, "ledgers", userLedgerId, "entries"),
      orderBy("createdAt", "desc"),
    );

    return onSnapshot(
      entriesQuery,
      (snapshot) => {
        setEntries(entriesFromDocs(snapshot.docs));
      },
      (error) => {
        Alert.alert("Could not sync ledger", error.message);
      },
    );
  }, [selectedUser]);

  const balanceCents = useMemo(
    () => userEntries.reduce((total, entry) => total + entry.amountCents, 0),
    [userEntries],
  );

  const addEntry = async () => {
    const parsedAmount = Number.parseFloat(amount);

    if (!Number.isFinite(parsedAmount) || parsedAmount === 0) {
      Alert.alert(
        "Enter an amount",
        "Use a number like 24.50, or -24.50 when you owe money.",
      );
      return;
    }

    const nextEntry: LedgerEntry = {
      id: `local-${Date.now()}`,
      amountCents: Math.round(parsedAmount * 100),
      source,
      note: note.trim(),
      user: selectedUser,
      createdAt: new Date(),
    };

    setIsSaving(true);

    try {
      if (db) {
        const userLedgerId = ledgerId(selectedUser);
        await addDoc(collection(db, "ledgers", userLedgerId, "entries"), {
          amountCents: nextEntry.amountCents,
          source: nextEntry.source,
          note: nextEntry.note,
          user: nextEntry.user,
          createdAt: serverTimestamp(),
        });
      } else {
        setEntries((currentEntries) => [nextEntry, ...currentEntries]);
      }

      setAmount("");
      setNote("");
    } catch (error) {
      Alert.alert("Could not save entry", String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const refreshEntries = async () => {
    if (!db) {
      setEntries((currentEntries) => [...currentEntries]);
      return;
    }

    setIsRefreshing(true);

    try {
      const snapshot = await getDocs(
        query(
          collection(db, "ledgers", ledgerId(selectedUser), "entries"),
          orderBy("createdAt", "desc"),
        ),
      );

      setEntries(entriesFromDocs(snapshot.docs));
    } catch (error) {
      Alert.alert("Could not refresh ledger", String(error));
    } finally {
      setIsRefreshing(false);
    }
  };

  const removeEntry = async (entry: LedgerEntry) => {
    try {
      if (db) {
        await deleteDoc(
          doc(db, "ledgers", ledgerId(selectedUser), "entries", entry.id),
        );
      } else {
        setEntries((currentEntries) =>
          currentEntries.filter((item) => item.id !== entry.id),
        );
      }
    } catch (error) {
      Alert.alert("Could not delete entry", String(error));
    }
  };

  const addPerson = async () => {
    const trimmedName = newPersonName.trim();

    if (!trimmedName) {
      Alert.alert("Enter a name", "Use a name like Dad or Mom.");
      return;
    }

    if (
      people.some(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      Alert.alert("Person already exists", `${trimmedName} is already listed.`);
      return;
    }

    setIsSavingPerson(true);

    try {
      if (db) {
        await addDoc(collection(db, "people"), {
          name: trimmedName,
          createdAt: serverTimestamp(),
        });
      } else {
        setPeople((currentPeople) => [
          ...currentPeople,
          {
            id: sourceIdFromName(trimmedName) || `person-${Date.now()}`,
            name: trimmedName,
          },
        ]);
      }

      setSelectedUser(trimmedName);
      setNewPersonName("");
    } catch (error) {
      Alert.alert("Could not add person", String(error));
    } finally {
      setIsSavingPerson(false);
    }
  };

  const removePerson = async (personToRemove: Person) => {
    if (people.length <= 1) {
      Alert.alert("Keep one person", "At least one person is required.");
      return;
    }

    try {
      if (db) {
        await deleteDoc(doc(db, "people", personToRemove.id));
      } else {
        setPeople((currentPeople) =>
          currentPeople.filter((item) => item.id !== personToRemove.id),
        );
      }

      if (selectedUser === personToRemove.name) {
        const nextPerson = people.find((item) => item.id !== personToRemove.id);
        if (nextPerson) setSelectedUser(nextPerson.name);
      }
    } catch (error) {
      Alert.alert("Could not remove person", String(error));
    }
  };

  const requestRemovePerson = (personToRemove: Person) => {
    setPersonToDelete(personToRemove);
    setPersonDeleteConfirmVisible(true);
  };

  const addPurchaseSource = async () => {
    const trimmedName = newSourceName.trim();

    if (!trimmedName) {
      Alert.alert("Enter a source", "Use a name like Amazon or Groceries.");
      return;
    }

    if (
      purchaseSources.some(
        (item) => item.name.toLowerCase() === trimmedName.toLowerCase(),
      )
    ) {
      Alert.alert("Source already exists", `${trimmedName} is already listed.`);
      return;
    }

    setIsSavingSource(true);

    try {
      if (db) {
        await addDoc(collection(db, "purchaseSources"), {
          name: trimmedName,
          createdAt: serverTimestamp(),
        });
      } else {
        setPurchaseSources((currentSources) => [
          ...currentSources,
          {
            id: sourceIdFromName(trimmedName) || `source-${Date.now()}`,
            name: trimmedName,
          },
        ]);
      }

      setSource(trimmedName);
      setNewSourceName("");
    } catch (error) {
      Alert.alert("Could not add source", String(error));
    } finally {
      setIsSavingSource(false);
    }
  };

  const removePurchaseSource = async (sourceToRemove: PurchaseSource) => {
    if (isDefaultSource(sourceToRemove.name)) {
      Alert.alert("Default source", "Default cannot be deleted.");
      return;
    }

    if (purchaseSources.length <= 1) {
      Alert.alert("Keep one source", "At least one source is required.");
      return;
    }

    try {
      if (db) {
        await deleteDoc(doc(db, "purchaseSources", sourceToRemove.id));
      } else {
        setPurchaseSources((currentSources) =>
          currentSources.filter((item) => item.id !== sourceToRemove.id),
        );
      }

      if (source === sourceToRemove.name) {
        const nextSource = purchaseSources.find(
          (item) => item.id !== sourceToRemove.id,
        );
        if (nextSource) setSource(nextSource.name);
      }
    } catch (error) {
      Alert.alert("Could not remove source", String(error));
    }
  };

  const requestRemovePurchaseSource = (sourceToRemove: PurchaseSource) => {
    setSourceToDelete(sourceToRemove);
    setSourceDeleteConfirmVisible(true);
  };

  const shareLedgerPdf = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Share from your phone",
        "PDF sharing is available in Expo Go on Android.",
      );
      return;
    }

    setIsSharing(true);

    try {
      const html = buildLedgerReportHtml({
        balanceCents,
        entries: userEntries,
        user: selectedUser,
      });
      const { uri } = await Print.printToFileAsync({
        base64: false,
        html,
      });
      const sharingAvailable = await Sharing.isAvailableAsync();

      if (!sharingAvailable) {
        Alert.alert("Sharing unavailable", "This device cannot share files.");
        return;
      }

      await Sharing.shareAsync(uri, {
        dialogTitle: "Share ledger PDF",
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
      });
    } catch (error) {
      Alert.alert("Could not share PDF", String(error));
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.screen}
        >
          <View style={styles.nonScrollContent}>
            <View style={styles.header}>
              <View style={styles.headerTopRow}>
                <Text style={styles.kicker}>{peopleCountLabel}</Text>
                <View style={styles.headerActions}>
                  <Pressable
                    accessibilityLabel="Manage sources"
                    onPress={() => setSettingsModalVisible(true)}
                    style={({ pressed }) => [
                      styles.headerIconButton,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <MaterialIcons name="settings" style={styles.headerIcon} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Refresh ledger"
                    disabled={isRefreshing}
                    onPress={refreshEntries}
                    style={({ pressed }) => [
                      styles.headerIconButton,
                      pressed && styles.buttonPressed,
                      isRefreshing && styles.buttonDisabled,
                    ]}
                  >
                    <MaterialIcons
                      name={isRefreshing ? "hourglass-empty" : "refresh"}
                      style={styles.headerIcon}
                    />
                  </Pressable>
                </View>
              </View>
              <View style={styles.tabBar}>
                {people.map((person) => {
                  const isActive = selectedUser === person.name;
                  return (
                    <Pressable
                      key={person.id}
                      onPress={() => setSelectedUser(person.name)}
                      style={[styles.tab, isActive && styles.tabActive]}
                    >
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.tabTextActive,
                        ]}
                      >
                        {person.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.balancePanel}>
                <Text style={styles.balanceLabel}>Total purchases</Text>
                <View style={styles.balanceAmountRow}>
                  <AedSymbol
                    color={balanceCents < 0 ? "#b14a3b" : "#172426"}
                    size="large"
                  />
                  <Text
                    style={[
                      styles.balanceAmount,
                      balanceCents < 0
                        ? styles.negativeAmount
                        : styles.totalAmount,
                    ]}
                  >
                    {balanceCents < 0 ? "(" : ""}
                    {amountFormatter.format(Math.abs(balanceCents) / 100)}
                    {balanceCents < 0 ? ")" : ""}
                  </Text>
                  <Pressable
                    accessibilityLabel="Share ledger PDF"
                    disabled={isSharing}
                    onPress={shareLedgerPdf}
                    style={({ pressed }) => [
                      styles.balanceIconButton,
                      pressed && styles.buttonPressed,
                      isSharing && styles.buttonDisabled,
                    ]}
                  >
                    <MaterialIcons
                      name={isSharing ? "hourglass-empty" : "ios-share"}
                      style={styles.balanceIcon}
                    />
                  </Pressable>
                </View>
                <Text style={styles.syncLabel}>
                  {firebaseIsConfigured
                    ? "Synced with Firebase"
                    : "Local demo mode"}
                </Text>
                <Pressable
                  onPress={() => setAddEntryModalVisible(true)}
                  style={styles.addEntryButton}
                >
                  <Text style={styles.addEntryButtonText}>Add entry</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <FlatList
            style={styles.list}
            contentContainerStyle={styles.listContent}
            data={userEntries}
            keyExtractor={(item) => item.id}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No entries yet</Text>
                <Text style={styles.emptyBody}>
                  Add the first amount to start tracking who owes whom.
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.entryRow}>
                <View style={styles.entryText}>
                  <Text style={styles.entryNote}>
                    {item.note || "Untitled entry"}
                  </Text>
                  <Text style={styles.entryMeta}>
                    {item.source} ·{" "}
                    {formatEntryDate(item.createdAt)}
                  </Text>
                </View>
                <View style={styles.entryAmountBlock}>
                  <View style={styles.entryAmountRow}>
                    <AedSymbol
                      color={item.amountCents < 0 ? "#b14a3b" : "#2e766f"}
                      size="small"
                    />
                    <Text
                      style={[
                        styles.entryAmount,
                        item.amountCents < 0
                          ? styles.negativeAmount
                          : styles.positiveAmount,
                      ]}
                    >
                      {item.amountCents < 0 ? "(" : ""}
                      {amountFormatter.format(Math.abs(item.amountCents) / 100)}
                      {item.amountCents < 0 ? ")" : ""}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      setEntryToDelete(item);
                      setDeleteConfirmVisible(true);
                    }}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            )}
          />

          <Modal
            animationType="none"
            transparent={true}
            visible={addEntryModalVisible}
            onRequestClose={() => setAddEntryModalVisible(false)}
          >
            <Animated.View
              style={[styles.modalOverlay, { opacity: addOverlayOpacity }]}
            >
              <Pressable
                onPress={() => setAddEntryModalVisible(false)}
                style={styles.modalDismissArea}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        translateY: addSlide.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 600],
                        }),
                      },
                    ],
                  }}
                >
                  <Pressable onPress={() => {}}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>New entry</Text>
                        <Pressable
                          onPress={() => setAddEntryModalVisible(false)}
                        >
                          <MaterialIcons
                            name="close"
                            size={24}
                            color="#526062"
                          />
                        </Pressable>
                      </View>

                      <View style={styles.formInModal}>
                        <View style={styles.pillGroup}>
                          <Pressable
                            onPress={() =>
                              setSourcePickerOpen((isOpen) => !isOpen)
                            }
                            style={styles.sourceHeader}
                          >
                            <Text style={styles.sourceLabel}>
                              Source:{" "}
                              <Text style={styles.sourceValue}>{source}</Text>
                            </Text>
                            <MaterialIcons
                              name={
                                sourcePickerOpen
                                  ? "keyboard-arrow-up"
                                  : "keyboard-arrow-down"
                              }
                              size={22}
                              color="#526062"
                            />
                          </Pressable>
                          {sourcePickerOpen && (
                            <View style={styles.sourcePickerPanel}>
                              <View style={styles.pillRow}>
                                {purchaseSources.map((purchaseSource) => {
                                  const isSelected =
                                    source === purchaseSource.name;

                                  return (
                                    <Pressable
                                      key={purchaseSource.id}
                                      onPress={() => {
                                        setSource(purchaseSource.name);
                                        setSourcePickerOpen(false);
                                      }}
                                      style={[
                                        styles.pill,
                                        isSelected && styles.pillActive,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.pillText,
                                          isSelected && styles.pillTextActive,
                                        ]}
                                      >
                                        {purchaseSource.name}
                                      </Text>
                                    </Pressable>
                                  );
                                })}
                              </View>
                              {!purchaseSources.length && (
                                <Text style={styles.noSourcesText}>
                                  Add a source before saving an entry.
                                </Text>
                              )}
                            </View>
                          )}
                        </View>

                        <View style={styles.inputRow}>
                          <TextInput
                            keyboardType="decimal-pad"
                            onChangeText={(text) => {
                              const sanitized = text.replace(/[^0-9.\-]/g, "");
                              setAmount(sanitized);
                            }}
                            placeholder="Amount"
                            placeholderTextColor="#7f8a8d"
                            style={[styles.input, styles.amountInput]}
                            value={amount}
                          />
                          <TextInput
                            onChangeText={setNote}
                            placeholder="Note"
                            placeholderTextColor="#7f8a8d"
                            style={styles.input}
                            value={note}
                          />
                        </View>

                        <Pressable
                          disabled={isSaving || !isFormValid}
                          onPress={async () => {
                            const parsedAmount = Number.parseFloat(amount);
                            if (
                              !Number.isFinite(parsedAmount) ||
                              parsedAmount === 0
                            ) {
                              Alert.alert(
                                "Enter an amount",
                                "Use a number like 24.50, or -24.50 when you owe money.",
                              );
                              return;
                            }
                            await addEntry();
                            setAddEntryModalVisible(false);
                          }}
                          style={({ pressed }) => [
                            styles.addButton,
                            pressed && isFormValid && styles.buttonPressed,
                            (isSaving || !isFormValid) && styles.buttonDisabled,
                          ]}
                        >
                          <Text style={styles.addButtonText}>
                            {isSaving ? "Saving..." : "Add entry"}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={settingsModalVisible}
            onRequestClose={() => setSettingsModalVisible(false)}
          >
            <View style={styles.settingsOverlay}>
              <View style={styles.settingsContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Settings</Text>
                  <Pressable
                    onPress={() => {
                      setSettingsModalVisible(false);
                      setNewPersonName("");
                      setNewSourceName("");
                    }}
                  >
                    <MaterialIcons name="close" size={24} color="#526062" />
                  </Pressable>
                </View>

                <View style={styles.formInModal}>
                  <View style={styles.settingsTabs}>
                    {(["sources", "people"] as SettingsTab[]).map((tab) => {
                      const isActive = settingsTab === tab;
                      return (
                        <Pressable
                          key={tab}
                          onPress={() => setSettingsTab(tab)}
                          style={[
                            styles.settingsTab,
                            isActive && styles.settingsTabActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.settingsTabText,
                              isActive && styles.settingsTabTextActive,
                            ]}
                          >
                            {tab === "people" ? "People" : "Sources"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {settingsTab === "people" ? (
                    <View>
                      <View style={styles.addSourceRow}>
                        <TextInput
                          onChangeText={setNewPersonName}
                          onSubmitEditing={addPerson}
                          placeholder="New person"
                          placeholderTextColor="#7f8a8d"
                          style={styles.addSourceInput}
                          value={newPersonName}
                        />
                        <Pressable
                          disabled={isSavingPerson}
                          onPress={addPerson}
                          style={({ pressed }) => [
                            styles.addSourceButton,
                            pressed && styles.buttonPressed,
                            isSavingPerson && styles.buttonDisabled,
                          ]}
                        >
                          <MaterialIcons name="add" size={22} color="#ffffff" />
                        </Pressable>
                      </View>

                      <ScrollView
                        contentContainerStyle={styles.sourceListContent}
                        style={styles.settingsList}
                      >
                        {people.map((person) => (
                          <View key={person.id} style={styles.sourceRow}>
                            <Text style={styles.sourceRowText}>
                              {person.name}
                            </Text>
                            <Pressable
                              accessibilityLabel={`Delete ${person.name}`}
                              onPress={() => requestRemovePerson(person)}
                              style={({ pressed }) => [
                                styles.sourceDeleteButton,
                                pressed && styles.buttonPressed,
                              ]}
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={21}
                                color="#b14a3b"
                              />
                            </Pressable>
                          </View>
                        ))}
                      </ScrollView>
                    </View>
                  ) : (
                    <View>
                      <View style={styles.addSourceRow}>
                        <TextInput
                          onChangeText={setNewSourceName}
                          onSubmitEditing={addPurchaseSource}
                          placeholder="New source"
                          placeholderTextColor="#7f8a8d"
                          style={styles.addSourceInput}
                          value={newSourceName}
                        />
                        <Pressable
                          disabled={isSavingSource}
                          onPress={addPurchaseSource}
                          style={({ pressed }) => [
                            styles.addSourceButton,
                            pressed && styles.buttonPressed,
                            isSavingSource && styles.buttonDisabled,
                          ]}
                        >
                          <MaterialIcons name="add" size={22} color="#ffffff" />
                        </Pressable>
                      </View>

                      <ScrollView
                        contentContainerStyle={styles.sourceListContent}
                        style={styles.settingsList}
                      >
                        {editablePurchaseSources.map((purchaseSource) => (
                          <View
                            key={purchaseSource.id}
                            style={styles.sourceRow}
                          >
                            <Text style={styles.sourceRowText}>
                              {purchaseSource.name}
                            </Text>
                            <Pressable
                              accessibilityLabel={`Delete ${purchaseSource.name}`}
                              onPress={() =>
                                requestRemovePurchaseSource(purchaseSource)
                              }
                              style={({ pressed }) => [
                                styles.sourceDeleteButton,
                                pressed && styles.buttonPressed,
                              ]}
                            >
                              <MaterialIcons
                                name="delete-outline"
                                size={21}
                                color="#b14a3b"
                              />
                            </Pressable>
                          </View>
                        ))}
                        {!editablePurchaseSources.length && (
                          <Text style={styles.noSourcesText}>
                            Add custom sources to show them here.
                          </Text>
                        )}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="none"
            transparent={true}
            visible={deleteConfirmVisible}
            onRequestClose={() => setDeleteConfirmVisible(false)}
          >
            <Animated.View
              style={[styles.modalOverlay, { opacity: delOverlayOpacity }]}
            >
              <Pressable
                onPress={() => {
                  setDeleteConfirmVisible(false);
                  setEntryToDelete(null);
                }}
                style={styles.modalDismissArea}
              >
                <Animated.View
                  style={{
                    transform: [
                      {
                        translateY: delSlide.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 600],
                        }),
                      },
                    ],
                  }}
                >
                  <Pressable onPress={() => {}}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Delete entry?</Text>
                        <Pressable
                          onPress={() => setDeleteConfirmVisible(false)}
                        >
                          <MaterialIcons
                            name="close"
                            size={24}
                            color="#526062"
                          />
                        </Pressable>
                      </View>

                      {entryToDelete && (
                        <View style={styles.formInModal}>
                          <Text style={styles.deleteConfirmText}>
                            {entryToDelete.note || "Untitled entry"}
                          </Text>
                          <Text style={styles.deleteConfirmMeta}>
                            {entryToDelete.source} ·{" "}
                            {amountFormatter.format(
                              Math.abs(entryToDelete.amountCents) / 100,
                            )}{" "}
                            AED
                          </Text>
                          <Text style={styles.deleteConfirmDate}>
                            {entryToDelete.createdAt.toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              },
                            )}
                          </Text>

                          <View style={styles.deleteConfirmButtons}>
                            <Pressable
                              onPress={() => setDeleteConfirmVisible(false)}
                              style={styles.deleteCancelButton}
                            >
                              <Text style={styles.deleteCancelText}>
                                Cancel
                              </Text>
                            </Pressable>
                            <Pressable
                              onPress={async () => {
                                await removeEntry(entryToDelete);
                                setDeleteConfirmVisible(false);
                                setEntryToDelete(null);
                              }}
                              style={styles.deleteConfirmButton}
                            >
                              <Text style={styles.deleteConfirmButtonText}>
                                Delete
                              </Text>
                            </Pressable>
                          </View>
                        </View>
                      )}
                    </View>
                  </Pressable>
                </Animated.View>
              </Pressable>
            </Animated.View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={sourceDeleteConfirmVisible}
            onRequestClose={() => setSourceDeleteConfirmVisible(false)}
          >
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Delete source?</Text>
                  <Pressable
                    onPress={() => setSourceDeleteConfirmVisible(false)}
                  >
                    <MaterialIcons name="close" size={24} color="#526062" />
                  </Pressable>
                </View>

                {sourceToDelete && (
                  <View style={styles.formInModal}>
                    <Text style={styles.deleteConfirmText}>
                      {sourceToDelete.name}
                    </Text>
                    <Text style={styles.deleteConfirmMeta}>
                      This permanently removes the source option. Existing
                      entries that already use it will keep their source name.
                    </Text>

                    <View style={styles.deleteConfirmButtons}>
                      <Pressable
                        onPress={() => {
                          setSourceDeleteConfirmVisible(false);
                          setSourceToDelete(null);
                        }}
                        style={styles.deleteCancelButton}
                      >
                        <Text style={styles.deleteCancelText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={async () => {
                          await removePurchaseSource(sourceToDelete);
                          setSourceDeleteConfirmVisible(false);
                          setSourceToDelete(null);
                        }}
                        style={styles.deleteConfirmButton}
                      >
                        <Text style={styles.deleteConfirmButtonText}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Modal>

          <Modal
            animationType="fade"
            transparent={true}
            visible={personDeleteConfirmVisible}
            onRequestClose={() => setPersonDeleteConfirmVisible(false)}
          >
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Delete person?</Text>
                  <Pressable
                    onPress={() => setPersonDeleteConfirmVisible(false)}
                  >
                    <MaterialIcons name="close" size={24} color="#526062" />
                  </Pressable>
                </View>

                {personToDelete && (
                  <View style={styles.formInModal}>
                    <Text style={styles.deleteConfirmText}>
                      {personToDelete.name}
                    </Text>
                    <Text style={styles.deleteConfirmMeta}>
                      This removes the person from the ledger tabs. Their
                      existing entries are not deleted from Firestore.
                    </Text>

                    <View style={styles.deleteConfirmButtons}>
                      <Pressable
                        onPress={() => {
                          setPersonDeleteConfirmVisible(false);
                          setPersonToDelete(null);
                        }}
                        style={styles.deleteCancelButton}
                      >
                        <Text style={styles.deleteCancelText}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        onPress={async () => {
                          await removePerson(personToDelete);
                          setPersonDeleteConfirmVisible(false);
                          setPersonToDelete(null);
                        }}
                        style={styles.deleteConfirmButton}
                      >
                        <Text style={styles.deleteConfirmButtonText}>
                          Delete
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f1ea",
    ...Platform.select({
      web: {
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f4f1ea",
    ...Platform.select({
      web: {
        maxWidth: 430,
        width: "100%",
      },
    }),
  },
  screen: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  headerIconButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  headerIcon: {
    color: "#526062",
    fontSize: 21,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  kicker: {
    color: "#526062",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  tabBar: {
    flexDirection: "row",
    marginTop: 10,
  },
  tab: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  tabText: {
    color: "#526062",
    fontSize: 15,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  balancePanel: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    padding: 18,
  },
  balanceLabel: {
    color: "#526062",
    fontSize: 14,
    fontWeight: "700",
  },
  balanceAmount: {
    color: "#172426",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  syncLabel: {
    color: "#6b7678",
    fontSize: 13,
    marginTop: 8,
  },
  balanceAmountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  balanceIconButton: {
    alignItems: "center",
    backgroundColor: "#f4f1ea",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginLeft: "auto",
    width: 36,
  },
  balanceIcon: {
    color: "#2e766f",
    fontSize: 21,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  pillGroup: {
    marginTop: 0,
  },
  sourceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sourceLabel: {
    color: "#526062",
    fontSize: 15,
    fontWeight: "700",
  },
  sourceValue: {
    color: "#172426",
    fontWeight: "800",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  pillText: {
    color: "#172426",
    fontSize: 14,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  sourcePickerPanel: {
    marginTop: 10,
  },
  addSourceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  addSourceInput: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    color: "#172426",
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  addSourceButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    justifyContent: "center",
    width: 44,
  },
  sourcePill: {
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  sourcePillName: {
    paddingLeft: 14,
    paddingVertical: 10,
  },
  removeSourceButton: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  noSourcesText: {
    color: "#687476",
    fontSize: 13,
    marginTop: 8,
  },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    color: "#172426",
    flex: 1,
    fontSize: 16,
    minHeight: 50,
    minWidth: 0,
    paddingHorizontal: 14,
  },
  amountInput: {
    flex: 0.55,
    minWidth: 0,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 50,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  nonScrollContent: {
    flexShrink: 0,
    paddingTop: 20,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 42,
  },
  emptyTitle: {
    color: "#172426",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBody: {
    color: "#687476",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  entryRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  entryText: {
    flex: 1,
    overflow: "hidden",
  },
  entryNote: {
    color: "#172426",
    fontSize: 16,
    fontWeight: "800",
    ...Platform.select({
      web: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }),
  },
  entryMeta: {
    color: "#687476",
    fontSize: 13,
    marginTop: 4,
    ...Platform.select({
      web: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }),
  },
  entryAmountBlock: {
    alignItems: "flex-end",
  },
  entryAmountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  positiveAmount: {
    color: "#2e766f",
  },
  negativeAmount: {
    color: "#b14a3b",
  },
  totalAmount: {
    color: "#172426",
  },
  deleteText: {
    color: "#687476",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
  aedSymbolLarge: {
    height: 24,
    width: 28,
  },
  aedSymbolSmall: {
    height: 10,
    width: 12,
  },
  aedSymbolFrame: {
    alignItems: "center",
    justifyContent: "flex-end",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#f4f1ea",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 40,
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  settingsContent: {
    backgroundColor: "#f4f1ea",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "82%",
    paddingBottom: 26,
  },
  confirmOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  confirmContent: {
    backgroundColor: "#f4f1ea",
    borderRadius: 12,
    maxWidth: 390,
    width: "100%",
  },
  modalDismissArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    color: "#172426",
    fontSize: 18,
    fontWeight: "800",
  },
  formInModal: {
    padding: 20,
  },
  addEntryButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    marginTop: 14,
    minHeight: 44,
    justifyContent: "center",
  },
  addEntryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  settingsTabs: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  settingsTab: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
  },
  settingsTabActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  settingsTabText: {
    color: "#526062",
    fontSize: 15,
    fontWeight: "800",
  },
  settingsTabTextActive: {
    color: "#ffffff",
  },
  settingsList: {
    maxHeight: 360,
  },
  sourceListContent: {
    gap: 8,
    paddingTop: 2,
  },
  sourceRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingLeft: 14,
  },
  sourceRowText: {
    color: "#172426",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  sourceDeleteButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  deleteConfirmText: {
    color: "#172426",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  deleteConfirmMeta: {
    color: "#687476",
    fontSize: 14,
  },
  deleteConfirmDate: {
    color: "#526062",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  deleteCancelButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  deleteCancelText: {
    color: "#526062",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteConfirmButton: {
    alignItems: "center",
    backgroundColor: "#b14a3b",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  deleteConfirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
