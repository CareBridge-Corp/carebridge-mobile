import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { borderRadius, colors, shadows, spacing } from "../../theme";

type Variant = "flat" | "elevated" | "outlined" | "tinted";

interface CardProps {
  children: React.ReactNode;
  variant?: Variant;
  padding?: keyof typeof spacing | number;
  style?: StyleProp<ViewStyle>;
  /** When provided, the card becomes pressable. */
  onPress?: PressableProps["onPress"];
  accessibilityLabel?: string;
}

const variantStyles: Record<Variant, ViewStyle> = {
  flat: {
    backgroundColor: colors.surface,
  },
  elevated: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  outlined: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tinted: {
    backgroundColor: colors.surfaceTint,
  },
};

/**
 * Card container primitive. Use instead of stylesheet duplication
 * for grouped content.
 */
export function Card({
  children,
  variant = "elevated",
  padding = "lg",
  style,
  onPress,
  accessibilityLabel,
}: CardProps) {
  const resolvedPadding =
    typeof padding === "number"
      ? padding
      : (spacing as Record<string, number>)[padding] ?? spacing.lg;

  const baseStyle = [
    styles.base,
    variantStyles[variant],
    { padding: resolvedPadding },
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          baseStyle,
          pressed && styles.pressed,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.xl,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
