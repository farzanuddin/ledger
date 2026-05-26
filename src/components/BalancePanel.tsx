import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { firebaseIsConfigured } from "../firebase";
import { formatDecimalAmount } from "../utils/format";
import { AedSymbol } from "./AedSymbol";

export function BalancePanel({
  balanceCents,
  isSharing,
  onAddEntry,
  onSharePdf,
}: {
  balanceCents: number;
  isSharing: boolean;
  onAddEntry: () => void;
  onSharePdf: () => void;
}) {
  return (
    <View style={styles.balancePanel}>
      <Text style={styles.balanceLabel}>Total purchases</Text>
      <View style={styles.balanceAmountRow}>
        <AedSymbol color={balanceCents < 0 ? "#b14a3b" : "#172426"} size="large" />
        <Text
          style={[
            styles.balanceAmount,
            balanceCents < 0 ? styles.negativeAmount : styles.totalAmount,
          ]}
        >
          {balanceCents < 0 ? "(" : ""}
          {formatDecimalAmount(Math.abs(balanceCents) / 100)}
          {balanceCents < 0 ? ")" : ""}
        </Text>
        <Pressable
          accessibilityLabel="Share ledger PDF"
          disabled={isSharing}
          onPress={onSharePdf}
          style={({ pressed }) => [
            styles.balanceIconButton,
            pressed && styles.buttonPressed,
            isSharing && styles.buttonDisabled,
          ]}
        >
          <MaterialIcons
            name={isSharing ? "hourglass-empty" : "ios-share"}
            style={styles.balanceIcon}
          />
        </Pressable>
      </View>
      <Text style={styles.syncLabel}>
        {firebaseIsConfigured ? "Synced with Firebase" : "Firebase not configured"}
      </Text>
      <Pressable onPress={onAddEntry} style={styles.addEntryButton}>
        <Text style={styles.addEntryButtonText}>Add entry</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  balancePanel: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 6,
    padding: 18,
  },
  balanceLabel: {
    color: "#526062",
    fontSize: 14,
    fontWeight: "700",
  },
  balanceAmountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  balanceAmount: {
    color: "#172426",
    fontSize: 42,
    fontWeight: "800",
    letterSpacing: 0,
    marginTop: 4,
  },
  balanceIconButton: {
    alignItems: "center",
    backgroundColor: "#f4f1ea",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    marginLeft: "auto",
    width: 36,
  },
  balanceIcon: {
    color: "#2e766f",
    fontSize: 21,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  syncLabel: {
    color: "#6b7678",
    fontSize: 13,
    marginTop: 8,
  },
  addEntryButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    marginTop: 14,
    minHeight: 44,
    justifyContent: "center",
  },
  addEntryButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  positiveAmount: {
    color: "#2e766f",
  },
  negativeAmount: {
    color: "#b14a3b",
  },
  totalAmount: {
    color: "#172426",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
