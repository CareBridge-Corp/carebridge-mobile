import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { Screening } from "../store/screeningStore";

interface ScreeningResultCardProps {
  screening: Screening;
}

export function ScreeningResultCard({ screening }: ScreeningResultCardProps) {
  const router = useRouter();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "HIGH":
        return "#EF4444";
      case "MEDIUM":
        return "#F59E0B";
      case "LOW":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const handlePress = () => {
    if (screening.status === "UNDER_REVIEW") return;
    router.push("/(app)/(mchat)/mchat-results" as Href);
  };

  const isUnderReview = screening.status === "UNDER_REVIEW";

  return (
    <TouchableOpacity
      style={[styles.card, isUnderReview && styles.cardDisabled]}
      onPress={handlePress}
      activeOpacity={isUnderReview ? 1 : 0.7}
      disabled={isUnderReview}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={isUnderReview ? "time" : "document-text"}
            size={24}
            color="#0C4A6E"
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>Screening Result</Text>
          <Text style={styles.date}>
            {new Date(screening.createdAt).toLocaleDateString()}
          </Text>
        </View>
        {!isUnderReview && (
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: getRiskColor(screening.riskLevel) + "20" },
            ]}
          >
            <Text
              style={[
                styles.riskText,
                { color: getRiskColor(screening.riskLevel) },
              ]}
            >
              {screening.riskLevel} RISK
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.description}>
        {isUnderReview
          ? "Your screening is currently being reviewed by our medical professionals. You will be notified once the results are ready."
          : "Click to view full results and professional interpretation from your recent screening."}
      </Text>

      <View style={styles.footer}>
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusDot, isUnderReview && styles.statusDotReview]}
          />
          <Text
            style={[
              styles.statusText,
              isUnderReview && styles.statusTextReview,
            ]}
          >
            {screening.status.replace("_", " ")}
          </Text>
        </View>
        {!isUnderReview && (
          <View style={styles.viewResult}>
            <Text style={styles.viewResultText}>View Results</Text>
            <Ionicons name="arrow-forward" size={16} color="#4A9FD8" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E8F0F5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardDisabled: {
    borderColor: "#D1DFE8",
    opacity: 0.9,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  date: {
    fontSize: typography.fontSize.xs,
    color: "#A0B8C8",
    marginTop: 2,
  },
  riskBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  riskText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4A9FD8",
    marginRight: 6,
  },
  statusDotReview: {
    backgroundColor: "#F59E0B",
    width: 10,
    height: 10,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: "#5A7A8F",
    fontWeight: typography.fontWeight.medium,
  },
  statusTextReview: {
    color: "#D97706",
    fontWeight: typography.fontWeight.bold,
    fontSize: typography.fontSize.sm,
  },
  viewResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewResultText: {
    fontSize: typography.fontSize.xs,
    color: "#4A9FD8",
    fontWeight: typography.fontWeight.semibold,
  },
});
