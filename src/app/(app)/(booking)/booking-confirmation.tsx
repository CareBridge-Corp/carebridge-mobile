import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { useCreateAppointment } from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useBookingStore } from "../store/bookingStore";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { doctor, slot, meetingType, childId, reset } = useBookingStore();
  const { data: profile } = useProfile();
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!doctor || !slot || !profile?.userId) {
      Alert.alert("Missing details", "Please complete the booking steps first.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createAppointment.mutateAsync({
        doctorId: doctor.userId,
        payload: {
          schedule_id: slot.scheduleId,
          parent_id: profile.userId,
          child_id: childId ?? undefined,
          appointment_date: slot.date,
          start_time: slot.startTime,
          meeting_type: meetingType,
        },
      });

      reset();
      Alert.alert("Success", "Appointment booked successfully.", [
        {
          text: "OK",
          onPress: () => router.replace("/(app)/schedule" as Href),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Booking failed", error?.message ?? "Unable to create appointment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirmation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Review your appointment details</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Doctor</Text>
          <Text style={styles.valueText}>
            {doctor
              ? `${doctor.surname ?? ""} ${doctor.firstName} ${doctor.lastName}`.trim()
              : "Not selected"}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Date & Time</Text>
          <Text style={styles.valueText}>
            {slot
              ? `${slot.date} at ${slot.startTime}`
              : "Not selected"}
          </Text>
          <Text style={styles.helperText}>
            Meeting type: {meetingType === "online" ? "Online" : "In person"}
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#0C4A6E" />
          <Text style={styles.infoBoxText}>
            Your clinician will confirm the appointment. You will receive a notification when it is updated.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color={colors.white} />
              <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  backButton: { padding: spacing.sm },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  scrollView: { flex: 1 },
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
    marginBottom: spacing.sm,
  },
  valueText: { fontSize: 16, color: "#0C4A6E", fontWeight: "600" },
  helperText: { fontSize: 14, color: "#94A3B8", marginTop: 6 },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.xxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoBoxText: { flex: 1, fontSize: 14, color: "#5A7A8F", lineHeight: 22 },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
