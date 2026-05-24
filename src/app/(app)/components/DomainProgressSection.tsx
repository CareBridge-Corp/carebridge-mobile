import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { Badge, Card, ProgressBar, Text } from "../../../shared/components/ui";
import { borderRadius, colors, spacing } from "../../../shared/theme";
import type {
  DomainProgressEntry,
  ScreeningComparisonSummary,
} from "../hooks/useScreeningProgress";

interface DomainProgressSectionProps {
  domainProgress: DomainProgressEntry[];
  screeningComparison: ScreeningComparisonSummary | null | undefined;
  /** Home uses a shorter preview; growth journey shows all areas. */
  compact?: boolean;
}

type Trend = DomainProgressEntry["trend"];

const TREND_TONE: Record<
  Trend,
  "success" | "info" | "warning" | "brand"
> = {
  improving: "success",
  stable: "info",
  needs_attention: "warning",
  resolved: "success",
};

export function DomainProgressSection({
  domainProgress,
  screeningComparison,
  compact = false,
}: DomainProgressSectionProps) {
  const { t } = useTranslation();

  const areas = useMemo(() => {
    const ranked = [...domainProgress].sort((a, b) => {
      if (b.improvedCount !== a.improvedCount) {
        return b.improvedCount - a.improvedCount;
      }
      return a.currentFailedCount - b.currentFailedCount;
    });

    if (!screeningComparison?.hasComparison) {
      return ranked.filter((area) => area.history.length > 0);
    }

    const withChanges = ranked.filter(
      (area) =>
        area.improvedCount > 0 ||
        area.stillFailedCount > 0 ||
        area.currentFailedCount > 0,
    );

    return compact ? withChanges.slice(0, 3) : withChanges;
  }, [compact, domainProgress, screeningComparison?.hasComparison]);

  if (areas.length === 0 && !screeningComparison?.hasComparison) {
    return null;
  }

  const comparison = screeningComparison;

  return (
    <View style={styles.wrap}>
      {comparison?.hasComparison ? (
        <Card variant="elevated" padding="lg" style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryIconCircle}>
              <Ionicons name="trending-up" size={22} color={colors.success} />
            </View>
            <View style={styles.summaryText}>
              <Text variant="label" tone="brand">
                {t("screening.progressTitle")}
              </Text>
              <Text variant="title3" style={styles.summaryTitle}>
                {t("screening.comparisonSummary", {
                  improved: comparison.improvedCount,
                  previous: comparison.previousFailedTotal,
                })}
              </Text>
              <Text variant="caption" tone="secondary">
                {t("screening.comparisonSubtitle", {
                  previousMonth: comparison.previousMonth,
                  currentMonth: comparison.currentMonth,
                })}
              </Text>
            </View>
            <Text variant="display" tone="brand" style={styles.rateValue}>
              {comparison.improvementRate}%
            </Text>
          </View>

          <ProgressBar value={comparison.improvementRate} height={8} />

          <View style={styles.summaryMetrics}>
            <MetricPill
              icon="checkmark-circle"
              tone="success"
              label={t("screening.improvedAnswers", {
                count: comparison.improvedCount,
              })}
            />
            <MetricPill
              icon="alert-circle"
              tone="warning"
              label={t("screening.stillConcerning", {
                count: comparison.stillFailedCount,
              })}
            />
            {comparison.newFailedCount > 0 ? (
              <MetricPill
                icon="add-circle"
                tone="info"
                label={t("screening.newConcerns", {
                  count: comparison.newFailedCount,
                })}
              />
            ) : null}
          </View>
        </Card>
      ) : null}

      {areas.map((area) => (
        <AreaProgressCard key={area.area} area={area} />
      ))}
    </View>
  );
}

function AreaProgressCard({ area }: { area: DomainProgressEntry }) {
  const { t } = useTranslation();
  const trendTone = TREND_TONE[area.trend];

  return (
    <Card variant="elevated" padding="md" style={styles.areaCard}>
      <View style={styles.areaHeader}>
        <Text variant="body" weight="semibold" style={styles.areaTitle}>
          {area.areaLabel}
        </Text>
        <Badge
          label={t(`screening.trend.${area.trend}`)}
          tone={trendTone}
          size="sm"
        />
      </View>

      <ProgressBar value={area.progressPercent} height={6} />

      <View style={styles.areaMeta}>
        <Text variant="caption" tone="secondary">
          {area.previousFailedCount !== area.currentFailedCount
            ? t("screening.improvedFrom", { count: area.previousFailedCount })
            : t("screening.failedCount", { count: area.currentFailedCount })}
        </Text>
        {area.improvedCount > 0 || area.stillFailedCount > 0 ? (
          <Text variant="caption" tone="brand">
            {t("screening.areaImprovement", {
              improved: area.improvedCount,
              still: area.stillFailedCount,
            })}
          </Text>
        ) : null}
      </View>

      {area.improvedQuestionIds.length > 0 ? (
        <View style={styles.questionRow}>
          <Text variant="caption" tone="secondary">
            {t("screening.nowYes")}
          </Text>
          <View style={styles.chipRow}>
            {area.improvedQuestionIds.map((questionId) => (
              <View key={questionId} style={styles.chipSuccess}>
                <Text variant="caption" weight="semibold" tone="brand">
                  {questionId}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

function MetricPill({
  icon,
  tone,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  tone: "success" | "warning" | "info";
  label: string;
}) {
  const iconColor =
    tone === "success"
      ? colors.success
      : tone === "warning"
        ? colors.warning
        : colors.primary;

  return (
    <View style={styles.metricPill}>
      <Ionicons name={icon} size={14} color={iconColor} />
      <Text variant="caption" tone="secondary" numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing[3],
  },
  summaryCard: {
    gap: spacing[3],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  summaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.successBackground,
  },
  summaryText: {
    flex: 1,
    gap: spacing[1],
  },
  summaryTitle: {
    marginTop: 2,
  },
  rateValue: {
    minWidth: 52,
    textAlign: "right",
  },
  summaryMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  metricPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceMuted,
  },
  areaCard: {
    gap: spacing[2],
  },
  areaHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  areaTitle: {
    flex: 1,
  },
  areaMeta: {
    gap: 2,
  },
  questionRow: {
    gap: spacing[1],
    marginTop: spacing[1],
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[1],
  },
  chipSuccess: {
    paddingHorizontal: spacing[2],
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.successBackground,
  },
});
