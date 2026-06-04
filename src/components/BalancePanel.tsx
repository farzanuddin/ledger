import { MaterialIcons } from "@expo/vector-icons";
import { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes, spacing, typography, withButtonState } from "../theme";
import { formatBalanceCell } from "../utils/format";
import { AedSymbol } from "./AedSymbol";

export const BalancePanel = memo(function BalancePanel({
  balanceCents,
  isDisabled,
  isSharing,
  onAddEntry,
  onSharePdf,
  onSettleBalance,
}: {
  balanceCents: number;
  isDisabled: boolean;
  isSharing: boolean;
  onAddEntry: () => void;
  onSharePdf: () => void;
  onSettleBalance: () => void;
}) {
  return (
    <View style={styles.balancePanel}>
      <Text style={styles.balanceLabel}>Balance</Text>
      <View style={styles.balanceAmountRow}>
        <AedSymbol
          color={balanceCents < 0 ? colors.danger : colors.text}
          size="large"
        />
        <Text
          style={[
            styles.balanceAmount,
            balanceCents < 0 ? styles.negativeAmount : styles.totalAmount,
          ]}
        >
          {formatBalanceCell(balanceCents)}
        </Text>
        <Pressable
          accessibilityLabel="Share ledger PDF"
          disabled={isDisabled || isSharing}
          onPress={onSharePdf}
          style={withButtonState(styles.balanceIconButton, isDisabled || isSharing)}
        >
          <MaterialIcons
            name={isSharing ? "hourglass-empty" : "ios-share"}
            style={styles.balanceIcon}
          />
        </Pressable>
      </View>
      <Text style={styles.syncLabel}>
        {isDisabled ? "Connect Firebase to use the ledger" : "Synced with Firebase"}
      </Text>
      <View style={styles.actionRow}>
        <Pressable
          accessibilityLabel="Add entry"
          disabled={isDisabled}
          onPress={onAddEntry}
          style={withButtonState(styles.addEntryButton, isDisabled)}
        >
          <Text style={styles.addEntryButtonText}>Add entry</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Settle balance"
          disabled={isDisabled || balanceCents === 0}
          onPress={onSettleBalance}
          style={withButtonState(styles.settleButton, isDisabled || balanceCents === 0)}
        >
          <MaterialIcons name="done-all" style={styles.settleIcon} />
          <Text style={styles.settleButtonText}>Settle</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  balancePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.screen,
  },
  balanceLabel: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
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
    flexShrink: 1,
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
    height: sizes.iconSmall,
    justifyContent: "center",
    marginLeft: "auto",
    width: sizes.iconSmall,
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
    flex: 1,
    minHeight: sizes.control,
    justifyContent: "center",
    minWidth: 0,
    paddingHorizontal: spacing.section,
  },
  addEntryButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.section,
  },
  settleButton: {
    alignItems: "center",
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexShrink: 0,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "center",
    minHeight: sizes.control,
    paddingHorizontal: spacing.section,
  },
  settleIcon: {
    color: colors.primary,
    fontSize: typography.sizes.title,
    lineHeight: 18,
  },
  settleButtonText: {
    color: colors.text,
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
