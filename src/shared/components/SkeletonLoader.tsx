import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, ViewStyle } from "react-native";

interface SkeletonLoaderProps {
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({ style }: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  return (
    <Animated.View
      style={[styles.skeleton, style, { opacity: animatedValue }]}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#C0D4E0", // Using a muted brand matching tint
    borderRadius: 8,
  },
});
