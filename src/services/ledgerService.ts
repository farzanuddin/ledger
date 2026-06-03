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
  type Unsubscribe,
} from "firebase/firestore";

import { ledgerId } from "../utils/ledger";
import { db } from "../firebase";
import { entriesFromDocs, peopleFromDocs, sourcesFromDocs } from "./firestoreMappers";
import type { Entry, Person, Source } from "../types";

export const subscribeToPeople = ({
  onData,
  onError,
}: {
  onData: (people: Person[]) => void;
  onError: (error: Error) => void;
}): Unsubscribe | undefined => {
  if (!db) return undefined;

  const peopleQuery = query(collection(db, "people"), orderBy("name"));

  return onSnapshot(
    peopleQuery,
    (snapshot) => onData(peopleFromDocs(snapshot.docs)),
    onError,
  );
};

export const subscribeToSources = ({
  onData,
  onError,
}: {
  onData: (sources: Source[]) => void;
  onError: (error: Error) => void;
}): Unsubscribe | undefined => {
  if (!db) return undefined;

  const sourcesQuery = query(collection(db, "purchaseSources"), orderBy("name", "asc"));

  return onSnapshot(
    sourcesQuery,
    (snapshot) => onData(sourcesFromDocs(snapshot.docs)),
    onError,
  );
};

export const subscribeToEntries = ({
  onData,
  onError,
  personId,
}: {
  onData: (entries: Entry[]) => void;
  onError: (error: Error) => void;
  personId: string;
}): Unsubscribe | undefined => {
  if (!db) return undefined;

  const entriesQuery = query(
    collection(db, "ledgers", ledgerId(personId), "entries"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    entriesQuery,
    (snapshot) => onData(entriesFromDocs(snapshot.docs)),
    onError,
  );
};

export const createEntry = async (entry: Entry) => {
  if (!db) return;

  await addDoc(collection(db, "ledgers", ledgerId(entry.personId), "entries"), {
    amountCents: entry.amountCents,
    source: entry.source,
    note: entry.note,
    personId: entry.personId,
    createdAt: serverTimestamp(),
  });
};

export const fetchEntries = async (personId: string) => {
  if (!db) return [];

  const snapshot = await getDocs(
    query(
      collection(db, "ledgers", ledgerId(personId), "entries"),
      orderBy("createdAt", "desc"),
    ),
  );

  return entriesFromDocs(snapshot.docs);
};

export const deleteEntry = async (entry: Entry) => {
  if (!db) return;

  await deleteDoc(doc(db, "ledgers", ledgerId(entry.personId), "entries", entry.id));
};

export const createPerson = async (name: string) => {
  if (!db) return "";

  const personRef = await addDoc(collection(db, "people"), {
    name,
    createdAt: serverTimestamp(),
  });

  return personRef.id;
};

export const deletePerson = async (person: Person) => {
  if (!db) return;

  await deleteDoc(doc(db, "people", person.id));
};

export const createSource = async (name: string) => {
  if (!db) return;

  await addDoc(collection(db, "purchaseSources"), {
    name,
    createdAt: serverTimestamp(),
  });
};

export const deleteSource = async (source: Source) => {
  if (!db) return;

  await deleteDoc(doc(db, "purchaseSources", source.id));
};
