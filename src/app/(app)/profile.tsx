import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLogout } from "../(auth)/hooks/useLogout";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useChildrenStore } from "./store/childrenStore";

export default function ProfileScreen() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { activeChild } = useChildrenStore();

  // Use the profile from our new profile feature hook/store
  const { data: profile } = useProfile();
  
  // Fetch clinician for the active child if available
  const { data: clinician } = useAssignedClinician(activeChild?.childId);

  console.log("Loaded profile:", profile);
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
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarLarge}>
              {profile?.profilePictureUrl ? (
                <Image
                  source={{ uri: profile?.profilePictureUrl }}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                />
              ) : (
                <Ionicons name="person" size={48} color={colors.white} />
              )}
            </View>
            <View style={styles.editAvatarBadge}>
              <Ionicons name="camera" size={14} color={colors.white} />
            </View>
          </View>

          <Text style={styles.userName}>
            {profile?.fullName ||
              `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()}
          </Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={colors.primary}
              style={{ marginRight: 4 }}
            />
            <Text style={styles.userRole}>
              {profile?.role?.toUpperCase() || "PATIENT"}
            </Text>
          </View>

          <Text style={styles.userEmail}>{profile?.email}</Text>
        </View>

        {/* Doctor Section (Conditional) */}
        {clinician && (
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>Assigned Clinician</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push({
                pathname: "/(app)/(doctor)/doctor-details",
                params: { childId: activeChild?.childId }
              } as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="medical" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>
                  {clinician.surname} {clinician.firstName} {clinician.lastName}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textLight }}>
                  {clinician.specializations[0]?.name || "Specialist"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.iconLight} />
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account settings</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/(app)/(parent)/update-profile" as any)}
            activeOpacity={0.7}
          >
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
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>General</Text>

          <TouchableOpacity style={styles.menuItem}>
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.textMedium}
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
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <Ionicons
                name="help-circle-outline"
                size={20}
                color={colors.textMedium}
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
            <View
              style={[
                styles.menuIconContainer,
                { backgroundColor: colors.borderLight },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={colors.textMedium}
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
  avatarWrapper: {
    marginTop: 0,
    marginBottom: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  editAvatarBadge: {
    position: "absolute",
    bottom: 8,
    right: -4,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF4FF", // Light blue background for the badge
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: 100, // Pill shape
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: "#D3E4F9",
  },
  userRole: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: 1,
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textLight,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
    marginTop: spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
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
    backgroundColor: "#FEF2F2", // very light red/pink for error backing
    borderWidth: 1,
    borderColor: "#FCC2D7",
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
  },
});
