import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { db } from "../firebase";
import {
  createPerson,
  deletePerson,
  subscribeToPeople,
} from "../services/ledgerService";
import type { Person } from "../types";
import { handleAction } from "../utils/actions";
import { validatePersonName } from "../utils/validation";

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(db));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db) return;

    setIsLoading(true);

    return subscribeToPeople({
      onData: (nextPeople) => {
        setPeople(nextPeople);
        setIsLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync people", String(error));
        setIsLoading(false);
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

  const requireFirebase = useCallback(() => {
    if (db) return true;

    Alert.alert(
      "Firebase not configured",
      "Connect Firebase before using the ledger.",
    );
    return false;
  }, []);

  const addPerson = useCallback(
    async (name: string) => {
      if (!requireFirebase()) return false;

      const trimmedName = name.trim();

      const validation = validatePersonName(trimmedName, people);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSaving(true);

      const personId = await handleAction(
        () => createPerson(trimmedName),
        "Could not add person",
      );

      setIsSaving(false);

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

  return useMemo(
    () => ({
      people,
      selectedPersonId,
      isPeopleLoading: isLoading,
      isSavingPerson: isSaving,
      addPerson,
      removePerson,
      selectPerson: setSelectedPersonId,
    }),
    [people, selectedPersonId, isLoading, isSaving, addPerson, removePerson],
  );
}
