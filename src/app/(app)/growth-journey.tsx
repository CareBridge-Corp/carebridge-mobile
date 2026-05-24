import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  ProgressBar,
  Screen,
  Text,
} from "../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../shared/theme";
import {
  calculateRoadmapProgress,
  canStartActivity,
  getActivityStatus,
  isRoadmapCycleComplete,
  resolveActiveRoadmap,
  resolveRoadmapCycleStatus,
} from "../../shared/utils/roadmapProgress";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { DomainProgressSection } from "./components/DomainProgressSection";
import { useProfile } from "./hooks/useProfile";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useScreeningProgress } from "./hooks/useScreeningProgress";
import { useChildrenStore } from "./store/childrenStore";

const { width } = Dimensions.get("window");

export default function GrowthJourneyScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeChild, children } = useChildrenStore();
  const { data: roadmapData, refetch } = useRoadmaps(activeChild?.childId);
  const { data: progressData, refetch: refetchProgress } =
    useScreeningProgress(activeChild?.childId);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const [pathHeight, setPathHeight] = useState(0);

  useFocusEffect(
    useCallback(() => {
      refetch();
      refetchProgress();
    }, [refetch, refetchProgress]),
  );

  const weekPlans = roadmapData?.weekPlans ?? [];
  const activeRoadmap = resolveActiveRoadmap(
    activeChild?.childId,
    roadmapData?.roadmap ?? null,
    weekPlans,
  );

  const rawNodes = weekPlans.flatMap((wp) => {
    const headerNode = {
      type: "week-header" as const,
      id: wp.weekPlanId,
      title: `Week ${wp.weekNumber}: ${wp.description
        .replace(/<[^>]*>?/gm, "")
        .split(" ")
        .slice(0, 2)
        .join(" ")}`,
      status: wp.status,
    };

    const activityNodes = (wp.activities || []).map((activity) => {
      const status = getActivityStatus(wp, activity.activityId);
      const access = canStartActivity(wp, activity.activityId, weekPlans);
      return {
        type: "activity" as const,
        id: `${wp.weekPlanId}-${activity.activityId}`,
        activityId: activity.activityId,
        title: activity.title,
        weekPlanId: wp.weekPlanId,
        completed: status.completed,
        started: status.started,
        locked: !access.allowed && !status.completed,
        isActive: access.allowed && !status.completed,
        weekStatus: wp.status,
      };
    });

    return [headerNode, ...activityNodes];
  });

  const pathNodes = [...rawNodes].reverse();

  const pathShape = useMemo(() => {
    const segmentHeight = 140;
    const nodesCount = Math.max(pathNodes.length, 4);
    const totalHeight = nodesCount * segmentHeight + segmentHeight;
    const centerX = width / 2;
    const leftX = width * 0.25;
    const rightX = width * 0.75;

    let d = `M ${centerX} -50`;

    for (let i = 0; i < nodesCount; i += 1) {
      const y = i * segmentHeight;
      const nextY = y + segmentHeight;
      const targetX = i % 2 === 0 ? rightX : leftX;
      const controlX = i % 2 === 0 ? centerX + 60 : centerX - 60;
      d += ` C ${controlX} ${y + segmentHeight * 0.3}, ${targetX} ${y + segmentHeight * 0.7}, ${targetX} ${nextY}`;
    }

    const lastY = nodesCount * segmentHeight;
    const lastControlX =
      (nodesCount - 1) % 2 === 0 ? centerX + 60 : centerX - 60;
    d += ` C ${lastControlX} ${lastY + segmentHeight * 0.3}, ${centerX} ${lastY + segmentHeight * 0.7}, ${centerX} ${lastY + segmentHeight + 600}`;

    return { d, totalHeight: totalHeight + 500 };
  }, [pathNodes.length]);

  const totalProgress = activeRoadmap
    ? calculateRoadmapProgress(weekPlans)
    : 0;

  const roadmapCycleComplete = isRoadmapCycleComplete(
    weekPlans,
    activeRoadmap,
  );
  const { readyForNextScreening } = resolveRoadmapCycleStatus(
    weekPlans,
    activeRoadmap,
    progressData ?? undefined,
  );

  const journeyStats = useMemo(() => {
    let totalActivities = 0;
    let completedActivities = 0;
    let activeNode: {
      activityId: string;
      title: string;
      weekPlanId: string;
      weekNumber: number;
    } | null = null;

    for (const wp of weekPlans) {
      const activities = wp.activities || [];
      totalActivities += activities.length;
      for (const activity of activities) {
        const status = getActivityStatus(wp, activity.activityId);
        if (status.completed) {
          completedActivities += 1;
          continue;
        }
        if (
          !activeNode &&
          canStartActivity(wp, activity.activityId, weekPlans).allowed
        ) {
          activeNode = {
            activityId: activity.activityId,
            title: activity.title,
            weekPlanId: wp.weekPlanId,
            weekNumber: wp.weekNumber,
          };
        }
      }
    }

    return {
      totalActivities,
      completedActivities,
      weekCount: weekPlans.length,
      activeNode,
    };
  }, [weekPlans]);

  const { data: profile } = useProfile();
  const parentStatus = profile?.status || "UNVERIFIED";
  const childStatus = activeChild?.status || "UNVERIFIED";

  const parentVerified = parentStatus === "VERIFIED";
  const childVerified = childStatus === "VERIFIED";
  const bothVerified = parentVerified && childVerified;

  if (!bothVerified) {
    return (
      <Screen padded={false} background={colors.surfaceMuted}>
        <View style={styles.headerBar}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          />
          <Text variant="title2" align="center" style={styles.headerTitle}>
            {t("growth.blocked")}
          </Text>
          <View style={styles.headerSide} />
        </View>

        <View style={styles.gateBody}>
          <Card variant="elevated" padding="lg">
            <View style={styles.gateIconCircle}>
              <Ionicons
                name="shield-checkmark"
                size={28}
                color={colors.primary}
              />
            </View>
            <Text variant="title1" align="center" style={styles.gateTitle}>
              {t("growth.verifyFirst")}
            </Text>
            <Text
              variant="body"
              tone="secondary"
              align="center"
              style={styles.gateSubtitle}
            >
              {t("growth.verifyDesc")}
            </Text>

            <View style={styles.gateStatusList}>
              <GateStatusRow label={t("growth.parent")} verified={parentVerified} />
              <GateStatusRow label={t("growth.child")} verified={childVerified} />
            </View>

            <Button
              label={t("growth.goVerify")}
              onPress={() => router.push("/(app)/(verification)/verify" as Href)}
              trailingIcon="arrow-forward"
            />
          </Card>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.headerBar}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Back"
          onPress={() => router.back()}
        />

        <Pressable
          onPress={() => children.length > 0 && setShowChildSelector(true)}
          style={styles.headerCenter}
          hitSlop={6}
        >
          <Avatar
            uri={activeChild?.profilePictureUrl}
            name={activeChild?.firstName}
            size="sm"
          />
          <View style={styles.headerTextBlock}>
            <Text variant="title3" numberOfLines={1}>
              {t("growth.childJourney", {
                name: activeChild?.firstName || t("growth.child"),
              })}
            </Text>
            <View style={styles.progressRow}>
              <ProgressBar
                value={totalProgress}
                height={6}
                style={styles.progressTrack}
              />
              <Text
                variant="caption"
                weight="semibold"
                tone="brand"
                style={styles.progressValue}
              >
                {totalProgress}%
              </Text>
            </View>
          </View>
        </Pressable>

        <View style={styles.headerSide} />
      </View>

      {roadmapCycleComplete ? (
        <View style={styles.cycleBanner}>
          <Badge
            tone="success"
            label={t("growth.cycleComplete")}
            icon="checkmark-circle"
          />
          <Text
            variant="caption"
            tone="secondary"
            style={styles.cycleBannerText}
          >
            {readyForNextScreening
              ? t("growth.cycleCompleteNextMchat")
              : t("growth.cycleCompleteDesc")}
          </Text>
          {readyForNextScreening ? (
            <Button
              label={t("home.hero.startNextMchat")}
              onPress={() => router.push("/(app)/mchat-privacy" as Href)}
              trailingIcon="arrow-forward"
              style={styles.cycleBannerButton}
            />
          ) : null}
        </View>
      ) : null}

      {weekPlans.length === 0 ? (
        <EmptyState
          icon="map-outline"
          title={t("growth.noRoadmap")}
          description={t("growth.noRoadmapDesc")}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          ref={(ref) => ref?.scrollToEnd({ animated: false })}
        >
          {/* Summary + active activity CTA */}
          <View style={styles.summaryWrap}>
            <Card variant="elevated" padding="lg">
              <View style={styles.summaryHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="label" tone="brand">
                    {t("growth.summaryTitle")}
                  </Text>
                  <Text variant="title2" style={styles.summaryTitle}>
                    {t("growth.activitiesDone", {
                      done: journeyStats.completedActivities,
                      total: journeyStats.totalActivities,
                    })}
                  </Text>
                </View>
                <Text variant="display" tone="brand">
                  {totalProgress}%
                </Text>
              </View>
              <ProgressBar value={totalProgress} />
              <View style={styles.summaryMetricsRow}>
                <View style={styles.summaryMetric}>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <Text variant="caption" tone="secondary">
                    {t("growth.weeks", { count: journeyStats.weekCount })}
                  </Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={16}
                    color={colors.success}
                  />
                  <Text variant="caption" tone="secondary">
                    {t("growth.doneCount", {
                      count: journeyStats.completedActivities,
                    })}
                  </Text>
                </View>
                <View style={styles.summaryMetric}>
                  <Ionicons
                    name="trail-sign-outline"
                    size={16}
                    color={colors.warning}
                  />
                  <Text variant="caption" tone="secondary">
                    {t("growth.toGo", {
                      count: Math.max(
                        0,
                        journeyStats.totalActivities -
                          journeyStats.completedActivities,
                      ),
                    })}
                  </Text>
                </View>
              </View>
            </Card>

            {journeyStats.activeNode ? (
              <Card variant="tinted" padding="md" style={styles.activeCard}>
                <View style={styles.activeCardHeader}>
                  <Badge label={t("growth.todaysTask")} tone="brand" icon="sparkles" />
                  <Text variant="caption" tone="secondary">
                    {t("growth.week", {
                      number: journeyStats.activeNode.weekNumber,
                    })}
                  </Text>
                </View>
                <Text
                  variant="title3"
                  numberOfLines={2}
                  style={styles.activeCardTitle}
                >
                  {journeyStats.activeNode.title}
                </Text>
                <Button
                  label={t("growth.continueActivity")}
                  trailingIcon="arrow-forward"
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(doctor)/activity-detail",
                      params: {
                        activityId: journeyStats.activeNode!.activityId,
                        weekPlanId: journeyStats.activeNode!.weekPlanId,
                      },
                    } as any)
                  }
                />
              </Card>
            ) : null}

            {progressData?.screeningComparison?.hasComparison ? (
              <View style={styles.progressSection}>
                <Text variant="label" tone="brand">
                  {t("screening.progressTitle")}
                </Text>
                <Text variant="caption" tone="secondary">
                  {t("screening.progressSubtitle")}
                </Text>
                <DomainProgressSection
                  domainProgress={progressData.domainProgress ?? []}
                  screeningComparison={progressData.screeningComparison}
                />
              </View>
            ) : null}

            <View style={styles.legendRow}>
              <LegendDot color={colors.success} icon="checkmark" label={t("growth.legendDone")} />
              <LegendDot color={colors.primary} icon="sparkles" label={t("growth.legendActive")} />
              <LegendDot
                color={colors.borderStrong}
                icon="lock-closed"
                label={t("growth.legendLocked")}
              />
            </View>
          </View>

          <View
            style={styles.pathContainer}
            onLayout={(event) =>
              setPathHeight(event.nativeEvent.layout.height)
            }
          >
            <View style={styles.svgBackgroundContainer} pointerEvents="none">
              <Svg
                width={width}
                height={Math.max(pathHeight, pathShape.totalHeight)}
                style={styles.journeySvg}
              >
                <Path
                  d={pathShape.d}
                  stroke={colors.primaryMuted}
                  strokeWidth={18}
                  strokeOpacity={0.5}
                  fill="none"
                  strokeLinecap="round"
                />
                <Path
                  d={pathShape.d}
                  stroke={colors.primary}
                  strokeWidth={6}
                  strokeOpacity={0.45}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="18 12"
                />
              </Svg>
            </View>

            {pathNodes.map((node, index) => {
              const isLeft = index % 2 === 1;
              const activityNode = node as any;

              return (
                <View
                  key={node.id}
                  style={
                    node.type === "week-header"
                      ? styles.weekRow
                      : [
                          styles.nodeRow,
                          isLeft ? styles.nodeRowLeft : styles.nodeRowRight,
                        ]
                  }
                >
                  {node.type === "week-header" ? (
                    <>
                      <View style={styles.weekSeparator} />
                      <View style={styles.weekLabel}>
                        <Text variant="title3" weight="semibold" tone="brand">
                          {node.title}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <>
                      {activityNode.isActive ? (
                        <View
                          style={[
                            styles.activeTooltip,
                            isLeft ? styles.tooltipLeft : styles.tooltipRight,
                          ]}
                        >
                          <Text variant="label" tone="secondary">
                            CURRENT ACTIVITY
                          </Text>
                          <Text variant="title3" style={styles.tooltipTitle}>
                            {activityNode.title}
                          </Text>
                          <View style={styles.tooltipMeta}>
                            <Ionicons
                              name="time-outline"
                              size={14}
                              color={colors.textSecondary}
                            />
                            <Text variant="caption" tone="secondary">
                              5 mins
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      <Pressable
                        style={({ pressed }) => [
                          styles.nodeCircle,
                          activityNode.completed && styles.nodeCircleCompleted,
                          activityNode.isActive && styles.nodeCircleActive,
                          activityNode.locked && styles.nodeCircleLocked,
                          pressed && !activityNode.locked && styles.nodePressed,
                        ]}
                        disabled={activityNode.locked}
                        onPress={() => {
                          if (activityNode.locked) return;
                          router.push({
                            pathname: "/(app)/(doctor)/activity-detail",
                            params: {
                              activityId: activityNode.activityId,
                              weekPlanId: activityNode.weekPlanId,
                            },
                          } as any);
                        }}
                      >
                        {activityNode.completed ? (
                          <Ionicons
                            name="checkmark"
                            size={28}
                            color={colors.textInverse}
                          />
                        ) : activityNode.isActive ? (
                          <Ionicons
                            name="sparkles"
                            size={28}
                            color={colors.textInverse}
                          />
                        ) : activityNode.locked ? (
                          <Ionicons
                            name="lock-closed"
                            size={20}
                            color={colors.surface}
                          />
                        ) : (
                          <View style={styles.nodeStandardInner} />
                        )}
                      </Pressable>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </Screen>
  );
}

function LegendDot({
  color,
  icon,
  label,
}: {
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={12} color={colors.textInverse} />
      </View>
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

function GateStatusRow({
  label,
  verified,
}: {
  label: string;
  verified: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View style={styles.gateStatusRow}>
      <View style={styles.gateStatusLeft}>
        <Ionicons
          name={verified ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={verified ? colors.success : colors.iconMuted}
        />
        <Text variant="body" weight="medium">
          {label}
        </Text>
      </View>
      <Badge
        label={verified ? t("common.verified") : t("common.pending")}
        tone={verified ? "success" : "warning"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
    gap: spacing[2],
  },
  headerSide: {
    width: 40,
  },
  headerTitle: {
    flex: 1,
  },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  headerTextBlock: {
    flex: 1,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: spacing[2],
  },
  progressTrack: {
    flex: 1,
  },
  progressValue: {
    minWidth: 32,
    textAlign: "right",
  },
  cycleBanner: {
    gap: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    backgroundColor: colors.successBackground,
  },
  cycleBannerText: {
    lineHeight: 20,
  },
  cycleBannerButton: {
    alignSelf: "stretch",
  },
  gateBody: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },
  gateIconCircle: {
    alignSelf: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
    marginBottom: spacing[4],
  },
  gateTitle: {
    marginBottom: spacing[2],
  },
  gateSubtitle: {
    marginBottom: spacing[5],
  },
  gateStatusList: {
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  gateStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceMuted,
    borderRadius: borderRadius.lg,
  },
  gateStatusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  scrollContent: {
    paddingBottom: 100,
  },
  summaryWrap: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
    gap: spacing[3],
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  summaryTitle: {
    marginTop: spacing[1],
  },
  summaryMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  summaryMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  activeCard: {
    gap: spacing[3],
  },
  activeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  activeCardTitle: {
    marginTop: spacing[1],
    marginBottom: spacing[3],
  },
  progressSection: {
    gap: spacing[2],
    marginTop: spacing[1],
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing[4],
    marginTop: spacing[1],
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  legendCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  pathContainer: {
    paddingVertical: 40,
    alignItems: "center",
    width: "100%",
    position: "relative",
  },
  svgBackgroundContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    alignItems: "center",
  },
  journeySvg: {
    width: "100%",
    height: "100%",
    opacity: 0.55,
  },
  weekRow: {
    width: "100%",
    alignItems: "center",
    marginVertical: 40,
    justifyContent: "center",
    position: "relative",
    zIndex: 1,
  },
  weekSeparator: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    borderBottomWidth: 2,
    borderBottomColor: colors.borderStrong,
    borderStyle: "dashed",
    zIndex: -1,
  },
  weekLabel: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  nodeRow: {
    width: "100%",
    paddingHorizontal: spacing[5],
    marginVertical: 30,
    alignItems: "center",
    position: "relative",
    zIndex: 1,
  },
  nodeRowLeft: {
    alignItems: "flex-start",
    paddingLeft: width * 0.25,
  },
  nodeRowRight: {
    alignItems: "flex-end",
    paddingRight: width * 0.25,
  },
  nodeCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.borderStrong,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.surface,
    ...shadows.md,
  },
  nodeCircleCompleted: {
    backgroundColor: colors.success,
  },
  nodeCircleActive: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.1 }],
  },
  nodeCircleLocked: {
    backgroundColor: colors.borderStrong,
    opacity: 0.7,
  },
  nodePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  nodeStandardInner: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  activeTooltip: {
    position: "absolute",
    bottom: 90,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    width: 200,
    ...shadows.lg,
    zIndex: 10,
  },
  tooltipLeft: {
    left: width * 0.25 - 60,
  },
  tooltipRight: {
    right: width * 0.25 - 60,
  },
  tooltipTitle: {
    marginVertical: spacing[1],
  },
  tooltipMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});
