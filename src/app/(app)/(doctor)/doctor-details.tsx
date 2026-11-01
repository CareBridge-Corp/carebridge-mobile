import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import StatusModal from "../../../shared/components/StatusModal";
import { colors, layout, spacing } from "../../../shared/theme";
import {
  useChatRequestStatus,
  useRequestClinicianChat,
} from "../hooks/useChat";
import { useClinicianById } from "../hooks/useClinician";
import { useClinicianStore } from "../store/clinicianStore";
import { useChatStore } from "../store/chatStore";
import { useChildrenStore } from "../store/childrenStore";
import { toLocalIsoDate, useDoctorAppointments } from "../hooks/useAppointments";
import {
  getAppointmentTimeLeftLabel,
  isAppointmentUpcomingOrActive,
} from "../utils/appointmentTime";

function paramValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default function DoctorDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    childId?: string | string[];
    doctorId?: string | string[];
  }>();
  const childIdParam = paramValue(params.childId);
  const doctorIdParam = paramValue(params.doctorId);
  const { activeChild } = useChildrenStore();
  const { setActiveConversation } = useChatStore();
  const childId = childIdParam || activeChild?.childId;
  const [now, setNow] = useState(() => new Date());
  const [statusModal, setStatusModal] = useState<{
    visible: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({ visible: false, type: "info", title: "", message: "" });

  // Never reuse the assigned-clinician cache for a different doctorId.
  const cachedClinician = useClinicianStore((state) =>
    childIdParam ? state.cliniciansByChild[childIdParam] : null,
  );
  const cachedMatchesDoctor =
    !!doctorIdParam && cachedClinician?.userId === doctorIdParam;

  const { data: fetchedClinician, isLoading } = useClinicianById(
    doctorIdParam
      ? cachedMatchesDoctor
        ? undefined
        : doctorIdParam
      : cachedClinician
        ? undefined
        : doctorIdParam,
  );

  const clinician = doctorIdParam
    ? cachedMatchesDoctor
      ? cachedClinician
      : fetchedClinician
    : cachedClinician || fetchedClinician;

  // Hard guard: if a doctorId was requested, never show a mismatched profile.
  const profileMatches =
    !doctorIdParam || clinician?.userId === doctorIdParam;
  const clinicianId = profileMatches ? clinician?.userId : undefined;

  const { data: requestStatus, isLoading: requestStatusLoading } =
    useChatRequestStatus(childId, clinicianId);
  const requestChatMutation = useRequestClinicianChat();
  const { data: upcomingAppointments = [], isLoading: appointmentsLoading } =
    useDoctorAppointments(clinicianId, {
      status: "confirmed",
      from: toLocalIsoDate(new Date()),
      childId: childId || undefined,
    });

  const nextAppointment = useMemo(() => {
    if (!clinicianId) return undefined;
    return upcomingAppointments.find(
      (appointment) =>
        appointment.doctorId === clinicianId &&
        isAppointmentUpcomingOrActive(appointment, now),
    );
  }, [upcomingAppointments, clinicianId, now]);

  useEffect(() => {
    if (!nextAppointment?.meetingLink) return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [nextAppointment?.meetingLink, nextAppointment?.id, nextAppointment?.appointmentId]);

  const meetTimeLeft = nextAppointment
    ? getAppointmentTimeLeftLabel(nextAppointment, now)
    : null;

  const openAssignedOrPeerChat = async () => {
    if (!childId || !clinician) return;

    if (requestStatus?.status === "ASSIGNED" || requestStatus?.canMessage) {
      const isAssigned = requestStatus?.status === "ASSIGNED";
      setActiveConversation({
        channelType: isAssigned ? "ASSIGNED_DM" : "PEER_DM",
        conversationId: isAssigned
          ? `dm:${childId}`
          : `peer:${childId}:${clinician.userId}`,
        child: {
          childId,
          firstName: activeChild?.firstName || "Child",
          parentId: activeChild?.parentId || "",
          assignedClinicianId: activeChild?.assignedClinicianId || null,
        },
        parent: {
          userId: activeChild?.parentId || "",
          firstName: "",
          lastName: "",
        },
        clinician: {
          userId: clinician.userId,
          firstName: clinician.firstName,
          lastName: clinician.lastName,
          surname: clinician.surname,
          profilePictureUrl: clinician.profilePictureUrl,
        },
        lastMessage: null,
      });
      router.push("/(app)/(doctor)/doctor-chat" as Href);
      return;
    }

    if (!childId) {
      setStatusModal({
        visible: true,
        type: "info",
        title: "Select a child",
        message: "Choose a child first so we can request a chat for them.",
      });
      return;
    }

    try {
      await requestChatMutation.mutateAsync({
        childId,
        clinicianId: clinician.userId,
      });
      setStatusModal({
        visible: true,
        type: "success",
        title: "Request sent",
        message:
          "Your chat request was sent. You can message this clinician after they accept.",
      });
    } catch (error: any) {
      setStatusModal({
        visible: true,
        type: "error",
        title: "Could not send request",
        message: error?.message || "Please try again.",
      });
    }
  };

  const messageLabel =
    requestStatus?.status === "ASSIGNED" || requestStatus?.canMessage
      ? "Message"
      : requestStatus?.status === "PENDING"
        ? "Request pending"
        : "Request chat";

  if (isLoading || (doctorIdParam && !profileMatches && !fetchedClinician)) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </Screen>
    );
  }

  if (!clinician || !profileMatches) {
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
            label={messageLabel}
            onPress={() => void openAssignedOrPeerChat()}
            leadingIcon="chatbubble-ellipses"
            fullWidth={false}
            style={styles.actionBtn}
            loading={requestStatusLoading || requestChatMutation.isPending}
            disabled={
              requestStatus?.status === "PENDING" ||
              requestStatusLoading ||
              requestChatMutation.isPending
            }
          />
          <Button
            label="Consult"
            variant="secondary"
            fullWidth={false}
            leadingIcon="calendar"
            onPress={() =>
              router.push({
                pathname: "/(app)/(doctor)/doctor-consultation",
                params: {
                  childId,
                  doctorId: clinician.userId,
                },
              } as any)
            }
            style={styles.actionBtn}
          />
        </View>
        {requestStatus?.status === "PENDING" ? (
          <Text
            variant="bodySmall"
            tone="secondary"
            align="center"
            style={{ marginBottom: spacing[4] }}
          >
            Waiting for this clinician to accept your chat request.
          </Text>
        ) : null}

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
              <View style={styles.meetJoinBlock}>
                <Button
                  label="Join Google Meet"
                  leadingIcon="videocam"
                  onPress={() =>
                    void Linking.openURL(nextAppointment.meetingLink as string)
                  }
                />
                {meetTimeLeft ? (
                  <Text
                    variant="bodySmall"
                    tone="secondary"
                    align="center"
                    style={styles.meetTimeLeft}
                  >
                    {meetTimeLeft}
                  </Text>
                ) : null}
              </View>
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

      <StatusModal
        visible={statusModal.visible}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onPrimaryPress={() =>
          setStatusModal((prev) => ({ ...prev, visible: false }))
        }
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
  meetJoinBlock: {
    gap: spacing[2],
  },
  meetTimeLeft: {
    marginTop: spacing[1],
  },
});
