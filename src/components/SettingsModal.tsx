import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";
import type { Person, PurchaseSource, SettingsTab } from "../types";
import { SettingsListSection } from "./SettingsListSection";
import { SettingsTabBar } from "./SettingsTabBar";

export function SettingsModal({
  editableSources,
  isSavingPerson,
  isSavingSource,
  isPeopleLoading,
  isSourcesLoading,
  newPersonName,
  newSourceName,
  onAddPerson,
  onAddSource,
  onClose,
  onDeletePerson,
  onDeleteSource,
  onNewPersonNameChange,
  onNewSourceNameChange,
  onTabChange,
  people,
  settingsTab,
  visible,
}: {
  editableSources: PurchaseSource[];
  isSavingPerson: boolean;
  isSavingSource: boolean;
  isPeopleLoading: boolean;
  isSourcesLoading: boolean;
  newPersonName: string;
  newSourceName: string;
  onAddPerson: () => void | Promise<void>;
  onAddSource: () => void | Promise<void>;
  onClose: () => void;
  onDeletePerson: (person: Person) => void;
  onDeleteSource: (source: PurchaseSource) => void;
  onNewPersonNameChange: (value: string) => void;
  onNewSourceNameChange: (value: string) => void;
  onTabChange: (tab: SettingsTab) => void;
  people: Person[];
  settingsTab: SettingsTab;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Settings</Text>
            <Pressable onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.muted} />
            </Pressable>
          </View>

          <View style={styles.formInModal}>
            <SettingsTabBar activeTab={settingsTab} onTabChange={onTabChange} />

            {settingsTab === "people" ? (
              <SettingsListSection
                addPlaceholder="New person"
                emptyText="No people yet."
                isSaving={isSavingPerson}
                isLoading={isPeopleLoading}
                items={people}
                newValue={newPersonName}
                onAdd={onAddPerson}
                onChangeNewValue={onNewPersonNameChange}
                onDelete={onDeletePerson}
              />
            ) : (
              <SettingsListSection
                addPlaceholder="New source"
                emptyText="Add custom sources to show them here."
                isSaving={isSavingSource}
                isLoading={isSourcesLoading}
                items={editableSources}
                newValue={newSourceName}
                onAdd={onAddSource}
                onChangeNewValue={onNewSourceNameChange}
                onDelete={onDeleteSource}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  settingsOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  settingsContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    maxHeight: "82%",
    paddingBottom: 26,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.modal,
    paddingBottom: 0,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
  },
  formInModal: {
    padding: spacing.modal,
  },
});
