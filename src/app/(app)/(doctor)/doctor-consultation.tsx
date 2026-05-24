import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";
import {
  useCreateAppointment,
  useDoctorAppointments,
} from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useClinicianStore } from "../store/clinicianStore";

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
      month: d.toLocaleDateString("en-US", { month: "short" }),
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
        "Missing information",
        "Please ensure all details are selected.",
      );
      return;
    }

    const payload: any = {
      appointment_date: selectedDate,
      start_time: selectedTime,
      meeting_type: meetingType,
      parent_id: profile.id,
      child_id: childId,
      schedule_id: "schedule-uuid-placeholder",
    };

    createAppointment.mutate(
      { doctorId: clinician.userId, payload },
      {
        onSuccess: () => {
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

  if (!clinician) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.center}>
          <Text variant="title2" align="center">
            Doctor information not found
          </Text>
          <Button
            label="Go back"
            variant="ghost"
            onPress={() => router.back()}
            style={{ marginTop: spacing[4] }}
          />
        </View>
      </Screen>
    );
  }

  const fullName =
    `${clinician.surname ?? ""} ${clinician.firstName} ${clinician.lastName}`.trim();
  const isActive = clinician.status === "ACTIVE";

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title="Doctor consultation" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Avatar
            uri={clinician.profilePictureUrl}
            name={fullName}
            size="xl"
          />
          <Text variant="display" align="center" style={styles.name}>
            {fullName}
          </Text>
          <Text variant="body" tone="secondary" align="center">
            {clinician.specializations[0]?.name || "Specialist"}
          </Text>
          <Badge
            label={clinician.status}
            tone={isActive ? "success" : "neutral"}
            icon={isActive ? "checkmark-circle" : "ellipse"}
            style={styles.statusBadge}
          />
        </View>

        <SectionHeader title="Consultation type" />
        <View style={styles.typeRow}>
          {(
            [
              { value: "in_person", label: "In person", icon: "business" },
              { value: "video", label: "Video call", icon: "videocam" },
            ] as const
          ).map((option) => {
            const active = meetingType === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => setMeetingType(option.value)}
              >
                <Ionicons
                  name={option.icon as any}
                  size={20}
                  color={active ? colors.textInverse : colors.primary}
                />
                <Text
                  variant="bodyMedium"
                  weight="semibold"
                  style={{
                    color: active ? colors.textInverse : colors.textPrimary,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Select a day" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesScroll}
        >
          {dates.map((date) => {
            const isActiveDate = selectedDate === date.id;
            return (
              <Pressable
                key={date.id}
                style={[
                  styles.dateCard,
                  isActiveDate && styles.dateCardActive,
                ]}
                onPress={() => setSelectedDate(date.id)}
              >
                <Text
                  variant="caption"
                  tone={isActiveDate ? "inverse" : "secondary"}
                >
                  {date.month.toUpperCase()}
                </Text>
                <Text
                  variant="title1"
                  style={{
                    color: isActiveDate
                      ? colors.textInverse
                      : colors.textPrimary,
                  }}
                >
                  {date.dayNumber}
                </Text>
                <Text
                  variant="caption"
                  tone={isActiveDate ? "inverse" : "secondary"}
                >
                  {date.dayName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader title="Available times" />
        {isAppointmentsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="caption" tone="secondary">
              Fetching available slots...
            </Text>
          </View>
        ) : (
          <View style={styles.timeGrid}>
            {TIME_SLOTS.map((time) => {
              const active = selectedTime === time;
              const booked = bookedSlots.includes(time);

              return (
                <Pressable
                  key={time}
                  style={[
                    styles.timeSlot,
                    active && styles.timeSlotActive,
                    booked && styles.timeSlotBooked,
                  ]}
                  onPress={() => !booked && setSelectedTime(time)}
                  disabled={booked}
                >
                  <Text
                    variant="bodyMedium"
                    weight="semibold"
                    style={{
                      color: booked
                        ? colors.textTertiary
                        : active
                          ? colors.textInverse
                          : colors.textPrimary,
                      textDecorationLine: booked ? "line-through" : "none",
                    }}
                  >
                    {time}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Card variant="tinted" padding="md" style={styles.tipCard}>
          <View style={styles.tipRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.primary}
            />
            <Text variant="bodySmall" tone="secondary" style={{ flex: 1 }}>
              Booked slots are unavailable. Choose a free time to confirm your
              appointment.
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={
            createAppointment.isPending
              ? "Confirming..."
              : "Confirm appointment"
          }
          loading={createAppointment.isPending}
          onPress={handleBookMeeting}
          leadingIcon="calendar-outline"
          disabled={!selectedDate || !selectedTime}
        />
        <Button
          label="Message doctor"
          variant="secondary"
          leadingIcon="chatbubble-outline"
          onPress={() => router.push("/(app)/doctor-chat" as Href)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: layout.screenPadding,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  hero: {
    alignItems: "center",
    paddingVertical: spacing[4],
    gap: spacing[1],
  },
  name: {
    marginTop: spacing[2],
  },
  statusBadge: {
    marginTop: spacing[2],
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[2],
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  datesScroll: {
    paddingRight: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[2],
  },
  dateCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    alignItems: "center",
    minWidth: 72,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing[1],
  },
  dateCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loadingBox: {
    paddingVertical: spacing[6],
    alignItems: "center",
    gap: spacing[2],
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  timeSlot: {
    minWidth: 88,
    paddingVertical: spacing[3],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    flexGrow: 1,
  },
  timeSlotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeSlotBooked: {
    backgroundColor: colors.surfaceSunken,
    borderColor: colors.borderSubtle,
    opacity: 0.7,
  },
  tipCard: {
    marginTop: spacing[2],
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[2],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    gap: spacing[2],
  },
});
