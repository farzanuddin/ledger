import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

export function ConfirmDeleteModal({
  body,
  meta,
  onCancel,
  onConfirm,
  title,
  visible,
}: {
  body: string;
  meta?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.confirmOverlay}>
        <View style={styles.confirmContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onCancel}>
              <MaterialIcons name="close" size={24} color="#526062" />
            </Pressable>
          </View>

          <View style={styles.formInModal}>
            <Text style={styles.deleteConfirmText}>{body}</Text>
            {meta ? <Text style={styles.deleteConfirmMeta}>{meta}</Text> : null}

            <View style={styles.deleteConfirmButtons}>
              <Pressable onPress={onCancel} style={styles.deleteCancelButton}>
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={onConfirm} style={styles.deleteConfirmButton}>
                <Text style={styles.deleteConfirmButtonText}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  confirmOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  confirmContent: {
    backgroundColor: "#f4f1ea",
    borderRadius: 12,
    maxWidth: 390,
    width: "100%",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 0,
  },
  modalTitle: {
    color: "#172426",
    fontSize: 18,
    fontWeight: "800",
  },
  formInModal: {
    padding: 20,
  },
  deleteConfirmText: {
    color: "#172426",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  deleteConfirmMeta: {
    color: "#687476",
    fontSize: 14,
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  deleteCancelButton: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d9d6ca",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  deleteCancelText: {
    color: "#526062",
    fontSize: 16,
    fontWeight: "700",
  },
  deleteConfirmButton: {
    alignItems: "center",
    backgroundColor: "#b14a3b",
    borderRadius: 8,
    flex: 1,
    justifyContent: "center",
    minHeight: 48,
  },
  deleteConfirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
});
