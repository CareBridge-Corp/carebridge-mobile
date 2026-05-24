import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Button,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";
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
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title="Date & time" subtitle="Step 2 of 3" />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <SectionHeader title="Select a day" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.datesContainer}
        >
          {dates.map((item) => {
            const selected = selectedDate === item.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.dateCard, selected && styles.dateCardSelected]}
                onPress={() => {
                  setSelectedDate(item.id);
                  setSelectedSlotKey(null);
                }}
              >
                <Text
                  variant="caption"
                  tone={selected ? "inverse" : "secondary"}
                >
                  {item.month.toUpperCase()}
                </Text>
                <Text
                  variant="title1"
                  style={{
                    color: selected ? colors.textInverse : colors.textPrimary,
                  }}
                >
                  {item.dayNumber}
                </Text>
                <Text
                  variant="caption"
                  tone={selected ? "inverse" : "secondary"}
                >
                  {item.dayName}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader title="Consultation type" />
        <View style={styles.typeRow}>
          {(["in_person", "online"] as const).map((type) => {
            const active = meetingType === type;
            return (
              <Pressable
                key={type}
                style={[styles.typeChip, active && styles.typeChipSelected]}
                onPress={() => {
                  setMeetingType(type);
                  setSelectedSlotKey(null);
                }}
              >
                <Ionicons
                  name={type === "in_person" ? "business" : "videocam"}
                  size={18}
                  color={active ? colors.primary : colors.iconMuted}
                />
                <Text
                  variant="bodyMedium"
                  weight="semibold"
                  style={{
                    color: active ? colors.primary : colors.textSecondary,
                  }}
                >
                  {type === "in_person" ? "In person" : "Online"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Available times" />
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : slots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="time-outline"
              size={28}
              color={colors.iconMuted}
            />
            <Text variant="body" tone="secondary" align="center">
              No available slots for this date. Try another day.
            </Text>
          </View>
        ) : (
          <View style={styles.timeSlotsContainer}>
            {slots.map((slot) => {
              const key = `${slot.schedule_id}-${slot.start_time}`;
              const label = slot.start_time.slice(0, 5);
              const selected = selectedSlotKey === key;
              return (
                <Pressable
                  key={key}
                  style={[
                    styles.timeSlot,
                    selected && styles.timeSlotSelected,
                  ]}
                  onPress={() => setSelectedSlotKey(key)}
                >
                  <Text
                    variant="bodyMedium"
                    weight="semibold"
                    style={{
                      color: selected
                        ? colors.textInverse
                        : colors.textPrimary,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Review booking"
          onPress={handleNext}
          disabled={!selectedSlotKey}
          trailingIcon="arrow-forward"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
    gap: spacing[2],
  },
  datesContainer: {
    paddingRight: spacing[4],
    gap: spacing[2],
    paddingBottom: spacing[3],
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
  dateCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[3],
  },
  typeChip: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipSelected: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    paddingBottom: spacing[4],
  },
  timeSlot: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 78,
    alignItems: "center",
  },
  timeSlotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  loading: {
    paddingVertical: spacing[6],
    alignItems: "center",
  },
  emptyBox: {
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[6],
    paddingHorizontal: spacing[5],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
