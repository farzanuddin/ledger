import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes, spacing, typography } from "../theme";

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
              <MaterialIcons name="close" size={24} color={colors.muted} />
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
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: "center",
    padding: spacing.modal,
  },
  confirmContent: {
    backgroundColor: colors.background,
    borderRadius: radii.dialog,
    maxWidth: 390,
    width: "100%",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: spacing.modal,
    paddingBottom: 0,
  },
  modalTitle: {
    color: colors.text,
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
  },
  formInModal: {
    padding: spacing.modal,
  },
  deleteConfirmText: {
    color: colors.text,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  deleteConfirmMeta: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.modal,
  },
  deleteCancelButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.modalActionMinHeight,
  },
  deleteCancelText: {
    color: colors.muted,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.semibold,
  },
  deleteConfirmButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radii.control,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.modalActionMinHeight,
  },
  deleteConfirmButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
  },
});
