import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, layout, spacing } from "../../theme";
import { Text } from "./Text";

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  /** Show back button. Default: true. */
  showBack?: boolean;
  onBack?: () => void;
  /** Optional right-side action (icon button). */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  /** Custom right-side element (overrides rightIcon). */
  rightSlot?: React.ReactNode;
  /** Visual style. Default: "default". */
  variant?: "default" | "transparent";
}

/**
 * Consistent page header. Replaces the per-screen
 * "back arrow + Text + right action" pattern.
 */
export function ScreenHeader({
  title,
  subtitle,
  showBack = true,
  onBack,
  rightIcon,
  onRightPress,
  rightSlot,
  variant = "default",
}: ScreenHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) return onBack();
    if (router.canGoBack()) router.back();
  };

  return (
    <View
      style={[
        styles.container,
        variant === "transparent" && styles.transparent,
      ]}
    >
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={handleBack}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.center}>
        {title ? (
          <Text variant="title2" align="center" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" tone="secondary" align="center" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>
        {rightSlot ??
          (rightIcon ? (
            <Pressable
              accessibilityRole="button"
              onPress={onRightPress}
              hitSlop={10}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed,
              ]}
            >
              <Ionicons name={rightIcon} size={22} color={colors.textPrimary} />
            </Pressable>
          ) : null)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.headerHeight,
    paddingVertical: spacing[2],
  },
  transparent: {
    backgroundColor: "transparent",
  },
  side: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  sideRight: {
    alignItems: "flex-end",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    backgroundColor: colors.surfaceSunken,
  },
});
