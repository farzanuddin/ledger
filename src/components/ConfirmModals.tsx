import type { Entry, Person, Source } from "../types";
import { formatDecimalAmount } from "../utils/format";
import { ConfirmModal } from "./ConfirmModal";
import type { useConfirmAction } from "../hooks/useConfirmAction";

export function ConfirmModals({
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
  return (
    <>
      <ConfirmModal
        body={entryDelete.item?.note || "Untitled entry"}
        meta={
          entryDelete.item
            ? `${entryDelete.item.source} · ${formatDecimalAmount(
                Math.abs(entryDelete.item.amountCents) / 100,
              )} AED`
            : undefined
        }
        onCancel={entryDelete.clear}
        onConfirm={async () => {
          if (!entryDelete.item) return;
          await onRemoveEntry(entryDelete.item);
          entryDelete.clear();
        }}
        title="Delete entry?"
        visible={entryDelete.visible}
      />

      <ConfirmModal
        body={sourceDelete.item?.name || ""}
        meta="This permanently removes the source option. Existing entries that already use it will keep their source name."
        onCancel={sourceDelete.clear}
        onConfirm={async () => {
          if (!sourceDelete.item) return;
          await onRemoveSource(sourceDelete.item);
          sourceDelete.clear();
        }}
        title="Delete source?"
        visible={sourceDelete.visible}
      />

      <ConfirmModal
        body="This keeps the existing ledger history and brings the current balance to zero."
        confirmLabel="Settle"
        onCancel={settleConfirm.clear}
        onConfirm={async () => {
          await onSettleBalance();
          settleConfirm.clear();
        }}
        title={`Settle balance of AED ${formatDecimalAmount(
          Math.abs(balanceCents) / 100,
        )}?`}
        variant="primary"
        visible={settleConfirm.visible}
      />

      <ConfirmModal
        body={personDelete.item?.name || ""}
        meta="This removes the person from the ledger tabs. Their existing entries are not deleted from Firestore."
        onCancel={personDelete.clear}
        onConfirm={async () => {
          if (!personDelete.item) return;
          await onRemovePerson(personDelete.item);
          personDelete.clear();
        }}
        title="Delete person?"
        visible={personDelete.visible}
      />
    </>
  );
}
