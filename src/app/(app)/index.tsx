import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
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

import { useLanguageStore } from "../../shared/store/languageStore";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { DoctorsSection } from "./components/DoctorsSection";
import { EmptyChildView } from "./components/EmptyChildView";
import { HasChildView } from "./components/HasChildView";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import VerificationTracker from "./components/VerificationTracker";
import { VerifiedChildView } from "./components/VerifiedChildView";
import { useChildren } from "./hooks/useChildren";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useRoadmaps } from "./hooks/useRoadmaps";
import { useChildScreenings } from "./hooks/useScreenings";
import { useChildrenStore } from "./store/childrenStore";

export default function AppHomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { activeChild, children, setActiveChild } = useChildrenStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  console.log("children:", children, activeChild);
  const [showChildSelector, setShowChildSelector] = useState(false);

  // Determine greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return t("home.goodMorning");
    if (hours < 17) return t("home.goodAfternoon");
    return t("home.goodEvening");
  };

  // Fetch children and sync with store
  const {
    data: childrenData,
    isLoading,
    refetch: refetchChildren,
  } = useChildren();

  // Only set the active child to the first one if there isn't one already selected
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

  const { data: screeningsData, refetch: refetchScreenings } =
    useChildScreenings(activeChild?.childId);
  const { data: roadmapData, refetch: refetchRoadmaps } = useRoadmaps(
    activeChild?.childId,
  );

  // Refetch verification status when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refetchProfile();
      refetchChildren();
      if (activeChild?.childId) {
        refetchScreenings();
        refetchRoadmaps();
      }
    }, [
      refetchProfile,
      refetchChildren,
      refetchScreenings,
      refetchRoadmaps,
      activeChild?.childId,
    ]),
  );

  // Fetch clinician if child is verified
  const { data: clinician } = useAssignedClinician(
    activeChild?.status === "VERIFIED" ? activeChild?.childId : undefined,
  );

  const hasActiveRoadmap = roadmapData?.hasActiveRoadmap ?? false;

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

  console.log(activeChild);

  // const handleMChat = () => {
  //   router.push("/(app)/mchat-privacy" as Href);
  // };

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

            {!hasChildren ? (
              <EmptyChildView /> //checked
            ) : !bothVerified ? (
              <View>
                {/* <View>
                  <Text>Please Complete the Verification Process</Text>
                </View> */}

                <VerificationTracker
                  parentStatus={profile?.status}
                  childStatus={activeChild?.status}
                />
              </View>
            ) : (
              <>
                <HasChildView />
                {hasActiveRoadmap && (
                  <VerifiedChildView
                    clinician={clinician}
                    weekPlans={roadmapData?.weekPlans ?? []}
                    roadmap={roadmapData?.roadmap ?? null}
                  />
                )}
              </>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
