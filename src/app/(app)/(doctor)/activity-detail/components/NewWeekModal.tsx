import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../../../../shared/theme";

interface NewWeekModalProps {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
  weekNumber: number;
}

export function NewWeekModal({
  visible,
  onClose,
  onContinue,
  weekNumber,
}: NewWeekModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="sparkles" size={48} color="#0C4A6E" />
          </View>

          <Text style={styles.title}>Next Week Plan!</Text>
          <Text style={styles.subtitle}>
            Great progress! You've completed your current tasks and are now
            moving to Week {weekNumber}.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onContinue}
            >
              <Text style={styles.confirmButtonText}>Let's go</Text>
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
    backgroundColor: "rgba(12, 74, 110, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  content: {
    backgroundColor: colors.white,
    borderRadius: 32,
    padding: spacing.xxxl,
    width: "100%",
    alignItems: "center",
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
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
    width: "100%",
  },
  button: {
    width: "100%",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#0C4A6E",
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
