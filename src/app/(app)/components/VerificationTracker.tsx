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
  childStatus: string;
}) {
  const router = useRouter();
  const getStatusProps = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return {
          color: "#10B981",
          bg: "#D1FAE5",
          icon: "checkmark-circle",
          text: "Verified",
        };
      case "PENDING":
        return {
          color: "#F59E0B",
          bg: "#FEF3C7",
          icon: "time",
          text: "In Review",
        };
      case "REJECTED":
        return {
          color: "#DC2626",
          bg: "#FEE2E2",
          icon: "alert-circle",
          text: "Rejected",
        };
      default:
        return {
          color: "#EA580C",
          bg: "#FFEDD5",
          icon: "warning",
          text: "Required",
        };
    }
  };
  const parentProps = getStatusProps(parentStatus);
  const childProps = getStatusProps(childStatus);
  return (
    <View style={styles.trackerContainer}>
      <Text style={styles.trackerTitle}>Profile Verification</Text>
      <Text style={styles.trackerSubtitle}>
        Please complete the following verifications to unlock full clinical
        access and treatments.
      </Text>

      <TouchableOpacity
        style={[styles.trackerItem, { borderLeftColor: parentProps.color }]}
        onPress={() => router.push("/(app)/(parent)/verify-parent" as Href)}
        disabled={parentStatus === "VERIFIED" || parentStatus === "PENDING"}
        activeOpacity={0.7}
      >
        <View
          style={[styles.trackerIconBg, { backgroundColor: parentProps.bg }]}
        >
          <Ionicons
            name={parentProps.icon as any}
            size={20}
            color={parentProps.color}
          />
        </View>
        <View style={styles.trackerItemTexts}>
          <Text style={styles.trackerItemTitle}>Parent Identity</Text>
          <Text style={styles.trackerItemSubtitle}>Verify using Fayda ID</Text>
        </View>
        <View
          style={[
            styles.trackerStatusBadge,
            { backgroundColor: parentProps.color },
          ]}
        >
          <Text style={styles.trackerStatusText}>{parentProps.text}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.trackerItem, { borderLeftColor: childProps.color }]}
        onPress={() => router.push("/(app)/(verification)/verify" as Href)}
        disabled={childStatus === "VERIFIED" || childStatus === "PENDING"}
        activeOpacity={0.7}
      >
        <View
          style={[styles.trackerIconBg, { backgroundColor: childProps.bg }]}
        >
          <Ionicons
            name={childProps.icon as any}
            size={20}
            color={childProps.color}
          />
        </View>
        <View style={styles.trackerItemTexts}>
          <Text style={styles.trackerItemTitle}>Child Profile</Text>
          <Text style={styles.trackerItemSubtitle}>
            Verify identity documents
          </Text>
        </View>
        <View
          style={[
            styles.trackerStatusBadge,
            { backgroundColor: childProps.color },
          ]}
        >
          <Text style={styles.trackerStatusText}>{childProps.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  trackerContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  trackerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0F172A",
    marginBottom: spacing.xs,
  },
  trackerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#64748B",
    marginBottom: spacing.lg,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  trackerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  trackerItemTexts: { flex: 1 },
  trackerItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#1E293B",
    marginBottom: 2,
  },
  trackerItemSubtitle: { fontSize: typography.fontSize.sm, color: "#64748B" },
  trackerStatusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  trackerStatusText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    textTransform: "uppercase",
  },
});
