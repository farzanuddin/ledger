import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { db } from "../firebase";
import { clearLegacyDemoStorage } from "../services/legacyStorage";
import {
  loadLocalLedgerData,
  saveLocalLedgerData,
} from "../services/localLedgerStorage";
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
import { getErrorMessage } from "../utils/errors";
import { sourceIdFromName } from "../utils/ledger";
import {
  parseAmountCents,
  validateEntryInput,
  validatePersonName,
  validateSourceName,
} from "../utils/validation";

export function useLedger() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [hasLoadedLocalData, setHasLoadedLocalData] = useState(Boolean(db));
  const [isPeopleLoading, setIsPeopleLoading] = useState(Boolean(db));
  const [isSourcesLoading, setIsSourcesLoading] = useState(Boolean(db));
  const [isEntriesLoading, setIsEntriesLoading] = useState(Boolean(db));
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPerson, setIsSavingPerson] = useState(false);
  const [isSavingSource, setIsSavingSource] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  useEffect(() => {
    clearLegacyDemoStorage();
  }, []);

  useEffect(() => {
    if (db) return;

    let isMounted = true;

    loadLocalLedgerData()
      .then((localData) => {
        if (!isMounted) return;

        setEntries(localData.entries);
        setPeople(localData.people);
        setSources(localData.sources);
        setSelectedPersonId(localData.selectedPersonId);
      })
      .catch((error) => {
        Alert.alert("Could not load saved ledger", getErrorMessage(error));
      })
      .finally(() => {
        if (isMounted) setHasLoadedLocalData(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (db) return;
    if (!hasLoadedLocalData) return;

    saveLocalLedgerData({
      entries,
      people,
      sources,
      selectedPersonId,
    }).catch((error) => {
      Alert.alert("Could not save ledger", getErrorMessage(error));
    });
  }, [entries, hasLoadedLocalData, people, sources, selectedPersonId]);

  useEffect(() => {
    if (!db) return;

    setIsPeopleLoading(true);

    return subscribeToPeople({
      onData: (nextPeople) => {
        setPeople(nextPeople);
        setIsPeopleLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync people", getErrorMessage(error));
        setIsPeopleLoading(false);
      },
    });
  }, []);

  useEffect(() => {
    if (!people.length) return;

    if (!people.some((item) => item.id === selectedPersonId)) {
      setSelectedPersonId(people[0].id);
    }
  }, [people, selectedPersonId]);

  useEffect(() => {
    if (people.length) return;

    setSelectedPersonId("");
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
        Alert.alert("Could not sync sources", getErrorMessage(error));
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
        Alert.alert("Could not sync ledger", getErrorMessage(error));
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
      if (!selectedPerson) {
        Alert.alert("Add a person first", "Create a person before adding entries.");
        return;
      }

      const validation = validateEntryInput({ amount, note, source });

      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return;
      }

      const nextEntry: Entry = {
        id: `local-${Date.now()}`,
        amountCents: parseAmountCents(amount) || 0,
        source,
        note: note.trim(),
        personId: selectedPerson.id,
        user: selectedPerson.name,
        createdAt: new Date(),
      };

      setIsSaving(true);

      try {
        if (db) {
          await createEntry(nextEntry);
        } else {
          setEntries((currentEntries) => [nextEntry, ...currentEntries]);
        }
      } catch (error) {
        Alert.alert("Could not save entry", getErrorMessage(error));
      } finally {
        setIsSaving(false);
      }
    },
    [selectedPerson],
  );

  const settleBalance = useCallback(async () => {
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
      user: selectedPerson.name,
      createdAt: new Date(),
    };

    setIsSaving(true);

    try {
      if (db) {
        await createEntry(entry);
      } else {
        setEntries((currentEntries) => [entry, ...currentEntries]);
      }

      return true;
    } catch (error) {
      Alert.alert("Could not settle balance", getErrorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [balanceCents, selectedPerson]);

  const refreshEntries = useCallback(async () => {
    if (!selectedPerson) {
      setEntries([]);
      return;
    }

    if (!db) {
      setEntries((currentEntries) => [...currentEntries]);
      return;
    }

    setIsRefreshing(true);
    setIsEntriesLoading(true);

    try {
      setEntries(await fetchEntries(selectedPerson.id));
    } catch (error) {
      Alert.alert("Could not refresh ledger", getErrorMessage(error));
    } finally {
      setIsRefreshing(false);
      setIsEntriesLoading(false);
    }
  }, [selectedPerson]);

  const removeEntry = useCallback(async (entry: Entry) => {
    try {
      if (db) {
        await deleteEntry(entry);
      } else {
        setEntries((currentEntries) =>
          currentEntries.filter((item) => item.id !== entry.id),
        );
      }
    } catch (error) {
      Alert.alert("Could not delete entry", getErrorMessage(error));
    }
  }, []);

  const addPerson = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();

      const validation = validatePersonName(trimmedName, people);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSavingPerson(true);

      try {
        let nextPersonId = sourceIdFromName(trimmedName) || `person-${Date.now()}`;

        if (db) {
          nextPersonId = await createPerson(trimmedName);
        } else {
          setPeople((currentPeople) => [
            ...currentPeople,
            {
              id: nextPersonId,
              name: trimmedName,
            },
          ]);
        }

        setSelectedPersonId(nextPersonId);
        return true;
      } catch (error) {
        Alert.alert("Could not add person", getErrorMessage(error));
        return false;
      } finally {
        setIsSavingPerson(false);
      }
    },
    [people],
  );

  const removePerson = useCallback(
    async (personToRemove: Person) => {
      if (people.length <= 1) {
        Alert.alert("Keep one person", "At least one person is required.");
        return;
      }

      try {
        if (db) {
          await deletePerson(personToRemove);
        } else {
          setPeople((currentPeople) =>
            currentPeople.filter((item) => item.id !== personToRemove.id),
          );
        }

        if (selectedPersonId === personToRemove.id) {
          const nextPerson = people.find((item) => item.id !== personToRemove.id);
          if (nextPerson) setSelectedPersonId(nextPerson.id);
        }
      } catch (error) {
        Alert.alert("Could not remove person", getErrorMessage(error));
      }
    },
    [people, selectedPersonId],
  );

  const addSource = useCallback(
    async (name: string) => {
      const trimmedName = name.trim();

      const validation = validateSourceName(trimmedName, sources);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSavingSource(true);

      try {
        if (db) {
          await createSource(trimmedName);
        } else {
          setSources((currentSources) => [
            ...currentSources,
            {
              id: sourceIdFromName(trimmedName) || `source-${Date.now()}`,
              name: trimmedName,
            },
          ]);
        }

        return true;
      } catch (error) {
        Alert.alert("Could not add source", getErrorMessage(error));
        return false;
      } finally {
        setIsSavingSource(false);
      }
    },
    [sources],
  );

  const removeSource = useCallback(
    async (sourceToRemove: Source) => {
      if (sources.length <= 1) {
        Alert.alert("Keep one source", "At least one source is required.");
        return;
      }

      try {
        if (db) {
          await deleteSource(sourceToRemove);
        } else {
          setSources((currentSources) =>
            currentSources.filter((item) => item.id !== sourceToRemove.id),
          );
        }
      } catch (error) {
        Alert.alert("Could not remove source", getErrorMessage(error));
      }
    },
    [sources],
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
        refreshing: isRefreshing,
        savingEntry: isSaving,
        savingPerson: isSavingPerson,
        savingSource: isSavingSource,
        sources: isSourcesLoading,
      },
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
      isRefreshing,
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
