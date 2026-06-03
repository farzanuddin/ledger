import { Timestamp } from "firebase/firestore";
import type { Entry, Person, Source } from "../types";

type FirestoreDoc = {
  id: string;
  data: () => Record<string, unknown>;
};

export const entriesFromDocs = (docs: FirestoreDoc[]): Entry[] =>
  docs.map((entryDoc) => {
    const data = entryDoc.data();
    const createdAt =
      data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();

    return {
      id: entryDoc.id,
      amountCents: typeof data.amountCents === "number" ? data.amountCents : 0,
      source: typeof data.source === "string" ? data.source : "Unknown source",
      note: typeof data.note === "string" ? data.note : "",
      personId:
        typeof data.personId === "string"
          ? data.personId
          : typeof data.user === "string"
            ? data.user.toLowerCase()
            : "unknown",
      createdAt,
    };
  });

const namedRecordFromDoc = <T extends Person | Source>(
  itemDoc: FirestoreDoc,
): T | null => {
  const data = itemDoc.data();
  const name = typeof data.name === "string" ? data.name.trim() : "";
  return name ? ({ id: itemDoc.id, name } as T) : null;
};

export const peopleFromDocs = (docs: FirestoreDoc[]): Person[] =>
  docs
    .map((personDoc) => namedRecordFromDoc<Person>(personDoc))
    .filter((item): item is Person => item !== null);

export const sourcesFromDocs = (docs: FirestoreDoc[]): Source[] =>
  docs
    .map((sourceDoc) => namedRecordFromDoc<Source>(sourceDoc))
    .filter((item): item is Source => item !== null);
