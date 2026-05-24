import { Easing } from "react-native";

/**
 * Motion tokens. Keep interactions short and decisive.
 * Anything > 350ms feels sluggish on mobile.
 */
export const motion = {
  duration: {
    instant: 80,
    fast: 150,
    base: 200,
    slow: 280,
    slower: 360,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    emphasized: Easing.bezier(0.3, 0, 0, 1),
    decelerate: Easing.bezier(0, 0, 0.2, 1),
    accelerate: Easing.bezier(0.4, 0, 1, 1),
  },
  pressScale: 0.97,
} as const;
