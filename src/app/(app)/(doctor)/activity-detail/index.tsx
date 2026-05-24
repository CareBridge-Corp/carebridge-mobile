import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  IconButton,
  ProgressBar,
  Screen,
  Text,
} from "../../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../../shared/theme";
import {
  canCompleteActivity,
  canStartActivity,
  getActivityStatus,
  isWeekFullyCompleted,
} from "../../../../shared/utils/roadmapProgress";
import { useRoadmaps } from "../../hooks/useRoadmaps";
import { useWeekPlanActions } from "../../hooks/useWeekPlanActions";
import { useChildrenStore } from "../../store/childrenStore";
import { CompletionModal } from "./components/CompletionModal";
import { NewWeekModal } from "./components/NewWeekModal";
import { RecommendedGames } from "./components/RecommendedGames";
import { SectionHeader } from "./components/SectionHeader";

function splitInstructions(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function formatAreaLabel(area: string): string {
  return area
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ActivityDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    title: string;
    description: string;
    weekPlanId: string;
    activityId: string;
  }>();

  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showNewWeekModal, setShowNewWeekModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const { activeChild } = useChildrenStore();
  const { data: roadmapData, refetch } = useRoadmaps(activeChild?.childId);
  const { startActivity, completeActivity, completeWeekPlan } =
    useWeekPlanActions(activeChild?.childId);

  const weekPlans = roadmapData?.weekPlans ?? [];
  const currentWeekPlan = weekPlans.find(
    (wp) => wp.weekPlanId === params.weekPlanId,
  );
  const currentActivityStatus = currentWeekPlan
    ? getActivityStatus(currentWeekPlan, params.activityId)
    : null;
  const canStart = currentWeekPlan
    ? canStartActivity(currentWeekPlan, params.activityId, weekPlans)
    : { allowed: false };
  const canComplete = currentWeekPlan
    ? canCompleteActivity(currentWeekPlan, params.activityId, weekPlans)
    : { allowed: false };

  const allActivitiesWithContext = weekPlans.flatMap((wp) =>
    (wp.activities || []).map((a) => {
      const statusObj = wp.activityStatuses?.find(
        (s) => s.activityId === a.activityId,
      );
      return {
        ...a,
        weekPlanId: wp.weekPlanId,
        weekNumber: wp.weekNumber,
        completed: statusObj ? statusObj.completed : a.completed,
      };
    }),
  );

  const currentIndex = allActivitiesWithContext.findIndex(
    (a) => a.activityId === params.activityId,
  );
  const currentActivity = allActivitiesWithContext[currentIndex];
  const nextActivity = allActivitiesWithContext[currentIndex + 1];
  const weekActivities = currentWeekPlan?.activities ?? [];
  const activityIndexInWeek = weekActivities.findIndex(
    (a) => a.activityId === params.activityId,
  );
  const weekProgress =
    weekActivities.length > 0 && activityIndexInWeek >= 0
      ? ((activityIndexInWeek + 1) / weekActivities.length) * 100
      : 0;

  const [isCompleted, setIsCompleted] = useState(
    currentActivityStatus?.completed || false,
  );
  const [isStarted, setIsStarted] = useState(
    currentActivityStatus?.started || false,
  );

  useEffect(() => {
    if (!currentWeekPlan || !params.activityId || isStarted || isCompleted) {
      return;
    }
    if (canStart.allowed) {
      startActivity
        .mutateAsync({
          weekPlanId: currentWeekPlan.weekPlanId,
          activityId: params.activityId,
        })
        .then(() => {
          setIsStarted(true);
          refetch();
        })
        .catch(() => {});
    }
  }, [currentWeekPlan?.weekPlanId, params.activityId]);

  const activityData = useMemo(
    () => ({
      title: currentActivity?.title || params.title || t("activity.title"),
      description:
        currentActivity?.description ||
        currentActivity?.instruction ||
        params.description ||
        "",
      instruction: currentActivity?.instruction || params.description || "",
      riskCategory: currentActivity?.riskCategory,
      mediaUrl: currentActivity?.mediaUrl,
    }),
    [currentActivity, params, t],
  );

  const instructionSteps = useMemo(
    () => splitInstructions(activityData.instruction),
    [activityData.instruction],
  );

  const handleNext = () => {
    if (!isCompleted) {
      setShowCompletionModal(true);
    } else if (nextActivity) {
      if (nextActivity.weekPlanId !== params.weekPlanId) {
        setShowNewWeekModal(true);
      } else {
        navigateToNext();
      }
    } else {
      router.back();
    }
  };

  const navigateToNext = () => {
    if (!nextActivity) return;
    router.setParams({
      activityId: nextActivity.activityId,
      weekPlanId: nextActivity.weekPlanId,
      title: nextActivity.title,
      description: nextActivity.instruction,
    });
    setIsCompleted(nextActivity.completed || false);
  };

  const handleConfirmCompletion = async () => {
    if (!params.weekPlanId || !params.activityId || !currentWeekPlan) return;
    if (!canComplete.allowed) return;

    try {
      setIsCompleting(true);
      await completeActivity.mutateAsync({
        weekPlanId: params.weekPlanId,
        activityId: params.activityId,
      });
      setIsCompleted(true);
      setShowCompletionModal(false);
      await refetch();

      const latestWeekPlans = (await refetch()).data?.weekPlans ?? weekPlans;
      const refreshedWeek = latestWeekPlans.find(
        (wp) => wp.weekPlanId === params.weekPlanId,
      );
      if (refreshedWeek && isWeekFullyCompleted(refreshedWeek)) {
        await completeWeekPlan.mutateAsync({
          weekPlanId: params.weekPlanId,
        });
      }
    } catch (error: any) {
      const message = error?.message ?? "";
      if (message.includes("already completed")) {
        setIsCompleted(true);
        setShowCompletionModal(false);
      } else {
        console.error("Failed to complete activity", error);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const statusBadge = isCompleted
    ? { label: t("schedule.completed"), tone: "success" as const }
    : isStarted
      ? { label: t("common.inProgress"), tone: "brand" as const }
      : { label: t("common.ready"), tone: "neutral" as const };

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.navbar}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel={t("common.back")}
          onPress={() => router.back()}
        />
        <View style={styles.navbarCenter}>
          {currentWeekPlan ? (
            <Text variant="caption" tone="secondary" align="center">
              {t("schedule.weekOf", {
                current: currentWeekPlan.weekNumber,
                total: weekPlans.length || 4,
              })}
            </Text>
          ) : null}
          <Text variant="title3" numberOfLines={1} align="center">
            {activityData.title}
          </Text>
        </View>
        <IconButton
          icon="close"
          variant="tinted"
          accessibilityLabel={t("common.cancel")}
          onPress={() => router.back()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="elevated" padding="lg" style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Badge label={statusBadge.label} tone={statusBadge.tone} />
            {activityData.riskCategory ? (
              <Badge
                label={formatAreaLabel(activityData.riskCategory)}
                tone="info"
                size="sm"
              />
            ) : null}
          </View>

          {activityData.description ? (
            <Text variant="body" tone="secondary" style={styles.heroDesc}>
              {activityData.description}
            </Text>
          ) : null}

          <View style={styles.progressBlock}>
            <View style={styles.progressLabelRow}>
              <Text variant="caption" tone="secondary">
                {t("activity.weekProgress")}
              </Text>
              <Text variant="caption" tone="brand" weight="semibold">
                {Math.round(weekProgress)}%
              </Text>
            </View>
            <ProgressBar value={weekProgress} height={8} />
          </View>

          {activityData.mediaUrl ? (
            <View style={styles.mediaPlaceholder}>
              <View style={styles.playCircle}>
                <Ionicons name="play" size={28} color={colors.primary} />
              </View>
              <Text variant="caption" tone="secondary">
                {t("activity.demoVideo")}
              </Text>
            </View>
          ) : null}
        </Card>

        <View style={styles.section}>
          <SectionHeader
            title={t("activity.howToPractice")}
            subtitle={t("activity.howToPracticeDesc")}
          />
          <Card variant="flat" padding="lg" style={styles.stepsCard}>
            {instructionSteps.length > 0 ? (
              instructionSteps.map((step, index) => (
                <View key={`${index}-${step.slice(0, 12)}`} style={styles.stepRow}>
                  <View style={styles.stepNum}>
                    <Text variant="caption" tone="brand" weight="semibold">
                      {index + 1}
                    </Text>
                  </View>
                  <Text variant="body" tone="secondary" style={styles.stepText}>
                    {step}
                  </Text>
                </View>
              ))
            ) : (
              <Text variant="body" tone="secondary">
                {t("activity.noInstructions")}
              </Text>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <SectionHeader
            title={t("activity.relatedGames")}
            subtitle={t("activity.relatedGamesDesc")}
          />
          <RecommendedGames riskCategory={activityData.riskCategory} />
        </View>

        <View style={styles.section}>
          <SectionHeader title={t("activity.evidence")} />
          <View style={styles.evidenceRow}>
            {[
              t("activity.evidenceClinical"),
              t("activity.evidencePediatric"),
              t("activity.evidenceWho"),
            ].map((label) => (
              <View key={label} style={styles.evidenceChip}>
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={colors.primary}
                />
                <Text variant="caption" weight="medium" numberOfLines={2}>
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={
            isCompleted
              ? nextActivity
                ? t("activity.goToNext")
                : t("common.done")
              : t("activity.markCompleted")
          }
          variant={isCompleted ? "secondary" : "primary"}
          onPress={handleNext}
          loading={isCompleting}
          disabled={!canComplete.allowed && !isCompleted}
          trailingIcon={isCompleted ? "checkmark-done-circle" : "checkmark-circle"}
        />
      </View>

      <CompletionModal
        visible={showCompletionModal}
        title={activityData.title}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleConfirmCompletion}
      />

      <NewWeekModal
        visible={showNewWeekModal}
        weekNumber={nextActivity?.weekNumber || 0}
        onClose={() => setShowNewWeekModal(false)}
        onContinue={() => {
          setShowNewWeekModal(false);
          navigateToNext();
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
    gap: spacing[2],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  navbarCenter: {
    flex: 1,
    gap: 2,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
    gap: spacing[5],
  },
  heroCard: {
    gap: spacing[3],
  },
  heroTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  heroDesc: {
    lineHeight: 22,
  },
  progressBlock: {
    gap: spacing[2],
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mediaPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceSunken,
    borderRadius: borderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 3,
  },
  section: {
    gap: spacing[2],
  },
  stepsCard: {
    gap: spacing[3],
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  stepText: {
    flex: 1,
    lineHeight: 22,
  },
  evidenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  evidenceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    maxWidth: "100%",
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
