import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing } from "../../../../../shared/theme";

interface CompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}

export function CompletionModal({
  visible,
  onClose,
  onConfirm,
  title,
}: CompletionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Activity Completed?</Text>
          <Text style={styles.subtitle}>
            Have you finished practicing "{title}" with your child?
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Not yet</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>Yes, confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxxl,
    width: "100%",
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0C4A6E",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#F1F5F9",
  },
  confirmButton: {
    backgroundColor: "#0C4A6E",
  },
  cancelButtonText: {
    color: "#64748B",
    fontWeight: "600",
  },
  confirmButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
});
