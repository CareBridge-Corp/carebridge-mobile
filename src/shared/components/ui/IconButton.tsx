import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, shadows } from "../../theme";

type Variant = "ghost" | "filled" | "tinted";
type Size = "sm" | "md" | "lg";

interface IconButtonProps extends Omit<PressableProps, "style"> {
  icon: keyof typeof Ionicons.glyphMap;
  variant?: Variant;
  size?: Size;
  tint?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel: string;
}

const sizeMap: Record<Size, { box: number; icon: number }> = {
  sm: { box: 32, icon: 16 },
  md: { box: 40, icon: 20 },
  lg: { box: 48, icon: 24 },
};

/**
 * Compact circular icon-only button. Use for nav back/forward, kebab menus,
 * close buttons, language toggles.
 */
export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  tint,
  background,
  style,
  accessibilityLabel,
  ...rest
}: IconButtonProps) {
  const dims = sizeMap[size];

  const visualBg =
    background ??
    (variant === "filled"
      ? colors.primary
      : variant === "tinted"
        ? colors.surface
        : "transparent");

  const visualTint =
    tint ??
    (variant === "filled"
      ? colors.textInverse
      : variant === "tinted"
        ? colors.textPrimary
        : colors.textPrimary);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        {
          width: dims.box,
          height: dims.box,
          borderRadius: dims.box / 2,
          backgroundColor: visualBg,
        },
        variant === "tinted" && shadows.xs,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      <Ionicons name={icon} size={dims.icon} color={visualTint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
});
