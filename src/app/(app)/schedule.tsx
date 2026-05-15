import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
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

  // Get active week plan
  const activeRoadmap = roadmapData?.roadmaps?.[0];
  const weekPlans = activeRoadmap?.weekPlans || [];

  // Generate week dates for the selector (7 days centered around today)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - 3 + i);
    return date;
  });

  const [selectedDate, setSelectedDate] = useState(new Date());

  // Find the current week (first one that is IN_PROGRESS or the first PENDING after a COMPLETED)
  const currentWeek =
    weekPlans.find((wp) => wp.status === "IN_PROGRESS") ||
    weekPlans.find((wp) => wp.status === "PENDING") ||
    weekPlans[0];

  useEffect(() => {
    if (currentWeek && !expandedWeekId) {
      setExpandedWeekId(currentWeek.weekPlanId);
    }
  }, [currentWeek]);

  // Handle accordion toggle
  const toggleWeek = (id: string) => {
    setExpandedWeekId(expandedWeekId === id ? null : id);
  };

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
                  style={[styles.dayName, isSelected && styles.dayNameSelected]}
                >
                  {dayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Week Plans Mapping */}
          {weekPlans.length > 0 ? (
            weekPlans.map((weekPlan, index) => {
              // Only show if it's the current week, a completed week,
              // or the very next pending week after a completed one.
              const isCompleted = weekPlan.status === "COMPLETED";
              const isCurrent = weekPlan.weekPlanId === currentWeek?.weekPlanId;
              const prevWeek = index > 0 ? weekPlans[index - 1] : null;
              const isNextAvailable =
                prevWeek?.status === "COMPLETED" &&
                weekPlan.status === "PENDING";

              if (!isCompleted && !isCurrent && !isNextAvailable) return null;

              const activities = weekPlan.activities || [];
              const totalActivities = activities.length;
              const completedCount =
                weekPlan.activityStatuses?.filter((s) => s.completed).length ||
                0;
              const progressPercentage =
                totalActivities > 0
                  ? Math.round((completedCount / totalActivities) * 100)
                  : 0;
              const clinician = weekPlan.clinician;
              const isExpanded = expandedWeekId === weekPlan.weekPlanId;

              return (
                <View key={weekPlan.weekPlanId} style={styles.weekPlanSection}>
                  {/* Week Header - Toggle for Accordion */}
                  <TouchableOpacity
                    style={styles.weekHeader}
                    onPress={() => toggleWeek(weekPlan.weekPlanId)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.weekTitleContainer}>
                      <View style={styles.weekBadgeRow}>
                        <Text style={styles.therapyTitle}>
                          Week {weekPlan.weekNumber}
                        </Text>
                        {isCompleted && (
                          <View style={styles.completedBadge}>
                            <Ionicons
                              name="checkmark-circle"
                              size={14}
                              color={colors.success}
                            />
                            <Text style={styles.completedBadgeText}>Done</Text>
                          </View>
                        )}
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                          </View>
                        )}
                      </View>
                      {clinician && (
                        <Text style={styles.clinicianName}>
                          Curated by Dr. {clinician.firstName}{" "}
                          {clinician.lastName}
                        </Text>
                      )}
                    </View>
                    <View style={styles.headerRight}>
                      <View style={styles.progressCircleSmall}>
                        <Text style={styles.progressTextSmall}>
                          {progressPercentage}%
                        </Text>
                      </View>
                      <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="#0C4A6E"
                        style={{ marginLeft: spacing.sm }}
                      />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.weekDescription}>
                        {weekPlan.description}
                      </Text>

                      {/* Activity Progress */}
                      <View style={styles.progressContainer}>
                        <View style={styles.progressLabelRow}>
                          <Text style={styles.progressLabel}>
                            Activity Progress
                          </Text>
                          <Text style={styles.progressCount}>
                            {completedCount}/{totalActivities}
                          </Text>
                        </View>
                        <View style={styles.progressCirclesContainer}>
                          {activities.map((activity) => {
                            const activityCompleted =
                              weekPlan.activityStatuses?.find(
                                (s) => s.activityId === activity.activityId,
                              )?.completed;
                            return (
                              <View
                                key={activity.activityId}
                                style={[
                                  styles.progressDot,
                                  activityCompleted &&
                                    styles.progressDotCompleted,
                                ]}
                              >
                                {activityCompleted && (
                                  <Ionicons
                                    name="checkmark"
                                    size={18}
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

                          <Text
                            style={styles.taskDescription}
                            numberOfLines={3}
                          >
                            {activity.instruction}
                          </Text>

                          <TouchableOpacity
                            style={styles.continueButton}
                            onPress={handleContinue}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.continueButtonText}>
                              Continue
                            </Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.weekDivider} />
                </View>
              );
            })
          ) : (
            <View style={styles.noPlanContainer}>
              <Text style={styles.noPlanText}>No active schedule found.</Text>
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
  dayNum: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  dayNumSelected: {
    color: colors.white,
  },
  dayName: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "500",
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
  weekPlanSection: {
    marginBottom: spacing.xxxl,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.sm,
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
  },
  progressCircleSmall: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  progressTextSmall: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  weekDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: spacing.xxxl,
  },
  weekBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadge: {
    backgroundColor: "#ECFDF5",
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 12,
    color: colors.success,
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
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  weekDescription: {
    fontSize: typography.fontSize.md,
    color: "#475569",
    lineHeight: 22,
    marginBottom: spacing.xl,
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
