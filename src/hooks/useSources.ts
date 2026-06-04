import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { db } from "../firebase";
import {
  createSource,
  deleteSource,
  subscribeToSources,
} from "../services/ledgerService";
import type { Source } from "../types";
import { handleAction } from "../utils/actions";
import { validateSourceName } from "../utils/validation";

export function useSources() {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(db));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!db) return;

    setIsLoading(true);

    return subscribeToSources({
      onData: (nextSources) => {
        setSources(nextSources);
        setIsLoading(false);
      },
      onError: (error) => {
        Alert.alert("Could not sync sources", String(error));
        setIsLoading(false);
      },
    });
  }, []);

  const requireFirebase = useCallback(() => {
    if (db) return true;

    Alert.alert(
      "Firebase not configured",
      "Connect Firebase before using the ledger.",
    );
    return false;
  }, []);

  const addSource = useCallback(
    async (name: string) => {
      if (!requireFirebase()) return false;

      const trimmedName = name.trim();

      const validation = validateSourceName(trimmedName, sources);
      if (!validation.ok) {
        Alert.alert(validation.title, validation.message);
        return false;
      }

      setIsSaving(true);

      const result = await handleAction(
        () => createSource(trimmedName),
        "Could not add source",
      );

      setIsSaving(false);
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
      sources,
      isSourcesLoading: isLoading,
      isSavingSource: isSaving,
      addSource,
      removeSource,
    }),
    [sources, isLoading, isSaving, addSource, removeSource],
  );
}
