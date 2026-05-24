import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, View } from "react-native";
import { Button, Text } from "../../../../../shared/components/ui";
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
          <View style={styles.iconCircle}>
            <Ionicons
              name="checkmark-done"
              size={28}
              color={colors.primary}
            />
          </View>
          <Text variant="title2" align="center" style={styles.title}>
            Activity completed?
          </Text>
          <Text
            variant="body"
            tone="secondary"
            align="center"
            style={styles.subtitle}
          >
            {`Have you finished practicing "${title}" with your child?`}
          </Text>

          <View style={styles.buttons}>
            <Button
              label="Not yet"
              variant="secondary"
              onPress={onClose}
              fullWidth={false}
              style={styles.btn}
            />
            <Button
              label="Yes, confirm"
              onPress={onConfirm}
              fullWidth={false}
              style={styles.btn}
            />
          </View>
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
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[4],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
  buttons: {
    flexDirection: "row",
    gap: spacing[3],
    width: "100%",
  },
  btn: {
    flex: 1,
  },
});
