import { Href, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Screen,
  ScreenHeader,
  Text,
} from "../../../shared/components/ui";
import { colors, layout, spacing } from "../../../shared/theme";
import { PaywallCard } from "../components/PaywallCard";
import { useAssignedClinician } from "../hooks/useClinician";
import { useEntitlements } from "../hooks/useEntitlements";
import { useBookingStore } from "../store/bookingStore";
import { useChildrenStore } from "../store/childrenStore";

export default function BookingSelectDoctorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeChild } = useChildrenStore();
  const { data: entitlements, isLoading: entitlementsLoading } =
    useEntitlements();
  const { data: clinician, isLoading } = useAssignedClinician(
    activeChild?.childId,
  );
  const { setDoctor, setChildId } = useBookingStore();

  const isPaywalled =
    !entitlementsLoading && entitlements && !entitlements.canBookAppointments;

  const handleNext = () => {
    if (!clinician) return;
    setDoctor(clinician);
    setChildId(activeChild?.childId ?? null);
    router.push("/(app)/booking-select-date" as Href);
  };

  const clinicianName = clinician
    ? `${clinician.surname ?? ""} ${clinician.firstName} ${clinician.lastName}`.trim()
    : "";

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title="Book appointment" subtitle="Step 1 of 3" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isPaywalled ? (
          <PaywallCard
            title={t("payment.gate.appointmentTitle")}
            description={t("payment.gate.appointmentDescription")}
          />
        ) : (
          <>
            <Text
              variant="bodySmall"
              tone="secondary"
              style={styles.eyebrow}
            >
              Your assigned clinician
            </Text>

            {isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : clinician ? (
              <Card variant="elevated" padding="lg" style={styles.doctorCard}>
                <View style={styles.doctorRow}>
                  <Avatar
                    uri={(clinician as any).profilePictureUrl}
                    name={clinicianName}
                    size="lg"
                  />
                  <View style={styles.doctorInfo}>
                    <Text variant="title2" numberOfLines={2}>
                      {clinicianName}
                    </Text>
                    <Text variant="bodySmall" tone="secondary">
                      {clinician.specializations?.[0]?.name ??
                        "Assigned clinician"}
                    </Text>
                    <Text variant="caption" tone="tertiary">
                      {clinician.email}
                    </Text>
                  </View>
                </View>
                <View style={styles.badgeRow}>
                  <Badge
                    label="Verified clinician"
                    tone="success"
                    icon="shield-checkmark"
                  />
                </View>
              </Card>
            ) : (
              <EmptyState
                icon="medkit-outline"
                title="No assigned clinician"
                description={`We couldn't find an assigned clinician for ${activeChild?.firstName ?? "this child"}. Reach out to support for help.`}
              />
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Choose date & time"
          onPress={handleNext}
          disabled={!clinician || isPaywalled}
          trailingIcon="arrow-forward"
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
    gap: spacing[4],
  },
  eyebrow: {
    marginBottom: spacing[1],
  },
  loading: {
    paddingVertical: spacing[8],
  },
  doctorCard: {
    gap: spacing[4],
  },
  doctorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[4],
  },
  doctorInfo: {
    flex: 1,
    gap: spacing[1],
  },
  badgeRow: {
    flexDirection: "row",
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
