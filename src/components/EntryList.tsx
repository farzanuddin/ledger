import { memo, useCallback } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { LedgerEntry } from "../types";
import { formatDecimalAmount, formatEntryDate } from "../utils/format";
import { AedSymbol } from "./AedSymbol";

export function EntryList({
  entries,
  isLoading,
  onRequestDelete,
}: {
  entries: LedgerEntry[];
  isLoading: boolean;
  onRequestDelete: (entry: LedgerEntry) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: LedgerEntry }) => (
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
  entry: LedgerEntry;
  onRequestDelete: (entry: LedgerEntry) => void;
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
            color={entry.amountCents < 0 ? "#b14a3b" : "#2e766f"}
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
    padding: 20,
    paddingBottom: 32,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 42,
  },
  emptyTitle: {
    color: "#172426",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyBody: {
    color: "#687476",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  entryRow: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 10,
    padding: 14,
  },
  entryText: {
    flex: 1,
    overflow: "hidden",
  },
  entryNote: {
    color: "#172426",
    fontSize: 16,
    fontWeight: "800",
    ...Platform.select({
      web: {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      },
    }),
  },
  entryMeta: {
    color: "#687476",
    fontSize: 13,
    marginTop: 4,
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
    gap: 3,
  },
  entryAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  positiveAmount: {
    color: "#2e766f",
  },
  negativeAmount: {
    color: "#b14a3b",
  },
  deleteText: {
    color: "#687476",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 8,
  },
});
