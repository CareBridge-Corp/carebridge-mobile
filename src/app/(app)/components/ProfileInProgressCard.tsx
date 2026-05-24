import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { ScreeningProgressResponse } from "../hooks/useScreeningProgress";

interface ProfileInProgressCardProps {
  progress: ScreeningProgressResponse | null | undefined;
  childName?: string;
}

const STEPS = [
  { key: "submitted", icon: "checkmark-circle" as const },
  { key: "review", icon: "medical" as const },
  { key: "roadmap", icon: "map" as const },
  { key: "ready", icon: "sparkles" as const },
];

export function ProfileInProgressCard({
  progress,
  childName,
}: ProfileInProgressCardProps) {
  const { t } = useTranslation();

  if (!progress || progress.profileStatus !== "profile_in_progress") {
    return null;
  }

  const failedCount =
    progress.latestScreening?.failedQuestionIds?.length ?? 0;
  const activeStep = progress.latestScreening?.status === "UNDER_REVIEW" ? 1 : 2;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <ActivityIndicator size="small" color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("screening.profileInProgressTitle")}</Text>
          <Text style={styles.subtitle}>
            {t("screening.profileInProgressSubtitle", {
              name: childName ?? t("home.guest"),
            })}
          </Text>
        </View>
      </View>

      <View style={styles.stepsRow}>
        {STEPS.map((step, index) => {
          const isComplete = index < activeStep;
          const isActive = index === activeStep;
          return (
            <View key={step.key} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  isComplete && styles.stepDotComplete,
                  isActive && styles.stepDotActive,
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={14}
                  color={isComplete || isActive ? colors.white : "#94A3B8"}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  (isComplete || isActive) && styles.stepLabelActive,
                ]}
              >
                {t(`screening.step.${step.key}`)}
              </Text>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    isComplete && styles.stepLineComplete,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
        <Text style={styles.infoText}>
          {t("screening.profileInProgressInfo", { count: failedCount })}
        </Text>
      </View>

      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{t("screening.month")}</Text>
          <Text style={styles.badgeValue}>
            {progress.latestScreening?.screeningMonth ?? 1}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{t("screening.status")}</Text>
          <Text style={styles.badgeValue}>{t("screening.underReview")}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0F7FF",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: 20,
  },
  stepsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    position: "relative",
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepDotComplete: {
    backgroundColor: "#10B981",
  },
  stepDotActive: {
    backgroundColor: "#2563EB",
  },
  stepLabel: {
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.semibold,
  },
  stepLine: {
    position: "absolute",
    top: 15,
    left: "60%",
    width: "80%",
    height: 2,
    backgroundColor: "#E2E8F0",
    zIndex: -1,
  },
  stepLineComplete: {
    backgroundColor: "#10B981",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: "#475569",
    lineHeight: 20,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: "center",
  },
  badgeLabel: {
    fontSize: 11,
    color: "#94A3B8",
    marginBottom: 2,
  },
  badgeValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
});
