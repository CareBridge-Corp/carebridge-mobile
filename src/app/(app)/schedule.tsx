import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const params = useLocalSearchParams<{ expandWeekId?: string }>();

  // Add this effect to handle expansion from home page
  useEffect(() => {
    if (params.expandWeekId) {
      setExpandedWeekId(params.expandWeekId);
    }
  }, [params.expandWeekId]);

  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { activeChild, children } = useChildrenStore();
  const { language } = useLanguageStore();

  const [showChildSelector, setShowChildSelector] = useState(false);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(null);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  );

  const isVerified = activeChild?.status === "VERIFIED";
  const { data: roadmapData, isLoading } = useRoadmaps(
    isVerified ? activeChild?.childId : undefined,
  );

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get active roadmap and plans
  const activeRoadmap = roadmapData?.roadmaps?.[0];
  const weekPlans = activeRoadmap?.weekPlans || [];

  // Determine current active week based on selection or current date
  const [activeWeekPlanId, setActiveWeekPlanId] = useState<string | null>(null);

  useEffect(() => {
    // If we have an override from navigation params, use it
    if (params.expandWeekId) {
      setActiveWeekPlanId(params.expandWeekId);
    } else if (weekPlans.length > 0 && !activeWeekPlanId) {
      // Default to in-progress or first week
      const current =
        weekPlans.find((wp) => wp.status === "IN_PROGRESS") || weekPlans[0];
      if (current) setActiveWeekPlanId(current.weekPlanId);
    }
  }, [params.expandWeekId, weekPlans]);

  const activeWeekPlan = weekPlans.find(
    (wp) => wp.weekPlanId === activeWeekPlanId,
  );

  // Pagination logic for weeks
  const handlePrevWeek = () => {
    if (!activeWeekPlan) return;
    const currentIndex = weekPlans.findIndex(
      (wp) => wp.weekPlanId === activeWeekPlanId,
    );
    if (currentIndex > 0)
      setActiveWeekPlanId(weekPlans[currentIndex - 1].weekPlanId);
  };

  const handleNextWeek = () => {
    if (!activeWeekPlan) return;
    const currentIndex = weekPlans.findIndex(
      (wp) => wp.weekPlanId === activeWeekPlanId,
    );
    if (currentIndex < weekPlans.length - 1)
      setActiveWeekPlanId(weekPlans[currentIndex + 1].weekPlanId);
  };

  // Generate week dates for the selector (7 days centered around today)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 3 + i);
    return date;
  });

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

        {/* Date Display */}
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={20} color="#0C4A6E" />
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        <VerificationRequiredView />

        <ChildSelectorModal
          visible={showChildSelector}
          onClose={() => setShowChildSelector(false)}
        />
      </View>
    );
  }

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

      <View style={styles.calendarCard}>
        <View style={styles.weekPaginationContainer}>
          <TouchableOpacity onPress={handlePrevWeek} style={styles.pageButton}>
            <Ionicons name="chevron-back" size={24} color="#0C4A6E" />
          </TouchableOpacity>
          <View style={styles.weekContainer}>
            {weekDates.map((date, index) => {
              const isSelected =
                date.toDateString() === selectedDate.toDateString();
              const dayName = date.toLocaleDateString("en-US", {
                weekday: "short",
              });
              const dayNum = date.getDate();

              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                  onPress={() => setSelectedDate(date)}
                >
                  <Text
                    style={[styles.dayNum, isSelected && styles.dayNumSelected]}
                  >
                    {dayNum}
                  </Text>
                  <Text
                    style={[
                      styles.dayName,
                      isSelected && styles.dayNameSelected,
                    ]}
                  >
                    {dayName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity onPress={handleNextWeek} style={styles.pageButton}>
            <Ionicons name="chevron-forward" size={24} color="#0C4A6E" />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {activeWeekPlan ? (
            (() => {
              const weekPlan = activeWeekPlan;
              const isCompleted = weekPlan.status === "COMPLETED";
              const isCurrent = weekPlan.status === "IN_PROGRESS";

              const filteredActivities = weekPlan.activities || [];

              const totalActivities = filteredActivities.length;
              const completedCount =
                weekPlan.activityStatuses?.filter(
                  (s) =>
                    s.completed &&
                    filteredActivities.some(
                      (fa) => fa.activityId === s.activityId,
                    ),
                ).length || 0;
              const progressPercentage =
                totalActivities > 0
                  ? Math.round((completedCount / totalActivities) * 100)
                  : 0;
              const clinician = weekPlan.clinician;

              return (
                <View key={weekPlan.weekPlanId} style={styles.weekPlanSection}>
                  {/* Therapy Header/Pagination Integration */}
                  <View style={styles.therapyHeader}>
                    <View style={styles.therapyInfo}>
                      <Text style={styles.therapyTitle} numberOfLines={1}>
                        {weekPlan.description.split(" ").slice(0, 4).join(" ") +
                          "..."}
                      </Text>
                      <Text style={styles.therapyStatus}>
                        {isCompleted ? "Completed" : "In Progress"}
                      </Text>
                      <View style={styles.progressCirclesContainer}>
                        {filteredActivities.slice(0, 5).map((activity) => {
                          const isActivityCompleted =
                            weekPlan.activityStatuses?.find(
                              (s) => s.activityId === activity.activityId,
                            )?.completed;
                          return (
                            <View
                              key={activity.activityId}
                              style={[
                                styles.miniProgressDot,
                                isActivityCompleted &&
                                  styles.miniProgressDotCompleted,
                              ]}
                            >
                              {isActivityCompleted && (
                                <Ionicons
                                  name="checkmark-done"
                                  size={16}
                                  color="#0C4A6E"
                                />
                              )}
                            </View>
                          );
                        })}
                      </View>
                    </View>
                    <View style={styles.circularProgressContainer}>
                      <View style={styles.circularProgress}>
                        <Text style={styles.progressText}>
                          {progressPercentage}%
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.tasksDivider} />

                  <View style={styles.expandedContent}>
                    {/* Task Cards */}
                    {filteredActivities.map((activity, index) => (
                      <View key={activity.activityId} style={styles.taskCard}>
                        <View style={styles.taskInfo}>
                          <Text style={styles.taskTitle}>
                            Task {index + 1}: {activity.title}
                          </Text>
                          <Text style={styles.taskStatus}>
                            {weekPlan.activityStatuses?.find(
                              (s) => s.activityId === activity.activityId,
                            )?.completed
                              ? "Completed"
                              : "In Progress"}
                          </Text>
                        </View>

                        <Text style={styles.taskDescription} numberOfLines={3}>
                          {activity.instruction}
                        </Text>

                        <TouchableOpacity
                          style={[
                            styles.continueButton,
                            weekPlan.activityStatuses?.find(
                              (s) => s.activityId === activity.activityId,
                            )?.completed && styles.completedContinueButton,
                          ]}
                          onPress={() => {
                            router.push({
                              pathname: "/(app)/(doctor)/activity-detail",
                              params: {
                                activityId: activity.activityId,
                                weekPlanId: weekPlan.weekPlanId,
                                title: activity.title,
                                description: activity.instruction,
                              },
                            } as any);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.continueButtonText,
                              weekPlan.activityStatuses?.find(
                                (s) => s.activityId === activity.activityId,
                              )?.completed &&
                                styles.completedContinueButtonText,
                            ]}
                          >
                            {weekPlan.activityStatuses?.find(
                              (s) => s.activityId === activity.activityId,
                            )?.completed
                              ? "Completed"
                              : "Continue"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()
          ) : (
            <View style={styles.noPlanContainer}>
              <Text style={styles.noPlanText}>
                No activities found for this period.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

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
    backgroundColor: "#0C4A6E",
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
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(12, 74, 110, 0.05)",
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignSelf: "flex-start",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0C4A6E",
  },
  scrollView: {
    flex: 1,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    minHeight: "100%",
  },
  weekContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginHorizontal: 8,
  },
  dayItem: {
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 24,
    minWidth: 45,
  },
  dayItemSelected: {
    backgroundColor: "#0C4A6E",
    // Premium shadow for selected date
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNum: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94A3B8",
    marginBottom: 4,
  },
  dayNumSelected: {
    color: colors.white,
  },
  dayName: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  dayNameSelected: {
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
  tasksDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 24,
  },
  circularProgressContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  circularProgress: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1.5,
    borderColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  miniProgressDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E2E8F0",
    opacity: 0.5,
    justifyContent: "center",
    alignItems: "center",
  },
  miniProgressDotCompleted: {
    backgroundColor: "#DBEAFE",
    opacity: 1,
  },
  taskCard: {
    backgroundColor: "#F1F5F9",
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    marginBottom: 4,
  },
  taskStatus: {
    fontSize: 14,
    color: "#94A3B8",
    marginBottom: 12,
  },
  taskDescription: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 22,
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#0C4A6E",
    paddingVertical: 18,
    borderRadius: 40,
    alignItems: "center",
  },
  completedContinueButton: {
    backgroundColor: "#DBEAFE",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  noPlanContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  noPlanText: {
    color: "#A0B8C8",
    fontSize: 16,
  },
  completedContinueButtonText: {
    color: "#0C4A6E",
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },
  weekPlanSection: {
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    overflow: "hidden",
  },
  weekTitleContainer: {
    flex: 1,
  },
  clinicianName: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: "600",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  progressStats: {
    alignItems: "flex-end",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
  },
  progressRatio: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
  expandIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  weekDisplayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
  },
  weekPaginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  pageButton: {
    padding: 8,
  },
  weekDivider: {
    display: "none",
  },
  weekBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadge: {
    backgroundColor: "#DBEAFE",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    color: "#0C4A6E",
    fontWeight: "500",
  },
  currentBadge: {
    backgroundColor: "#E0F2FE",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  currentBadgeText: {
    fontSize: 12,
    color: "#0C4A6E",
    fontWeight: "500",
  },
  expandedContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: 0,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  weekDescription: {
    fontSize: typography.fontSize.md,
    color: "#475569",
    lineHeight: 22,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  progressContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0C4A6E",
  },
});
