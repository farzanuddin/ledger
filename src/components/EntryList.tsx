import { memo, useCallback } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";
import type { Entry } from "../types";
import { formatDecimalAmount, formatEntryDate } from "../utils/format";
import { AedSymbol } from "./AedSymbol";

export function EntryList({
  entries,
  isLoading,
  onRequestDelete,
}: {
  entries: Entry[];
  isLoading: boolean;
  onRequestDelete: (entry: Entry) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: Entry }) => (
      <EntryRow entry={item} onRequestDelete={onRequestDelete} />
    ),
    [onRequestDelete],
  );

  return (
    <FlatList
      style={styles.list}
      contentContainerStyle={styles.listContent}
      data={entries}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>
            {isLoading ? "Loading ledger" : "No entries yet"}
          </Text>
          <Text style={styles.emptyBody}>
            {isLoading
              ? "Syncing your latest entries."
              : "Add the first amount to start tracking who owes whom."}
          </Text>
        </View>
      }
      renderItem={renderItem}
    />
  );
}

const EntryRow = memo(function EntryRow({
  entry,
  onRequestDelete,
}: {
  entry: Entry;
  onRequestDelete: (entry: Entry) => void;
}) {
  return (
    <View style={styles.entryRow}>
      <View style={styles.entryText}>
        <Text style={styles.entryNote}>{entry.note || "Untitled entry"}</Text>
        <Text style={styles.entryMeta}>
          {entry.source} · {formatEntryDate(entry.createdAt)}
        </Text>
      </View>
      <View style={styles.entryAmountBlock}>
        <View style={styles.entryAmountRow}>
          <AedSymbol
            color={entry.amountCents < 0 ? colors.danger : colors.primary}
            size="small"
          />
          <Text
            style={[
              styles.entryAmount,
              entry.amountCents < 0 ? styles.negativeAmount : styles.positiveAmount,
            ]}
          >
            {entry.amountCents < 0 ? "(" : ""}
            {formatDecimalAmount(Math.abs(entry.amountCents) / 100)}
            {entry.amountCents < 0 ? ")" : ""}
          </Text>
        </View>
        <Pressable onPress={() => onRequestDelete(entry)}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.modal,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 42,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
  },
  emptyBody: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
    textAlign: "center",
  },
  entryRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.xxl,
    marginBottom: spacing.xl,
    padding: spacing.section,
  },
  entryText: {
    flex: 1,
    overflow: "hidden",
  },
  entryNote: {
    color: colors.text,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
    ...Platform.select({
      web: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }),
  },
  entryMeta: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
    ...Platform.select({
      web: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }),
  },
  entryAmountBlock: {
    alignItems: "flex-end",
  },
  entryAmountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  entryAmount: {
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.heavy,
  },
  positiveAmount: {
    color: colors.primary,
  },
  negativeAmount: {
    color: colors.danger,
  },
  deleteText: {
    color: colors.textMuted,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.lg,
  },
});
