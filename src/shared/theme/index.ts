export * from "./borderRadius";
export * from "./colors";
export * from "./motion";
export * from "./shadows";
export * from "./spacing";
export * from "./typography";

import { borderRadius } from "./borderRadius";
import { colors } from "./colors";
import { motion } from "./motion";
import { shadows } from "./shadows";
import { layout, spacing } from "./spacing";
import { typography } from "./typography";

export const theme = {
  colors,
  spacing,
  layout,
  typography,
  borderRadius,
  shadows,
  motion,
};

export type Theme = typeof theme;
