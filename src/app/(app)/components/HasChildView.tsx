import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useScreeningProgress } from "../hooks/useScreeningProgress";
import { useRoadmaps } from "../hooks/useRoadmaps";
import { useChildScreenings } from "../hooks/useScreenings";
import { useChildrenStore } from "../store/childrenStore";
import { useScreeningStore } from "../store/screeningStore";
import { ProfileInProgressCard } from "./ProfileInProgressCard";
import { ScreeningProgressCard } from "./ScreeningProgressCard";
import { LongitudinalCheckInCard } from "./LongitudinalCheckInCard";

export function HasChildView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeChild } = useChildrenStore();

  const { data: screeningsData } = useChildScreenings(activeChild?.childId);
  const { data: progressData } = useScreeningProgress(activeChild?.childId);
  const { data: roadmapData } = useRoadmaps(activeChild?.childId);
  const screeningsByChild = useScreeningStore(
    (state) => state.screeningsByChild,
  );

  const childScreenings = activeChild
    ? screeningsData?.screenings || screeningsByChild[activeChild.childId] || []
    : [];

  const latestScreening = childScreenings[0];
  const hasActiveRoadmap = roadmapData?.hasActiveRoadmap ?? false;
  const profileInProgress =
    progressData?.profileStatus === "profile_in_progress" ||
    (!!latestScreening && !hasActiveRoadmap);

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  return (
    <View style={styles.mainCard}>
      <Text style={styles.mainTitle}>{t("home.fillInfoStartTreatment")}</Text>

      {profileInProgress && (
        <ProfileInProgressCard
          progress={progressData ?? null}
          childName={activeChild?.firstName}
        />
      )}

      {progressData?.domainProgress && progressData.domainProgress.length > 0 && (
        <ScreeningProgressCard
          domainProgress={progressData.domainProgress}
          screeningMonth={progressData.latestScreening?.screeningMonth}
        />
      )}

      {progressData?.readyForNextScreening && (
        <LongitudinalCheckInCard
          progress={progressData}
          childName={activeChild?.firstName}
        />
      )}

      {!latestScreening && !profileInProgress && (
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleMChat}
          activeOpacity={0.7}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardTitle}>M-CHAT</Text>
            <Text style={styles.actionCardSubtitle}>{t("home.infoSafe")}</Text>

            <View style={styles.verifiedBadge}>
              <View style={styles.whoIcon}>
                <Ionicons name="shield-checkmark" size={24} color="#4A9FD8" />
              </View>
              <View>
                <Text style={styles.verifiedTitle}>{t("home.verifiedBy")}</Text>
                <Text style={styles.verifiedSubtitle}>
                  {t("home.verifiedBySub")}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={20} color="#0C4A6E" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xxl,
    lineHeight: 36,
  },
  actionCard: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    position: "relative",
  },
  followUpCard: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  actionCardContent: {
    paddingRight: 50,
  },
  actionCardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
  },
  actionCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.xl,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  whoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  verifiedSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  arrowCircle: {
    position: "absolute",
    top: spacing.xxl,
    right: spacing.xxl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
});
