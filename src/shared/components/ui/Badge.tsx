import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { borderRadius, colors, spacing } from "../../theme";
import { Text } from "./Text";

type Tone = "neutral" | "brand" | "success" | "warning" | "danger" | "info";
type Size = "sm" | "md";

interface BadgeProps {
  label: string;
  tone?: Tone;
  size?: Size;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Use the bolder, filled style. */
  solid?: boolean;
  style?: StyleProp<ViewStyle>;
}

const toneStyles: Record<
  Tone,
  { bg: string; bgSolid: string; fg: string; fgSolid: string }
> = {
  neutral: {
    bg: colors.surfaceSunken,
    bgSolid: colors.textPrimary,
    fg: colors.textSecondary,
    fgSolid: colors.textInverse,
  },
  brand: {
    bg: colors.primaryMuted,
    bgSolid: colors.primary,
    fg: colors.primary,
    fgSolid: colors.textInverse,
  },
  success: {
    bg: colors.successBackground,
    bgSolid: colors.success,
    fg: colors.success,
    fgSolid: colors.textInverse,
  },
  warning: {
    bg: colors.warningBackground,
    bgSolid: colors.warning,
    fg: colors.warning,
    fgSolid: colors.textInverse,
  },
  danger: {
    bg: colors.errorBackground,
    bgSolid: colors.error,
    fg: colors.error,
    fgSolid: colors.textInverse,
  },
  info: {
    bg: colors.infoBackground,
    bgSolid: colors.info,
    fg: colors.info,
    fgSolid: colors.textInverse,
  },
};

/**
 * Compact pill for status, counts, or category labels.
 */
export function Badge({
  label,
  tone = "neutral",
  size = "sm",
  icon,
  solid = false,
  style,
}: BadgeProps) {
  const palette = toneStyles[tone];
  const bg = solid ? palette.bgSolid : palette.bg;
  const fg = solid ? palette.fgSolid : palette.fg;

  return (
    <View
      style={[
        styles.base,
        size === "md" ? styles.md : styles.sm,
        { backgroundColor: bg },
        style,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={size === "md" ? 14 : 12}
          color={fg}
          style={styles.icon}
        />
      ) : null}
      <Text variant="label" style={{ color: fg }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: borderRadius.full,
  },
  sm: {
    paddingHorizontal: spacing[2],
    paddingVertical: 4,
  },
  md: {
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
  },
  icon: {
    marginRight: 4,
  },
});
