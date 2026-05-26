import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Person } from "../types";

export function AppHeader({
  isRefreshing,
  onOpenSettings,
  onRefresh,
  onSelectPerson,
  people,
  peopleCountLabel,
  selectedPerson,
}: {
  isRefreshing: boolean;
  onOpenSettings: () => void;
  onRefresh: () => void;
  onSelectPerson: (id: string) => void;
  people: Person[];
  peopleCountLabel: string;
  selectedPerson: string;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={styles.kicker}>{peopleCountLabel}</Text>
        <View style={styles.headerActions}>
          <Pressable
            accessibilityLabel="Manage sources"
            onPress={onOpenSettings}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <MaterialIcons name="settings" style={styles.headerIcon} />
          </Pressable>
          <Pressable
            accessibilityLabel="Refresh ledger"
            disabled={isRefreshing}
            onPress={onRefresh}
            style={({ pressed }) => [
              styles.headerIconButton,
              pressed && styles.buttonPressed,
              isRefreshing && styles.buttonDisabled,
            ]}
          >
            <MaterialIcons
              name={isRefreshing ? "hourglass-empty" : "refresh"}
              style={styles.headerIcon}
            />
          </Pressable>
        </View>
      </View>

      <View style={styles.tabBar}>
        {people.map((person) => {
          const isActive = selectedPerson === person.id;
          return (
            <Pressable
              key={person.id}
              onPress={() => onSelectPerson(person.id)}
              style={[styles.tab, isActive && styles.tabActive]}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {person.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 0,
  },
  headerTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  headerIconButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  headerIcon: {
    color: "#526062",
    fontSize: 21,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  kicker: {
    color: "#526062",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  tabBar: {
    flexDirection: "row",
    marginTop: 10,
  },
  tab: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: "#2e766f",
    borderColor: "#2e766f",
  },
  tabText: {
    color: "#526062",
    fontSize: 15,
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
