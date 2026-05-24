import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors } from "../../theme";
import { Text } from "./Text";

type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: Size;
  /** Show a small numeric badge in the top-right (e.g. child count). */
  badgeCount?: number;
  onPress?: PressableProps["onPress"];
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

const sizeMap: Record<Size, { box: number; iconSize: number; fontSize: number }> = {
  xs: { box: 28, iconSize: 14, fontSize: 11 },
  sm: { box: 36, iconSize: 18, fontSize: 13 },
  md: { box: 44, iconSize: 22, fontSize: 15 },
  lg: { box: 56, iconSize: 28, fontSize: 18 },
  xl: { box: 80, iconSize: 40, fontSize: 24 },
};

function getInitials(name?: string) {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0]?.charAt(0).toUpperCase() ?? "";
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar primitive. Renders image, initials, or a fallback person icon.
 */
export function Avatar({
  uri,
  name,
  size = "md",
  badgeCount,
  onPress,
  accessibilityLabel,
  style,
}: AvatarProps) {
  const dims = sizeMap[size];
  const initials = getInitials(name);

  const inner = uri ? (
    <Image
      source={{ uri }}
      style={{ width: dims.box, height: dims.box, borderRadius: dims.box / 2 }}
    />
  ) : initials ? (
    <Text
      variant="body"
      tone="brand"
      weight="semibold"
      style={{ fontSize: dims.fontSize }}
    >
      {initials}
    </Text>
  ) : (
    <Ionicons name="person" size={dims.iconSize} color={colors.primary} />
  );

  const container = (
    <View
      style={[
        styles.base,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
        },
        style,
      ]}
    >
      {inner}
      {badgeCount && badgeCount > 0 ? (
        <View style={styles.badge}>
          <Text variant="label" style={styles.badgeText}>
            {badgeCount > 9 ? "9+" : String(badgeCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? name ?? "Profile"}
        onPress={onPress}
        hitSlop={6}
        style={({ pressed }) => [pressed && styles.pressed]}
      >
        {container}
      </Pressable>
    );
  }

  return container;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  pressed: {
    opacity: 0.8,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 9,
  },
});
