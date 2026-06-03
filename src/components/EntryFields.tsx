import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, commonStyles, radii, sizes, spacing, typography } from "../theme";
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
  const isNegative = amount.trim().startsWith("-");
  const displayAmount = isNegative ? amount.replace(/^-+/, "") : amount;

  const changeAmountValue = (text: string) => {
    const unsignedAmount = sanitizeAmountInput(text).replace(/-/g, "");
    onAmountChange(isNegative && unsignedAmount ? `-${unsignedAmount}` : unsignedAmount);
  };

  const changeAmountSign = (nextIsNegative: boolean) => {
    const unsignedAmount = sanitizeAmountInput(amount).replace(/-/g, "");
    onAmountChange(nextIsNegative && unsignedAmount ? `-${unsignedAmount}` : unsignedAmount);
  };

  return (
    <View style={styles.inputRow}>
      <View style={styles.amountInput}>
        <Pressable
          accessibilityLabel={
            isNegative ? "Change amount to positive" : "Change amount to negative"
          }
          onPress={() => changeAmountSign(!isNegative)}
          style={({ pressed }) => [
            styles.amountSign,
            isNegative && styles.amountSignNegative,
            pressed && commonStyles.buttonPressed,
          ]}
        >
          <Text
            style={[
              styles.amountSignText,
              isNegative && styles.amountSignTextNegative,
            ]}
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
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    flex: 0.55,
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
