import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
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
import { VerifiedBadge } from "./components/VerifiedBadge";

export default function ActivityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    title: string;
    description: string;
    weekPlanId: string;
    activityId: string;
  }>();

  const [isExpanded, setIsExpanded] = useState(false);
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

  const activityData = {
    title: currentActivity?.title || params.title || "Activity",
    description: currentActivity?.instruction || params.description || "",
  };

  return (
    <Screen padded={false} background={colors.surface}>
      <View style={styles.navbar}>
        <View style={{ flex: 1 }}>
          <Text variant="title1" numberOfLines={2}>
            {activityData.title}
          </Text>
        </View>
        <IconButton
          icon="close"
          variant="tinted"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.videoContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={32} color={colors.primary} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Description" />
          <Text
            variant="body"
            tone="secondary"
            numberOfLines={isExpanded ? undefined : 6}
            style={styles.descriptionText}
          >
            {activityData.description}
          </Text>
          <Pressable
            onPress={() => setIsExpanded(!isExpanded)}
            hitSlop={6}
          >
            <Text
              variant="bodyMedium"
              weight="semibold"
              style={styles.moreLink}
            >
              {isExpanded ? "Show less" : "Show more"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <SectionHeader title="Verified by" />
          <VerifiedBadge label="Clinical evidence" />
          <VerifiedBadge label="Pediatric protocol" />
          <VerifiedBadge label="WHO guidance" />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <SectionHeader title="Recommended games" />
          <RecommendedGames />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={
            isCompleted
              ? nextActivity
                ? "Go to next"
                : "Finish"
              : "Mark as completed"
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
    gap: spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[4],
    paddingBottom: spacing[10],
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: colors.surfaceSunken,
    borderRadius: borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing[6],
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 4,
  },
  section: {
    marginBottom: spacing[5],
  },
  descriptionText: {
    marginBottom: spacing[2],
  },
  moreLink: {
    color: colors.primary,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing[5],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
