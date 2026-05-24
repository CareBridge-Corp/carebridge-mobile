import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { ScreeningProgressResponse } from "../hooks/useScreeningProgress";

interface LongitudinalCheckInCardProps {
  progress: ScreeningProgressResponse | null | undefined;
  childName?: string;
}

export function LongitudinalCheckInCard({
  progress,
  childName,
}: LongitudinalCheckInCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  if (!progress?.readyForNextScreening) return null;

  const failedCount = progress.pendingFailedQuestionCount ?? 0;
  const nextMonth = progress.nextScreeningMonth ?? 2;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="refresh-circle" size={28} color={colors.white} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{t("screening.monthlyCheckInReady")}</Text>
          <Text style={styles.subtitle}>
            {t("screening.monthlyCheckInReadySubtitle", {
              name: childName ?? t("home.guest"),
              month: nextMonth,
            })}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{failedCount}</Text>
          <Text style={styles.statLabel}>{t("screening.carryForwardQuestions")}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>6</Text>
          <Text style={styles.statLabel}>{t("screening.newQuestions")}</Text>
        </View>
      </View>

      <Text style={styles.info}>{t("screening.longitudinalInfo")}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/(app)/mchat-privacy" as Href)}
      >
        <Text style={styles.buttonText}>{t("screening.startMonthCheckIn")}</Text>
        <Ionicons name="arrow-forward" size={18} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ECFDF5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#6EE7B7",
  },
  header: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.xl },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  headerText: { flex: 1 },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginTop: 4,
    lineHeight: 20,
  },
  statsRow: { flexDirection: "row", gap: spacing.md, marginBottom: spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: "center",
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },
  info: {
    fontSize: typography.fontSize.sm,
    color: "#475569",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: "#059669",
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
  },
});
