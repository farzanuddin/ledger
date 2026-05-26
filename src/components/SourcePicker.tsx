import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "../theme";
import type { PurchaseSource } from "../types";

export function SourcePicker({
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
  sources: PurchaseSource[];
}) {
  return (
    <View>
      <Pressable onPress={onToggle} style={styles.header}>
        <Text style={styles.label}>
          Source:{" "}
          <Text style={styles.value}>{selectedSource || "No source selected"}</Text>
        </Text>
        <MaterialIcons
          name={isOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={22}
          color={colors.muted}
        />
      </Pressable>
      {isOpen && (
        <View style={styles.panel}>
          <View style={styles.pillRow}>
            {sources.map((source) => {
              const isSelected = selectedSource === source.name;

              return (
                <Pressable
                  key={source.id}
                  onPress={() => onSelectSource(source.name)}
                  style={[styles.pill, isSelected && styles.pillActive]}
                >
                  <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
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

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  label: {
    color: colors.muted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  value: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  panel: {
    marginTop: spacing.xl,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  pill: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.panel,
    paddingVertical: spacing.xl,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    color: colors.text,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  pillTextActive: {
    color: colors.surface,
  },
  noSourcesText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
});
