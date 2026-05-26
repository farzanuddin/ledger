import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

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
          placeholderTextColor="#7f8a8d"
          style={styles.addInput}
          value={newValue}
        />
        <Pressable
          disabled={isSaving}
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.buttonPressed,
            isSaving && styles.buttonDisabled,
          ]}
        >
          <MaterialIcons name="add" size={22} color="#ffffff" />
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
                pressed && styles.buttonPressed,
              ]}
            >
              <MaterialIcons name="delete-outline" size={21} color="#b14a3b" />
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
    gap: 8,
    marginBottom: 10,
  },
  addInput: {
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    color: "#172426",
    flex: 1,
    fontSize: 15,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  addButton: {
    alignItems: "center",
    backgroundColor: "#2e766f",
    borderRadius: 8,
    justifyContent: "center",
    width: 44,
  },
  settingsList: {
    maxHeight: 360,
  },
  listContent: {
    gap: 8,
    paddingTop: 2,
  },
  row: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 48,
    paddingLeft: 14,
  },
  rowText: {
    color: "#172426",
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  deleteButton: {
    alignItems: "center",
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  emptyText: {
    color: "#687476",
    fontSize: 13,
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.86,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
