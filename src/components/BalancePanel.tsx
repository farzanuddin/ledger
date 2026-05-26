import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, commonStyles, radii, sizes, spacing, typography } from "../theme";
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
        <AedSymbol color={balanceCents < 0 ? colors.danger : colors.text} size="large" />
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
            pressed && commonStyles.buttonPressed,
            isSharing && commonStyles.buttonDisabled,
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
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.card,
  },
  balanceLabel: {
    color: colors.muted,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  balanceAmountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  balanceAmount: {
    color: colors.text,
    fontSize: typography.sizes.balance,
    fontWeight: typography.weights.bold,
    letterSpacing: 0,
    marginTop: spacing.sm,
  },
  balanceIconButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: sizes.balanceIconButton,
    justifyContent: "center",
    marginLeft: "auto",
    width: sizes.balanceIconButton,
  },
  balanceIcon: {
    color: colors.primary,
    fontSize: typography.sizes.icon,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  syncLabel: {
    color: colors.syncText,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
  addEntryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    marginTop: spacing.section,
    minHeight: sizes.controlMinHeight,
    justifyContent: "center",
  },
  addEntryButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  negativeAmount: {
    color: colors.danger,
  },
  totalAmount: {
    color: colors.text,
  },
});
