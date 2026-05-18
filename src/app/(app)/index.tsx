import { Ionicons } from "@expo/vector-icons";
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
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

import { Href, router } from "expo-router";
import { useLanguageStore } from "../../shared/store/languageStore";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { DoctorsSection } from "./components/DoctorsSection";
import { EmptyChildView } from "./components/EmptyChildView";
import { HasChildView } from "./components/HasChildView";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import { VerifiedChildView } from "./components/VerifiedChildView";
import { useChildren } from "./hooks/useChildren";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useChildrenStore } from "./store/childrenStore";

export default function AppHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { activeChild, children } = useChildrenStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  // console.log(children);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("home.goodMorning");
    if (hours < 17) return t("home.goodAfternoon");
    return t("home.goodEvening");
  };

  // Fetch children and sync with store
  const { isLoading } = useChildren();

  // Fetch parent profile to check verification status
  const { data: profile } = useProfile();

  // Fetch clinician if child is verified
  const { data: clinician } = useAssignedClinician(
    activeChild?.status === "VERIFIED" ? activeChild?.childId : undefined,
  );

  const hasChildren = children.length > 0;

  // Check if BOTH parent and child are verified
  const parentVerified = profile?.status === "VERIFIED";
  const childVerified = activeChild?.status === "VERIFIED";
  const bothVerified = parentVerified && childVerified;

  console.log("Verification Status:", {
    hasChildren,
    parentStatus: profile?.status,
    childStatus: activeChild?.status,
    parentVerified,
    childVerified,
    bothVerified,
  });

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>
            {activeChild
              ? activeChild.firstName
              : user?.firstName || t("home.guest")}
          </Text>
        </View>

        {/* Small Language Toggle in Header */}
        <View style={styles.headerLanguageActions}>
          <TouchableOpacity
            onPress={() =>
              setLanguage(
                language === "en" ? "am" : language === "am" ? "om" : "en",
              )
            }
            style={styles.langHeaderToggle}
          >
            <Ionicons name="language" size={16} color={colors.primary} />
            <Text style={styles.langHeaderText}>{language.toUpperCase()}</Text>
          </TouchableOpacity>

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
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <HomeSkeletonView />
        ) : (
          <View style={styles.contentContainer}>
            <DoctorsSection />
            {/* <HasChildView /> */}
            {/* <VerifiedChildView clinician={clinician} /> */}

            {!hasChildren ? (
              // No children created - show prompt to create child
              <EmptyChildView />
            ) : !bothVerified ? (
              // Has children but not fully verified - show verification flow
              <HasChildView />
            ) : (
              // Both parent and child verified - show treatment timeline
              <VerifiedChildView clinician={clinician} />
            )}

            <View>
              <TouchableOpacity
                style={styles.actionCard}
                onPress={() => {}}
                activeOpacity={0.7}
              >
                <View style={styles.actionCardContent}>
                  <Text style={styles.actionCardTitle}>
                    {t("home.uploadVideo")}
                  </Text>
                  <Text style={styles.actionCardSubtitle}>
                    {t("home.infoSafe")}
                  </Text>

                  <View style={styles.watchGuideButton}>
                    <View style={styles.playIconCircle}>
                      <Ionicons name="play" size={20} color={colors.white} />
                    </View>
                    <Text style={styles.watchGuideText}>Watch Guide</Text>
                  </View>
                </View>

                <View style={styles.arrowCircle}>
                  <Ionicons name="arrow-forward" size={20} color="#0C4A6E" />
                </View>
              </TouchableOpacity>

              {/* Feature Cards */}
              <View style={styles.placeholderRow}>
                <TouchableOpacity
                  style={styles.featureCard}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(app)/schedule" as Href)}
                >
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="calendar" size={32} color="#0C4A6E" />
                  </View>
                  <Text style={styles.featureCardTitle}>My Schedule</Text>
                  <Text style={styles.featureCardSubtitle}>
                    View appointments
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.featureCard}
                  activeOpacity={0.7}
                  onPress={() => router.push("/(app)/chat" as Href)}
                >
                  <View style={styles.featureIconContainer}>
                    <Ionicons name="chatbubbles" size={32} color="#0C4A6E" />
                  </View>
                  <Text style={styles.featureCardTitle}>Messages</Text>
                  <Text style={styles.featureCardSubtitle}>
                    Chat with doctors
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.resourcesContainer}>
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
                <View style={styles.resourceCard}>
                  <Text style={styles.resourceCategory}>Speech therapy</Text>
                  <Text style={styles.resourceTitle} numberOfLines={4}>
                    Speech therapy Phase 1 Fill out the information and start
                    the treatment Fill out the information and start the
                    treatment
                  </Text>
                </View>
                <View style={styles.resourceCard}>
                  <Text style={styles.resourceCategory}>Speech therapy</Text>
                  <Text style={styles.resourceTitle} numberOfLines={4}>
                    Speech therapy Phase 2 Next steps in communication
                    improvement
                  </Text>
                </View>
              </ScrollView>
            </View>

            {/* Sensory Games */}
            <View style={styles.gamesContainer}>
              <Text style={styles.sectionTitle}>
                {t("home.trySensoryGames")}
              </Text>
              <View style={styles.gamesRow}>
                {[1, 2, 3, 4].map((i) => (
                  <View key={i} style={styles.gamePlaceholder} />
                ))}
              </View>
            </View>
          </View>
        )}

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
  headerLanguageActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  langHeaderToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E0E7FF",
  },
  langHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: spacing.xxxl,
  },
  doctorsWrapper: {
    marginBottom: 0,
  },
  resourcesContainer: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
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
  gamesContainer: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    marginBottom: spacing.xl,
  },
  gamesRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: spacing.md,
  },
  gamePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
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
