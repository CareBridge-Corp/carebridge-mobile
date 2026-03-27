export * from "./borderRadius";
export * from "./colors";
export * from "./spacing";
export * from "./typography";

import { borderRadius } from "./borderRadius";
import { colors } from "./colors";
import { spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  typography,
  borderRadius,
};

export type Theme = typeof theme;
