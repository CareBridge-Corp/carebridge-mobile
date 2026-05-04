import React from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonLoader } from "../../../shared/components/SkeletonLoader";
import { borderRadius, colors, spacing } from "../../../shared/theme";

export function HomeSkeletonView() {
  return (
    <View style={styles.mainCard}>
      {/* Title Skeletons */}
      <SkeletonLoader style={styles.titleSkeletonTop} />
      <SkeletonLoader style={styles.titleSkeletonBottom} />

      {/* Action Cards Skeletons */}
      <View style={styles.actionCard}>
        <View style={styles.actionCardContent}>
          <SkeletonLoader style={styles.cardTitleSkeleton} />
          <SkeletonLoader style={styles.cardSubtitleSkeleton} />
          <SkeletonLoader style={styles.cardSubtitleSkeletonShort} />

          <View style={styles.watchGuideButton}>
            <SkeletonLoader style={styles.playIconCircle} />
            <SkeletonLoader style={styles.watchGuideTextSkeleton} />
          </View>
        </View>
        <SkeletonLoader style={styles.arrowCircle} />
      </View>

      <View style={styles.actionCard}>
        <View style={styles.actionCardContent}>
          <SkeletonLoader style={styles.cardTitleSkeleton} />
          <SkeletonLoader style={styles.cardSubtitleSkeleton} />
          <SkeletonLoader style={styles.cardSubtitleSkeletonShort} />

          <View style={styles.watchGuideButton}>
            <SkeletonLoader style={styles.playIconCircle} />
            <View>
              <SkeletonLoader style={styles.verifiedTitleSkeleton} />
              <SkeletonLoader style={styles.verifiedSubtitleSkeleton} />
            </View>
          </View>
        </View>
        <SkeletonLoader style={styles.arrowCircle} />
      </View>

      {/* Feature Cards Skeletons */}
      <View style={styles.placeholderRow}>
        <View style={styles.featureCard}>
          <SkeletonLoader style={styles.featureIconContainer} />
          <SkeletonLoader style={styles.featureCardTitleSkeleton} />
          <SkeletonLoader style={styles.featureCardSubtitleSkeleton} />
        </View>

        <View style={styles.featureCard}>
          <SkeletonLoader style={styles.featureIconContainer} />
          <SkeletonLoader style={styles.featureCardTitleSkeleton} />
          <SkeletonLoader style={styles.featureCardSubtitleSkeleton} />
        </View>
      </View>
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
  titleSkeletonTop: {
    height: 28,
    width: "80%",
    marginBottom: spacing.xs,
    borderRadius: spacing.sm,
  },
  titleSkeletonBottom: {
    height: 28,
    width: "60%",
    marginBottom: spacing.xxl,
    borderRadius: spacing.sm,
  },
  actionCard: {
    backgroundColor: "#F4F8FA", // Softer skeleton bg for card
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    position: "relative",
  },
  actionCardContent: {
    paddingRight: 50,
  },
  cardTitleSkeleton: {
    height: 20,
    width: "35%",
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
  },
  cardSubtitleSkeleton: {
    height: 14,
    width: "90%",
    marginBottom: 6,
    borderRadius: spacing.sm,
  },
  cardSubtitleSkeletonShort: {
    height: 14,
    width: "60%",
    marginBottom: spacing.xl,
    borderRadius: spacing.sm,
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
  },
  watchGuideTextSkeleton: {
    height: 16,
    width: 100,
    borderRadius: spacing.sm,
  },
  verifiedTitleSkeleton: {
    height: 14,
    width: 110,
    marginBottom: 6,
    borderRadius: spacing.sm,
  },
  verifiedSubtitleSkeleton: {
    height: 12,
    width: 160,
    borderRadius: spacing.sm,
  },
  arrowCircle: {
    position: "absolute",
    top: spacing.xxl,
    right: spacing.xxl,
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#F4F8FA",
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
    marginBottom: spacing.md,
  },
  featureCardTitleSkeleton: {
    height: 16,
    width: "70%",
    marginBottom: spacing.sm,
    borderRadius: spacing.sm,
  },
  featureCardSubtitleSkeleton: {
    height: 12,
    width: "90%",
    borderRadius: spacing.sm,
  },
});
