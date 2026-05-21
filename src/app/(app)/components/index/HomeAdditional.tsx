import { borderRadius, colors, spacing, typography } from "@/shared/theme";
import { Ionicons } from "@expo/vector-icons";
import { Href, router } from "expo-router";
import { t } from "i18next";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeAdditional() {
  return (
    <View style={styles.container}>
      <View>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => {}}
          activeOpacity={0.7}
        >
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardTitle}>{t("home.uploadVideo")}</Text>
            <Text style={styles.actionCardSubtitle}>{t("home.infoSafe")}</Text>

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
            <Text style={styles.featureCardSubtitle}>View appointments</Text>
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
            <Text style={styles.featureCardSubtitle}>Chat with doctors</Text>
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
              Speech therapy Phase 1 Fill out the information and start the
              treatment Fill out the information and start the treatment
            </Text>
          </View>
          <View style={styles.resourceCard}>
            <Text style={styles.resourceCategory}>Speech therapy</Text>
            <Text style={styles.resourceTitle} numberOfLines={4}>
              Speech therapy Phase 2 Next steps in communication improvement
            </Text>
          </View>
        </ScrollView>
      </View>

      {/* Sensory Games */}
      <View style={styles.gamesContainer}>
        <Text style={styles.sectionTitle}>{t("home.trySensoryGames")}</Text>
        <View style={styles.gamesRow}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={styles.gamePlaceholder} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  scrollView: {
    flex: 1,
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
});
