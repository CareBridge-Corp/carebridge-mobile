import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { useAvailableSlots } from "../hooks/useAppointments";
import { useBookingStore } from "../store/bookingStore";

function buildCalendarDates(days = 14) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      id: date.toISOString().split("T")[0],
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: date.getDate(),
      month: date.toLocaleDateString("en-US", { month: "short" }),
    });
  }
  return dates;
}

export default function BookingSelectDateScreen() {
  const router = useRouter();
  const { doctor, meetingType, setSlot, setMeetingType } = useBookingStore();
  const dates = useMemo(() => buildCalendarDates(), []);
  const [selectedDate, setSelectedDate] = useState(dates[0]?.id ?? "");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  const { data: slots = [], isLoading } = useAvailableSlots(
    doctor?.userId,
    selectedDate,
    meetingType,
  );

  const handleNext = () => {
    const slot = slots.find(
      (item) => `${item.schedule_id}-${item.start_time}` === selectedSlotKey,
    );
    if (!slot) return;

    setSlot({
      scheduleId: slot.schedule_id,
      date: selectedDate,
      startTime: slot.start_time.slice(0, 5),
      endTime: slot.end_time.slice(0, 5),
    });
    router.push("/(app)/booking-confirmation" as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        >
          {dates.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dateCard,
                selectedDate === item.id && styles.dateCardSelected,
              ]}
              onPress={() => {
                setSelectedDate(item.id);
                setSelectedSlotKey(null);
              }}
            >
              <Text
                style={[
                  styles.dateMonth,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.month}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.dayNumber}
              </Text>
              <Text
                style={[
                  styles.dateDay,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.dayName}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Consultation Type</Text>
        <View style={styles.typeRow}>
          {(["in_person", "online"] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeChip,
                meetingType === type && styles.typeChipSelected,
              ]}
              onPress={() => {
                setMeetingType(type);
                setSelectedSlotKey(null);
              }}
            >
              <Text
                style={[
                  styles.typeChipText,
                  meetingType === type && styles.typeChipTextSelected,
                ]}
              >
                {type === "in_person" ? "In Person" : "Online"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Available Times</Text>
        {isLoading ? (
          <ActivityIndicator color="#0C4A6E" style={{ marginVertical: 24 }} />
        ) : slots.length === 0 ? (
          <Text style={styles.emptyText}>No available slots for this date.</Text>
        ) : (
          <View style={styles.timeSlotsContainer}>
            {slots.map((slot) => {
              const key = `${slot.schedule_id}-${slot.start_time}`;
              const label = slot.start_time.slice(0, 5);
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.timeSlot,
                    selectedSlotKey === key && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedSlotKey(key)}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      selectedSlotKey === key && styles.timeSlotTextSelected,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedSlotKey && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedSlotKey}
        >
          <Text style={styles.nextButtonText}>Review Booking</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
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
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  datesContainer: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  dateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateCardSelected: { backgroundColor: "#0C4A6E", borderColor: "#0C4A6E" },
  dateMonth: { fontSize: typography.fontSize.sm, color: "#A0B8C8", marginBottom: 4 },
  dateNumber: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  dateDay: { fontSize: typography.fontSize.sm, color: "#5A7A8F" },
  dateTextSelected: { color: colors.white },
  typeRow: {
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  typeChip: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeChipSelected: { borderColor: "#0C4A6E", backgroundColor: "#E8F0F5" },
  typeChipText: { color: "#5A7A8F", fontWeight: "600" },
  typeChipTextSelected: { color: "#0C4A6E" },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingHorizontal: spacing.xxl,
  },
  timeSlot: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeSlotSelected: { backgroundColor: "#E8F0F5", borderColor: "#0C4A6E" },
  timeSlotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#5A7A8F",
  },
  timeSlotTextSelected: { color: "#0C4A6E" },
  emptyText: {
    paddingHorizontal: spacing.xxl,
    color: "#94A3B8",
    fontSize: 15,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  nextButtonDisabled: { backgroundColor: "#C0D4E0" },
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
