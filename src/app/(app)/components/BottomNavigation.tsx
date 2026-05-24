import { Ionicons } from "@expo/vector-icons";
import { Href, usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";

type NavItem = "home" | "schedule" | "chat" | "profile";

interface TabConfig {
  key: NavItem;
  label: string;
  icon: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  iconFilled: keyof typeof import("@expo/vector-icons/Ionicons").default.glyphMap;
  path: string;
}

const TABS: TabConfig[] = [
  { key: "home", label: "Home", icon: "home-outline", iconFilled: "home", path: "/" },
  {
    key: "schedule",
    label: "Schedule",
    icon: "calendar-outline",
    iconFilled: "calendar",
    path: "/schedule",
  },
  {
    key: "chat",
    label: "Chat",
    icon: "chatbubble-outline",
    iconFilled: "chatbubble",
    path: "/chat",
  },
  {
    key: "profile",
    label: "Profile",
    icon: "person-outline",
    iconFilled: "person",
    path: "/profile",
  },
];

/**
 * Pathnames where the tab bar should be hidden. These are immersive flows
 * (forms, questionnaires, chat threads, payment) where the tab bar competes
 * with the primary on-screen action.
 *
 * Order matters slightly — more specific matches first.
 */
const IMMERSIVE_PATH_FRAGMENTS = [
  "/mchat-",
  "/screening-detail",
  "/verify",
  "/create-child",
  "/update-profile",
  "/booking-",
  "/payment",
  "/doctor-chat",
  "/doctor-details",
  "/doctor-consultation",
  "/activity-detail",
  "/growth-journey",
];

/**
 * Persistent bottom tab bar. Only renders on the four root tab routes.
 */
export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isImmersive = useMemo(
    () => IMMERSIVE_PATH_FRAGMENTS.some((fragment) => pathname.includes(fragment)),
    [pathname],
  );

  if (isImmersive) {
    return null;
  }

  const activeTab: NavItem = pathname.includes("/schedule")
    ? "schedule"
    : pathname.includes("/chat")
      ? "chat"
      : pathname.includes("/profile")
        ? "profile"
        : "home";

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, spacing[3]) },
      ]}
    >
      <View style={styles.bar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
              onPress={() => router.push(tab.path as Href)}
              hitSlop={6}
              style={({ pressed }) => [
                styles.tab,
                pressed && styles.tabPressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.iconContainerActive,
                ]}
              >
                <Ionicons
                  name={isActive ? tab.iconFilled : tab.icon}
                  size={22}
                  color={isActive ? colors.primary : colors.navInactiveTint}
                />
              </View>
              <Text
                variant="label"
                style={[
                  styles.label,
                  { color: isActive ? colors.primary : colors.navInactiveTint },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingTop: spacing[2],
    paddingHorizontal: spacing[3],
    ...shadows.md,
  },
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "stretch",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[1],
    gap: 2,
    minHeight: 48,
  },
  tabPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 36,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  iconContainerActive: {
    backgroundColor: colors.navActiveBackground,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
});
