import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Linking, ScrollView, StyleSheet, View } from "react-native";
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
import { colors, layout, spacing } from "../../../shared/theme";
import { useClinicianById } from "../hooks/useClinician";
import { useClinicianStore } from "../store/clinicianStore";
import { toLocalIsoDate, useDoctorAppointments } from "../hooks/useAppointments";

export default function DoctorDetailsScreen() {
  const router = useRouter();
  const { childId, doctorId } = useLocalSearchParams<{
    childId?: string;
    doctorId?: string;
  }>();

  // Prefer the assigned clinician kept in the store when arriving from "your
  // care team" via childId. Otherwise fetch by doctorId.
  const cachedClinician = useClinicianStore((state) =>
    childId ? state.cliniciansByChild[childId] : null,
  );

  const { data: fetchedClinician, isLoading } = useClinicianById(
    !cachedClinician ? doctorId : undefined,
  );

  const clinician = cachedClinician || fetchedClinician;
  const clinicianId = clinician?.userId;
  const { data: upcomingAppointments = [], isLoading: appointmentsLoading } =
    useDoctorAppointments(clinicianId, {
      status: "confirmed",
      from: toLocalIsoDate(new Date()),
    });
  const nextAppointment = upcomingAppointments[0];

  if (isLoading) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

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
      <ScreenHeader title="Doctor profile" />

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
          <Text variant="bodySmall" tone="secondary" align="center">
            License: {clinician.licenseNumber}
          </Text>
          <Badge
            label={clinician.status}
            tone={isActive ? "success" : "neutral"}
            icon={isActive ? "checkmark-circle" : "ellipse"}
            style={styles.statusBadge}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Message"
            onPress={() => router.push("/(app)/chat" as Href)}
            leadingIcon="chatbubble-ellipses"
            fullWidth={false}
            style={styles.actionBtn}
          />
          <Button
            label="Consult"
            variant="secondary"
            fullWidth={false}
            leadingIcon="calendar"
            onPress={() =>
              router.push({
                pathname: "/(app)/(doctor)/doctor-consultation",
                params: { childId },
              } as any)
            }
            style={styles.actionBtn}
          />
        </View>

        <SectionHeader title="Upcoming consultation" />
        {appointmentsLoading ? (
          <Card variant="tinted" padding="md" style={styles.appointmentCard}>
            <ActivityIndicator color={colors.primary} />
          </Card>
        ) : nextAppointment ? (
          <Card variant="tinted" padding="md" style={styles.appointmentCard}>
            <View style={styles.appointmentHeading}>
              <View style={styles.appointmentIcon}>
                <Ionicons
                  name={nextAppointment.meetingType === "online" ? "videocam" : "location"}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.appointmentCopy}>
                <Text variant="title3">
                  {new Date(`${nextAppointment.appointmentDate}T12:00:00`).toLocaleDateString(
                    undefined,
                    { weekday: "short", month: "short", day: "numeric" },
                  )}
                </Text>
                <Text variant="bodySmall" tone="secondary">
                  {nextAppointment.startTime.slice(0, 5)}–{nextAppointment.endTime.slice(0, 5)} · {nextAppointment.meetingType === "online" ? "Online" : "In person"}
                </Text>
              </View>
              <Badge label="Confirmed" tone="success" />
            </View>

            {nextAppointment.meetingType === "online" && nextAppointment.meetingLink ? (
              <Button
                label="Join Google Meet"
                leadingIcon="videocam"
                onPress={() => void Linking.openURL(nextAppointment.meetingLink as string)}
              />
            ) : nextAppointment.meetingType === "online" ? (
              <View style={styles.meetPending}>
                <Ionicons name="time-outline" size={17} color={colors.info} />
                <Text variant="bodySmall" tone="secondary" style={styles.appointmentCopy}>
                  {nextAppointment.conferenceStatus === "not_connected"
                    ? "The clinician will add the Google Meet link."
                    : "Google Meet link is being prepared."}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : (
          <Card variant="tinted" padding="md" style={styles.appointmentCard}>
            <Text variant="bodySmall" tone="secondary">
              No upcoming consultation with this clinician.
            </Text>
          </Card>
        )}

        <SectionHeader title="Specializations" />
        <View style={styles.specs}>
          {clinician.specializations.map((spec) => (
            <Card
              key={spec.specializationId}
              variant="tinted"
              padding="md"
            >
              <Text variant="title3">{spec.name}</Text>
              <Text
                variant="bodySmall"
                tone="secondary"
                style={styles.specDesc}
              >
                {spec.description}
              </Text>
            </Card>
          ))}
        </View>

        <SectionHeader title="Contact" />
        <Card variant="tinted" padding="md" style={styles.contactCard}>
          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={colors.primary}
            />
            <Text variant="body" tone="primary" numberOfLines={1}>
              {clinician.email}
            </Text>
          </View>
        </Card>
      </ScrollView>
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
    paddingVertical: spacing[5],
    gap: spacing[2],
  },
  name: {
    marginTop: spacing[3],
  },
  statusBadge: {
    marginTop: spacing[2],
  },
  actions: {
    flexDirection: "row",
    gap: spacing[3],
    marginBottom: spacing[2],
  },
  actionBtn: {
    flex: 1,
  },
  specs: {
    gap: spacing[2],
  },
  specDesc: {
    marginTop: spacing[1],
  },
  contactCard: {
    marginBottom: spacing[2],
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  appointmentCard: {
    gap: spacing[4],
  },
  appointmentHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  appointmentIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
  },
  appointmentCopy: {
    flex: 1,
  },
  meetPending: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
  },
});
