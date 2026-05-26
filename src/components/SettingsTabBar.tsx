import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes, spacing, typography } from "../theme";
import type { SettingsTab } from "../types";

const settingsTabs: SettingsTab[] = ["sources", "people"];

export function SettingsTabBar({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}) {
  return (
    <View style={styles.tabs}>
      {settingsTabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <Pressable
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab === "people" ? "People" : "Sources"}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.section,
  },
  tab: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.tabMinHeight,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  tabTextActive: {
    color: colors.surface,
  },
});
