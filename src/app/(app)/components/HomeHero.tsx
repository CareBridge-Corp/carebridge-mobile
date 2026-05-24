import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Text,
} from "../../../shared/components/ui";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from "../../../shared/theme";

interface HeroStat {
  label: string;
  value: string;
}

interface HomeHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional progress (0-100). */
  progress?: number;
  /** Optional status badge. */
  badge?: {
    label: string;
    tone: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
    icon?: keyof typeof Ionicons.glyphMap;
  };
  /** Primary CTA. */
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
    leadingIcon?: keyof typeof Ionicons.glyphMap;
    trailingIcon?: keyof typeof Ionicons.glyphMap;
  };
  /** Optional secondary action. */
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  /** Optional inline stats row. */
  stats?: HeroStat[];
  /** Pictogram / icon shown top-right. */
  illustrationIcon?: keyof typeof Ionicons.glyphMap;
}

/**
 * The single primary card on Home. Driven by the user's lifecycle stage
 * (no children → unverified → screening → review → therapy).
 *
 * Only ONE HomeHero is rendered at a time. Everything else on Home is
 * supporting context.
 */
export function HomeHero({
  eyebrow,
  title,
  description,
  progress,
  badge,
  primaryAction,
  secondaryAction,
  stats,
  illustrationIcon,
}: HomeHeroProps) {
  return (
    <Card variant="elevated" padding="lg" style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          {eyebrow ? (
            <Text variant="label" tone="brand" style={styles.eyebrow}>
              {eyebrow}
            </Text>
          ) : null}
          <Text variant="title1">{title}</Text>
        </View>

        {illustrationIcon ? (
          <View style={styles.illustrationWrapper}>
            <Ionicons
              name={illustrationIcon}
              size={28}
              color={colors.primary}
            />
          </View>
        ) : null}
      </View>

      {badge ? (
        <Badge
          label={badge.label}
          tone={badge.tone}
          icon={badge.icon}
          style={styles.badge}
        />
      ) : null}

      {description ? (
        <Text variant="body" tone="secondary" style={styles.description}>
          {description}
        </Text>
      ) : null}

      {typeof progress === "number" ? (
        <View style={styles.progress}>
          <ProgressBar value={progress} />
          <Text variant="caption" tone="secondary" style={styles.progressLabel}>
            {progress}% complete
          </Text>
        </View>
      ) : null}

      {stats && stats.length > 0 ? (
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <React.Fragment key={stat.label}>
              {idx > 0 ? <View style={styles.statDivider} /> : null}
              <View style={styles.stat}>
                <Text variant="title2" tone="brand">
                  {stat.value}
                </Text>
                <Text variant="caption" tone="secondary">
                  {stat.label}
                </Text>
              </View>
            </React.Fragment>
          ))}
        </View>
      ) : null}

      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {primaryAction ? (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              loading={primaryAction.loading}
              leadingIcon={primaryAction.leadingIcon}
              trailingIcon={primaryAction.trailingIcon ?? "arrow-forward"}
            />
          ) : null}
          {secondaryAction ? (
            <Pressable
              onPress={secondaryAction.onPress}
              style={({ pressed }) => [
                styles.secondary,
                pressed && styles.secondaryPressed,
              ]}
            >
              <Text variant="bodyMedium" tone="brand">
                {secondaryAction.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    ...shadows.sm,
    borderRadius: borderRadius.xl,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    marginBottom: spacing[1],
  },
  illustrationWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    marginTop: spacing[3],
  },
  description: {
    marginTop: spacing[3],
  },
  progress: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  progressLabel: {
    textAlign: "right",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing[4],
    paddingTop: spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderSubtle,
  },
  actions: {
    marginTop: spacing[5],
    gap: spacing[3],
  },
  secondary: {
    alignItems: "center",
    paddingVertical: spacing[2],
  },
  secondaryPressed: {
    opacity: 0.6,
  },
});
