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
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";

export default function BookingConfirmationScreen() {
  const router = useRouter();

  const handleConfirm = () => {
    // TODO: Submit booking
    router.replace("/(app)/schedule" as Href);
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
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressStepCompleted]}>
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </View>
        <View style={[styles.progressLine, styles.progressLineActive]} />
        <View style={[styles.progressStep, styles.progressStepCompleted]}>
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </View>
        <View style={[styles.progressLine, styles.progressLineActive]} />
        <View style={[styles.progressStep, styles.progressStepActive]}>
          <Text style={styles.progressStepTextActive}>3</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Review your appointment details</Text>

        {/* Doctor Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor</Text>
          <View style={styles.doctorInfo}>
            <Image
              source={require("../../../../assets/docs/doc1.png")}
              style={styles.doctorImage}
            />
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. Walter White</Text>
              <Text style={styles.doctorSpecialty}>Neurology specialist</Text>
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>4.8</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Date & Time Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar-outline" size={24} color="#0C4A6E" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>Wednesday, Dec 17, 2024</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="time-outline" size={24} color="#0C4A6E" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>10:00 AM - 10:30 AM</Text>
            </View>
          </View>
        </View>

        {/* Consultation Type Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Consultation Type</Text>
          <View style={styles.consultationOptions}>
            <TouchableOpacity
              style={styles.consultationOption}
              activeOpacity={0.7}
            >
              <Ionicons name="videocam" size={24} color="#0C4A6E" />
              <Text style={styles.consultationOptionText}>Video Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.consultationOption,
                styles.consultationOptionSelected,
              ]}
              activeOpacity={0.7}
            >
              <Ionicons name="location" size={24} color={colors.white} />
              <Text
                style={[
                  styles.consultationOptionText,
                  styles.consultationOptionTextSelected,
                ]}
              >
                In-Person
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Additional Notes (Optional)</Text>
          <View style={styles.notesInput}>
            <Text style={styles.notesPlaceholder}>
              Add any specific concerns or questions...
            </Text>
          </View>
        </View>

        {/* Important Info */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#0C4A6E" />
          <Text style={styles.infoBoxText}>
            Please arrive 10 minutes early for your appointment. Bring any
            relevant medical records or test results.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={24} color={colors.white} />
          <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
        </TouchableOpacity>
      </View>
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
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: "#0C4A6E",
  },
  progressStepCompleted: {
    backgroundColor: "#10B981",
  },
  progressStepTextActive: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.sm,
  },
  progressLineActive: {
    backgroundColor: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: "#5A7A8F",
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.md,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: spacing.md,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  consultationOptions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  consultationOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F5",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  consultationOptionSelected: {
    backgroundColor: "#0C4A6E",
  },
  consultationOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  consultationOptionTextSelected: {
    color: colors.white,
  },
  notesInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 80,
  },
  notesPlaceholder: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.xxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  infoBoxText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
