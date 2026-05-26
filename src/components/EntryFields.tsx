import { StyleSheet, TextInput, View } from "react-native";
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
        placeholderTextColor="#7f8a8d"
        style={[styles.input, styles.amountInput]}
        value={amount}
      />
      <TextInput
        onChangeText={onNoteChange}
        placeholder="Note"
        placeholderTextColor="#7f8a8d"
        style={styles.input}
        value={note}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    color: "#172426",
    flex: 1,
    fontSize: 16,
    minHeight: 50,
    minWidth: 0,
    paddingHorizontal: 14,
  },
  amountInput: {
    flex: 0.55,
    minWidth: 0,
  },
});
