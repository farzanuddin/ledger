import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, commonStyles, radii, sizes, spacing, typography } from "../theme";
import type { PurchaseSource } from "../types";
import { validateEntryInput } from "../utils/validation";
import { EntryFields } from "./EntryFields";
import { ModalSheet } from "./ModalSheet";
import { SourcePicker } from "./SourcePicker";

export function AddEntryModal({
  amount,
  isSaving,
  note,
  onAddEntry,
  onAmountChange,
  onClose,
  onNoteChange,
  onSelectSource,
  onToggleSourcePicker,
  source,
  sourcePickerOpen,
  sources,
  visible,
}: {
  amount: string;
  isSaving: boolean;
  note: string;
  onAddEntry: () => Promise<void>;
  onAmountChange: (value: string) => void;
  onClose: () => void;
  onNoteChange: (value: string) => void;
  onSelectSource: (source: string) => void;
  onToggleSourcePicker: () => void;
  source: string;
  sourcePickerOpen: boolean;
  sources: PurchaseSource[];
  visible: boolean;
}) {
  const [errorMessage, setErrorMessage] = useState("");

  const clearError = () => setErrorMessage("");

  const closeModal = () => {
    clearError();
    onClose();
  };

  const submit = async () => {
    const validation = validateEntryInput({ amount, note, source });

    if (!validation.ok) {
      setErrorMessage(validation.message);
      Alert.alert(validation.title, validation.message);
      return;
    }

    clearError();
    await onAddEntry();
    closeModal();
  };

  return (
    <ModalSheet visible={visible} onClose={closeModal}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>New entry</Text>
        <Pressable onPress={closeModal}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.formInModal}>
        <SourcePicker
          isOpen={sourcePickerOpen}
          onSelectSource={(nextSource) => {
            clearError();
            onSelectSource(nextSource);
          }}
          onToggle={onToggleSourcePicker}
          selectedSource={source}
          sources={sources}
        />

        <EntryFields
          amount={amount}
          note={note}
          onAmountChange={(value) => {
            clearError();
            onAmountChange(value);
          }}
          onNoteChange={(value) => {
            clearError();
            onNoteChange(value);
          }}
        />

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          disabled={isSaving}
          onPress={submit}
          style={({ pressed }) => [
            styles.addButton,
            pressed && !isSaving && commonStyles.buttonPressed,
            isSaving && commonStyles.buttonDisabled,
          ]}
        >
          <Text style={styles.addButtonText}>
            {isSaving ? "Saving..." : "Add entry"}
          </Text>
        </Pressable>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
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
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    justifyContent: "center",
    marginTop: spacing.section,
    minHeight: sizes.largeControlMinHeight,
  },
  addButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
  },
  errorText: {
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.lg,
  },
});
