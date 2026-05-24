import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { borderRadius, colors } from "../../theme";

interface ProgressBarProps {
  value: number;
  max?: number;
  /** Track color. Default: primaryMuted. */
  trackColor?: string;
  /** Fill color. Default: primary. */
  fillColor?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  max = 100,
  trackColor = colors.primaryMuted,
  fillColor = colors.primary,
  height = 6,
  style,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <View
      style={[
        styles.track,
        { backgroundColor: trackColor, height, borderRadius: height / 2 },
        style,
      ]}
      accessibilityRole="progressbar"
      accessibilityValue={{ now: pct, min: 0, max: 100 }}
    >
      <View
        style={[
          styles.fill,
          {
            width: `${pct}%`,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: "hidden",
    borderRadius: borderRadius.full,
    width: "100%",
  },
  fill: {
    height: "100%",
  },
});
