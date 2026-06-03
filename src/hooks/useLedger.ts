import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { db, firebaseIsConfigured } from "../firebase";
import {
  createEntry,
  createPerson,
  createSource,
  deleteEntry,
  deletePerson,
  deleteSource,
  fetchEntries,
  subscribeToEntries,
  subscribeToPeople,
  subscribeToSources,
} from "../services/ledgerService";
import type { Entry, Person, Source } from "../types";
import { handleAction } from "../utils/actions";
import {
  parseAmountCents,
  validatePersonName,
  validateSourceName,
} from "../utils/validation";

export function useLedger() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isPeopleLoading, setIsPeopleLoading] = useState(Boolean(db));
  const [isSourcesLoading, setIsSourcesLoading] = useState(Boolean(db));
  const [isEntriesLoading, setIsEntriesLoading] = useState(Boolean(db));
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPerson, setIsSavingPerson] = useState(false);
  const [isSavingSource, setIsSavingSource] = useState(false);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedPersonId),
    [people, selectedPersonId],
  );

  const userEntries = useMemo(
    () =>
      selectedPerson
        ? entries.filter((entry) => entry.personId === selectedPerson.id)
        : [],
    [entries, selectedPerson],
  );

  const balanceCents = useMemo(
    () => userEntries.reduce((total, entry) => total + entry.amountCents, 0),
    [userEntries],
  );

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

    setIsPeopleLoading(true);

    return subscribeToPeople({
      onData: (nextPeople) => {
        setPeople(nextPeople);
        setIsPeopleLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync people", String(error));
        setIsPeopleLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    if (!people.length) {
      setSelectedPersonId("");
      return;
    }

    if (!people.some((item) => item.id === selectedPersonId)) {
      setSelectedPersonId(people[0]?.id || "");
    }
  }, [people, selectedPersonId]);

  useEffect(() => {
    if (!db) return;

    setIsSourcesLoading(true);

    return subscribeToSources({
      onData: (nextSources) => {
        setSources(nextSources);
        setIsSourcesLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync sources", String(error));
        setIsSourcesLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    if (!db) return;
    if (!selectedPerson) {
      setEntries([]);
      setIsEntriesLoading(false);
      return;
    }

    setIsEntriesLoading(true);

    return subscribeToEntries({
      onData: (nextEntries) => {
        setEntries(nextEntries);
        setIsEntriesLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync ledger", String(error));
        setIsEntriesLoading(false);
      },
      personId: selectedPerson.id,
    });
  }, [selectedPerson]);

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
        Alert.alert("Add a person first", "Create a person before adding entries.");
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
      Alert.alert("Choose a person first", "Select a person before settling.");
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

    setIsEntriesLoading(true);

    const result = await handleAction(
      () => fetchEntries(selectedPerson.id),
      "Could not refresh ledger",
    );

    if (result !== false) setEntries(result);
    setIsEntriesLoading(false);
  }, [requireFirebase, selectedPerson]);

  const removeEntry = useCallback(
    async (entry: Entry) => {
      if (!requireFirebase()) return;
      await handleAction(() => deleteEntry(entry), "Could not delete entry");
    },
    [requireFirebase],
  );

  const addPerson = useCallback(
    async (name: string) => {
      if (!requireFirebase()) return false;

      const trimmedName = name.trim();

      const validation = validatePersonName(trimmedName, people);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSavingPerson(true);

      const personId = await handleAction(
        () => createPerson(trimmedName),
        "Could not add person",
      );

      setIsSavingPerson(false);

      if (personId) {
        setSelectedPersonId(personId);
        return true;
      }

      return false;
    },
    [people, requireFirebase],
  );

  const removePerson = useCallback(
    async (personToRemove: Person) => {
      if (!requireFirebase()) return;

      if (people.length <= 1) {
        Alert.alert("Keep one person", "At least one person is required.");
        return;
      }

      const success = await handleAction(
        () => deletePerson(personToRemove),
        "Could not remove person",
      );

      if (success !== false && selectedPersonId === personToRemove.id) {
        const nextPerson = people.find((item) => item.id !== personToRemove.id);
        if (nextPerson) setSelectedPersonId(nextPerson.id);
      }
    },
    [people, requireFirebase, selectedPersonId],
  );

  const addSource = useCallback(
    async (name: string) => {
      if (!requireFirebase()) return false;

      const trimmedName = name.trim();

      const validation = validateSourceName(trimmedName, sources);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSavingSource(true);

      const result = await handleAction(
        () => createSource(trimmedName),
        "Could not add source",
      );

      setIsSavingSource(false);
      return result !== false;
    },
    [requireFirebase, sources],
  );

  const removeSource = useCallback(
    async (sourceToRemove: Source) => {
      if (!requireFirebase()) return;

      if (sources.length <= 1) {
        Alert.alert("Keep one source", "At least one source is required.");
        return;
      }

      await handleAction(
        () => deleteSource(sourceToRemove),
        "Could not remove source",
      );
    },
    [requireFirebase, sources],
  );

  return useMemo(
    () => ({
      actions: {
        addEntry,
        addPerson,
        addSource,
        refreshEntries,
        removeEntry,
        removePerson,
        removeSource,
        selectPerson: setSelectedPersonId,
        settleBalance,
      },
      balanceCents,
      entries: userEntries,
      loading: {
        entries: isEntriesLoading,
        people: isPeopleLoading,
        savingEntry: isSaving,
        savingPerson: isSavingPerson,
        savingSource: isSavingSource,
        sources: isSourcesLoading,
      },
      ready: firebaseIsConfigured,
      sources,
      people,
      selectedPerson,
      selectedPersonId,
    }),
    [
      addEntry,
      addPerson,
      addSource,
      balanceCents,
      sources,
      isEntriesLoading,
      isPeopleLoading,
      isSourcesLoading,
      isSaving,
      isSavingPerson,
      isSavingSource,
      people,
      refreshEntries,
      removeEntry,
      removePerson,
      removeSource,
      selectedPerson,
      selectedPersonId,
      settleBalance,
      userEntries,
    ],
  );
}
