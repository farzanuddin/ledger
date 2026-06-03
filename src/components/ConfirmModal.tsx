import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, modalStyles, radii, sizes, spacing, typography } from "../theme";
import { ModalSheet } from "./ModalSheet";

export function ConfirmModal({
  body,
  confirmLabel = "Delete",
  meta,
  onCancel,
  onConfirm,
  title,
  variant = "danger",
  visible,
}: {
  body: string;
  confirmLabel?: string;
  meta?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  variant?: "danger" | "primary";
  visible: boolean;
}) {
  return (
    <ModalSheet visible={visible} onClose={onCancel}>
      <View style={modalStyles.header}>
        <Text style={modalStyles.title}>{title}</Text>
        <Pressable onPress={onCancel}>
          <MaterialIcons name="close" size={24} color={colors.muted} />
        </Pressable>
      </View>

      <View style={modalStyles.body}>
        <Text style={styles.confirmText}>{body}</Text>
        {meta ? <Text style={styles.confirmMeta}>{meta}</Text> : null}

        <View style={styles.confirmButtons}>
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={onConfirm}
            style={[
              styles.confirmButton,
              variant === "primary" && styles.confirmButtonPrimary,
            ]}
          >
            <Text style={styles.confirmButtonText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </ModalSheet>
  );
}

const styles = StyleSheet.create({
  confirmText: {
    color: colors.text,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
  },
  confirmMeta: {
    color: colors.textMuted,
    fontSize: typography.sizes.sm,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: spacing.xl,
    marginTop: spacing.screen,
  },
  cancelButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.control,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: sizes.controlLarge,
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
    minHeight: sizes.controlLarge,
  },
  confirmButtonPrimary: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: colors.surface,
    fontSize: typography.sizes.input,
    fontWeight: typography.weights.bold,
  },
});
