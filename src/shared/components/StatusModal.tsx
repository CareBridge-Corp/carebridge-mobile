import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../theme";

interface StatusModalProps {
  visible: boolean;
  type?: "success" | "error" | "info";
  title: string;
  message: string;
  primaryButtonText?: string;
  onPrimaryPress: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
}

export default function StatusModal({
  visible,
  type = "success",
  title,
  message,
  primaryButtonText = "OK",
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
}: StatusModalProps) {
  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#10B981"; // emerald-500
      case "error":
        return "#EF4444"; // red-500
      default:
        return "#3B82F6"; // blue-500
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Ionicons
            name={getIconName()}
            size={64}
            color={getIconColor()}
            style={styles.icon}
          />

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonContainer}>
            {secondaryButtonText && onSecondaryPress && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={onSecondaryPress}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryButtonText}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={onPrimaryPress}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>{primaryButtonText}</Text>
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
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  icon: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  message: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    textAlign: "center",
    marginBottom: spacing.xxl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: spacing.md,
    width: "100%",
  },
  button: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#0C4A6E",
  },
  secondaryButton: {
    backgroundColor: "#E8F0F5",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  secondaryButtonText: {
    color: "#0C4A6E",
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
});
