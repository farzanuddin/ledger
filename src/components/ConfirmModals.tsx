import { memo, useCallback, useMemo } from "react";
import type { Entry, Person, Source } from "../types";
import { formatDecimalAmount } from "../utils/format";
import { ConfirmModal } from "./ConfirmModal";
import type { useConfirmAction } from "../hooks/useConfirmAction";

export const ConfirmModals = memo(function ConfirmModals({
  balanceCents,
  entryDelete,
  onRemoveEntry,
  onRemovePerson,
  onRemoveSource,
  onSettleBalance,
  personDelete,
  settleConfirm,
  sourceDelete,
}: {
  balanceCents: number;
  entryDelete: ReturnType<typeof useConfirmAction<Entry>>;
  onRemoveEntry: (entry: Entry) => Promise<void>;
  onRemovePerson: (person: Person) => Promise<void>;
  onRemoveSource: (source: Source) => Promise<void>;
  onSettleBalance: () => Promise<boolean>;
  personDelete: ReturnType<typeof useConfirmAction<Person>>;
  settleConfirm: ReturnType<typeof useConfirmAction<void>>;
  sourceDelete: ReturnType<typeof useConfirmAction<Source>>;
}) {
  const handleEntryDeleteConfirm = useCallback(async () => {
    if (!entryDelete.item) return;
    await onRemoveEntry(entryDelete.item);
    entryDelete.clear();
  }, [entryDelete.item, onRemoveEntry, entryDelete.clear]);

  const handleSourceDeleteConfirm = useCallback(async () => {
    if (!sourceDelete.item) return;
    await onRemoveSource(sourceDelete.item);
    sourceDelete.clear();
  }, [sourceDelete.item, onRemoveSource, sourceDelete.clear]);

  const handleSettleConfirm = useCallback(async () => {
    await onSettleBalance();
    settleConfirm.clear();
  }, [onSettleBalance, settleConfirm.clear]);

  const handlePersonDeleteConfirm = useCallback(async () => {
    if (!personDelete.item) return;
    await onRemovePerson(personDelete.item);
    personDelete.clear();
  }, [personDelete.item, onRemovePerson, personDelete.clear]);

  const entryMeta = useMemo(
    () =>
      entryDelete.item
        ? `${entryDelete.item.source} · ${formatDecimalAmount(
            Math.abs(entryDelete.item.amountCents) / 100,
          )} AED`
        : undefined,
    [entryDelete.item],
  );

  const settleTitle = useMemo(
    () =>
      `Settle balance of AED ${formatDecimalAmount(Math.abs(balanceCents) / 100)}?`,
    [balanceCents],
  );

  return (
    <>
      <ConfirmModal
        body={entryDelete.item?.note || "Untitled entry"}
        meta={entryMeta}
        onCancel={entryDelete.clear}
        onConfirm={handleEntryDeleteConfirm}
        title="Delete entry?"
        visible={entryDelete.visible}
      />

      <ConfirmModal
        body={sourceDelete.item?.name || ""}
        meta="This permanently removes the source option. Existing entries that already use it will keep their source name."
        onCancel={sourceDelete.clear}
        onConfirm={handleSourceDeleteConfirm}
        title="Delete source?"
        visible={sourceDelete.visible}
      />

      <ConfirmModal
        body="This keeps the existing ledger history and brings the current balance to zero."
        confirmLabel="Settle"
        onCancel={settleConfirm.clear}
        onConfirm={handleSettleConfirm}
        title={settleTitle}
        variant="primary"
        visible={settleConfirm.visible}
      />

      <ConfirmModal
        body={personDelete.item?.name || ""}
        meta="This removes the person from the ledger tabs. Their existing entries are not deleted from Firestore."
        onCancel={personDelete.clear}
        onConfirm={handlePersonDeleteConfirm}
        title="Delete person?"
        visible={personDelete.visible}
      />
    </>
  );
});
