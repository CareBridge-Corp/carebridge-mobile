import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import { useLanguageStore } from "../../shared/store/languageStore";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { VerificationRequiredView } from "./components/VerificationRequiredView";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildrenStore } from "./store/childrenStore";

export default function ScheduleScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { activeChild, children } = useChildrenStore();
  const { language } = useLanguageStore();

  const [showChildSelector, setShowChildSelector] = useState(false);

  const isVerified = activeChild?.status === "VERIFIED";
  const { data: roadmapData, isLoading } = useRoadmaps(
    isVerified ? activeChild?.childId : undefined,
  );

  // Get active week plan
  const activeRoadmap = roadmapData?.roadmaps?.[0];
  const activeWeekPlan =
    activeRoadmap?.weekPlans?.find((wp) => wp.status === "IN_PROGRESS") ||
    activeRoadmap?.weekPlans?.[0];

  // Demo data for calendar (could be made dynamic later)
  const weekDays = [
    { date: 14, day: "Sat" },
    { date: 15, day: "Sun" },
    { date: 16, day: "Mon" },
    { date: 17, day: "Tue", selected: true },
    { date: 18, day: "Wed" },
    { date: 19, day: "Thu" },
    { date: 20, day: "Fri" },
  ];

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  const handleContinue = () => {
    // Lead to details or specific activity
    console.log("Continue task pressed");
  };

  if (!isVerified) {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={colors.backgroundBlue}
        />
        {/* Header (Keep same as main index) */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>{t("home.goodMorning")}</Text>
            <Text style={styles.userName}>
              {activeChild?.firstName || user?.firstName || t("home.guest")}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={() => children.length > 0 && setShowChildSelector(true)}
            activeOpacity={0.7}
          >
            {activeChild?.profilePictureUrl ? (
              <Image
                source={{ uri: activeChild.profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={28} color={colors.text} />
            )}
            {children.length > 1 && (
              <View style={styles.childCountBadge}>
                <Text style={styles.childCountText}>{children.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <VerificationRequiredView />

        <ChildSelectorModal
          visible={showChildSelector}
          onClose={() => setShowChildSelector(false)}
        />
      </View>
    );
  }

  // Calculate progress for circles
  const activities = activeWeekPlan?.activities || [];
  const totalActivities = activities.length;
  const completedCount =
    activeWeekPlan?.activityStatuses?.filter((s) => s.completed).length || 0;
  const progressPercentage =
    totalActivities > 0
      ? Math.round((completedCount / totalActivities) * 100)
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{t("home.goodMorning")}</Text>
          <Text style={styles.userName}>
            {activeChild?.firstName || user?.firstName || t("home.guest")}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => children.length > 0 && setShowChildSelector(true)}
          activeOpacity={0.7}
        >
          {activeChild?.profilePictureUrl ? (
            <Image
              source={{ uri: activeChild.profilePictureUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={28} color={colors.text} />
          )}
          {children.length > 1 && (
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarCard}>
          <View style={styles.weekContainer}>
            {weekDays.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  item.selected && styles.dayItemSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateText,
                    item.selected && styles.dateTextSelected,
                  ]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[
                    styles.dayText,
                    item.selected && styles.dayTextSelected,
                  ]}
                >
                  {item.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeWeekPlan ? (
            <>
              {/* Therapy Progress */}
              <View style={styles.therapySection}>
                <View style={styles.therapyHeader}>
                  <View style={styles.therapyInfo}>
                    <Text style={styles.therapyTitle}>
                      Week {activeWeekPlan.weekNumber}
                    </Text>
                    <Text style={styles.therapyStatus}>
                      {activeWeekPlan.description}
                    </Text>
                  </View>
                  <View style={styles.progressCircle}>
                    <Text style={styles.progressText}>
                      {progressPercentage}%
                    </Text>
                  </View>
                </View>

                {/* Progress Circles */}
                <View style={styles.progressCirclesContainer}>
                  {activities.map((activity, index) => {
                    const isCompleted = activeWeekPlan.activityStatuses?.find(
                      (s) => s.activityId === activity.activityId,
                    )?.completed;
                    return (
                      <View
                        key={activity.activityId}
                        style={[
                          styles.progressDot,
                          isCompleted && styles.progressDotCompleted,
                        ]}
                      >
                        {isCompleted && (
                          <Ionicons
                            name="checkmark"
                            size={24}
                            color={colors.primary}
                          />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Task Cards */}
              {activities.map((activity, index) => (
                <View key={activity.activityId} style={styles.taskCard}>
                  <View style={styles.taskHeader}>
                    <View style={styles.taskInfo}>
                      <Text style={styles.taskTitle}>
                        Activity {index + 1}: {activity.title}
                      </Text>
                      <Text style={styles.taskStatus}>
                        {activity.riskCategory}
                      </Text>
                    </View>
                    <View style={styles.taskIconCircle}>
                      <Ionicons
                        name="play-circle"
                        size={32}
                        color={colors.primary}
                      />
                    </View>
                  </View>

                  <Text style={styles.taskDescription} numberOfLines={3}>
                    {activity.instruction}
                  </Text>

                  <TouchableOpacity
                    style={styles.continueButton}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.continueButtonText}>Continue</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </>
          ) : (
            <View style={styles.noPlanContainer}>
              <Text style={styles.noPlanText}>
                No active schedule found for this week.
              </Text>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  unverifiedContainer: {
    flex: 1,
    padding: spacing.xxl,
    justifyContent: "center",
  },
  mchatPromptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxxl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  promptTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C4A6E",
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  promptSubtitle: {
    fontSize: 16,
    color: "#5A7A8F",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxxl,
  },
  mchatButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: 8,
  },
  mchatButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  childCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#10B981",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  childCountText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    minHeight: "100%",
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxxl,
  },
  dayItem: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xxl,
    minWidth: 50,
  },
  dayItemSelected: {
    backgroundColor: "#0C4A6E",
  },
  dateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  dateTextSelected: {
    color: colors.white,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  dayTextSelected: {
    color: colors.white,
  },
  therapySection: {
    marginBottom: spacing.xl,
  },
  therapyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  therapyInfo: {
    flex: 1,
  },
  therapyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  therapyStatus: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.lg,
  },
  progressText: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  progressCirclesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  progressDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotCompleted: {
    backgroundColor: "#E0F2FE",
  },
  taskCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  noPlanContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  noPlanText: {
    color: "#A0B8C8",
    fontSize: 16,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  taskStatus: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    textTransform: "capitalize",
  },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  taskDescription: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    lineHeight: 22,
    marginBottom: spacing.xl,
  },
  continueButton: {
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
