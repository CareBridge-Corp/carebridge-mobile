import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";
import { getDateLocale } from "../../../shared/localization/language";
import { useLanguageStore } from "../../../shared/store/languageStore";
import { useAvailableDays, useAvailableSlots } from "../hooks/useAppointments";
import { useBookingStore } from "../store/bookingStore";

const RANGE_DAYS = 30;

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDay(dateStr: string, locale: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  const dateLocale = getDateLocale(locale);
  return {
    dayName: date.toLocaleDateString(dateLocale, { weekday: "short" }),
    dayNumber: date.getDate(),
    month: date.toLocaleDateString(dateLocale, { month: "short" }),
  };
}

export default function BookingSelectDateScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { doctor, meetingType, setSlot, setMeetingType } = useBookingStore();

  const range = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + RANGE_DAYS - 1);
    return { from: toIsoDate(today), to: toIsoDate(end) };
  }, []);

  const { data: availableDays = [], isLoading: daysLoading } = useAvailableDays(
    doctor?.userId,
    range.from,
    range.to,
    meetingType,
  );

  // First selectable day = first day with availability. Falls back to today.
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate && availableDays.length > 0) {
      const firstOpen =
        availableDays.find((day) => day.is_available)?.date ||
        availableDays[0]?.date;
      if (firstOpen) setSelectedDate(firstOpen);
    }
  }, [availableDays, selectedDate]);

  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots(
    doctor?.userId,
    selectedDate || undefined,
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

  const totalAvailableSlots = availableDays.reduce(
    (sum, day) => sum + day.available_slots,
    0,
  );
  const totalOpenDays = availableDays.filter((day) => day.is_available).length;

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title={t("booking.dateTime")} subtitle={t("booking.step2of3")} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Card variant="tinted" padding="md">
          <View style={styles.summaryRow}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text variant="bodyMedium" weight="semibold">
                {t("booking.liveAvailability")}
              </Text>
              <Text variant="caption" tone="secondary">
                {daysLoading
                  ? t("booking.loadingSchedule")
                  : totalOpenDays > 0
                    ? t("booking.openDays", {
                        days: totalOpenDays,
                        slots: totalAvailableSlots,
                        range: RANGE_DAYS,
                      })
                    : t("booking.noOpenDays", { days: RANGE_DAYS })}
              </Text>
            </View>
          </View>
        </Card>

        <SectionHeader title={t("booking.consultationType")} />
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
                  {type === "in_person" ? t("booking.inPerson") : t("booking.online")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader
          title={t("booking.availableDays")}
          subtitle={
            availableDays.length > 0
              ? `${range.from} – ${range.to}`
              : undefined
          }
        />
        {daysLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : availableDays.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={colors.iconMuted}
            />
            <Text variant="body" tone="secondary" align="center">
              {t("booking.noAvailability")}
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesContainer}
          >
            {availableDays.map((day) => {
              const formatted = formatDay(day.date, language);
              const selected = selectedDate === day.date;
              const disabled = !day.is_available;
              return (
                <Pressable
                  key={day.date}
                  disabled={disabled}
                  style={[
                    styles.dateCard,
                    selected && styles.dateCardSelected,
                    disabled && styles.dateCardDisabled,
                  ]}
                  onPress={() => {
                    setSelectedDate(day.date);
                    setSelectedSlotKey(null);
                  }}
                >
                  <Text
                    variant="caption"
                    tone={selected ? "inverse" : "secondary"}
                  >
                    {formatted.month.toUpperCase()}
                  </Text>
                  <Text
                    variant="title1"
                    style={{
                      color: disabled
                        ? colors.textTertiary
                        : selected
                          ? colors.textInverse
                          : colors.textPrimary,
                    }}
                  >
                    {formatted.dayNumber}
                  </Text>
                  <Text
                    variant="caption"
                    tone={selected ? "inverse" : "secondary"}
                  >
                    {formatted.dayName}
                  </Text>
                  {day.is_available ? (
                    <Text
                      variant="caption"
                      style={{
                        color: selected
                          ? colors.textInverse
                          : colors.success,
                        marginTop: 2,
                      }}
                    >
                      {t("booking.openSlots", { count: day.available_slots })}
                    </Text>
                  ) : (
                    <Text
                      variant="caption"
                      tone="tertiary"
                      style={{ marginTop: 2 }}
                    >
                      {t("booking.full")}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <SectionHeader
          title={t("booking.availableTimes")}
          subtitle={
            selectedDate
              ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(
                  getDateLocale(language),
                  { weekday: "long", month: "long", day: "numeric" },
                )
              : undefined
          }
        />
        {!selectedDate ? (
          <View style={styles.emptyBox}>
            <Ionicons
              name="time-outline"
              size={28}
              color={colors.iconMuted}
            />
            <Text variant="body" tone="secondary" align="center">
              {t("booking.pickDay")}
            </Text>
          </View>
        ) : slotsLoading ? (
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
              {t("booking.noSlotsForDay")}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.slotsMeta}>
              <Badge label={t("booking.openSlots", { count: slots.length })} tone="success" />
              <Text variant="caption" tone="secondary">
                {t("booking.tapTime")}
              </Text>
            </View>
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
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t("booking.reviewBooking")}
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
  dateCardDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.borderSubtle,
    opacity: 0.55,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  slotsMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[2],
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
