import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { db } from "../firebase";
import {
  createEntry,
  deleteEntry,
  fetchEntries,
  subscribeToEntries,
} from "../services/ledgerService";
import type { Entry, Person } from "../types";
import { handleAction } from "../utils/actions";
import { parseAmountCents } from "../utils/validation";

export function useEntries(selectedPerson: Person | undefined) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(db));
  const [isSaving, setIsSaving] = useState(false);

  const requireFirebase = useCallback(() => {
    if (db) return true;

    Alert.alert(
      "Firebase not configured",
      "Connect Firebase before using the ledger.",
    );
    return false;
  }, []);

  useEffect(() => {
    if (!db) return;
    if (!selectedPerson) {
      setEntries([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    return subscribeToEntries({
      onData: (nextEntries) => {
        setEntries(nextEntries);
        setIsLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync ledger", String(error));
        setIsLoading(false);
      },
      personId: selectedPerson.id,
    });
  }, [selectedPerson]);

  const balanceCents = useMemo(
    () => entries.reduce((total, entry) => total + entry.amountCents, 0),
    [entries],
  );

  const addEntry = useCallback(
    async ({
      amount,
      note,
      source,
    }: {
      amount: string;
      note: string;
      source: string;
    }) => {
      if (!requireFirebase()) return false;

      if (!selectedPerson) {
        Alert.alert(
          "Add a person first",
          "Create a person before adding entries.",
        );
        return false;
      }

      const nextEntry: Entry = {
        id: `local-${Date.now()}`,
        amountCents: parseAmountCents(amount) || 0,
        source,
        note: note.trim(),
        personId: selectedPerson.id,
        createdAt: new Date(),
      };

      setIsSaving(true);

      const result = await handleAction(
        () => createEntry(nextEntry),
        "Could not save entry",
      );

      setIsSaving(false);
      return result !== false;
    },
    [requireFirebase, selectedPerson],
  );

  const settleBalance = useCallback(async () => {
    if (!requireFirebase()) return false;

    if (!selectedPerson) {
      Alert.alert(
        "Choose a person first",
        "Select a person before settling.",
      );
      return false;
    }

    if (balanceCents === 0) {
      Alert.alert("Already settled", "This ledger balance is already zero.");
      return false;
    }

    const entry: Entry = {
      id: `local-${Date.now()}`,
      amountCents: -balanceCents,
      source: "Settlement",
      note: "Balance settled",
      personId: selectedPerson.id,
      createdAt: new Date(),
    };

    setIsSaving(true);

    const result = await handleAction(
      () => createEntry(entry),
      "Could not settle balance",
    );

    setIsSaving(false);
    return result !== false;
  }, [balanceCents, requireFirebase, selectedPerson]);

  const refreshEntries = useCallback(async () => {
    if (!requireFirebase()) return;
    if (!selectedPerson) return;

    setIsLoading(true);

    const result = await handleAction(
      () => fetchEntries(selectedPerson.id),
      "Could not refresh ledger",
    );

    if (result !== false) setEntries(result);
    setIsLoading(false);
  }, [requireFirebase, selectedPerson]);

  const removeEntry = useCallback(
    async (entry: Entry) => {
      if (!requireFirebase()) return;
      await handleAction(() => deleteEntry(entry), "Could not delete entry");
    },
    [requireFirebase],
  );

  return useMemo(
    () => ({
      entries,
      balanceCents,
      isEntriesLoading: isLoading,
      isSaving,
      addEntry,
      removeEntry,
      refreshEntries,
      settleBalance,
    }),
    [
      entries,
      balanceCents,
      isLoading,
      isSaving,
      addEntry,
      removeEntry,
      refreshEntries,
      settleBalance,
    ],
  );
}
