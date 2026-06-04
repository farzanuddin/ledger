import { useMemo } from "react";
import { firebaseIsConfigured } from "../firebase";
import { useEntries } from "./useEntries";
import { usePeople } from "./usePeople";
import { useSources } from "./useSources";

export function useLedger() {
  const {
    people,
    selectedPersonId,
    isPeopleLoading,
    isSavingPerson,
    addPerson,
    removePerson,
    selectPerson,
  } = usePeople();

  const {
    sources,
    isSourcesLoading,
    isSavingSource,
    addSource,
    removeSource,
  } = useSources();

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === selectedPersonId),
    [people, selectedPersonId],
  );

  const {
    entries,
    balanceCents,
    isEntriesLoading,
    isSaving,
    addEntry,
    removeEntry,
    refreshEntries,
    settleBalance,
  } = useEntries(selectedPerson);

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
        selectPerson,
        settleBalance,
      },
      balanceCents,
      entries,
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
      entries,
      isEntriesLoading,
      isPeopleLoading,
      isSaving,
      isSavingPerson,
      isSavingSource,
      isSourcesLoading,
      people,
      refreshEntries,
      removeEntry,
      removePerson,
      removeSource,
      selectedPerson,
      selectedPersonId,
      settleBalance,
      sources,
    ],
  );
}
