import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
          color="#526062"
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
    color: "#526062",
    fontSize: 15,
    fontWeight: "700",
  },
  value: {
    color: "#172426",
    fontWeight: "800",
  },
  panel: {
    marginTop: 10,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 100,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  pillActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  pillText: {
    color: "#172426",
    fontSize: 14,
    fontWeight: "700",
  },
  pillTextActive: {
    color: "#ffffff",
  },
  noSourcesText: {
    color: "#687476",
    fontSize: 13,
    marginTop: 8,
  },
});
