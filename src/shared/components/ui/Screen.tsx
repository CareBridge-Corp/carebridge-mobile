import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors, layout } from "../../theme";

interface ScreenProps {
  children: React.ReactNode;
  /** When true, content is wrapped in a ScrollView. Default: false. */
  scroll?: boolean;
  /** Background color of the safe area + content. Defaults to surfaceMuted. */
  background?: string;
  /** Apply standard horizontal padding (20px). Default: true. */
  padded?: boolean;
  /** Which safe-area edges to apply. Default: ["top","left","right"]. */
  edges?: Edge[];
  /** StatusBar style. Default: dark-content. */
  statusBarStyle?: "default" | "light-content" | "dark-content";
  /** Disable keyboard-avoiding wrapper (rare; needed on forms). */
  disableKeyboardAvoiding?: boolean;
  /** Pass-through scroll props when `scroll` is true. */
  scrollProps?: ScrollViewProps;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

/**
 * Unified screen wrapper. Handles:
 *   - Safe-area insets (no more `paddingTop: 60` magic numbers)
 *   - Status bar style + background sync
 *   - Optional scroll container
 *   - Keyboard-avoiding for forms
 */
export function Screen({
  children,
  scroll = false,
  background = colors.surfaceMuted,
  padded = true,
  edges = ["top", "left", "right"],
  statusBarStyle = "dark-content",
  disableKeyboardAvoiding = false,
  scrollProps,
  style,
  contentStyle,
}: ScreenProps) {
  const content = (
    <View
      style={[
        styles.content,
        padded && styles.padded,
        contentStyle,
      ]}
    >
      {children}
    </View>
  );

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        contentStyle,
      ]}
      {...scrollProps}
    >
      {children}
    </ScrollView>
  ) : (
    content
  );

  const wrapped = disableKeyboardAvoiding ? (
    body
  ) : (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.flex}
    >
      {body}
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={[styles.container, { backgroundColor: background }, style]}
    >
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={background}
        translucent={false}
      />
      {wrapped}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: layout.tabBarHeight + 24,
  },
  padded: {
    paddingHorizontal: layout.screenPadding,
  },
});
