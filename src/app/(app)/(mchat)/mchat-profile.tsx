import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { ChildSelectorModal } from "../components/ChildSelectorModal";
import { useChildScreenings } from "../hooks/useScreenings";
import { useChildrenStore } from "../store/childrenStore";

export default function MChatProfileScreen() {
  const router = useRouter();
  const { activeChild, children } = useChildrenStore();
  const [childSelectorVisible, setChildSelectorVisible] = React.useState(false);

  const { data: screeningsData, isLoading } = useChildScreenings(
    activeChild?.childId,
  );

  const screenings = screeningsData?.screenings || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "#10B981";
      case "UNDER_REVIEW":
        return "#F59E0B";
      case "PENDING":
        return "#6B7280";
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETE":
        return "Complete";
      case "UNDER_REVIEW":
        return "Under Review";
      case "PENDING":
        return "Pending";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Screening Profile</Text>

        {/* Child Profile Selector */}
        <TouchableOpacity
          style={styles.childSelector}
          onPress={() => setChildSelectorVisible(true)}
        >
          {activeChild?.profilePictureUrl ? (
            <Image
              source={{ uri: activeChild.profilePictureUrl }}
              style={styles.childAvatar}
            />
          ) : (
            <View style={styles.childAvatarPlaceholder}>
              <Ionicons name="person" size={20} color="#0C4A6E" />
            </View>
          )}
          {children.length > 1 && (
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={childSelectorVisible}
        onClose={() => setChildSelectorVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.infoCard}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="clipboard-outline"
              size={32}
              color={colors.primary}
            />
          </View>
          <Text style={styles.cardTitle}>M-CHAT-R/F Profile</Text>
          <Text style={styles.cardSubtitle}>
            Review your previously submitted developmental screenings and track
            your child's milestones.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Screenings</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0C4A6E" />
            <Text style={styles.loadingText}>Loading screenings...</Text>
          </View>
        ) : screenings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="folder-open-outline" size={48} color="#C0D4E0" />
            <Text style={styles.emptyStateTitle}>No screenings yet</Text>
            <Text style={styles.emptyStateSub}>
              Complete an M-CHAT-R/F screening to see the results here.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(app)/(mchat)/mchat-privacy" as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Start New Screening</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {screenings.map((screening) => (
              <TouchableOpacity
                key={screening.screeningId}
                style={styles.screeningCard}
                activeOpacity={0.7}
                onPress={() => {
                  router.push(
                    `/(app)/(mchat)/screening-detail?id=${screening.screeningId}` as any,
                  );
                }}
              >
                <View style={styles.screeningHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(screening.status) },
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatusText(screening.status)}
                    </Text>
                  </View>
                  <Text style={styles.screeningDate}>
                    {formatDate(screening.date)}
                  </Text>
                </View>

                <View style={styles.screeningFooter}>
                  <Text style={styles.viewDetailsText}>
                    Tap to view details
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="#5A7A8F" />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  childSelector: {
    position: "relative",
  },
  childAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  childAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  childCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#0C4A6E",
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.white,
  },
  childCountText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.xxl,
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F0F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    textAlign: "center",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.md,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C0D4E0",
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#5A7A8F",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSub: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: "#0C4A6E",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginTop: spacing.md,
  },
  screeningCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xl,
    marginBottom: spacing.md,
    shadowColor: "#0C4A6E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  screeningHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.xl,
  },
  statusText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: "uppercase",
  },
  screeningDate: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    fontWeight: typography.fontWeight.medium,
  },
  screeningFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E8F0F5",
  },
  viewDetailsText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    fontWeight: typography.fontWeight.medium,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F5",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  secondaryButtonText: {
    color: "#0C4A6E",
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
