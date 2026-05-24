import { Href, useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import {
  EmptyState,
  Screen,
  SectionHeader,
} from "../../shared/components/ui";
import { colors, layout, spacing } from "../../shared/theme";
import { AsdResourcesSection } from "./components/AsdResourcesSection";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { ClinicianCard } from "./components/ClinicianCard";
import { DomainProgressSection } from "./components/DomainProgressSection";
import { HelpfulGamesSection } from "./components/HelpfulGamesSection";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import { PediatriciansSection } from "./components/PediatriciansSection";
import { useChildren } from "./hooks/useChildren";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildScreenings } from "./hooks/useScreenings";
import { useScreeningProgress } from "./hooks/useScreeningProgress";
import { useChildrenStore } from "./store/childrenStore";
import { resolveRoadmapCycleStatus } from "../../shared/utils/roadmapProgress";

type LifecycleStage =
  | "no_children"
  | "needs_verification"
  | "needs_screening"
  | "screening_under_review"
  | "follow_up_due"
  | "active_care"
  | "ready_for_next_screening";

export default function AppHomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { activeChild, children, setActiveChild } = useChildrenStore();
  const [showChildSelector, setShowChildSelector] = useState(false);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("home.goodMorning", "Good morning");
    if (hours < 17) return t("home.goodAfternoon", "Good afternoon");
    return t("home.goodEvening", "Good evening");
  };

  const {
    data: childrenData,
    isLoading,
    refetch: refetchChildren,
  } = useChildren();

  useEffect(() => {
    if (!activeChild) {
      if (childrenData && childrenData.length > 0) {
        setActiveChild(childrenData[0]);
      } else if (children && children.length > 0) {
        setActiveChild(children[0]);
      }
    }
  }, [childrenData, children, activeChild, setActiveChild]);

  const { data: profile, refetch: refetchProfile } = useProfile();
  const { data: screeningsData, refetch: refetchScreenings } = useChildScreenings(
    activeChild?.childId,
  );
  const { data: roadmapData, refetch: refetchRoadmaps } = useRoadmaps(
    activeChild?.childId,
  );
  const { data: progressData, refetch: refetchScreeningProgress } =
    useScreeningProgress(activeChild?.childId);

  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchChildren();
      if (activeChild?.childId) {
        refetchScreenings();
        refetchRoadmaps();
        refetchScreeningProgress();
      }
    }, [
      refetchProfile,
      refetchChildren,
      refetchScreenings,
      refetchRoadmaps,
      refetchScreeningProgress,
      activeChild?.childId,
    ]),
  );

  const { data: clinician } = useAssignedClinician(
    activeChild?.status === "VERIFIED" ? activeChild?.childId : undefined,
  );

  const hasActiveRoadmap = roadmapData?.hasActiveRoadmap ?? false;
  const weekPlans = roadmapData?.weekPlans ?? [];
  const activeRoadmap = roadmapData?.roadmap ?? null;
  const { roadmapCycleComplete, readyForNextScreening } =
    resolveRoadmapCycleStatus(weekPlans, activeRoadmap, progressData ?? undefined);

  const hasChildren = children.length > 0;
  const parentVerified = profile?.status === "VERIFIED";
  const childVerified = activeChild?.status === "VERIFIED";
  const bothVerified = parentVerified && childVerified;

  const screenings = screeningsData?.screenings ?? [];
  const latestScreening = screenings[0];
  const profileInProgress =
    progressData?.profileStatus === "profile_in_progress" ||
    (!!latestScreening && !hasActiveRoadmap && !roadmapCycleComplete);

  const stage = computeStage({
    hasChildren,
    bothVerified,
    hasActiveRoadmap,
    profileInProgress,
    hasLatestScreening: !!latestScreening,
    roadmapCycleComplete,
    readyForNextScreening,
  });

  const greeting = getGreeting();
  const primaryName = activeChild?.firstName || user?.firstName || t("common.friend");
  const headerSubtitle = activeChild
    ? activeChild.gender ? `${activeChild.gender}` : undefined
    : undefined;

  const onAvatarPress = () => {
    if (children.length > 0) setShowChildSelector(true);
  };

  return (
    <Screen
      padded={false}
      background={colors.surfaceMuted}
      statusBarStyle="dark-content"
    >
      <HomeHeader
        greeting={greeting}
        primaryName={primaryName}
        subtitle={headerSubtitle}
        avatarUri={activeChild?.profilePictureUrl}
        badgeCount={children.length}
        onAvatarPress={onAvatarPress}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <HomeSkeletonView />
        ) : (
          <View style={styles.body}>
            {/* Hero — single primary CTA driven by lifecycle stage */}
            {renderHero(stage, {
              router,
              t,
              childName: activeChild?.firstName,
              parentVerified,
              childVerified,
              latestScreening,
              progressPct: computeScreeningProgressPercent(progressData),
              nextScreeningMonth: progressData?.nextScreeningMonth,
            })}

            {/* M-CHAT round comparison — shown after 2+ screenings */}
            {bothVerified &&
            progressData?.screeningComparison?.hasComparison &&
            (progressData.domainProgress?.length ?? 0) > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={t("home.developmentProgress")}
                  action={{
                    label: t("home.seeFullProgress"),
                    onPress: () =>
                      router.push("/(app)/growth-journey" as Href),
                  }}
                />
                <DomainProgressSection
                  domainProgress={progressData.domainProgress}
                  screeningComparison={progressData.screeningComparison}
                  compact
                />
              </View>
            ) : null}

            {/* Top section: pediatricians network preview */}
            <View style={styles.section}>
              <PediatriciansSection />
            </View>

            {/* Optional: assigned clinician */}
            {bothVerified && clinician ? (
              <View style={styles.section}>
                <SectionHeader title={t("home.careTeam")} />
                <ClinicianCard
                  clinician={clinician}
                  onPress={() =>
                    router.push({
                      pathname: "/(app)/(doctor)/doctor-details",
                      params: { childId: activeChild?.childId },
                    } as any)
                  }
                  onMessagePress={() => router.push("/chat" as Href)}
                />
              </View>
            ) : null}

            {/* Optional: screening history link if any exists */}
            {bothVerified && screenings.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={t("home.recentScreenings")}
                  action={{
                    label: t("home.viewAll"),
                    onPress: () =>
                      router.push("/(app)/(mchat)/mchat-profile" as any),
                  }}
                />
                <EmptyState
                  icon="clipboard-outline"
                  title={t("home.screeningsOnFile", {
                    count: screenings.length,
                  })}
                  description={t("home.screeningHistoryDesc")}
                  primaryAction={{
                    label: t("home.openHistory"),
                    onPress: () =>
                      router.push("/(app)/(mchat)/mchat-profile" as any),
                  }}
                />
              </View>
            ) : null}

            {/* Interactive games */}
            <View style={styles.section}>
              <HelpfulGamesSection />
            </View>

            {/* Bottom section: trusted ASD info resources */}
            <View style={styles.section}>
              <AsdResourcesSection />
            </View>
          </View>
        )}
      </ScrollView>

      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </Screen>
  );
}

function computeScreeningProgressPercent(
  progress: ReturnType<typeof useScreeningProgress>["data"],
): number | undefined {
  if (!progress) return undefined;
  if (progress.profileStatus === "roadmap_ready") return 100;
  if (progress.profileStatus === "profile_in_progress") return 75;
  if (progress.latestScreening) return 50;
  return 0;
}

function computeStage(input: {
  hasChildren: boolean;
  bothVerified: boolean;
  hasActiveRoadmap: boolean;
  profileInProgress: boolean;
  hasLatestScreening: boolean;
  roadmapCycleComplete: boolean;
  readyForNextScreening: boolean;
}): LifecycleStage {
  if (!input.hasChildren) return "no_children";
  if (!input.bothVerified) return "needs_verification";
  if (input.roadmapCycleComplete && input.readyForNextScreening) {
    return "ready_for_next_screening";
  }
  if (input.roadmapCycleComplete && !input.readyForNextScreening) {
    return "follow_up_due";
  }
  if (input.hasActiveRoadmap) return "active_care";
  if (input.profileInProgress) return "screening_under_review";
  if (input.readyForNextScreening) return "ready_for_next_screening";
  return "needs_screening";
}

function renderHero(
  stage: LifecycleStage,
  ctx: {
    router: ReturnType<typeof useRouter>;
    t: ReturnType<typeof useTranslation>["t"];
    childName?: string;
    parentVerified: boolean;
    childVerified: boolean;
    latestScreening?: any;
    progressPct?: number;
    nextScreeningMonth?: number;
  },
) {
  const startMChat = () => ctx.router.push("/(app)/mchat-privacy" as Href);

  switch (stage) {
    case "no_children":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.step1")}
          title={ctx.t("home.hero.getStarted")}
          description={ctx.t("home.hero.getStartedDesc")}
          illustrationIcon="happy-outline"
          primaryAction={{
            label: ctx.t("home.hero.registerChild"),
            onPress: () =>
              ctx.router.push("/(app)/(child)/create-child" as Href),
            leadingIcon: "person-add-outline",
          }}
        />
      );
    case "needs_verification": {
      const completed =
        (ctx.parentVerified ? 1 : 0) + (ctx.childVerified ? 1 : 0);
      const progress = (completed / 2) * 100;
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.step2")}
          title={ctx.t("home.hero.verifyTitle")}
          description={ctx.t("home.hero.verifyDesc")}
          illustrationIcon="shield-checkmark-outline"
          badge={{
            label: completed === 0 ? ctx.t("common.required") : ctx.t("common.inProgress"),
            tone: "warning",
            icon: "time-outline",
          }}
          progress={progress}
          primaryAction={{
            label: completed === 0 ? ctx.t("home.hero.startVerification") : ctx.t("common.continue"),
            onPress: () => ctx.router.push("/(app)/(verification)/verify" as Href),
          }}
        />
      );
    }
    case "needs_screening":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.step3")}
          title={
            ctx.childName
              ? ctx.t("home.hero.beginScreening", { name: ctx.childName })
              : ctx.t("home.hero.beginScreeningDefault")
          }
          description={ctx.t("home.hero.screeningDesc")}
          illustrationIcon="clipboard-outline"
          stats={[
            { label: ctx.t("home.hero.minutes"), value: "10" },
            { label: ctx.t("home.hero.questions"), value: "20" },
          ]}
          primaryAction={{
            label: ctx.t("home.hero.startScreening"),
            onPress: () => ctx.router.push("/(app)/mchat-privacy" as Href),
          }}
        />
      );
    case "screening_under_review":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.step4")}
          title={ctx.t("home.hero.underReview")}
          description={ctx.t("home.hero.underReviewDesc")}
          illustrationIcon="hourglass-outline"
          badge={{
            label: ctx.t("screening.underReview"),
            tone: "info",
            icon: "time-outline",
          }}
          progress={ctx.progressPct ?? 50}
          secondaryAction={{
            label: ctx.t("home.hero.viewSubmission"),
            onPress: () =>
              ctx.router.push("/(app)/(mchat)/mchat-profile" as any),
          }}
        />
      );
    case "ready_for_next_screening":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.nextMchatPhase")}
          title={
            ctx.childName
              ? ctx.t("home.hero.planCompleteTitle", { name: ctx.childName })
              : ctx.t("home.hero.planCompleteTitleDefault")
          }
          description={ctx.t("home.hero.nextMchatRequiredDesc")}
          illustrationIcon="clipboard-outline"
          badge={{
            label: ctx.t("home.hero.actionRequired"),
            tone: "warning",
            icon: "alert-circle",
          }}
          stats={[
            {
              label: ctx.t("home.hero.nextPhase"),
              value: ctx.nextScreeningMonth
                ? ctx.t("home.hero.monthNumber", {
                    month: ctx.nextScreeningMonth,
                  })
                : ctx.t("home.hero.mchatRescreen"),
            },
            { label: ctx.t("home.hero.minutes"), value: "10" },
            { label: ctx.t("home.hero.questions"), value: "20" },
          ]}
          primaryAction={{
            label: ctx.t("home.hero.startNextMchat"),
            onPress: startMChat,
            leadingIcon: "arrow-forward-circle",
          }}
          secondaryAction={{
            label: ctx.t("home.hero.reviewCompletedPlan"),
            onPress: () => ctx.router.push("/schedule" as Href),
          }}
        />
      );
    case "follow_up_due":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.planFinished")}
          title={
            ctx.childName
              ? ctx.t("home.hero.planCompleteTitle", { name: ctx.childName })
              : ctx.t("home.hero.planCompleteTitleDefault")
          }
          description={ctx.t("home.hero.nextMchatCooldownDesc")}
          illustrationIcon="hourglass-outline"
          badge={{
            label: ctx.t("home.hero.comingSoon"),
            tone: "info",
            icon: "time-outline",
          }}
          progress={100}
          primaryAction={{
            label: ctx.t("home.hero.reviewCompletedPlan"),
            onPress: () => ctx.router.push("/schedule" as Href),
          }}
          secondaryAction={{
            label: ctx.t("home.hero.seeGrowthJourney"),
            onPress: () => ctx.router.push("/(app)/growth-journey" as Href),
          }}
        />
      );
    case "active_care":
      return (
        <HomeHero
          eyebrow={ctx.t("home.hero.todayFocus")}
          title={ctx.t("home.hero.continuePlan")}
          description={ctx.t("home.hero.continuePlanDesc", {
            name: ctx.childName ?? ctx.t("common.friend"),
          })}
          illustrationIcon="flame-outline"
          badge={{
            label: ctx.t("common.active"),
            tone: "success",
            icon: "checkmark-circle",
          }}
          primaryAction={{
            label: ctx.t("home.hero.openSchedule"),
            onPress: () => ctx.router.push("/schedule" as Href),
          }}
          secondaryAction={{
            label: ctx.t("home.hero.seeGrowthJourney"),
            onPress: () => ctx.router.push("/(app)/growth-journey" as Href),
          }}
        />
      );
  }
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.tabBarHeight + spacing[8],
  },
  body: {
    paddingHorizontal: spacing[5],
    gap: spacing[6],
  },
  section: {
    gap: spacing[3],
  },
});
