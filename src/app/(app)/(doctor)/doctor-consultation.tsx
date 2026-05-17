import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import {
  useCreateAppointment,
  useDoctorAppointments,
} from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useClinicianStore } from "../store/clinicianStore";

// Mock data for dates and times
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      id: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      fullDate: d,
    });
  }
  return dates;
};

const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
];

export default function DoctorConsultationScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const clinician = useClinicianStore((state) =>
    childId ? state.cliniciansByChild[childId] : null,
  );

  const { data: profile } = useProfile();
  const createAppointment = useCreateAppointment();
  const { data: appointments, isLoading: isAppointmentsLoading } =
    useDoctorAppointments(clinician?.userId);

  const dates = useState(generateDates())[0];
  const [selectedDate, setSelectedDate] = useState(dates[0].id);
  const [selectedTime, setSelectedTime] = useState("");
  const [meetingType, setMeetingType] = useState<"in_person" | "video">(
    "in_person",
  );

  const bookedSlots = useMemo(() => {
    if (!appointments) return [];
    return appointments
      .filter(
        (app) =>
          app.appointmentDate === selectedDate && app.status !== "cancelled",
      )
      .map((app) => app.startTime);
  }, [appointments, selectedDate]);

  const handleBookMeeting = () => {
    if (!selectedDate || !selectedTime || !clinician || !profile?.id) {
      Alert.alert(
        "Missing Information",
        "Please ensure all details are selected.",
      );
      return;
    }

    const payload = {
      appointment_date: selectedDate,
      start_time: selectedTime,
      meeting_type: meetingType,
      parent_id: profile.id,
      child_id: childId,
      schedule_id: "schedule-uuid-placeholder", // In a real flow, you'll pick this from doctor's schedules
    };

    createAppointment.mutate(
      { doctorId: clinician.userId, payload },
      {
        onSuccess: (data) => {
          Alert.alert("Success", "Appointment successfully booked!", [
            { text: "OK", onPress: () => router.back() },
          ]);
        },
        onError: (err: any) => {
          Alert.alert(
            "Error",
            err.response?.data?.message ||
              err.message ||
              "Failed to book appointment",
          );
        },
      },
    );
  };

  const handleChat = () => {
    router.push("/(app)/doctor-chat" as Href);
  };

  if (!clinician) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: "#0C4A6E" }}>Doctor information not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
        >
          <Text style={{ color: "#4A9FD8" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            {clinician.profilePictureUrl ? (
              <Image
                source={{ uri: clinician.profilePictureUrl }}
                style={styles.doctorImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={[
                  styles.doctorImage,
                  {
                    backgroundColor: colors.primary,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <Ionicons name="person" size={60} color={colors.white} />
              </View>
            )}
          </View>

          <Text style={styles.doctorName}>
            {clinician.surname} {clinician.firstName} {clinician.lastName}
          </Text>
          <Text style={styles.doctorSpecialty}>
            {clinician.specializations[0]?.name || "Specialist"}
          </Text>

          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    clinician.status === "ACTIVE" ? "#10B981" : "#9E9E9E",
                },
              ]}
            />
            <Text style={styles.statusText}>{clinician.status}</Text>
          </View>
        </View>

        {/* Consultation Types */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                meetingType === "in_person" && styles.typeOptionActive,
              ]}
              onPress={() => setMeetingType("in_person")}
            >
              <Ionicons
                name="business"
                size={24}
                color={meetingType === "in_person" ? colors.white : "#0C4A6E"}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  meetingType === "in_person" && styles.typeOptionTextActive,
                ]}
              >
                In Person
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                meetingType === "video" && styles.typeOptionActive,
              ]}
              onPress={() => setMeetingType("video")}
            >
              <Ionicons
                name="videocam"
                size={24}
                color={meetingType === "video" ? colors.white : "#0C4A6E"}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  meetingType === "video" && styles.typeOptionTextActive,
                ]}
              >
                Video Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesScrollContent}
          >
            {dates.map((date) => {
              const isActive = selectedDate === date.id;
              return (
                <TouchableOpacity
                  key={date.id}
                  style={[styles.dateCard, isActive && styles.dateCardActive]}
                  onPress={() => setSelectedDate(date.id)}
                >
                  <Text
                    style={[styles.dayName, isActive && styles.dateTextActive]}
                  >
                    {date.dayName}
                  </Text>
                  <Text
                    style={[
                      styles.dayNumber,
                      isActive && styles.dateTextActive,
                    ]}
                  >
                    {date.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timeGrid}>
            {isAppointmentsLoading ? (
              <View
                style={{
                  flex: 1,
                  paddingVertical: spacing.xl,
                  alignItems: "center",
                }}
              >
                <ActivityIndicator color={colors.primary} size="small" />
                <Text
                  style={{ marginTop: spacing.sm, color: colors.textLight }}
                >
                  Fetching available slots...
                </Text>
              </View>
            ) : (
              TIME_SLOTS.map((time) => {
                const isActive = selectedTime === time;
                const isBooked = bookedSlots.includes(time);

                return (
                  <TouchableOpacity
                    key={time}
                    style={[
                      styles.timeSlot,
                      isActive && styles.timeSlotActive,
                      isBooked && styles.timeSlotBooked,
                    ]}
                    onPress={() => setSelectedTime(time)}
                    disabled={isBooked}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        isActive && styles.timeSlotTextActive,
                        isBooked && styles.timeSlotTextBooked,
                      ]}
                    >
                      {time}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[
              styles.primaryActionButton,
              (!selectedDate || !selectedTime || createAppointment.isPending) &&
                styles.buttonDisabled,
            ]}
            onPress={handleBookMeeting}
            activeOpacity={0.8}
            disabled={
              !selectedDate || !selectedTime || createAppointment.isPending
            }
          >
            {createAppointment.isPending ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Ionicons
                name="calendar-outline"
                size={20}
                color={colors.white}
              />
            )}
            <Text style={styles.primaryActionButtonText}>
              {createAppointment.isPending
                ? "Confirming..."
                : "Confirm Appointment"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryActionButton}
            onPress={handleChat}
            activeOpacity={0.8}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#0C4A6E" />
            <Text style={styles.secondaryActionButtonText}>Message Doctor</Text>
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
  sectionContainer: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  typeSelector: {
    flexDirection: "row",
    gap: spacing.md,
  },
  typeOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: spacing.sm,
  },
  typeOptionActive: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  typeOptionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  typeOptionTextActive: {
    color: colors.white,
  },
  datesScrollContent: {
    paddingRight: spacing.xxl,
    gap: spacing.sm,
  },
  dateCard: {
    width: 64,
    height: 80,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  dateCardActive: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  dayName: {
    fontSize: typography.fontSize.sm,
    color: "#64748B",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  dateTextActive: {
    color: colors.white,
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlot: {
    width: "30%",
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  timeSlotActive: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  timeSlotText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  timeSlotTextActive: {
    color: colors.white,
  },
  timeSlotBooked: {
    backgroundColor: "#F1F5F9",
    borderColor: "#E2E8F0",
    opacity: 0.6,
  },
  timeSlotTextBooked: {
    color: "#94A3B8",
    textDecorationLine: "line-through",
  },
  buttonDisabled: {
    opacity: 0.5,
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
