import { Pressable, StyleSheet, Text, View } from "react-native";
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
    gap: 6,
    marginBottom: 14,
  },
  tab: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
  },
  tabActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  tabText: {
    color: "#526062",
    fontSize: 15,
    fontWeight: "800",
  },
  tabTextActive: {
    color: "#ffffff",
  },
});
