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
import { useProfile } from "../hooks/useProfile";
import { useChildScreenings } from "../hooks/useScreenings";
import { useChildrenStore } from "../store/childrenStore";
import { useScreeningStore } from "../store/screeningStore";
import { VerificationAlert } from "./VerificationAlert";

export function HasChildView() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeChild } = useChildrenStore();
  const { data: profile } = useProfile();

  // Use the new hook to fetch screenings
  const { data: screeningsData } = useChildScreenings(activeChild?.childId);
  const screeningsByChild = useScreeningStore(
    (state) => state.screeningsByChild,
  );

  const childScreenings = activeChild
    ? screeningsData?.screenings || screeningsByChild[activeChild.childId] || []
    : [];

  const latestScreening = childScreenings[0];

  console.log("latestScreening", childScreenings[0]);

  const status = activeChild?.status || "UNVERIFIED";
  const parentStatus = profile?.status || "PENDING";

  const needsVerification =
    status === "UNVERIFIED" ||
    status === "PENDING" ||
    parentStatus === "PENDING" ||
    parentStatus === "UNVERIFIED";

  const handleUploadVideo = () => {
    // TODO: Implement video upload
    console.log("Upload video pressed");
  };

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  return (
    <View style={styles.mainCard}>
      <Text style={styles.mainTitle}>{t("home.fillInfoStartTreatment")}</Text>

      {needsVerification && <VerificationAlert status={status} />}

      {/* {latestScreening && <ScreeningResultCard screening={latestScreening} />} */}

      {!latestScreening && !needsVerification && (
        <TouchableOpacity
          style={styles.actionCard}
          onPress={handleMChat}
          activeOpacity={0.7}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardTitle}>M-chat</Text>
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
  watchGuideButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  playIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
  },
  watchGuideText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
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
  placeholderRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  featureCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  featureCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    textAlign: "center",
  },
  statusContainer: {
    backgroundColor: "#F4F8FA",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  statusIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  statusTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  verifyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xxxl,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
    width: "100%",
  },
  verifyButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
