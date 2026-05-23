import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, spacing } from "../../../shared/theme";
import { Clinician } from "../store/clinicianStore";
import { RoadmapSummary, WeekPlan } from "../types/roadmap";
import { GrowthJourneyCard } from "./GrowthJourneyCard";

interface VerifiedChildViewProps {
  clinician?: Clinician | null;
  weekPlans: WeekPlan[];
  roadmap: RoadmapSummary | null;
}

function getWeekPhaseStatus(status: WeekPlan["status"]) {
  if (status === "COMPLETED") return "completed" as const;
  if (status === "IN_PROGRESS") return "active" as const;
  return "pending" as const;
}

function getWeekPhaseSubtitle(status: WeekPlan["status"]) {
  if (status === "COMPLETED") return "Completed";
  if (status === "IN_PROGRESS") return "In Progress";
  return "Pending";
}

export function VerifiedChildView({
  clinician,
  weekPlans,
  roadmap,
}: VerifiedChildViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const treatmentPhases = useMemo(
    () =>
      weekPlans.map((wp) => ({
        title: `Week ${wp.weekNumber}`,
        subtitle: getWeekPhaseSubtitle(wp.status),
        status: getWeekPhaseStatus(wp.status),
        weekPlanId: wp.weekPlanId,
        description: wp.description,
        tasks: wp.activities?.map((a) => a.title) || [],
        progress:
          wp.activities?.map(
            (a) =>
              wp.activityStatuses?.find((s) => s.activityId === a.activityId)
                ?.completed || false,
          ) || [],
      })),
    [weekPlans],
  );

  useEffect(() => {
    if (treatmentPhases.length > 0) {
      const activeIdx = treatmentPhases.findIndex((p) => p.status === "active");
      setExpandedIndex(activeIdx !== -1 ? activeIdx : 0);
    }
  }, [treatmentPhases]);

  if (!roadmap || weekPlans.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Wave Section */}
      <View style={styles.waveContainer}>
        {Array.from({ length: 45 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.waveBar,
              {
                height: Math.random() * 30 + 10,
                backgroundColor: i % 2 === 0 ? "#BFDBFE" : "#94A3B8",
                flex: 1,
                marginHorizontal: 1,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.journeyWrapper}>
        <GrowthJourneyCard weekPlans={weekPlans} />
      </View>

      {/* Curator Section */}
      {clinician && (
        <TouchableOpacity
          style={styles.curatorCard}
          onPress={() =>
            router.push({
              pathname: "/(app)/(doctor)/doctor-details",
              params: { childId: clinician.userId },
            } as any)
          }
        >
          <View style={styles.curatorInfo}>
            <View style={styles.curatorAvatarContainer}>
              {clinician.profilePictureUrl ? (
                <Image
                  source={{ uri: clinician.profilePictureUrl }}
                  style={styles.curatorAvatar}
                />
              ) : (
                <View style={[styles.curatorAvatar, styles.placeholderAvatar]}>
                  <Ionicons name="person" size={20} color={colors.white} />
                </View>
              )}
            </View>
            <View>
              <Text style={styles.curatorLabel}>Curated by</Text>
              <Text style={styles.curatorName}>
                {clinician.surname} {clinician.firstName} {clinician.lastName}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1DFE8" />
        </TouchableOpacity>
      )}

      {/* Timeline Section */}
      <View style={styles.timelineContainer}>
        {treatmentPhases.map((phase, index) => (
          <TouchableOpacity
            key={phase.weekPlanId}
            style={styles.timelineItem}
            onPress={() =>
              setExpandedIndex(index === expandedIndex ? null : index)
            }
            activeOpacity={0.7}
          >
            {index < treatmentPhases.length - 1 && (
              <View style={styles.connector} />
            )}

            <View
              style={[
                styles.statusDot,
                phase.status === "completed" && styles.dotCompleted,
                index === expandedIndex && styles.dotActive,
              ]}
            />

            <View style={styles.phaseContent}>
              <Text
                style={[
                  styles.phaseTitle,
                  phase.status === "completed" && styles.textMuted,
                ]}
              >
                {phase.title}
              </Text>
              <Text style={styles.phaseSubtitle}>{phase.subtitle}</Text>

              {index === expandedIndex && (
                <View style={styles.activePhaseCard}>
                  {phase.description && (
                    <Text style={styles.phaseDescription} numberOfLines={3}>
                      {phase.description}
                    </Text>
                  )}
                  {phase.tasks?.map((task, i) => (
                    <View key={`${phase.weekPlanId}-${i}`} style={styles.taskItem}>
                      <View
                        style={[
                          styles.taskCheckCircle,
                          phase.progress?.[i] && styles.taskCheckCircleDone,
                        ]}
                      >
                        {phase.progress?.[i] && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color="#0C4A6E"
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.taskText,
                          phase.progress?.[i] && styles.taskTextDone,
                        ]}
                      >
                        {task}
                      </Text>
                    </View>
                  ))}

                  <View style={styles.progressRow}>
                    <View style={styles.dotsContainer}>
                      {phase.progress?.map((done, i) => (
                        <View
                          key={`${phase.weekPlanId}-dot-${i}`}
                          style={[
                            styles.progressDot,
                            done && styles.progressDotDone,
                          ]}
                        >
                          {done && (
                            <Ionicons
                              name="checkmark"
                              size={12}
                              color="#0C4A6E"
                            />
                          )}
                        </View>
                      ))}
                    </View>
                    <TouchableOpacity
                      style={styles.expandButton}
                      onPress={() => {
                        router.push({
                          pathname: "/schedule",
                          params: { expandWeekId: phase.weekPlanId },
                        } as any);
                      }}
                    >
                      <Ionicons
                        name="arrow-up-outline"
                        size={20}
                        color="#0C4A6E"
                        style={{ transform: [{ rotate: "45deg" }] }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resources Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t("home.resources")}</Text>
        <TouchableOpacity style={styles.seeMore}>
          <Text style={styles.seeMoreText}>{t("home.seeMore")}</Text>
          <Ionicons name="chevron-forward" size={14} color="#A0B8C8" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.resourcesScroll}
      >
        {weekPlans.slice(0, 3).map((wp) => (
          <View key={wp.weekPlanId} style={styles.resourceCard}>
            <Text style={styles.resourceCategory}>Week {wp.weekNumber}</Text>
            <Text style={styles.resourceTitle} numberOfLines={4}>
              {wp.description}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Sensory Games */}
      <Text
        style={[
          styles.sectionTitle,
          { marginTop: spacing.xl, marginBottom: spacing.md },
        ]}
      >
        {t("home.trySensoryGames")}
      </Text>
      <View style={styles.gamesRow}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.gamePlaceholder} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 4,
    height: 40,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    marginHorizontal: -spacing.xxl,
  },
  waveBar: {
    width: 2,
    borderRadius: 1,
  },
  journeyWrapper: {
    marginHorizontal: -spacing.xxl,
    marginBottom: spacing.xxl,
  },
  curatorCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    marginBottom: spacing.xxl,
  },
  curatorInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  curatorAvatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  curatorAvatar: { width: "100%", height: "100%" },
  placeholderAvatar: {
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  curatorLabel: {
    fontSize: 12,
    color: "#A0B8C8",
    marginBottom: 2,
  },
  curatorName: { fontSize: 16, fontWeight: "700", color: "#0C4A6E" },
  timelineContainer: {
    paddingLeft: spacing.xs,
    marginBottom: spacing.huge,
  },
  timelineItem: {
    flexDirection: "row",
    marginBottom: spacing.xxl,
    position: "relative",
  },
  connector: {
    position: "absolute",
    left: 9,
    top: 24,
    bottom: -36,
    width: 2,
    backgroundColor: "#F1F5F9",
    zIndex: -1,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    backgroundColor: colors.white,
    marginTop: 4,
  },
  dotCompleted: {
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  dotActive: {
    borderColor: "#0C4A6E",
    borderWidth: 5,
  },
  phaseContent: { marginLeft: spacing.lg, flex: 1 },
  phaseTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
    letterSpacing: -0.5,
  },
  phaseSubtitle: {
    fontSize: 14,
    color: "#A0B8C8",
    marginTop: 4,
  },
  phaseDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  textMuted: { color: "#94A3B8" },
  activePhaseCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 28,
    padding: spacing.xl,
    marginTop: spacing.lg,
    marginRight: 0,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: spacing.md,
  },
  taskCheckCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  taskCheckCircleDone: {
    backgroundColor: "#DBEAFE",
    borderColor: "#DBEAFE",
  },
  taskText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0C4A6E",
  },
  taskTextDone: {
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.xl,
  },
  dotsContainer: { flexDirection: "row", gap: 10 },
  progressDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EDF2F7",
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotDone: {
    backgroundColor: "#DBEAFE",
  },
  expandButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0C4A6E",
    letterSpacing: -0.5,
  },
  seeMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeMoreText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "600",
  },
  resourcesScroll: {
    marginHorizontal: -spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  resourceCard: {
    width: 280,
    backgroundColor: "#F8FAFC",
    borderRadius: 28,
    padding: spacing.xl,
    marginRight: spacing.lg,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  resourceCategory: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    lineHeight: 24,
  },
  gamesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.xs,
  },
  gamePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
});
