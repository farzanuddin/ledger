import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes, spacing, typography, withButtonState } from "../theme";
import type { Person } from "../types";

export function AppHeader({
  isDisabled,
  onOpenSettings,
  onRefresh,
  onSelectPerson,
  people,
  peopleCountLabel,
  selectedPerson,
}: {
  isDisabled: boolean;
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
            disabled={isDisabled}
            onPress={onOpenSettings}
            style={withButtonState(styles.headerIconButton, isDisabled)}
          >
            <MaterialIcons name="settings" style={styles.headerIcon} />
          </Pressable>
          <Pressable
            accessibilityLabel="Refresh ledger"
            disabled={isDisabled}
            onPress={onRefresh}
            style={withButtonState(styles.headerIconButton, isDisabled)}
          >
            <MaterialIcons
              name="refresh"
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
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.screen,
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
    gap: spacing.md,
  },
  headerIconButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    height: sizes.iconSmall,
    justifyContent: "center",
    width: sizes.iconSmall,
  },
  headerIcon: {
    color: colors.muted,
    fontSize: typography.sizes.icon,
    lineHeight: 21,
    includeFontPadding: false,
    textAlign: "center",
    textAlignVertical: "center",
  },
  kicker: {
    color: colors.muted,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  tabBar: {
    flexDirection: "row",
    marginTop: spacing.xl,
  },
  tab: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.control,
    flex: 1,
    marginHorizontal: spacing.sm,
    paddingVertical: spacing.xl,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    color: colors.muted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
  },
  tabTextActive: {
    color: colors.surface,
  },
});
