import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
            {t("activity.completeConfirmTitle")}
          </Text>
          <Text
            variant="body"
            tone="secondary"
            align="center"
            style={styles.subtitle}
          >
            {t("activity.completeConfirmMessage", { title })}
          </Text>

          <View style={styles.buttons}>
            <Button
              label={t("activity.notYet")}
              variant="secondary"
              onPress={onClose}
              fullWidth={false}
              style={styles.btn}
            />
            <Button
              label={t("activity.yesConfirm")}
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
