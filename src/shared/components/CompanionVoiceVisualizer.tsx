import React, { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
} from "react-native";
import { colors } from "../theme";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );

    return () => subscription.remove();
  }, []);

  return reducedMotion;
}

export function CompanionLoadingAnimation() {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.78)).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      rotation.setValue(0);
      pulse.setValue(1);
      return;
    }

    const rotationAnimation = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 360,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.78,
          duration: 360,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );

    rotationAnimation.start();
    pulseAnimation.start();
    return () => {
      rotationAnimation.stop();
      pulseAnimation.stop();
    };
  }, [pulse, reducedMotion, rotation]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.loader} accessibilityElementsHidden>
      <Animated.View style={[styles.orbit, { transform: [{ rotate }] }]}>
        <View style={[styles.orbitDot, styles.orbitDotTop]} />
        <View style={[styles.orbitDot, styles.orbitDotRight]} />
        <View style={[styles.orbitDot, styles.orbitDotBottom]} />
      </Animated.View>
      <Animated.View style={[styles.loaderCore, { transform: [{ scale: pulse }] }]} />
    </View>
  );
}

const BAR_SCALES = [0.58, 0.92, 0.72, 1, 0.68, 0.88, 0.52];

interface CompanionWaveformProps {
  speaking?: boolean;
  muted?: boolean;
}

export function CompanionWaveform({
  speaking = false,
  muted = false,
}: CompanionWaveformProps) {
  const values = useRef(BAR_SCALES.map(() => new Animated.Value(0.28))).current;
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion || muted) {
      values.forEach((value, index) => {
        value.stopAnimation();
        value.setValue(muted ? 0.16 : BAR_SCALES[index] * 0.62);
      });
      return;
    }

    const animations = values.map((value, index) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 45),
          Animated.timing(value, {
            toValue: BAR_SCALES[index],
            duration: speaking ? 180 + index * 18 : 260 + index * 22,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0.24 + (index % 3) * 0.05,
            duration: speaking ? 210 + index * 14 : 330 + index * 18,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    animations.forEach((animation) => animation.start());
    return () => animations.forEach((animation) => animation.stop());
  }, [muted, reducedMotion, speaking, values]);

  return (
    <View style={styles.waveform} accessibilityElementsHidden>
      {values.map((value, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            muted && styles.waveBarMuted,
            { transform: [{ scaleY: value }] },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  orbit: {
    ...StyleSheet.absoluteFillObject,
  },
  orbitDot: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  orbitDotTop: {
    top: 1,
    left: 13,
  },
  orbitDotRight: {
    right: 2,
    bottom: 6,
    opacity: 0.72,
  },
  orbitDotBottom: {
    left: 3,
    bottom: 5,
    opacity: 0.42,
  },
  loaderCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  waveform: {
    height: 28,
    minWidth: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  waveBar: {
    width: 3,
    height: 24,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  waveBarMuted: {
    backgroundColor: colors.iconMuted,
  },
});
