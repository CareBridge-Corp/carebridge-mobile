import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Text } from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";

interface HomeHeaderProps {
  greeting: string;
  primaryName: string;
  /** Subtitle (e.g. "Caring for Aman") */
  subtitle?: string;
  avatarUri?: string | null;
  badgeCount?: number;
  onAvatarPress: () => void;
}

/**
 * Standardised header used across Home, Schedule, Chat top areas.
 * Replaces the per-screen greeting blocks with the same look.
 */
export function HomeHeader({
  greeting,
  primaryName,
  subtitle,
  avatarUri,
  badgeCount,
  onAvatarPress,
}: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        <Text variant="bodySmall" tone="secondary">
          {greeting}
        </Text>
        <Pressable
          onPress={onAvatarPress}
          style={({ pressed }) => [styles.nameRow, pressed && styles.pressed]}
          hitSlop={4}
        >
          <Text variant="title1" numberOfLines={1}>
            {primaryName}
          </Text>
          {badgeCount && badgeCount > 1 ? (
            <Ionicons
              name="chevron-down"
              size={18}
              color={colors.iconMuted}
              style={styles.caret}
            />
          ) : null}
        </Pressable>
        {subtitle ? (
          <Text variant="bodySmall" tone="tertiary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <Avatar
        uri={avatarUri}
        name={primaryName}
        size="md"
        badgeCount={badgeCount}
        onPress={onAvatarPress}
        accessibilityLabel="Switch child"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    gap: spacing[3],
  },
  text: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  caret: {
    marginLeft: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  subtitle: {
    marginTop: 2,
  },
});
