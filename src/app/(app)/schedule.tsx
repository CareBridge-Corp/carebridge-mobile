import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  ProgressBar,
  Screen,
  Text,
} from "../../shared/components/ui";
import { useLanguageStore } from "../../shared/store/languageStore";
import { colors, layout, spacing } from "../../shared/theme";
import {
  canStartActivity,
  getActivityStatus,
  isRoadmapCycleComplete,
} from "../../shared/utils/roadmapProgress";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { HomeHeader } from "./components/HomeHeader";
import { PaywallCard } from "./components/PaywallCard";
import { VerificationRequiredView } from "./components/VerificationRequiredView";
import { useEntitlements } from "./hooks/useEntitlements";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildrenStore } from "./store/childrenStore";

export default function ScheduleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ expandWeekId?: string }>();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { activeChild, children } = useChildrenStore();
  const { language } = useLanguageStore();

  const [showChildSelector, setShowChildSelector] = useState(false);
  const [activeWeekPlanId, setActiveWeekPlanId] = useState<string | null>(null);

  const formattedDate = new Date().toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    { weekday: "long", day: "numeric", month: "long" },
  );

  const isVerified = activeChild?.status === "VERIFIED";
  const { data: entitlements, isLoading: entitlementsLoading } = useEntitlements();
  const { data: roadmapData } = useRoadmaps(
    isVerified ? activeChild?.childId : undefined,
  );

  const weekPlans = roadmapData?.weekPlans ?? [];
  const activeRoadmap = roadmapData?.roadmap ?? null;

  useEffect(() => {
    if (params.expandWeekId) {
      setActiveWeekPlanId(params.expandWeekId);
    } else if (weekPlans.length > 0 && !activeWeekPlanId) {
      const current =
        weekPlans.find((wp) => wp.status === "IN_PROGRESS") || weekPlans[0];
      if (current) setActiveWeekPlanId(current.weekPlanId);
    }
  }, [params.expandWeekId, weekPlans, activeWeekPlanId]);

  const activeWeekPlan = weekPlans.find(
    (wp) => wp.weekPlanId === activeWeekPlanId,
  );

  const handlePrevWeek = () => {
    if (!activeWeekPlan) return;
    const idx = weekPlans.findIndex((wp) => wp.weekPlanId === activeWeekPlanId);
    if (idx > 0) setActiveWeekPlanId(weekPlans[idx - 1].weekPlanId);
  };
  const handleNextWeek = () => {
    if (!activeWeekPlan) return;
    const idx = weekPlans.findIndex((wp) => wp.weekPlanId === activeWeekPlanId);
    if (idx < weekPlans.length - 1)
      setActiveWeekPlanId(weekPlans[idx + 1].weekPlanId);
  };

  const greetingName = activeChild?.firstName || user?.firstName || "Friend";

  const headerEl = (
    <HomeHeader
      greeting={t("home.goodMorning", "Good morning")}
      primaryName={greetingName}
      subtitle={formattedDate}
      avatarUri={activeChild?.profilePictureUrl}
      badgeCount={children.length}
      onAvatarPress={() => children.length > 0 && setShowChildSelector(true)}
    />
  );

  // 1) Not verified yet
  if (!isVerified) {
    return (
      <Screen padded={false} background={colors.surfaceMuted}>
        {headerEl}
        <VerificationRequiredView />
        <ChildSelectorModal
          visible={showChildSelector}
          onClose={() => setShowChildSelector(false)}
        />
      </Screen>
    );
  }

  // 2) Paywall
  if (
    isVerified &&
    !entitlementsLoading &&
    entitlements &&
    !entitlements.canUseTreatment
  ) {
    return (
      <Screen padded={false} background={colors.surfaceMuted}>
        {headerEl}
        <View style={styles.paywallWrap}>
          <PaywallCard
            title={t("payment.gate.treatmentTitle", "Unlock therapy plan")}
            description={t(
              "payment.gate.treatmentDescription",
              "Subscribe to view your child's personalized therapy roadmap and activities.",
            )}
            purpose="SUBSCRIPTION"
          />
        </View>
        <ChildSelectorModal
          visible={showChildSelector}
          onClose={() => setShowChildSelector(false)}
        />
      </Screen>
    );
  }

  // 3) Verified + entitled — show week plan
  const filteredActivities = activeWeekPlan?.activities ?? [];
  const totalActivities = filteredActivities.length;
  const completedCount =
    activeWeekPlan?.activityStatuses?.filter(
      (s) =>
        s.completed &&
        filteredActivities.some((fa) => fa.activityId === s.activityId),
    ).length ?? 0;
  const progressPct =
    totalActivities > 0 ? Math.round((completedCount / totalActivities) * 100) : 0;

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      {headerEl}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Week navigation */}
        <View style={styles.weekNav}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel="Previous week"
            onPress={handlePrevWeek}
            variant="tinted"
            background={colors.surface}
          />
          <Text variant="title3">
            {activeWeekPlan
              ? `Week ${activeWeekPlan.weekNumber} of ${weekPlans.length}`
              : "No published plan"}
          </Text>
          <IconButton
            icon="chevron-forward"
            accessibilityLabel="Next week"
            onPress={handleNextWeek}
            variant="tinted"
            background={colors.surface}
          />
        </View>

        {/* Active week summary */}
        {activeWeekPlan ? (
          <>
            <Card variant="elevated" padding="lg">
              <View style={styles.summaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="title2">Week {activeWeekPlan.weekNumber}</Text>
                  <Badge
                    label={
                      activeWeekPlan.status === "COMPLETED"
                        ? "Completed"
                        : activeWeekPlan.status === "IN_PROGRESS"
                          ? "In progress"
                          : "Upcoming"
                    }
                    tone={
                      activeWeekPlan.status === "COMPLETED"
                        ? "success"
                        : activeWeekPlan.status === "IN_PROGRESS"
                          ? "info"
                          : "neutral"
                    }
                    style={styles.weekBadge}
                  />
                </View>
                <Text variant="display" tone="brand">
                  {progressPct}%
                </Text>
              </View>

              {activeWeekPlan.description ? (
                <Text variant="body" tone="secondary" style={styles.weekDesc}>
                  {activeWeekPlan.description}
                </Text>
              ) : null}

              <View style={styles.progress}>
                <ProgressBar value={progressPct} />
                <Text variant="caption" tone="secondary" style={styles.progressMeta}>
                  {completedCount} of {totalActivities} activities done
                </Text>
              </View>
            </Card>

            {/* Activities */}
            <View style={styles.activities}>
              {filteredActivities.map((activity, index) => {
                const status = getActivityStatus(
                  activeWeekPlan,
                  activity.activityId,
                );
                const access = canStartActivity(
                  activeWeekPlan,
                  activity.activityId,
                  weekPlans,
                );
                const isLocked = !access.allowed && !status.completed;

                const badgeTone: "success" | "info" | "neutral" | "warning" =
                  status.completed
                    ? "success"
                    : status.started
                      ? "info"
                      : isLocked
                        ? "neutral"
                        : "warning";
                const badgeLabel = status.completed
                  ? "Done"
                  : status.started
                    ? "In progress"
                    : isLocked
                      ? "Locked"
                      : "Ready";

                return (
                  <Card
                    key={activity.activityId}
                    variant="elevated"
                    padding="md"
                    style={styles.taskCard}
                  >
                    <View style={styles.taskHeader}>
                      <Text variant="caption" tone="secondary">
                        Task {index + 1}
                      </Text>
                      <Badge label={badgeLabel} tone={badgeTone} />
                    </View>

                    <Text variant="title3" style={styles.taskTitle}>
                      {activity.title}
                    </Text>
                    <Text
                      variant="bodySmall"
                      tone="secondary"
                      numberOfLines={3}
                      style={styles.taskDesc}
                    >
                      {activity.instruction}
                    </Text>

                    {isLocked && access.reason ? (
                      <Text
                        variant="caption"
                        tone="tertiary"
                        style={styles.lockedHint}
                      >
                        <Ionicons name="lock-closed" size={12} />{" "}
                        {access.reason}
                      </Text>
                    ) : null}

                    <Button
                      label={
                        status.completed
                          ? "Completed"
                          : isLocked
                            ? "Locked"
                            : status.started
                              ? "Continue"
                              : "Start activity"
                      }
                      variant={
                        status.completed
                          ? "secondary"
                          : isLocked
                            ? "secondary"
                            : "primary"
                      }
                      disabled={isLocked || status.completed}
                      leadingIcon={
                        status.completed
                          ? "checkmark-done"
                          : isLocked
                            ? "lock-closed"
                            : undefined
                      }
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/(doctor)/activity-detail",
                          params: {
                            activityId: activity.activityId,
                            weekPlanId: activeWeekPlan.weekPlanId,
                            title: activity.title,
                            description: activity.instruction,
                          },
                        } as any)
                      }
                    />
                  </Card>
                );
              })}
            </View>
          </>
        ) : (
          <EmptyState
            icon="calendar-outline"
            title={
              isRoadmapCycleComplete(weekPlans, activeRoadmap)
                ? "Cycle complete"
                : activeRoadmap
                  ? "No activities yet"
                  : "Roadmap not ready"
            }
            description={
              isRoadmapCycleComplete(weekPlans, activeRoadmap)
                ? "Great work! A new roadmap will be available after the one-month review period."
                : activeRoadmap
                  ? "Your clinician hasn't published activities for this week yet."
                  : "Your clinician is preparing a personalised therapy roadmap. You'll be notified when it's ready."
            }
          />
        )}

        {/* Quick link to growth journey */}
        {activeRoadmap ? (
          <Pressable
            onPress={() => router.push("/(app)/growth-journey" as any)}
            style={({ pressed }) => [
              styles.growthLink,
              pressed && styles.growthLinkPressed,
            ]}
          >
            <Ionicons name="trending-up" size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="semibold">
                Growth journey
              </Text>
              <Text variant="caption" tone="secondary">
                See all weeks at a glance
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.iconMuted}
            />
          </Pressable>
        ) : null}
      </ScrollView>

      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  paywallWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: layout.tabBarHeight + spacing[8],
    gap: spacing[4],
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[1],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  weekBadge: {
    marginTop: spacing[2],
  },
  weekDesc: {
    marginTop: spacing[3],
  },
  progress: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  progressMeta: {
    textAlign: "right",
  },
  activities: {
    gap: spacing[3],
  },
  taskCard: {
    gap: spacing[3],
  },
  taskHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskTitle: {
    marginTop: spacing[1],
  },
  taskDesc: {
    marginBottom: spacing[1],
  },
  lockedHint: {
    marginTop: -spacing[2],
  },
  growthLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    padding: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginTop: spacing[2],
  },
  growthLinkPressed: {
    opacity: 0.7,
  },
});
