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
import { colors, spacing, typography } from "../../shared/theme";

import { useLanguageStore } from "../../shared/store/languageStore";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { DoctorsSection } from "./components/DoctorsSection";
import { EmptyChildView } from "./components/EmptyChildView";
import { HasChildView } from "./components/HasChildView";
import { HomeSkeletonView } from "./components/HomeSkeletonView";
import { VerifiedChildView } from "./components/VerifiedChildView";
import { useChildren } from "./hooks/useChildren";
import { useAssignedClinician } from "./hooks/useClinician";
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

  // Fetch clinician if child is verified
  const { data: clinician } = useAssignedClinician(
    activeChild?.status === "VERIFIED" ? activeChild?.childId : undefined,
  );

  const hasChildren = children.length > 0;
  const isVerified = activeChild?.status === "VERIFIED";

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
            {/* Child-specific content */}
            <DoctorsSection />
            {hasChildren ? (
              isVerified ? (
                <>
                  <VerifiedChildView clinician={clinician} />
                </>
              ) : (
                <View>
                  {/* <View style={styles.doctorsWrapper}> */}

                  {/* </View> */}
                  <HasChildView />
                </View>
              )
            ) : (
              <EmptyChildView />
            )}
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
});
