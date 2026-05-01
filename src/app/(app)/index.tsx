import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthStore } from "../(auth)/store/authStore";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function AppHomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  const handleUploadVideo = () => {
    // TODO: Implement video upload
    console.log("Upload video pressed");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>{user?.firstName || "Guest"}</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Content Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>
            Fill out the information and{"\n"}start the treatment
          </Text>

          {/* Upload Video Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleUploadVideo}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>Upload Video</Text>
              <Text style={styles.actionCardSubtitle}>
                Lorem ipsum doler situm amet and{"\n"}his Your information is
                safe with.
              </Text>

              <View style={styles.watchGuideButton}>
                <View style={styles.playIconCircle}>
                  <Ionicons name="play" size={20} color={colors.white} />
                </View>
                <Text style={styles.watchGuideText}>Watch Guide</Text>
              </View>
            </View>

            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={20} color="#0C4A6E" />
            </View>
          </TouchableOpacity>

          {/* M-chat Card */}
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleMChat}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <Text style={styles.actionCardTitle}>M-chat</Text>
              <Text style={styles.actionCardSubtitle}>
                Lorem ipsum doler situm amet and{"\n"}his Your information is
                safe with.
              </Text>

              <View style={styles.verifiedBadge}>
                <View style={styles.whoIcon}>
                  <Ionicons name="shield-checkmark" size={24} color="#4A9FD8" />
                </View>
                <View>
                  <Text style={styles.verifiedTitle}>Verified by who</Text>
                  <Text style={styles.verifiedSubtitle}>
                    Your information is safe with us
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.arrowCircle}>
              <Ionicons name="arrow-forward" size={20} color="#0C4A6E" />
            </View>
          </TouchableOpacity>

          {/* Feature Cards */}
          <View style={styles.placeholderRow}>
            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => router.push("/(app)/schedule" as Href)}
            >
              <View style={styles.featureIconContainer}>
                <Ionicons name="calendar" size={32} color="#0C4A6E" />
              </View>
              <Text style={styles.featureCardTitle}>My Schedule</Text>
              <Text style={styles.featureCardSubtitle}>View appointments</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.featureCard}
              activeOpacity={0.7}
              onPress={() => router.push("/(app)/chat" as Href)}
            >
              <View style={styles.featureIconContainer}>
                <Ionicons name="chatbubbles" size={32} color="#0C4A6E" />
              </View>
              <Text style={styles.featureCardTitle}>Messages</Text>
              <Text style={styles.featureCardSubtitle}>Chat with doctors</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
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
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  mainCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xxl,
    lineHeight: 36,
  },
  actionCard: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.lg,
    position: "relative",
  },
  actionCardContent: {
    paddingRight: 50,
  },
  actionCardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
  },
  actionCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
    marginBottom: spacing.xl,
  },
  watchGuideButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  playIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
  },
  watchGuideText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  whoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  verifiedSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  arrowCircle: {
    position: "absolute",
    top: spacing.xxl,
    right: spacing.xxl,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderRow: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  featureCard: {
    flex: 1,
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
  },
  featureIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  featureCardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
    textAlign: "center",
  },
  featureCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    textAlign: "center",
  },
});
