import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
} from "react-native";

import { AddEntryModal } from "./src/components/AddEntryModal";
import { AppHeader } from "./src/components/AppHeader";
import { BalancePanel } from "./src/components/BalancePanel";
import { ConfirmModal } from "./src/components/ConfirmModal";
import { EntryList } from "./src/components/EntryList";
import { SettingsModal } from "./src/components/SettingsModal";
import { useConfirmAction } from "./src/hooks/useConfirmAction";
import { useLedger } from "./src/hooks/useLedger";
import { useLedgerSharing } from "./src/hooks/useLedgerSharing";
import { colors, spacing } from "./src/theme";
import type { Entry, Person, Source } from "./src/types";
import { formatDecimalAmount, formatPeopleCountLabel } from "./src/utils/format";

export default function App() {
  const ledger = useLedger();
  const { isSharing, shareLedgerPdf } = useLedgerSharing();
  const [addEntryModalVisible, setAddEntryModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const entryDelete = useConfirmAction<Entry>();
  const personDelete = useConfirmAction<Person>();
  const sourceDelete = useConfirmAction<Source>();
  const settleConfirm = useConfirmAction<void>();

  const peopleCountLabel = formatPeopleCountLabel(ledger.people.length);

  const handleSharePdf = useCallback(
    () =>
      shareLedgerPdf({
        balanceCents: ledger.balanceCents,
        entries: ledger.entries,
        user: ledger.selectedPerson?.name || "Ledger",
      }),
    [ledger.balanceCents, ledger.entries, ledger.selectedPerson?.name, shareLedgerPdf],
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.screen}
        >
          <View style={styles.nonScrollContent}>
            <AppHeader
              isDisabled={!ledger.ready}
              isRefreshing={ledger.loading.refreshing}
              onOpenSettings={() => setSettingsModalVisible(true)}
              onRefresh={ledger.actions.refreshEntries}
              onSelectPerson={ledger.actions.selectPerson}
              people={ledger.people}
              peopleCountLabel={peopleCountLabel}
              selectedPerson={ledger.selectedPersonId}
            />
            <View style={styles.balancePanelWrap}>
              <BalancePanel
                balanceCents={ledger.balanceCents}
                isDisabled={!ledger.ready}
                isSharing={isSharing}
                onAddEntry={() => setAddEntryModalVisible(true)}
                onSharePdf={handleSharePdf}
                onSettleBalance={() => settleConfirm.request()}
              />
            </View>
          </View>

          <EntryList
            entries={ledger.entries}
            isLoading={ledger.loading.entries}
            onRequestDelete={entryDelete.request}
          />

          <AddEntryModal
            isSaving={ledger.loading.savingEntry}
            onAddEntry={ledger.actions.addEntry}
            onClose={() => setAddEntryModalVisible(false)}
            sources={ledger.sources}
            visible={addEntryModalVisible}
          />

          <SettingsModal
            sources={ledger.sources}
            isSavingPerson={ledger.loading.savingPerson}
            isSavingSource={ledger.loading.savingSource}
            isPeopleLoading={ledger.loading.people}
            isSourcesLoading={ledger.loading.sources}
            onAddPerson={ledger.actions.addPerson}
            onAddSource={ledger.actions.addSource}
            onClose={() => setSettingsModalVisible(false)}
            onDeletePerson={personDelete.request}
            onDeleteSource={sourceDelete.request}
            people={ledger.people}
            visible={settingsModalVisible}
          />

          <ConfirmModals
            balanceCents={ledger.balanceCents}
            entryDelete={entryDelete}
            onRemoveEntry={ledger.actions.removeEntry}
            onRemovePerson={ledger.actions.removePerson}
            onRemoveSource={ledger.actions.removeSource}
            onSettleBalance={ledger.actions.settleBalance}
            personDelete={personDelete}
            settleConfirm={settleConfirm}
            sourceDelete={sourceDelete}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function ConfirmModals({
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        alignItems: "center",
        justifyContent: "center",
      },
    }),
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    ...Platform.select({
      web: {
        maxWidth: 430,
        width: "100%",
      },
    }),
  },
  screen: {
    flex: 1,
  },
  balancePanelWrap: {
    paddingHorizontal: spacing.screen,
    paddingBottom: spacing.section,
  },
  nonScrollContent: {
    flexShrink: 0,
    paddingTop: spacing.screen,
  },
});
