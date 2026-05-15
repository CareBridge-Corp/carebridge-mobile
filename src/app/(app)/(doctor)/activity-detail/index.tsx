import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing } from "../../../../shared/theme";
import { useRoadmaps } from "../../hooks/useRoadmaps";
import { useChildrenStore } from "../../store/childrenStore";
import { useRoadmapStore } from "../../store/roadmapStore";
import { CompletionModal } from "./components/CompletionModal";
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
  const [isCompleting, setIsCompleting] = useState(false);

  const { activeChild } = useChildrenStore();
  const { data: roadmapData } = useRoadmaps(activeChild?.childId);
  const completeActivityApi = useRoadmapStore(
    (state) => state.completeActivity,
  );

  // Find current activity and the next one
  const activeRoadmap = roadmapData?.roadmaps?.[0];
  const weekPlans = activeRoadmap?.weekPlans || [];

  // Flatten all activities in order across week plans
  const allActivitiesWithContext = weekPlans.flatMap((wp) =>
    (wp.activities || []).map((a) => {
      // Find status from activityStatuses array
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
    currentActivity?.completed || false,
  );

  // Sync state if currentActivity changes (due to setParams or data reload)
  useEffect(() => {
    const activity = allActivitiesWithContext.find(
      (a) => a.activityId === params.activityId,
    );
    if (activity) {
      setIsCompleted(activity.completed || false);
    }
  }, [params.activityId, roadmapData]);

  const handleNext = () => {
    if (!isCompleted) {
      setShowCompletionModal(true);
    } else if (nextActivity) {
      // If already completed, just move to next
      router.setParams({
        activityId: nextActivity.activityId,
        weekPlanId: nextActivity.weekPlanId,
        title: nextActivity.title,
        description: nextActivity.instruction,
      });
      setIsCompleted(nextActivity.completed || false);
    } else {
      router.back();
    }
  };

  const handleConfirmCompletion = async () => {
    if (!params.weekPlanId || !params.activityId) return;

    try {
      setIsCompleting(true);
      await completeActivityApi(params.weekPlanId, params.activityId);
      setIsCompleted(true);
      setShowCompletionModal(false);
    } catch (error: any) {
      if (error.response?.data?.error === "Activity is already completed") {
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>{activityData.title}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#0C4A6E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Placeholder */}
        <View style={styles.videoContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={40} color="#BFDBFE" />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <SectionHeader title="Description" />
          <Text
            style={styles.descriptionText}
            numberOfLines={isExpanded ? undefined : 6}
          >
            {activityData.description}
          </Text>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.moreLink}>{isExpanded ? "Less" : "More"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Verification Info */}
        <View style={styles.section}>
          <VerifiedBadge label="Verified by who" />
          <VerifiedBadge label="Verified by who" />
          <VerifiedBadge label="Verified by who" />
        </View>

        <View style={styles.divider} />

        {/* Recommended Games */}
        <View style={styles.section}>
          <SectionHeader title="Recommended Games" />
          <RecommendedGames />
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextButton, isCompleted && styles.completedNextButton]}
          activeOpacity={0.8}
          onPress={handleNext}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <ActivityIndicator color={isCompleted ? "#0C4A6E" : colors.white} />
          ) : (
            <>
              <Text
                style={[
                  styles.nextButtonText,
                  isCompleted && styles.completedNextButtonText,
                ]}
              >
                {isCompleted
                  ? nextActivity
                    ? "Go to Next"
                    : "Finish"
                  : "Mark as Completed"}
              </Text>
              <Ionicons
                name={
                  isCompleted ? "checkmark-done-circle" : "checkmark-circle"
                }
                size={22}
                color={isCompleted ? "#0C4A6E" : colors.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <CompletionModal
        visible={showCompletionModal}
        title={activityData.title}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleConfirmCompletion}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  navbarTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0C4A6E",
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 120,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#F1F5F9",
    borderRadius: borderRadius.xxl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6,
  },
  section: {
    marginBottom: spacing.xl,
  },
  descriptionText: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  moreLink: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    marginTop: 8,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: spacing.xl,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
  },
  nextButton: {
    backgroundColor: "#083344",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderRadius: 40,
    gap: 8,
  },
  completedNextButton: {
    backgroundColor: "#DBEAFE",
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  completedNextButtonText: {
    color: "#0C4A6E",
  },
});
