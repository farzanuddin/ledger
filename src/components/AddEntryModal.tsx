import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, commonStyles, modalStyles, radii, sizes, spacing, typography, withButtonState } from "../theme";
import type { Source } from "../types";
import { sanitizeAmountInput, validateEntryInput } from "../utils/validation";
import { ModalSheet } from "./ModalSheet";

const getPreferredSourceName = (sources: Source[]) =>
  sources.find((source) => source.name.toLowerCase() === "default")?.name ||
  sources[0]?.name ||
  "";

export function AddEntryModal({
  isSaving,
  onAddEntry,
  onClose,
  sources,
  visible,
}: {
  isSaving: boolean;
  onAddEntry: (entry: {
    amount: string;
    note: string;
    source: string;
  }) => Promise<boolean>;
  onClose: () => void;
  sources: Source[];
  visible: boolean;
}) {
  const form = useAddEntryForm(sources);

  const closeModal = () => {
    form.reset();
    onClose();
  };

  const submit = async () => {
    const validation = validateEntryInput(form.entry);

    if (!validation.ok) {
      form.setError(validation.message);
      Alert.alert(validation.title, validation.message);
      return;
    }

    form.clearError();
    const wasAdded = await onAddEntry(form.entry);
    if (wasAdded === false) return;
    form.reset();
    onClose();
  };

  return (
    <ModalSheet visible={visible} onClose={closeModal}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.title}>New entry</Text>
        <Pressable onPress={closeModal}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={modalStyles.body}>
        <SourcePicker
          isOpen={form.sourcePickerOpen}
          onSelectSource={form.selectSource}
          onToggle={form.toggleSourcePicker}
          selectedSource={form.entry.source}
          sources={sources}
        />

        <EntryFields
          amount={form.entry.amount}
          note={form.entry.note}
          onAmountChange={form.changeAmount}
          onNoteChange={form.changeNote}
        />

        {form.errorMessage ? (
          <Text style={styles.errorText}>{form.errorMessage}</Text>
        ) : null}

        <Pressable
          disabled={isSaving}
          onPress={submit}
          style={withButtonState(styles.addButton, isSaving)}
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
  // Submit state
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
  // Source picker
  sourceHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sourceLabel: {
    color: colors.muted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  sourceValue: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  sourcePanel: {
    marginTop: spacing.xl,
  },
  sourcePillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  sourcePill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.panel,
    paddingVertical: spacing.xl,
  },
  sourcePillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sourcePillText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  sourcePillTextActive: {
    color: colors.surface,
  },
  noSourcesText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
  // Entry fields
  inputRow: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.section,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.input,
    minHeight: sizes.largeControlMinHeight,
    minWidth: 0,
    paddingHorizontal: spacing.section,
  },
  amountInput: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 0.55,
    flexDirection: "row",
    minHeight: sizes.largeControlMinHeight,
    minWidth: 0,
    paddingLeft: spacing.md,
  },
  amountSign: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderRadius: radii.control,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  amountSignNegative: {
    backgroundColor: colors.danger,
  },
  amountSignText: {
    color: colors.primary,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
    lineHeight: 18,
  },
  amountSignTextNegative: {
    color: colors.surface,
  },
  amountTextInput: {
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.input,
    minHeight: sizes.largeControlMinHeight,
    minWidth: 0,
    paddingHorizontal: spacing.md,
  },
});

function useAddEntryForm(sources: Source[]) {
  const [amount, setAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [note, setNote] = useState("");
  const [source, setSource] = useState("");
  const [sourcePickerOpen, setSourcePickerOpen] = useState(false);

  useEffect(() => {
    if (!sources.length) {
      setSource("");
      return;
    }

    if (!sources.some((item) => item.name === source)) {
      setSource(getPreferredSourceName(sources));
    }
  }, [source, sources]);

  const clearError = () => setErrorMessage("");

  const reset = () => {
    setAmount("");
    setErrorMessage("");
    setNote("");
    setSourcePickerOpen(false);
  };

  const changeAmount = (value: string) => {
    clearError();
    setAmount(value);
  };

  const changeNote = (value: string) => {
    clearError();
    setNote(value);
  };

  const selectSource = (nextSource: string) => {
    clearError();
    setSource(nextSource);
    setSourcePickerOpen(false);
  };

  return {
    changeAmount,
    changeNote,
    clearError,
    entry: { amount, note, source },
    errorMessage,
    reset,
    selectSource,
    setError: setErrorMessage,
    sourcePickerOpen,
    toggleSourcePicker: () => setSourcePickerOpen((isOpen) => !isOpen),
  };
}

function SourcePicker({
  isOpen,
  onSelectSource,
  onToggle,
  selectedSource,
  sources,
}: {
  isOpen: boolean;
  onSelectSource: (source: string) => void;
  onToggle: () => void;
  selectedSource: string;
  sources: Source[];
}) {
  return (
    <View>
      <Pressable onPress={onToggle} style={styles.sourceHeader}>
        <Text style={styles.sourceLabel}>
          Source:{" "}
          <Text style={styles.sourceValue}>
            {selectedSource || "No source selected"}
          </Text>
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={22}
          color={colors.muted}
        />
      </Pressable>
      {isOpen && (
        <View style={styles.sourcePanel}>
          <View style={styles.sourcePillRow}>
            {sources.map((source) => {
              const isSelected = selectedSource === source.name;

              return (
                <Pressable
                  key={source.id}
                  onPress={() => onSelectSource(source.name)}
                  style={[styles.sourcePill, isSelected && styles.sourcePillActive]}
                >
                  <Text
                    style={[
                      styles.sourcePillText,
                      isSelected && styles.sourcePillTextActive,
                    ]}
                  >
                    {source.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {!sources.length && (
            <Text style={styles.noSourcesText}>
              Add a source before saving an entry.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function EntryFields({
  amount,
  note,
  onAmountChange,
  onNoteChange,
}: {
  amount: string;
  note: string;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
}) {
  const isNegative = amount.trim().startsWith("-");
  const displayAmount = isNegative ? amount.replace(/^-+/, "") : amount;

  const changeAmountValue = (text: string) => {
    const unsignedAmount = sanitizeAmountInput(text).replace(/-/g, "");
    onAmountChange(
      isNegative && unsignedAmount ? `-${unsignedAmount}` : unsignedAmount,
    );
  };

  const toggleAmountSign = () => {
    const unsignedAmount = sanitizeAmountInput(amount).replace(/-/g, "");
    onAmountChange(
      !isNegative && unsignedAmount ? `-${unsignedAmount}` : unsignedAmount,
    );
  };

  return (
    <View style={styles.inputRow}>
      <View style={styles.amountInput}>
        <Pressable
          accessibilityLabel={
            isNegative ? "Change amount to positive" : "Change amount to negative"
          }
          onPress={toggleAmountSign}
          style={({ pressed }) => [
            styles.amountSign,
            isNegative && styles.amountSignNegative,
            pressed && commonStyles.buttonPressed,
          ]}
        >
          <Text
            style={[styles.amountSignText, isNegative && styles.amountSignTextNegative]}
          >
            {isNegative ? "-" : "+"}
          </Text>
        </Pressable>
        <TextInput
          keyboardType="decimal-pad"
          onChangeText={changeAmountValue}
          placeholder="Amount"
          placeholderTextColor={colors.placeholder}
          style={styles.amountTextInput}
          value={displayAmount}
        />
      </View>
      <TextInput
        onChangeText={onNoteChange}
        placeholder="Note"
        placeholderTextColor={colors.placeholder}
        style={styles.input}
        value={note}
      />
    </View>
  );
}
