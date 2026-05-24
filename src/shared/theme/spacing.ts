/**
 * 4px-based spacing scale.
 *
 * Legacy named keys (xs, sm, md...) are kept for backward compatibility.
 * Prefer the numeric scale below in new code — it reads more naturally
 * with the underlying 4px grid (`spacing[6]` = 24px).
 */
export const spacing = {
  // Legacy named scale
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  massive: 48,

  // Numeric 4px scale
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
  12: 48,
  14: 56,
  16: 64,
} as const;

/** Standard layout constants used by the Screen + ScreenHeader primitives. */
export const layout = {
  screenPadding: 20,
  sectionGap: 24,
  cardPadding: 16,
  headerHeight: 56,
  tabBarHeight: 64,
  buttonHeight: 52,
  buttonHeightSm: 40,
  inputHeight: 52,
  listRowMinHeight: 56,
  touchTargetMin: 44,
} as const;
