import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../(auth)/store/authStore";
import StatusModal from "../../../shared/components/StatusModal";
import {
  ActivityIndicator,
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
import { getDateLocale } from "../../../shared/localization/language";
import { useLanguageStore } from "../../../shared/store/languageStore";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";
import {
  useAvailableDays,
  useAvailableSlots,
  useCreateAppointment,
  toLocalIsoDate,
} from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useProfileStore } from "../store/profileStore";
import { useClinicianStore } from "../store/clinicianStore";
import { isPaymentRequiredError } from "../../../shared/api/client";

const RANGE_DAYS = 30;

type ModalState = {
  visible: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

const MODAL_HIDDEN: ModalState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

function formatDay(dateStr: string, locale: string) {
  const date = new Date(`${dateStr}T00:00:00`);
  return {
    dayName: date.toLocaleDateString(locale, { weekday: "short" }),
    dayNumber: date.getDate(),
    month: date.toLocaleDateString(locale, { month: "short" }),
  };
}

export default function DoctorConsultationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const dateLocale = getDateLocale(language);
  const { childId } = useLocalSearchParams<{ childId: string }>();

  const clinician = useClinicianStore((state) =>
    childId ? state.cliniciansByChild[childId] : null,
  );

  const { data: profile } = useProfile();
  const authUser = useAuthStore((state) => state.user);
  const storedProfile = useProfileStore((state) => state.profile);
  const createAppointment = useCreateAppointment();
  const [modal, setModal] = useState<ModalState>(MODAL_HIDDEN);

  const parentId = useMemo(
    () => profile?.userId ?? authUser?.userId ?? storedProfile?.userId,
    [profile?.userId, authUser?.userId, storedProfile?.userId],
  );

  const closeModal = () => setModal(MODAL_HIDDEN);

  const showModal = (next: Omit<ModalState, "visible">) => {
    setModal({ ...next, visible: true });
  };

  const range = useMemo(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(today.getDate() + RANGE_DAYS - 1);
    return { from: toLocalIsoDate(today), to: toLocalIsoDate(end) };
  }, []);

  const [meetingType, setMeetingType] = useState<"in_person" | "online">(
    "in_person",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlotKey, setSelectedSlotKey] = useState<string | null>(null);

  const resolvedChildId = childId ?? undefined;

  const { data: availableDays = [], isLoading: daysLoading } = useAvailableDays({
    childId: resolvedChildId,
    doctorId: clinician?.userId,
    from: range.from,
    to: range.to,
    meetingType,
  });

  useEffect(() => {
    if (!selectedDate && availableDays.length > 0) {
      const firstOpen =
        availableDays.find((day) => day.is_available)?.date ||
        availableDays[0]?.date;
      if (firstOpen) setSelectedDate(firstOpen);
    }
  }, [availableDays, selectedDate]);

  const { data: slots = [], isLoading: slotsLoading } = useAvailableSlots({
    childId: resolvedChildId,
    doctorId: clinician?.userId,
    date: selectedDate || undefined,
    meetingType,
  });

  const handleBookMeeting = async () => {
    const slot = slots.find(
      (item) => `${item.schedule_id}-${item.start_time}` === selectedSlotKey,
    );

    if (!clinician) {
      showModal({
        type: "error",
        title: t("booking.missingDetails"),
        message: t("booking.missingClinician"),
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
      return;
    }

    if (!selectedDate || !slot?.schedule_id || !slot.start_time) {
      showModal({
        type: "error",
        title: t("booking.missingInfoTitle"),
        message: t("booking.missingInfoMessage"),
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
      return;
    }

    if (!parentId) {
      showModal({
        type: "error",
        title: t("booking.missingDetails"),
        message: t("booking.missingProfile"),
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
      return;
    }

    try {
      await createAppointment.mutateAsync({
        doctorId: clinician.userId,
        payload: {
          appointment_date: selectedDate,
          start_time: slot.start_time.slice(0, 5),
          meeting_type: meetingType,
          parent_id: parentId,
          schedule_id: slot.schedule_id,
          child_id: resolvedChildId,
        },
      });

      showModal({
        type: "success",
        title: t("common.success"),
        message: t("booking.bookSuccess"),
        primaryLabel: t("common.ok"),
        onPrimary: () => {
          closeModal();
          router.back();
        },
      });
    } catch (error: unknown) {
      if (isPaymentRequiredError(error)) {
        router.push("/(app)/payment?purpose=SUBSCRIPTION" as Href);
        return;
      }
      const message =
        error instanceof Error ? error.message : t("booking.bookFailed");
      showModal({
        type: "error",
        title: t("booking.bookingFailed"),
        message,
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
    }
  };

  if (!clinician) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.center}>
          <Text variant="title2" align="center">
            {t("doctor.notFound")}
          </Text>
          <Button
            label={t("common.back")}
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
      <ScreenHeader title={t("doctor.consultationTitle")} />

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
            {clinician.specializations[0]?.name || t("doctor.specialist")}
          </Text>
          <Badge
            label={clinician.status}
            tone={isActive ? "success" : "neutral"}
            icon={isActive ? "checkmark-circle" : "ellipse"}
            style={styles.statusBadge}
          />
        </View>

        <SectionHeader title={t("booking.consultationType")} />
        <View style={styles.typeRow}>
          {(["in_person", "online"] as const).map((type) => {
            const active = meetingType === type;
            return (
              <Pressable
                key={type}
                style={[styles.typeChip, active && styles.typeChipActive]}
                onPress={() => {
                  setMeetingType(type);
                  setSelectedSlotKey(null);
                }}
              >
                <Ionicons
                  name={type === "in_person" ? "business" : "videocam"}
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
                  {type === "in_person"
                    ? t("booking.inPerson")
                    : t("booking.online")}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title={t("booking.availableDays")} />
        {daysLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : availableDays.length === 0 ? (
          <Card variant="tinted" padding="md">
            <Text variant="body" tone="secondary" align="center">
              {t("booking.noAvailability")}
            </Text>
          </Card>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.datesScroll}
          >
            {availableDays.map((day) => {
              const formatted = formatDay(day.date, dateLocale);
              const isActiveDate = selectedDate === day.date;
              const disabled = !day.is_available;
              return (
                <Pressable
                  key={day.date}
                  disabled={disabled}
                  style={[
                    styles.dateCard,
                    isActiveDate && styles.dateCardActive,
                    disabled && styles.dateCardDisabled,
                  ]}
                  onPress={() => {
                    setSelectedDate(day.date);
                    setSelectedSlotKey(null);
                  }}
                >
                  <Text
                    variant="caption"
                    tone={isActiveDate ? "inverse" : "secondary"}
                  >
                    {formatted.month.toUpperCase()}
                  </Text>
                  <Text
                    variant="title1"
                    style={{
                      color: disabled
                        ? colors.textTertiary
                        : isActiveDate
                          ? colors.textInverse
                          : colors.textPrimary,
                    }}
                  >
                    {formatted.dayNumber}
                  </Text>
                  <Text
                    variant="caption"
                    tone={isActiveDate ? "inverse" : "secondary"}
                  >
                    {formatted.dayName}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        <SectionHeader title={t("booking.availableTimes")} />
        {slotsLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} />
            <Text variant="caption" tone="secondary">
              {t("booking.loadingSlots")}
            </Text>
          </View>
        ) : slots.length === 0 ? (
          <Card variant="tinted" padding="md">
            <Text variant="body" tone="secondary" align="center">
              {t("booking.noSlotsForDay")}
            </Text>
          </Card>
        ) : (
          <View style={styles.timeGrid}>
            {slots.map((slot) => {
              const key = `${slot.schedule_id}-${slot.start_time}`;
              const label = slot.start_time.slice(0, 5);
              const active = selectedSlotKey === key;
              return (
                <Pressable
                  key={key}
                  style={[styles.timeSlot, active && styles.timeSlotActive]}
                  onPress={() => setSelectedSlotKey(key)}
                >
                  <Text
                    variant="bodyMedium"
                    weight="semibold"
                    style={{
                      color: active
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
          label={
            createAppointment.isPending
              ? t("booking.confirming")
              : t("booking.confirmAppointment")
          }
          loading={createAppointment.isPending}
          onPress={handleBookMeeting}
          leadingIcon="calendar-outline"
          disabled={!selectedSlotKey}
        />
        <Button
          label={t("doctor.messageDoctor")}
          variant="secondary"
          leadingIcon="chatbubble-outline"
          onPress={() => router.push("/(app)/doctor-chat" as Href)}
        />
      </View>

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        primaryButtonText={modal.primaryLabel ?? t("common.ok")}
        onPrimaryPress={modal.onPrimary ?? closeModal}
      />
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
  dateCardDisabled: {
    opacity: 0.55,
    backgroundColor: colors.surfaceMuted,
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
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    gap: spacing[2],
  },
});
