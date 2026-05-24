/**
 * Color tokens for CareBridge.
 *
 * Two layers:
 *   1. RAW PALETTE — fixed brand + neutral ramps. Do not use directly in UI.
 *   2. SEMANTIC TOKENS — what components should reference. Re-skinnable.
 *
 * Legacy aliases at the bottom are kept so older screens keep working
 * while we migrate to semantic tokens.
 */

const palette = {
  // Brand blues
  brand900: "#0A3A56",
  brand800: "#0C4A6E",
  brand700: "#125E89",
  brand500: "#3B82A8",
  brand200: "#C8D8E4",
  brand100: "#D4E4ED",
  brand50: "#E8F1F6",
  brand25: "#F4F8FA",

  // Neutrals
  neutral0: "#FFFFFF",
  neutral50: "#F8FAFC",
  neutral75: "#F1F5F9",
  neutral100: "#EEF2F6",
  neutral200: "#E2E8F0",
  neutral300: "#CBD5E1",
  neutral400: "#94A3B8",
  neutral500: "#64748B",
  neutral600: "#475569",
  neutral700: "#334155",
  neutral800: "#1E293B",
  neutral900: "#0F172A",

  // Status
  success600: "#059669",
  success100: "#D1FAE5",
  warning600: "#D97706",
  warning100: "#FEF3C7",
  error600: "#DC2626",
  error100: "#FEE2E2",
  info600: "#0284C7",
  info100: "#E0F2FE",

  black: "#000000",
  transparent: "transparent",
};

export const colors = {
  // ─── Semantic tokens (preferred) ──────────────────────────────

  // Brand
  primary: palette.brand800,
  primaryHover: palette.brand900,
  primaryMuted: palette.brand50,
  primarySubtle: palette.brand25,

  // Surfaces
  surface: palette.neutral0,
  surfaceMuted: palette.neutral50,
  surfaceTint: palette.brand25,
  surfaceSunken: palette.neutral75,
  surfaceInverse: palette.brand800,
  backgroundBlue: palette.brand200,
  cardBackground: palette.brand100,
  cardLightBlue: palette.brand50,

  // Text
  textPrimary: "#1A365D",
  textSecondary: palette.neutral500,
  textTertiary: palette.neutral400,
  textInverse: palette.neutral0,
  textLink: palette.brand800,
  textBrand: palette.brand800,

  // Borders
  border: palette.neutral200,
  borderStrong: palette.neutral300,
  borderSubtle: palette.neutral100,
  borderFocus: palette.brand800,

  // Inputs
  inputBackground: "#F0F4F8",
  inputBackgroundFocus: palette.neutral0,

  // Icons
  icon: palette.neutral500,
  iconMuted: palette.neutral400,
  iconBrand: palette.brand800,

  // Navigation
  navActiveBackground: palette.brand50,
  navActiveTint: palette.brand800,
  navInactiveTint: palette.neutral400,

  // Status (semantic)
  success: palette.success600,
  successBackground: palette.success100,
  warning: palette.warning600,
  warningBackground: palette.warning100,
  error: palette.error600,
  errorBackground: palette.error100,
  info: palette.info600,
  infoBackground: palette.info100,

  // Overlay & utility
  overlay: "rgba(15, 23, 42, 0.55)",
  scrim: "rgba(15, 23, 42, 0.25)",
  white: palette.neutral0,
  black: palette.black,
  transparent: palette.transparent,

  // ─── Legacy aliases (kept for backward compatibility) ─────────
  primaryDark: palette.brand900,
  background: palette.neutral50,
  backgroundLight: palette.neutral0,
  text: "#1A365D",
  textLight: palette.neutral500,
  textMedium: palette.neutral600,
  iconLight: palette.neutral400,
  borderLight: palette.neutral100,
};

export const palettes = palette;
