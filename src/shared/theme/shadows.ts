import { Platform, type ViewStyle } from "react-native";

/**
 * Elevation presets for both iOS (shadow*) and Android (elevation).
 * Keep these subtle — healthcare apps should feel calm, not floaty.
 */

type Shadow = Pick<
  ViewStyle,
  "shadowColor" | "shadowOffset" | "shadowOpacity" | "shadowRadius" | "elevation"
>;

const make = (
  opacity: number,
  radius: number,
  y: number,
  elevation: number,
): Shadow => ({
  shadowColor: "#0F172A",
  shadowOffset: { width: 0, height: y },
  shadowOpacity: Platform.OS === "ios" ? opacity : 0,
  shadowRadius: radius,
  elevation: Platform.OS === "android" ? elevation : 0,
});

export const shadows = {
  none: make(0, 0, 0, 0),
  xs: make(0.04, 2, 1, 1),
  sm: make(0.06, 4, 2, 2),
  md: make(0.08, 8, 4, 4),
  lg: make(0.12, 16, 8, 8),
  xl: make(0.16, 24, 12, 12),
} as const;

export type ShadowToken = keyof typeof shadows;
