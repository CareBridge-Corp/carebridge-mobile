import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Text } from "../../../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../../../shared/theme";

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
            <Ionicons name="sparkles" size={36} color={colors.primary} />
          </View>

          <Text variant="title1" align="center" style={styles.title}>
            Next week unlocked!
          </Text>
          <Text
            variant="body"
            tone="secondary"
            align="center"
            style={styles.subtitle}
          >
            {`Great progress! You've completed your current tasks and are now moving to Week ${weekNumber}.`}
          </Text>

          <Button
            label="Let's go"
            onPress={onContinue}
            trailingIcon="arrow-forward"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[5],
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    padding: spacing[6],
    width: "100%",
    alignItems: "center",
    ...shadows.lg,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
});
