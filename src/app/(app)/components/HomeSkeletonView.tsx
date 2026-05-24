import React from "react";
import { StyleSheet, View } from "react-native";
import { SkeletonLoader } from "../../../shared/components/SkeletonLoader";
import { borderRadius, colors, spacing } from "../../../shared/theme";

/**
 * Skeleton placeholder for the Home screen while data loads.
 * Mirrors the actual HomeHero card layout.
 */
export function HomeSkeletonView() {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <SkeletonLoader style={styles.eyebrow} />
            <SkeletonLoader style={styles.titleLine1} />
            <SkeletonLoader style={styles.titleLine2} />
          </View>
          <SkeletonLoader style={styles.illustration} />
        </View>

        <SkeletonLoader style={styles.descriptionLine1} />
        <SkeletonLoader style={styles.descriptionLine2} />

        <SkeletonLoader style={styles.button} />
      </View>

      <SkeletonLoader style={styles.secondaryCard} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[5],
    gap: spacing[5],
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  eyebrow: {
    height: 10,
    width: "30%",
    marginBottom: spacing[2],
    borderRadius: 6,
  },
  titleLine1: {
    height: 22,
    width: "70%",
    marginBottom: spacing[1],
    borderRadius: 8,
  },
  titleLine2: {
    height: 22,
    width: "50%",
    borderRadius: 8,
  },
  illustration: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  descriptionLine1: {
    height: 14,
    width: "100%",
    marginTop: spacing[2],
    borderRadius: 6,
  },
  descriptionLine2: {
    height: 14,
    width: "85%",
    borderRadius: 6,
  },
  button: {
    height: 52,
    borderRadius: 9999,
    marginTop: spacing[3],
  },
  secondaryCard: {
    height: 84,
    borderRadius: borderRadius.xl,
  },
});
