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
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";

export default function DoctorConsultationScreen() {
  const router = useRouter();

  const handleScheduleMeeting = () => {
    // TODO: Navigate to scheduling
    console.log("Schedule meeting pressed");
  };

  const handleVideoCall = () => {
    // TODO: Start video call
    console.log("Video call pressed");
  };

  const handlePhoneCall = () => {
    // TODO: Start phone call
    console.log("Phone call pressed");
  };

  const handleChat = () => {
    router.push("/(app)/doctor-chat" as Href);
  };

  const handleBookMeeting = () => {
    router.push("/(app)/booking-select-doctor" as Href);
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
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Consultation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.doctorImageContainer}>
            <Image
              source={require("../../../../assets/docs/doc1.png")}
              style={styles.doctorImage}
              resizeMode="cover"
            />
          </View>

          <Text style={styles.doctorName}>Dr. Walter White</Text>
          <Text style={styles.doctorSpecialty}>Neurology specialist</Text>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Offline</Text>
          </View>
        </View>

        {/* Schedule Meeting Card */}
        <View style={styles.meetingCard}>
          <View style={styles.meetingInfo}>
            <Ionicons name="calendar-outline" size={24} color="#0C4A6E" />
            <View style={styles.meetingTextContainer}>
              <Text style={styles.meetingTitle}>Schedule Meeting</Text>
              <Text style={styles.meetingDays}>Mon, Tue, Wed, Thu</Text>
            </View>
          </View>

          <View style={styles.meetingActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleVideoCall}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam-outline" size={24} color="#0C4A6E" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handlePhoneCall}
              activeOpacity={0.7}
            >
              <Ionicons name="call-outline" size={24} color="#0C4A6E" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.primaryActionButton}
            onPress={handleBookMeeting}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={20} color={colors.white} />
            <Text style={styles.primaryActionButtonText}>Book Meeting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={handleChat}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0C4A6E" />
            <Text style={styles.secondaryActionButtonText}>
              Chat with Doctor
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recommended Doctors/Hospitals */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended</Text>

          {/* Ethio Tibeb */}
          <TouchableOpacity
            style={styles.recommendationCard}
            activeOpacity={0.7}
          >
            <View style={styles.recommendationIcon}>
              <Ionicons name="medical" size={28} color="#4A9FD8" />
            </View>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>Ethio Tibeb</Text>
              <Text style={styles.recommendationRole}>Expert Pediatrician</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#A0B8C8" />
          </TouchableOpacity>

          {/* Alert Comprehensive Specialized hospital 1 */}
          <TouchableOpacity
            style={styles.recommendationCard}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.recommendationIcon,
                { backgroundColor: "#E0F2F1" },
              ]}
            >
              <Ionicons name="business" size={28} color="#26A69A" />
            </View>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>
                Alert Comprehensive Specialized hospital
              </Text>
              <Text style={styles.recommendationRole}>MCH Director</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#A0B8C8" />
          </TouchableOpacity>

          {/* Alert Comprehensive Specialized hospital 2 */}
          <TouchableOpacity
            style={styles.recommendationCard}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.recommendationIcon,
                { backgroundColor: "#FFF9C4" },
              ]}
            >
              <Ionicons name="business" size={28} color="#F9A825" />
            </View>
            <View style={styles.recommendationInfo}>
              <Text style={styles.recommendationName}>
                Alert Comprehensive Specialized hospital
              </Text>
              <Text style={styles.recommendationRole}>MCH Director</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#A0B8C8" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xxl,
  },
  doctorImageContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#E8F0F5",
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  doctorImage: {
    width: "100%",
    height: "100%",
  },
  doctorName: {
    fontSize: 28,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  doctorSpecialty: {
    fontSize: typography.fontSize.md,
    color: "#A0B8C8",
    marginBottom: spacing.lg,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#9E9E9E",
  },
  statusText: {
    fontSize: typography.fontSize.sm,
    color: "#757575",
    fontWeight: typography.fontWeight.medium,
  },
  meetingCard: {
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.xxl,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  meetingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  meetingTextContainer: {
    marginLeft: spacing.md,
    flex: 1,
  },
  meetingTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  meetingDays: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  meetingActions: {
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "flex-end",
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonsContainer: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  primaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  primaryActionButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: "#0C4A6E",
  },
  secondaryActionButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  recommendationsSection: {
    paddingHorizontal: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.lg,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E3F2FD",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  recommendationInfo: {
    flex: 1,
  },
  recommendationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  recommendationRole: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
});
