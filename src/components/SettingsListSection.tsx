import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { colors, commonStyles, radii, sizes, spacing, typography } from "../theme";

type SettingsItem = {
  id: string;
  name: string;
};

export function SettingsListSection<T extends SettingsItem>({
  addPlaceholder,
  emptyText,
  isSaving,
  isLoading,
  items,
  newValue,
  onAdd,
  onChangeNewValue,
  onDelete,
}: {
  addPlaceholder: string;
  emptyText?: string;
  isSaving: boolean;
  isLoading?: boolean;
  items: T[];
  newValue: string;
  onAdd: () => void | Promise<void>;
  onChangeNewValue: (value: string) => void;
  onDelete: (item: T) => void;
}) {
  return (
    <View>
      <View style={styles.addRow}>
        <TextInput
          onChangeText={onChangeNewValue}
          onSubmitEditing={onAdd}
          placeholder={addPlaceholder}
          placeholderTextColor={colors.placeholder}
          style={styles.addInput}
          value={newValue}
        />
        <Pressable
          disabled={isSaving}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && commonStyles.buttonPressed,
            isSaving && commonStyles.buttonDisabled,
          ]}
        >
          <MaterialIcons name="add" size={22} color={colors.surface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContent}
        style={styles.settingsList}
      >
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rowText}>{item.name}</Text>
            <Pressable
              accessibilityLabel={`Delete ${item.name}`}
              onPress={() => onDelete(item)}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && commonStyles.buttonPressed,
              ]}
            >
              <MaterialIcons name="delete-outline" size={21} color={colors.danger} />
            </Pressable>
          </View>
        ))}
        {!items.length && (isLoading || emptyText) ? (
          <Text style={styles.emptyText}>{isLoading ? "Loading..." : emptyText}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  addInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.base,
    minHeight: sizes.controlMinHeight,
    paddingHorizontal: spacing.xxl,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.control,
    justifyContent: "center",
    width: sizes.controlMinHeight,
  },
  settingsList: {
    maxHeight: 360,
  },
  listContent: {
    gap: spacing.lg,
    paddingTop: spacing.xxs,
  },
  row: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: sizes.modalActionMinHeight,
    paddingLeft: spacing.section,
  },
  rowText: {
    color: colors.text,
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  deleteButton: {
    alignItems: "center",
    height: sizes.iconButton,
    justifyContent: "center",
    width: sizes.iconButton,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
  },
});
