import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLogout } from "../(auth)/hooks/useLogout";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function ProfileScreen() {
  const router = useRouter();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.replace("/(auth)/welcome");
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={48} color={colors.text} />
          </View>
          <Text style={styles.userName}>Abenezer</Text>
          <Text style={styles.userEmail}>abenezer@example.com</Text>

          <TouchableOpacity style={styles.editProfileButton}>
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>Personal Information</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="heart-outline" size={20} color={colors.primary} />
            </View>
            <Text style={styles.menuText}>Favorites</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>Appointments</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="notifications-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>Help & Support</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={styles.menuText}>About</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.iconLight}
            />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={logoutMutation.isPending}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.cardBackground,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  userEmail: {
    fontSize: typography.fontSize.sm,
    color: colors.textMedium,
    marginBottom: spacing.lg,
  },
  editProfileButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xxl,
  },
  editProfileText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  menuSection: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xs,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cardLightBlue,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },
});
