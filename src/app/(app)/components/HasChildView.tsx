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

const getStatusProps = (status: string) => {
  switch (status) {
    case "VERIFIED":
      return {
        color: "#10B981",
        bg: "#D1FAE5",
        icon: "checkmark-circle",
        text: "Verified",
      };
    case "PENDING":
      return {
        color: "#F59E0B",
        bg: "#FEF3C7",
        icon: "time",
        text: "In Review",
      };
    case "REJECTED":
      return {
        color: "#DC2626",
        bg: "#FEE2E2",
        icon: "alert-circle",
        text: "Rejected",
      };
    default:
      return {
        color: "#EA580C",
        bg: "#FFEDD5",
        icon: "warning",
        text: "Required",
      };
  }
};

export function VerificationTracker({
  parentStatus,
  childStatus,
}: {
  parentStatus: string;
  childStatus: string;
}) {
  const router = useRouter();

  const parentProps = getStatusProps(parentStatus);
  const childProps = getStatusProps(childStatus);

  return (
    <View style={styles.trackerContainer}>
      <Text style={styles.trackerTitle}>Profile Verification</Text>
      <Text style={styles.trackerSubtitle}>
        Please complete the following verifications to unlock full clinical
        access and treatments.
      </Text>

      <TouchableOpacity
        style={[styles.trackerItem, { borderLeftColor: parentProps.color }]}
        onPress={() => router.push("/(app)/(parent)/verify-parent" as any)}
        disabled={parentStatus === "VERIFIED" || parentStatus === "PENDING"}
        activeOpacity={0.7}
      >
        <View
          style={[styles.trackerIconBg, { backgroundColor: parentProps.bg }]}
        >
          <Ionicons
            name={parentProps.icon as any}
            size={20}
            color={parentProps.color}
          />
        </View>
        <View style={styles.trackerItemTexts}>
          <Text style={styles.trackerItemTitle}>Parent Identity</Text>
          <Text style={styles.trackerItemSubtitle}>Verify using Fayda ID</Text>
        </View>
        <View
          style={[
            styles.trackerStatusBadge,
            { backgroundColor: parentProps.color },
          ]}
        >
          <Text style={styles.trackerStatusText}>{parentProps.text}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.trackerItem, { borderLeftColor: childProps.color }]}
        onPress={() => router.push("/(app)/(verification)/verify" as Href)}
        disabled={childStatus === "VERIFIED" || childStatus === "PENDING"}
        activeOpacity={0.7}
      >
        <View
          style={[styles.trackerIconBg, { backgroundColor: childProps.bg }]}
        >
          <Ionicons
            name={childProps.icon as any}
            size={20}
            color={childProps.color}
          />
        </View>
        <View style={styles.trackerItemTexts}>
          <Text style={styles.trackerItemTitle}>Child Profile</Text>
          <Text style={styles.trackerItemSubtitle}>
            Verify identity documents
          </Text>
        </View>
        <View
          style={[
            styles.trackerStatusBadge,
            { backgroundColor: childProps.color },
          ]}
        >
          <Text style={styles.trackerStatusText}>{childProps.text}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

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
  const parentStatus = profile?.status || "UNVERIFIED";

  const parentVerified = parentStatus === "VERIFIED";
  const childVerified = status === "VERIFIED";
  const bothVerified = parentVerified && childVerified;

  const handleUploadVideo = () => {
    // ...existing code...
  };

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  return (
    <View style={styles.mainCard}>
      <Text style={styles.mainTitle}>{t("home.fillInfoStartTreatment")}</Text>

      {!bothVerified && (
        <VerificationTracker parentStatus={parentStatus} childStatus={status} />
      )}

      {/* {latestScreening && <ScreeningResultCard screening={latestScreening} />} */}

      {!latestScreening && (
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
  trackerContainer: {
    backgroundColor: "#F4F8FA",
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  trackerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  trackerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  trackerItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  trackerIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  trackerItemTexts: {
    flex: 1,
  },
  trackerItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  trackerItemSubtitle: {
    fontSize: typography.fontSize.xs,
    color: "#5A7A8F",
  },
  trackerStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  trackerStatusText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
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
