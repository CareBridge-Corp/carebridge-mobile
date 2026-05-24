import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import { Text } from "./Text";

interface SectionHeaderProps {
  title: string;
  /** Optional eyebrow text shown above the title. */
  eyebrow?: string;
  /** Optional descriptive text shown below the title. */
  subtitle?: string;
  /** Optional small action label on the right. */
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: any;
}

/**
 * Lightweight section title. Use between grouped content (e.g. above ListRow groups).
 */
export function SectionHeader({
  title,
  eyebrow,
  subtitle,
  action,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.titleGroup}>
        {eyebrow ? (
          <Text variant="label" tone="secondary" style={styles.eyebrow}>
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="title3">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ? (
        <Pressable
          onPress={action.onPress}
          hitSlop={10}
          style={({ pressed }) => [pressed && styles.actionPressed]}
        >
          <Text variant="bodySmall" weight="semibold" style={{ color: colors.primary }}>
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: spacing[3],
  },
  titleGroup: {
    flex: 1,
  },
  eyebrow: {
    marginBottom: 2,
  },
  subtitle: {
    marginTop: spacing[1],
  },
  actionPressed: {
    opacity: 0.6,
  },
});
