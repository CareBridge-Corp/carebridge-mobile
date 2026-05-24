import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { getDateLocale } from "../../../shared/localization/language";
import { useLanguageStore } from "../../../shared/store/languageStore";
import { isPaymentRequiredError } from "../../../shared/api/client";
import {
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  Text,
} from "../../../shared/components/ui";
import { colors, layout, spacing } from "../../../shared/theme";
import { useCreateAppointment } from "../hooks/useAppointments";
import { useProfile } from "../hooks/useProfile";
import { useBookingStore } from "../store/bookingStore";

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { doctor, slot, meetingType, childId, reset } = useBookingStore();
  const { data: profile } = useProfile();
  const createAppointment = useCreateAppointment();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!doctor || !slot || !profile?.userId) {
      Alert.alert(
        t("booking.missingDetails"),
        t("booking.missingDetailsMessage"),
      );
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
      Alert.alert(t("common.success"), t("booking.bookingSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => router.replace("/(app)/schedule" as Href),
        },
      ]);
    } catch (error: unknown) {
      if (isPaymentRequiredError(error)) {
        router.push("/(app)/payment?purpose=SUBSCRIPTION" as Href);
        return;
      }
      const message =
        error instanceof Error ? error.message : "Unable to create appointment.";
      Alert.alert(t("booking.bookingFailed"), message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doctorName = doctor
    ? `${doctor.surname ?? ""} ${doctor.firstName} ${doctor.lastName}`.trim()
    : t("booking.notSelected");

  const dateString = slot
    ? new Date(slot.date).toLocaleDateString(getDateLocale(language), {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : t("booking.notSelected");

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title={t("booking.confirmBooking")} subtitle={t("booking.step3of3")} />

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
              <Ionicons
                name="person-circle"
                size={22}
                color={colors.primary}
              />
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
              <Ionicons
                name="calendar"
                size={22}
                color={colors.primary}
              />
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
                  label={meetingType === "online" ? t("booking.online") : t("booking.inPerson")}
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
            <Text
              variant="bodySmall"
              tone="secondary"
              style={styles.infoText}
            >
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
          leadingIcon="checkmark-circle"
        />
      </View>
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
