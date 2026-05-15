import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing } from "../../../../shared/theme";
import { RecommendedGames } from "./components/RecommendedGames";
import { SectionHeader } from "./components/SectionHeader";
import { VerifiedBadge } from "./components/VerifiedBadge";

export default function ActivityDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock data - would normally come from store/params
  const activityData = {
    title: params.title || "Speech and Language Therapy",
    description:
      params.description ||
      "Lorem ipsum dolor sit amet consectetur adipiscing elit Ut et massa mi. Aliquam in hendrerit urna. Pellentesque sit amet sapien fringilla, mattis ligula consectetur, ultrices mauris. Maecenas vitae mattis tellus. Vestibulum, non suscipit magna interdum eu. Curabitur pellentesque nibh",
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Navbar */}
      <View style={styles.navbar}>
        <Text style={styles.navbarTitle}>{activityData.title}</Text>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#0C4A6E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Placeholder */}
        <View style={styles.videoContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={40} color="#BFDBFE" />
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <SectionHeader title="Description" />
          <Text
            style={styles.descriptionText}
            numberOfLines={isExpanded ? undefined : 6}
          >
            {activityData.description}
          </Text>
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.moreLink}>{isExpanded ? "Less" : "More"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Verification Info */}
        <View style={styles.section}>
          <VerifiedBadge label="Verified by who" />
          <VerifiedBadge label="Verified by who" />
          <VerifiedBadge label="Verified by who" />
        </View>

        <View style={styles.divider} />

        {/* Recommended Games */}
        <View style={styles.section}>
          <SectionHeader title="Recommended Games" />
          <RecommendedGames />
        </View>
      </ScrollView>

      {/* Sticky Bottom Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextButton} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  navbarTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0C4A6E",
    flex: 1,
    marginRight: spacing.md,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 120,
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#F1F5F9",
    borderRadius: borderRadius.xxl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 6,
  },
  section: {
    marginBottom: spacing.xl,
  },
  descriptionText: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  moreLink: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0C4A6E",
    marginTop: 8,
    textDecorationLine: "underline",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: spacing.xl,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xxl,
    paddingBottom: 40,
    paddingTop: spacing.lg,
    backgroundColor: colors.white,
  },
  nextButton: {
    backgroundColor: "#083344",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.xl,
    borderRadius: 40,
    gap: 8,
  },
  nextButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
