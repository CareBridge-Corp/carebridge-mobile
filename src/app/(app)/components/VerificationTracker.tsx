import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";

export default function VerificationTracker({
  parentStatus,
  childStatus,
}: {
  parentStatus: string;
  childStatus: any;
}) {
  const router = useRouter();

  const getStatusProps = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return {
          color: colors.success,
          bg: "#D1FAE5",
          icon: "checkmark-circle",
          text: "Verified",
        };
      case "PENDING":
        return {
          color: colors.warning,
          bg: "#FEF3C7",
          icon: "time-outline",
          text: "In Review",
        };
      case "REJECTED":
        return {
          color: colors.error,
          bg: "#FEE2E2",
          icon: "close-circle-outline",
          text: "Rejected",
        };
      default:
        return {
          color: colors.primary,
          bg: colors.cardLightBlue,
          icon: "alert-circle-outline",
          text: "Action Required",
        };
    }
  };

  const parentProps = getStatusProps(parentStatus);
  const childProps = getStatusProps(childStatus);

  const allVerified = parentStatus === "VERIFIED" && childStatus === "VERIFIED";
  const hasRejected = parentStatus === "REJECTED" || childStatus === "REJECTED";
  const bothPending = parentStatus === "PENDING" && childStatus === "PENDING";
  const completedCount =
    (parentStatus === "VERIFIED" ? 1 : 0) +
    (childStatus === "VERIFIED" ? 1 : 0);
  const progressPercentage = (completedCount / 2) * 100;

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons
            name={allVerified ? "shield-checkmark" : "shield-outline"}
            size={24}
            color={allVerified ? colors.success : colors.primary}
          />
        </View>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            {allVerified
              ? "All verifications completed"
              : "Complete both verifications to unlock full access"}
          </Text>
        </View>
      </View>

      {/* Progress Indicator */}
      {!allVerified && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {completedCount} of 2 completed
          </Text>
        </View>
      )}

      {/* Verification Items */}
      <View style={styles.itemsContainer}>
        {/* Parent Identity Verification */}
        <View
          style={[
            styles.item,
            parentStatus === "VERIFIED" && styles.itemVerified,
            parentStatus === "REJECTED" && styles.itemRejected,
          ]}
        >
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: parentProps.bg },
              ]}
            >
              <Ionicons
                name={parentProps.icon as any}
                size={24}
                color={parentProps.color}
              />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Parent Identity</Text>
                {parentStatus !== "VERIFIED" && parentStatus !== "PENDING" && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemSubtitle}>Verify using Fayda ID</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: parentProps.bg }]}
          >
            <Text style={[styles.statusText, { color: parentProps.color }]}>
              {parentProps.text}
            </Text>
          </View>
        </View>

        {/* Child Profile Verification */}
        <View
          style={[
            styles.item,
            childStatus === "VERIFIED" && styles.itemVerified,
            childStatus === "REJECTED" && styles.itemRejected,
          ]}
        >
          <View style={styles.itemLeft}>
            <View
              style={[styles.iconContainer, { backgroundColor: childProps.bg }]}
            >
              <Ionicons
                name={childProps.icon as any}
                size={24}
                color={childProps.color}
              />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle}>Child Profile</Text>
                {childStatus !== "VERIFIED" && childStatus !== "PENDING" && (
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
                )}
              </View>
              <Text style={styles.itemSubtitle}>Verify identity documents</Text>
            </View>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: childProps.bg }]}
          >
            <Text style={[styles.statusText, { color: childProps.color }]}>
              {childProps.text}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Banner */}
      {!allVerified && (
        <View
          style={[
            styles.infoBanner,
            hasRejected && styles.infoBannerError,
            bothPending && styles.infoBannerPending,
          ]}
        >
          <Ionicons
            name={
              hasRejected
                ? "information-circle"
                : bothPending
                  ? "time-outline"
                  : "information-circle-outline"
            }
            size={20}
            color={
              hasRejected
                ? colors.error
                : bothPending
                  ? colors.warning
                  : colors.primary
            }
          />
          <Text
            style={[
              styles.infoText,
              hasRejected && styles.infoTextError,
              bothPending && styles.infoTextPending,
            ]}
          >
            {hasRejected
              ? "Please review and resubmit rejected verifications"
              : bothPending
                ? "Your verifications are being reviewed. You'll be notified once approved."
                : "Both verifications must be completed to access clinical services"}
          </Text>
        </View>
      )}

      {/* Single Action Button */}
      {!allVerified && !bothPending && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/(app)/(verification)/verify" as Href)}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonText}>
            {hasRejected ? "Resubmit Verification" : "Start Verification"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.cardLightBlue,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.cardLightBlue,
    borderRadius: borderRadius.full,
    overflow: "hidden",
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textAlign: "center",
  },
  itemsContainer: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  itemVerified: {
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  itemRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  requiredBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  requiredText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.warning,
    textTransform: "uppercase",
  },
  itemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginLeft: spacing.sm,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    textTransform: "uppercase",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardLightBlue,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoBannerError: {
    backgroundColor: "#FEE2E2",
  },
  infoBannerPending: {
    backgroundColor: "#FEF3C7",
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  infoTextError: {
    color: colors.error,
  },
  infoTextPending: {
    color: colors.warning,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
