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
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { ClinicianCard } from "./components/ClinicianCard";
import { HomeHeader } from "./components/HomeHeader";
import { HomeHero } from "./components/HomeHero";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import { useChildren } from "./hooks/useChildren";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildScreenings } from "./hooks/useScreenings";
import { useScreeningProgress } from "./hooks/useScreeningProgress";
import { useChildrenStore } from "./store/childrenStore";

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
  const hasChildren = children.length > 0;
  const parentVerified = profile?.status === "VERIFIED";
  const childVerified = activeChild?.status === "VERIFIED";
  const bothVerified = parentVerified && childVerified;

  const screenings = screeningsData?.screenings ?? [];
  const latestScreening = screenings[0];
  const profileInProgress =
    progressData?.profileStatus === "profile_in_progress" ||
    (!!latestScreening && !hasActiveRoadmap);
  const readyForNextScreening = !!progressData?.readyForNextScreening;

  const stage = computeStage({
    hasChildren,
    bothVerified,
    hasActiveRoadmap,
    profileInProgress,
    hasLatestScreening: !!latestScreening,
    readyForNextScreening,
  });

  const greeting = getGreeting();
  const primaryName = activeChild?.firstName || user?.firstName || "Friend";
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
              childName: activeChild?.firstName,
              parentVerified,
              childVerified,
              latestScreening,
              progressPct: computeScreeningProgressPercent(progressData),
            })}

            {/* Optional: assigned clinician */}
            {bothVerified && clinician ? (
              <View style={styles.section}>
                <SectionHeader title="Your care team" />
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
                  title="Recent screenings"
                  action={{
                    label: "View all",
                    onPress: () =>
                      router.push("/(app)/(mchat)/mchat-profile" as any),
                  }}
                />
                <EmptyState
                  icon="clipboard-outline"
                  title={`${screenings.length} ${
                    screenings.length === 1 ? "screening" : "screenings"
                  } on file`}
                  description="Tap to review past M-CHAT submissions and clinician notes."
                  primaryAction={{
                    label: "Open history",
                    onPress: () =>
                      router.push("/(app)/(mchat)/mchat-profile" as any),
                  }}
                />
              </View>
            ) : null}
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
  readyForNextScreening: boolean;
}): LifecycleStage {
  if (!input.hasChildren) return "no_children";
  if (!input.bothVerified) return "needs_verification";
  if (input.hasActiveRoadmap) return "active_care";
  if (input.profileInProgress) return "screening_under_review";
  if (input.readyForNextScreening) return "ready_for_next_screening";
  return "needs_screening";
}

function renderHero(
  stage: LifecycleStage,
  ctx: {
    router: ReturnType<typeof useRouter>;
    childName?: string;
    parentVerified: boolean;
    childVerified: boolean;
    latestScreening?: any;
    progressPct?: number;
  },
) {
  switch (stage) {
    case "no_children":
      return (
        <HomeHero
          eyebrow="Step 1 of 4"
          title="Let's get started"
          description="Register your child to begin their screening and care journey."
          illustrationIcon="happy-outline"
          primaryAction={{
            label: "Register child",
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
          eyebrow="Step 2 of 4"
          title="Verify your identity"
          description="Two quick steps unlock screening and clinician matching."
          illustrationIcon="shield-checkmark-outline"
          badge={{
            label: completed === 0 ? "Required" : "In progress",
            tone: "warning",
            icon: "time-outline",
          }}
          progress={progress}
          primaryAction={{
            label: completed === 0 ? "Start verification" : "Continue",
            onPress: () => ctx.router.push("/(app)/(verification)/verify" as Href),
          }}
        />
      );
    }
    case "needs_screening":
      return (
        <HomeHero
          eyebrow="Step 3 of 4"
          title={`Begin ${ctx.childName ?? "your child"}'s screening`}
          description="The M-CHAT-R/F takes about 10 minutes. Your answers are private and only seen by your clinician."
          illustrationIcon="clipboard-outline"
          stats={[
            { label: "Minutes", value: "10" },
            { label: "Questions", value: "20" },
          ]}
          primaryAction={{
            label: "Start screening",
            onPress: () => ctx.router.push("/(app)/mchat-privacy" as Href),
          }}
        />
      );
    case "screening_under_review":
      return (
        <HomeHero
          eyebrow="Step 4 of 4"
          title="Under clinical review"
          description="Your clinician is reviewing the screening. You'll get a notification when the care plan is ready."
          illustrationIcon="hourglass-outline"
          badge={{
            label: "Under review",
            tone: "info",
            icon: "time-outline",
          }}
          progress={ctx.progressPct ?? 50}
          secondaryAction={{
            label: "View submission",
            onPress: () =>
              ctx.router.push("/(app)/(mchat)/mchat-profile" as any),
          }}
        />
      );
    case "ready_for_next_screening":
      return (
        <HomeHero
          eyebrow="Follow-up"
          title="Time for the next check-in"
          description="A short re-screening helps your clinician track progress and adjust the plan."
          illustrationIcon="refresh-circle-outline"
          badge={{
            label: "Due now",
            tone: "warning",
          }}
          primaryAction={{
            label: "Start re-screening",
            onPress: () => ctx.router.push("/(app)/mchat-privacy" as Href),
          }}
          secondaryAction={{
            label: "Not now",
            onPress: () =>
              ctx.router.push("/(app)/(mchat)/mchat-profile" as any),
          }}
        />
      );
    case "active_care":
      return (
        <HomeHero
          eyebrow="Today's focus"
          title="Continue this week's plan"
          description={`Open ${ctx.childName ?? "your child"}'s schedule to see today's activities.`}
          illustrationIcon="flame-outline"
          badge={{
            label: "Active",
            tone: "success",
            icon: "checkmark-circle",
          }}
          primaryAction={{
            label: "Open schedule",
            onPress: () => ctx.router.push("/schedule" as Href),
          }}
          secondaryAction={{
            label: "See growth journey",
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
