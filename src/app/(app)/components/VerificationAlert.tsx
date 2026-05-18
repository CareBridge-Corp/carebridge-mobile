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

  // Use light orange for unverified, stark red for rejected
  const bgColor = isRejected ? "#FEF2F2" : isPending ? "#FFFBEB" : "#FFEDD5";
  const iconColor = isRejected ? "#DC2626" : isPending ? "#D97706" : "#EA580C";
  const iconName = isRejected
    ? "alert-circle"
    : isPending
      ? "time-outline"
      : "warning";

  const title = isRejected
    ? "Verification Rejected"
    : isPending
      ? "Verification Pending"
      : "Action Required";

  const subtitle = isRejected
    ? "Your document was denied. Please upload a valid ID immediately."
    : isPending
      ? "We are currently reviewing your documents."
      : "You must verify your identity to access treatments.";

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: bgColor, borderLeftColor: iconColor },
      ]}
      disabled={isPending}
      activeOpacity={0.8}
      onPress={() => router.push("/(app)/(verification)/verify" as Href)}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={iconColor}
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: iconColor }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: iconColor, opacity: 0.85 }]}>
          {subtitle}
        </Text>
      </View>
      {!isPending && (
        <Ionicons name="chevron-forward" size={20} color={iconColor} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xxl,
    borderLeftWidth: 6,
  },
  icon: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    lineHeight: 22,
  },
});
