import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from "../../../shared/theme";

type NavItem = "home" | "schedule" | "chat" | "profile";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const getActiveTab = (): NavItem => {
    if (pathname.includes("/schedule")) return "schedule";
    if (pathname.includes("/chat")) return "chat";
    if (pathname.includes("/profile")) return "profile";
    return "home";
  };

  const activeTab = getActiveTab();

  const handlePress = (tab: NavItem) => {
    if (tab === "home") {
      router.push("/");
    } else if (tab === "schedule") {
      router.push("/schedule");
    } else if (tab === "chat") {
      router.push("/chat");
    } else if (tab === "profile") {
      router.push("/profile");
    }
  };

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navItem, activeTab === "home" && styles.navItemActive]}
        onPress={() => handlePress("home")}
      >
        <Ionicons
          name={activeTab === "home" ? "home" : "home-outline"}
          size={24}
          color={activeTab === "home" ? colors.primary : colors.iconLight}
        />
        {activeTab === "home" && <Text style={styles.navTextActive}>Home</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          activeTab === "schedule" && styles.navItemActive,
        ]}
        onPress={() => handlePress("schedule")}
      >
        <Ionicons
          name={activeTab === "schedule" ? "calendar" : "calendar-outline"}
          size={24}
          color={activeTab === "schedule" ? colors.primary : colors.iconLight}
        />
        {activeTab === "schedule" && (
          <Text style={styles.navTextActive}>Schedule</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navItem, activeTab === "chat" && styles.navItemActive]}
        onPress={() => handlePress("chat")}
      >
        <Ionicons
          name={activeTab === "chat" ? "chatbubble" : "chatbubble-outline"}
          size={24}
          color={activeTab === "chat" ? colors.primary : colors.iconLight}
        />
        {activeTab === "chat" && <Text style={styles.navTextActive}>Chat</Text>}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.navItem,
          activeTab === "profile" && styles.navItemActive,
        ]}
        onPress={() => handlePress("profile")}
      >
        <Ionicons
          name={activeTab === "profile" ? "person" : "person-outline"}
          size={24}
          color={activeTab === "profile" ? colors.primary : colors.iconLight}
        />
        {activeTab === "profile" && (
          <Text style={styles.navTextActive}>Profile</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxl,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  navItem: {
    padding: spacing.md,
    justifyContent: "center",
    alignItems: "center",
  },
  navItemActive: {
    flexDirection: "row",
    backgroundColor: colors.navActiveBackground,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  navTextActive: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
});
