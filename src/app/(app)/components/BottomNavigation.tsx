import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from "../../../shared/theme";

type NavItem = "home" | "wallet" | "chat" | "profile";

interface BottomNavigationProps {
  activeTab?: NavItem;
  onTabPress?: (tab: NavItem) => void;
}

export default function BottomNavigation({
  activeTab = "home",
  onTabPress,
}: BottomNavigationProps) {
  const handlePress = (tab: NavItem) => {
    onTabPress?.(tab);
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
        style={styles.navItem}
        onPress={() => handlePress("wallet")}
      >
        <Ionicons name="wallet-outline" size={24} color={colors.iconLight} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress("chat")}
      >
        <Ionicons
          name="chatbubble-outline"
          size={24}
          color={colors.iconLight}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => handlePress("profile")}
      >
        <Ionicons name="person-outline" size={24} color={colors.iconLight} />
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
