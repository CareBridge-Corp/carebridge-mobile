import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { borderRadius, colors, layout, shadows, spacing } from "../../theme";
import { Text } from "./Text";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style" | "children"> {
  label: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

const heightForSize: Record<Size, number> = {
  sm: layout.buttonHeightSm,
  md: layout.buttonHeight,
  lg: 56,
};

const paddingForSize: Record<Size, number> = {
  sm: spacing[4],
  md: spacing[5],
  lg: spacing[6],
};

/**
 * Primary interaction primitive. Replaces ad-hoc TouchableOpacity buttons.
 *
 * Variants:
 *   primary     — filled brand (default CTA)
 *   secondary   — outlined neutral (cancel, alternate)
 *   ghost       — text-only (inline actions)
 *   destructive — filled red (delete, logout)
 */
export function Button({
  label,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth = true,
  leadingIcon,
  trailingIcon,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const visual = getVariantStyles(variant, isDisabled);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      android_ripple={
        variant === "ghost" ? undefined : { color: "rgba(255,255,255,0.18)" }
      }
      style={({ pressed }) => [
        styles.base,
        {
          height: heightForSize[size],
          paddingHorizontal: paddingForSize[size],
          backgroundColor: visual.bg,
          borderColor: visual.border,
          borderWidth: visual.borderWidth,
        },
        fullWidth && styles.fullWidth,
        variant === "primary" && !isDisabled && shadows.sm,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={visual.fg} />
      ) : (
        <View style={styles.contentRow}>
          {leadingIcon ? (
            <Ionicons
              name={leadingIcon}
              size={size === "sm" ? 16 : 18}
              color={visual.fg}
            />
          ) : null}
          <Text
            variant={size === "lg" ? "buttonLarge" : "button"}
            style={{ color: visual.fg }}
          >
            {label}
          </Text>
          {trailingIcon ? (
            <Ionicons
              name={trailingIcon}
              size={size === "sm" ? 16 : 18}
              color={visual.fg}
            />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function getVariantStyles(variant: Variant, disabled: boolean) {
  if (disabled) {
    return {
      bg: variant === "ghost" ? "transparent" : colors.surfaceSunken,
      fg: colors.textTertiary,
      border: colors.borderSubtle,
      borderWidth: variant === "secondary" ? 1 : 0,
    };
  }

  switch (variant) {
    case "primary":
      return {
        bg: colors.primary,
        fg: colors.textInverse,
        border: colors.primary,
        borderWidth: 0,
      };
    case "secondary":
      return {
        bg: colors.surface,
        fg: colors.textPrimary,
        border: colors.border,
        borderWidth: 1,
      };
    case "ghost":
      return {
        bg: "transparent",
        fg: colors.primary,
        border: "transparent",
        borderWidth: 0,
      };
    case "destructive":
      return {
        bg: colors.error,
        fg: colors.textInverse,
        border: colors.error,
        borderWidth: 0,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  fullWidth: {
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
});
