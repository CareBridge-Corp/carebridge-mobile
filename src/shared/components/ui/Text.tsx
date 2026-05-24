import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";
import { colors, typography, type TextVariant } from "../../theme";

type Tone =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "brand"
  | "danger"
  | "success"
  | "warning";

const toneColor: Record<Tone, string> = {
  primary: colors.textPrimary,
  secondary: colors.textSecondary,
  tertiary: colors.textTertiary,
  inverse: colors.textInverse,
  brand: colors.textBrand,
  danger: colors.error,
  success: colors.success,
  warning: colors.warning,
};

type Align = "auto" | "left" | "right" | "center" | "justify";

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: Tone;
  align?: Align;
  weight?: "regular" | "medium" | "semibold" | "bold";
  /** Truncate to a fixed number of lines with ellipsis. */
  numberOfLines?: number;
}

/**
 * Typed Text primitive. Always renders with a real Inter font family
 * (avoids the broken system-font fallback caused by missing font files).
 *
 * Usage:
 *   <Text variant="title1">Hello</Text>
 *   <Text variant="body" tone="secondary">Subtitle</Text>
 */
export function Text({
  variant = "body",
  tone = "primary",
  align,
  weight,
  style,
  ...rest
}: TextProps) {
  const base = typography.textStyle[variant];
  const familyOverride = weight ? { fontFamily: typography.fontFamily[weight] } : null;

  return (
    <RNText
      allowFontScaling
      maxFontSizeMultiplier={1.4}
      style={[
        base,
        familyOverride,
        { color: toneColor[tone] },
        align ? { textAlign: align } : null,
        style,
      ]}
      {...rest}
    />
  );
}
