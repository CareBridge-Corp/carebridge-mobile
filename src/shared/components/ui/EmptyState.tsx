import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";
import { colors, spacing } from "../../theme";
import { Button } from "./Button";
import { Text } from "./Text";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  primaryAction?: {
    label: string;
    onPress: () => void;
    loading?: boolean;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
}

/**
 * Unified empty state. Use anywhere a list, screen, or section
 * has no content yet.
 */
export function EmptyState({
  icon = "document-text-outline",
  title,
  description,
  primaryAction,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>

      <Text variant="title2" align="center" style={styles.title}>
        {title}
      </Text>

      {description ? (
        <Text
          variant="body"
          tone="secondary"
          align="center"
          style={styles.description}
        >
          {description}
        </Text>
      ) : null}

      {(primaryAction || secondaryAction) && (
        <View style={styles.actions}>
          {primaryAction ? (
            <Button
              label={primaryAction.label}
              onPress={primaryAction.onPress}
              loading={primaryAction.loading}
            />
          ) : null}
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              variant="ghost"
              onPress={secondaryAction.onPress}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[10],
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[5],
  },
  title: {
    marginBottom: spacing[2],
  },
  description: {
    marginBottom: spacing[6],
    maxWidth: 320,
  },
  actions: {
    width: "100%",
    maxWidth: 320,
    gap: spacing[2],
  },
});
