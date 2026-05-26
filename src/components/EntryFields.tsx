import { StyleSheet, TextInput, View } from "react-native";
import { colors, radii, sizes, spacing, typography } from "../theme";
import { sanitizeAmountInput } from "../utils/validation";

export function EntryFields({
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
  return (
    <View style={styles.inputRow}>
      <TextInput
        keyboardType="decimal-pad"
        onChangeText={(text) => onAmountChange(sanitizeAmountInput(text))}
        placeholder="Amount"
        placeholderTextColor={colors.placeholder}
        style={[styles.input, styles.amountInput]}
        value={amount}
      />
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

const styles = StyleSheet.create({
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
    flex: 0.55,
    minWidth: 0,
  },
});
