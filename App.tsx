import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { AddEntryModal } from "./src/components/AddEntryModal";
import { AppHeader } from "./src/components/AppHeader";
import { BalancePanel } from "./src/components/BalancePanel";
import { ConfirmModals } from "./src/components/ConfirmModals";
import { EntryList } from "./src/components/EntryList";
import { SettingsModal } from "./src/components/SettingsModal";
import { useConfirmAction } from "./src/hooks/useConfirmAction";
import { useLedger } from "./src/hooks/useLedger";
import { useLedgerSharing } from "./src/hooks/useLedgerSharing";
import { colors, spacing } from "./src/theme";
import type { Entry, Person, Source } from "./src/types";
import { formatPeopleCountLabel } from "./src/utils/format";

export default function App() {
  const ledger = useLedger();
  const { isSharing, shareLedgerPdf } = useLedgerSharing();
  const [addEntryModalVisible, setAddEntryModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const entryDelete = useConfirmAction<Entry>();
  const personDelete = useConfirmAction<Person>();
  const sourceDelete = useConfirmAction<Source>();
  const settleConfirm = useConfirmAction<void>();

  const handleOpenSettings = useCallback(
    () => setSettingsModalVisible(true),
    [],
  );
  const handleOpenAddEntry = useCallback(
    () => setAddEntryModalVisible(true),
    [],
  );
  const handleSettleBalance = useCallback(
    () => settleConfirm.request(),
    [settleConfirm],
  );
  const handleCloseAddEntry = useCallback(
    () => setAddEntryModalVisible(false),
    [],
  );
  const handleCloseSettings = useCallback(
    () => setSettingsModalVisible(false),
    [],
  );

  const peopleCountLabel = useMemo(
    () => formatPeopleCountLabel(ledger.people.length),
    [ledger.people.length],
  );
  const isLedgerDisabled = !ledger.ready;

  const handleSharePdf = useCallback(
    () =>
      shareLedgerPdf({
        entries: ledger.entries,
        user: ledger.selectedPerson?.name || "Ledger",
      }),
    [ledger.entries, ledger.selectedPerson?.name, shareLedgerPdf],
  );

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          behavior={Platform.select({ ios: "padding", android: undefined })}
          style={styles.screen}
        >
          <View style={styles.nonScrollContent}>
            <AppHeader
              isDisabled={isLedgerDisabled}
              onOpenSettings={handleOpenSettings}
              onRefresh={ledger.actions.refreshEntries}
              onSelectPerson={ledger.actions.selectPerson}
              people={ledger.people}
              peopleCountLabel={peopleCountLabel}
              selectedPerson={ledger.selectedPersonId}
            />
            <View style={styles.balancePanelWrap}>
              <BalancePanel
                balanceCents={ledger.balanceCents}
                isDisabled={isLedgerDisabled}
                isSharing={isSharing}
                onAddEntry={handleOpenAddEntry}
                onSharePdf={handleSharePdf}
                onSettleBalance={handleSettleBalance}
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
            onClose={handleCloseAddEntry}
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
            onClose={handleCloseSettings}
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
    </SafeAreaProvider>
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
