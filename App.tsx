import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
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
import { ConfirmDeleteModal } from "./src/components/ConfirmDeleteModal";
import { EntryList } from "./src/components/EntryList";
import { SettingsModal } from "./src/components/SettingsModal";
import { useConfirmAction } from "./src/hooks/useConfirmAction";
import { useLedgerData } from "./src/hooks/useLedgerData";
import { useLedgerSharing } from "./src/hooks/useLedgerSharing";
import { colors, spacing } from "./src/theme";
import type { LedgerEntry, Person, PurchaseSource, SettingsTab } from "./src/types";
import { formatDecimalAmount, formatPeopleCountLabel } from "./src/utils/format";
import { getPreferredSourceName } from "./src/utils/sources";

export default function App() {
  const ledger = useLedgerData();
  const { isSharing, shareLedgerPdf } = useLedgerSharing();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [newPersonName, setNewPersonName] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);
  const [addEntryModalVisible, setAddEntryModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("people");
  const entryDelete = useConfirmAction<LedgerEntry>();
  const personDelete = useConfirmAction<Person>();
  const sourceDelete = useConfirmAction<PurchaseSource>();
  const settleConfirm = useConfirmAction<void>();

  const {
    addEntry,
    addPerson,
    addPurchaseSource,
    balanceCents,
    editablePurchaseSources,
    isEntriesLoading,
    isPeopleLoading,
    isRefreshing,
    isSaving,
    isSavingPerson,
    isSavingSource,
    isSourcesLoading,
    people,
    purchaseSources,
    refreshEntries,
    removeEntry,
    removePerson,
    removePurchaseSource,
    selectedPerson,
    selectedPersonId,
    setSelectedPersonId,
    settleBalance,
    userEntries,
  } = ledger;

  const peopleCountLabel = formatPeopleCountLabel(people.length);

  useEffect(() => {
    if (!purchaseSources.length) return;
    if (!purchaseSources.some((item) => item.name === source)) {
      setSource(getPreferredSourceName(purchaseSources));
    }
  }, [purchaseSources, source]);

  useEffect(() => {
    if (purchaseSources.length) return;
    setSource("");
  }, [purchaseSources.length]);

  const saveEntry = async () => {
    await addEntry({ amount, note, source });
    setAmount("");
    setNote("");
  };

  const savePerson = async () => {
    const wasAdded = await addPerson(newPersonName);
    if (wasAdded) setNewPersonName("");
  };

  const savePurchaseSource = async () => {
    const wasAdded = await addPurchaseSource(newSourceName);
    if (wasAdded) {
      setSource(newSourceName.trim());
      setNewSourceName("");
    }
  };

  const handleSharePdf = useCallback(
    () =>
      shareLedgerPdf({
        balanceCents,
        entries: userEntries,
        user: selectedPerson?.name || "Ledger",
      }),
    [balanceCents, selectedPerson?.name, shareLedgerPdf, userEntries],
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
              isRefreshing={isRefreshing}
              onOpenSettings={() => setSettingsModalVisible(true)}
              onRefresh={refreshEntries}
              onSelectPerson={setSelectedPersonId}
              people={people}
              peopleCountLabel={peopleCountLabel}
              selectedPerson={selectedPersonId}
            />
            <View style={styles.balancePanelWrap}>
          <BalancePanel
            balanceCents={balanceCents}
            isSharing={isSharing}
            onAddEntry={() => setAddEntryModalVisible(true)}
            onSharePdf={handleSharePdf}
            onSettleBalance={() =>
              settleConfirm.request()
            }
          />
            </View>
          </View>

          <EntryList
            entries={userEntries}
            isLoading={isEntriesLoading}
            onRequestDelete={entryDelete.request}
          />

          <AddEntryModal
            amount={amount}
            isSaving={isSaving}
            note={note}
            onAddEntry={saveEntry}
            onAmountChange={setAmount}
            onClose={() => setAddEntryModalVisible(false)}
            onNoteChange={setNote}
            onSelectSource={(nextSource) => {
              setSource(nextSource);
              setSourcePickerOpen(false);
            }}
            onToggleSourcePicker={() => setSourcePickerOpen((isOpen) => !isOpen)}
            source={source}
            sourcePickerOpen={sourcePickerOpen}
            sources={purchaseSources}
            visible={addEntryModalVisible}
          />

          <SettingsModal
            editableSources={editablePurchaseSources}
            isSavingPerson={isSavingPerson}
            isSavingSource={isSavingSource}
            isPeopleLoading={isPeopleLoading}
            isSourcesLoading={isSourcesLoading}
            newPersonName={newPersonName}
            newSourceName={newSourceName}
            onAddPerson={savePerson}
            onAddSource={savePurchaseSource}
            onClose={() => {
              setSettingsModalVisible(false);
              setNewPersonName("");
              setNewSourceName("");
            }}
            onDeletePerson={personDelete.request}
            onDeleteSource={sourceDelete.request}
            onNewPersonNameChange={setNewPersonName}
            onNewSourceNameChange={setNewSourceName}
            onTabChange={setSettingsTab}
            people={people}
            settingsTab={settingsTab}
            visible={settingsModalVisible}
          />

          <ConfirmDeleteModal
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
              await removeEntry(entryDelete.item);
              entryDelete.clear();
            }}
            title="Delete entry?"
            visible={entryDelete.visible}
          />

          <ConfirmDeleteModal
            body={sourceDelete.item?.name || ""}
            meta="This permanently removes the source option. Existing entries that already use it will keep their source name."
            onCancel={sourceDelete.clear}
            onConfirm={async () => {
              if (!sourceDelete.item) return;
              await removePurchaseSource(sourceDelete.item);
              sourceDelete.clear();
            }}
            title="Delete source?"
            visible={sourceDelete.visible}
          />

          <ConfirmDeleteModal
            body="This keeps the existing ledger history and brings the current balance to zero."
            confirmLabel="Settle"
            onCancel={settleConfirm.clear}
            onConfirm={async () => {
              await settleBalance();
              settleConfirm.clear();
            }}
            title={`Settle balance of AED ${formatDecimalAmount(Math.abs(balanceCents) / 100)}?`}
            visible={settleConfirm.visible}
          />

          <ConfirmDeleteModal
            body={personDelete.item?.name || ""}
            meta="This removes the person from the ledger tabs. Their existing entries are not deleted from Firestore."
            onCancel={personDelete.clear}
            onConfirm={async () => {
              if (!personDelete.item) return;
              await removePerson(personDelete.item);
              personDelete.clear();
            }}
            title="Delete person?"
            visible={personDelete.visible}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
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
