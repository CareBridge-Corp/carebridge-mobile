import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import { useAuthStore } from "../../(auth)/store/authStore";
import { isPaymentRequiredError } from "../../../shared/api/client";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  Text,
} from "../../../shared/components/ui";
import { getDateLocale } from "../../../shared/localization/language";
import { useLanguageStore } from "../../../shared/store/languageStore";
import { colors, layout, spacing } from "../../../shared/theme";
import { useCreateAppointment } from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useProfileStore } from "../store/profileStore";
import { useBookingStore } from "../store/bookingStore";

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

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { doctor, slot, meetingType, childId, reset } = useBookingStore();
  const authUser = useAuthStore((state) => state.user);
  const storedProfile = useProfileStore((state) => state.profile);
  const { data: profile } = useProfile();
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>(MODAL_HIDDEN);

  const parentId = useMemo(
    () => profile?.userId ?? authUser?.userId ?? storedProfile?.userId,
    [profile?.userId, authUser?.userId, storedProfile?.userId],
  );

  const closeModal = () => setModal(MODAL_HIDDEN);

  const showModal = (next: Omit<ModalState, "visible">) => {
    setModal({ ...next, visible: true });
  };

  const handleConfirm = async () => {
    if (!doctor) {
      showModal({
        type: "error",
        title: t("booking.missingDetails"),
        message: t("booking.missingClinician"),
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
      return;
    }

    if (!slot?.scheduleId || !slot.date || !slot.startTime) {
      showModal({
        type: "error",
        title: t("booking.missingInfoTitle"),
        message: t("booking.missingInfoMessage"),
        primaryLabel: t("common.ok"),
        onPrimary: () => {
          closeModal();
          router.back();
        },
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
      setIsSubmitting(true);
      await createAppointment.mutateAsync({
        doctorId: doctor.userId,
        payload: {
          schedule_id: slot.scheduleId,
          parent_id: parentId,
          child_id: childId ?? undefined,
          appointment_date: slot.date,
          start_time: slot.startTime,
          meeting_type: meetingType,
        },
      });

      reset();
      showModal({
        type: "success",
        title: t("common.success"),
        message: t("booking.bookingSuccess"),
        primaryLabel: t("common.ok"),
        onPrimary: () => {
          closeModal();
          router.replace("/(app)/schedule" as Href);
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctorName = doctor
    ? `${doctor.surname ?? ""} ${doctor.firstName} ${doctor.lastName}`.trim()
    : t("booking.notSelected");

  const dateString = slot
    ? new Date(`${slot.date}T12:00:00`).toLocaleDateString(
        getDateLocale(language),
        {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        },
      )
    : t("booking.notSelected");

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader
        title={t("booking.confirmBooking")}
        subtitle={t("booking.step3of3")}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          {t("booking.reviewDetails")}
        </Text>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="person-circle" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">
                {t("booking.clinician").toUpperCase()}
              </Text>
              <Text variant="title3" style={styles.rowValue}>
                {doctorName}
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="secondary">
                {t("booking.dateTimeLabel").toUpperCase()}
              </Text>
              <Text variant="title3" style={styles.rowValue}>
                {dateString}
              </Text>
              {slot ? (
                <Text variant="body" tone="secondary">
                  {slot.startTime} – {slot.endTime}
                </Text>
              ) : null}
              <View style={styles.badgeRow}>
                <Badge
                  label={
                    meetingType === "online"
                      ? t("booking.online")
                      : t("booking.inPerson")
                  }
                  tone="info"
                  icon={meetingType === "online" ? "videocam" : "business"}
                />
              </View>
            </View>
          </View>
        </Card>

        <Card variant="tinted" padding="md" style={styles.card}>
          <View style={styles.row}>
            <Ionicons
              name="information-circle"
              size={22}
              color={colors.primary}
            />
            <Text variant="bodySmall" tone="secondary" style={styles.infoText}>
              {t("booking.confirmInfo")}
            </Text>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={t("booking.confirmAppointment")}
          onPress={handleConfirm}
          loading={isSubmitting}
          disabled={!doctor || !slot}
          leadingIcon="checkmark-circle"
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
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  subtitle: {
    marginBottom: spacing[2],
  },
  card: {
    gap: spacing[2],
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  rowValue: {
    marginTop: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeRow: {
    flexDirection: "row",
    marginTop: spacing[2],
  },
  infoText: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
