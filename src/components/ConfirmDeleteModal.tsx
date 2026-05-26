import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, sizes, spacing, typography } from "../theme";
import { ModalSheet } from "./ModalSheet";

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
    <ModalSheet visible={visible} onClose={onCancel}>
      <View style={styles.modalHeader}>
        <Text style={styles.modalTitle}>{title}</Text>
        <Pressable onPress={onCancel}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={styles.formInModal}>
        <Text style={styles.confirmText}>{body}</Text>
        {meta ? <Text style={styles.confirmMeta}>{meta}</Text> : null}

        <View style={styles.confirmButtons}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
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
  confirmText: {
    color: colors.text,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  confirmMeta: {
    color: colors.textMuted,
    fontSize: typography.sizes.md,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.modal,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.modalActionMinHeight,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.semibold,
  },
  confirmButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: radii.control,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.modalActionMinHeight,
  },
  confirmButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
  },
});
