import { MaterialIcons } from "@expo/vector-icons";
import { memo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, commonStyles, modalStyles, radii, sizes, spacing, typography, withButtonState } from "../theme";
import type { Person, Source, SettingsTab } from "../types";
import { ModalSheet } from "./ModalSheet";

const settingsTabs: SettingsTab[] = ["sources", "people"];

type SettingsItem = {
  id: string;
  name: string;
};

export const SettingsModal = memo(function SettingsModal({
  sources,
  isSavingPerson,
  isSavingSource,
  isPeopleLoading,
  isSourcesLoading,
  onAddPerson,
  onAddSource,
  onClose,
  onDeletePerson,
  onDeleteSource,
  people,
  visible,
}: {
  sources: Source[];
  isSavingPerson: boolean;
  isSavingSource: boolean;
  isPeopleLoading: boolean;
  isSourcesLoading: boolean;
  onAddPerson: (name: string) => void | Promise<boolean>;
  onAddSource: (name: string) => void | Promise<boolean>;
  onClose: () => void;
  onDeletePerson: (person: Person) => void;
  onDeleteSource: (source: Source) => void;
  people: Person[];
  visible: boolean;
}) {
  const [newPersonName, setNewPersonName] = useState("");
  const [newSourceName, setNewSourceName] = useState("");
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("people");

  const closeModal = () => {
    setNewPersonName("");
    setNewSourceName("");
    onClose();
  };

  const addPerson = async () => {
    const wasAdded = await onAddPerson(newPersonName);
    if (wasAdded) setNewPersonName("");
  };

  const addSource = async () => {
    const wasAdded = await onAddSource(newSourceName);
    if (wasAdded) setNewSourceName("");
  };

  return (
    <ModalSheet visible={visible} onClose={closeModal} contentStyle={styles.content}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.title}>Settings</Text>
        <Pressable accessibilityLabel="Close settings" onPress={closeModal}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={modalStyles.body}>
        <SettingsTabBar activeTab={settingsTab} onTabChange={setSettingsTab} />

        {settingsTab === "people" ? (
          <SettingsListSection
            addPlaceholder="New person"
            emptyText="No people yet."
            isSaving={isSavingPerson}
            isLoading={isPeopleLoading}
            items={people}
            newValue={newPersonName}
            onAdd={addPerson}
            onChangeNewValue={setNewPersonName}
            onDelete={onDeletePerson}
          />
        ) : (
          <SettingsListSection
            addPlaceholder="New source"
            emptyText="Add custom sources to show them here."
            isSaving={isSavingSource}
            isLoading={isSourcesLoading}
            items={sources}
            newValue={newSourceName}
            onAdd={addSource}
            onChangeNewValue={setNewSourceName}
            onDelete={onDeleteSource}
          />
        )}
      </View>
    </ModalSheet>
  );
});

const styles = StyleSheet.create({
  // Modal shell
  content: {
    maxHeight: "100%",
  },
  // Tabs
  tabs: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  tab: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.control,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  tabTextActive: {
    color: colors.surface,
  },
  // Add row
  addRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  addInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.base,
    minHeight: sizes.control,
    paddingHorizontal: spacing.section,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    justifyContent: "center",
    width: sizes.control,
  },
  // List
  settingsList: {
    maxHeight: 360,
  },
  listContent: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: sizes.controlLarge,
    paddingLeft: spacing.section,
  },
  rowText: {
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    alignItems: "center",
    height: sizes.control,
    justifyContent: "center",
    width: sizes.control,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
});

const SettingsTabBar = memo(function SettingsTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  return (
    <View style={styles.tabs}>
      {settingsTabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
                <Pressable
                  key={tab}
                  accessibilityLabel={tab === "people" ? "People tab" : "Sources tab"}
                  onPress={() => onTabChange(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab === "people" ? "People" : "Sources"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const SettingsListSection = memo(function SettingsListSection<T extends SettingsItem>({
  addPlaceholder,
  emptyText,
  isSaving,
  isLoading,
  items,
  newValue,
  onAdd,
  onChangeNewValue,
  onDelete,
}: {
  addPlaceholder: string;
  emptyText?: string;
  isSaving: boolean;
  isLoading?: boolean;
  items: T[];
  newValue: string;
  onAdd: () => void | Promise<void>;
  onChangeNewValue: (value: string) => void;
  onDelete: (item: T) => void;
}) {
  return (
    <View>
      <View style={styles.addRow}>
        <TextInput
          onChangeText={onChangeNewValue}
          onSubmitEditing={onAdd}
          placeholder={addPlaceholder}
          placeholderTextColor={colors.placeholder}
          style={styles.addInput}
          value={newValue}
        />
        <Pressable
          accessibilityLabel={`Add ${addPlaceholder}`}
          disabled={isSaving}
          onPress={onAdd}
          style={withButtonState(styles.addButton, isSaving)}
        >
          <MaterialIcons name="add" size={22} color={colors.surface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        style={styles.settingsList}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Pressable
              accessibilityLabel={`Delete ${item.name}`}
              onPress={() => onDelete(item)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && commonStyles.buttonPressed,
              ]}
            >
              <MaterialIcons name="delete-outline" size={21} color={colors.danger} />
            </Pressable>
          </View>
        ))}
        {!items.length && (isLoading || emptyText) ? (
          <Text style={styles.emptyText}>{isLoading ? "Loading..." : emptyText}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
});
