import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, spacing, typography } from "../../../shared/theme";

interface VerificationAlertProps {
  status: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

export function VerificationAlert({ status }: VerificationAlertProps) {
  const router = useRouter();

  if (status === "VERIFIED") return null;

  const isPending = status === "PENDING";
  const isRejected = status === "REJECTED";

  const bgColor = isRejected ? "#FEE2E2" : isPending ? "#FEF3C7" : "#E0E7FF";
  const iconColor = isRejected ? "#EF4444" : isPending ? "#D97706" : "#4338CA";
  const iconName = isRejected
    ? "close-circle"
    : isPending
      ? "time"
      : "shield-half";
  const title = isRejected
    ? "Verification Rejected"
    : isPending
      ? "Verification in Progress"
      : "Action Required";
  const subtitle = isRejected
    ? "Tap to update your document."
    : isPending
      ? "Our clinical team is reviewing your profile."
      : "Verify your child's profile to access treatments.";

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: bgColor }]}
      disabled={isPending}
      activeOpacity={0.7}
      onPress={() => router.push("/(app)/verify-child" as Href)}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={28} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: iconColor }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: iconColor, opacity: 0.8 }]}>
          {subtitle}
        </Text>
      </View>
      {!isPending && (
        <View style={styles.arrowContainer}>
          <Ionicons name="chevron-forward" size={20} color={iconColor} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
});
