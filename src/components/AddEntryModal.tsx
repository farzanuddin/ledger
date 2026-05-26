import { MaterialIcons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
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
  const isFormValid =
    amount.trim().length > 0 && note.trim().length > 0 && source.trim().length > 0;

  const submit = async () => {
    const validation = validateEntryInput({ amount, note, source });

    if (!validation.ok) {
      Alert.alert(validation.title, validation.message);
      return;
    }

    await onAddEntry();
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={onClose}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>New entry</Text>
        <Pressable onPress={onClose}>
          <MaterialIcons name="close" size={24} color="#526062" />
        </Pressable>
      </View>

      <View style={styles.formInModal}>
        <SourcePicker
          isOpen={sourcePickerOpen}
          onSelectSource={onSelectSource}
          onToggle={onToggleSourcePicker}
          selectedSource={source}
          sources={sources}
        />

        <EntryFields
          amount={amount}
          note={note}
          onAmountChange={onAmountChange}
          onNoteChange={onNoteChange}
        />

        <Pressable
          disabled={isSaving || !isFormValid}
          onPress={submit}
          style={({ pressed }) => [
            styles.addButton,
            pressed && isFormValid && styles.buttonPressed,
            (isSaving || !isFormValid) && styles.buttonDisabled,
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
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    color: "#172426",
    fontSize: 18,
    fontWeight: "800",
  },
  formInModal: {
    padding: 20,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 50,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
