import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { DomainProgressEntry } from "../hooks/useScreeningProgress";

interface ScreeningProgressCardProps {
  domainProgress: DomainProgressEntry[];
  screeningMonth?: number;
}

function trendIcon(trend: DomainProgressEntry["trend"]) {
  switch (trend) {
    case "improving":
      return { name: "trending-up" as const, color: "#10B981" };
    case "needs_attention":
      return { name: "alert-circle" as const, color: "#EF4444" };
    case "resolved":
      return { name: "checkmark-circle" as const, color: "#10B981" };
    default:
      return { name: "remove" as const, color: "#94A3B8" };
  }
}

export function ScreeningProgressCard({
  domainProgress,
  screeningMonth,
}: ScreeningProgressCardProps) {
  const { t } = useTranslation();

  if (!domainProgress.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("screening.progressTitle")}</Text>
        {screeningMonth ? (
          <Text style={styles.monthBadge}>
            {t("screening.month")} {screeningMonth}
          </Text>
        ) : null}
      </View>
      <Text style={styles.subtitle}>{t("screening.progressSubtitle")}</Text>

      {domainProgress.map((domain) => {
        const icon = trendIcon(domain.trend);
        const maxFailed = Math.max(
          domain.previousFailedCount,
          domain.currentFailedCount,
          1,
        );
        const currentWidth = Math.max(
          8,
          (domain.currentFailedCount / maxFailed) * 100,
        );
        const previousWidth =
          domain.previousFailedCount > 0
            ? Math.max(8, (domain.previousFailedCount / maxFailed) * 100)
            : 0;

        return (
          <View key={domain.area} style={styles.domainRow}>
            <View style={styles.domainHeader}>
              <Text style={styles.domainLabel}>{domain.areaLabel}</Text>
              <View style={styles.trendBadge}>
                <Ionicons name={icon.name} size={14} color={icon.color} />
                <Text style={[styles.trendText, { color: icon.color }]}>
                  {t(`screening.trend.${domain.trend}`)}
                </Text>
              </View>
            </View>

            <View style={styles.barTrack}>
              {previousWidth > 0 && (
                <View
                  style={[
                    styles.barPrevious,
                    { width: `${Math.min(previousWidth, 100)}%` },
                  ]}
                />
              )}
              <View
                style={[
                  styles.barCurrent,
                  { width: `${Math.min(currentWidth, 100)}%` },
                ]}
              />
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statText}>
                {t("screening.failedCount", {
                  count: domain.currentFailedCount,
                })}
              </Text>
              {domain.trend === "improving" && (
                <Text style={styles.improvedText}>
                  {t("screening.improvedFrom", {
                    count: domain.previousFailedCount,
                  })}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  monthBadge: {
    fontSize: typography.fontSize.xs,
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.md,
    fontWeight: typography.fontWeight.semibold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  domainRow: {
    marginBottom: spacing.lg,
  },
  domainHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  domainLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    flex: 1,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
  },
  barTrack: {
    height: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 5,
    overflow: "hidden",
    position: "relative",
    marginBottom: spacing.xs,
  },
  barPrevious: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FCA5A5",
    borderRadius: 5,
    opacity: 0.5,
  },
  barCurrent: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 5,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 11,
    color: "#64748B",
  },
  improvedText: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: typography.fontWeight.medium,
  },
});
