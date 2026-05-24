import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { ActivityIndicator, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslation } from "react-i18next";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { PaywallCard } from "../components/PaywallCard";
import { useEntitlements } from "../hooks/useEntitlements";
import { useAssignedClinician } from "../hooks/useClinician";
import { useChildrenStore } from "../store/childrenStore";
import { useBookingStore } from "../store/bookingStore";

export default function BookingSelectDoctorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { activeChild } = useChildrenStore();
  const { data: entitlements, isLoading: entitlementsLoading } =
    useEntitlements();
  const { data: clinician, isLoading } = useAssignedClinician(activeChild?.childId);
  const { setDoctor, setChildId } = useBookingStore();

  const handleNext = () => {
    if (!clinician) return;
    setDoctor(clinician);
    setChildId(activeChild?.childId ?? null);
    router.push("/(app)/booking-select-date" as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {!entitlementsLoading &&
        entitlements &&
        !entitlements.canBookAppointments ? (
          <PaywallCard
            title={t("payment.gate.appointmentTitle")}
            description={t("payment.gate.appointmentDescription")}
            purpose="SUBSCRIPTION"
          />
        ) : (
          <>
        <Text style={styles.subtitle}>Your assigned clinician</Text>

        {isLoading ? (
          <ActivityIndicator color="#0C4A6E" />
        ) : clinician ? (
          <View style={styles.doctorCard}>
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>
                {clinician.surname} {clinician.firstName} {clinician.lastName}
              </Text>
              <Text style={styles.doctorSpecialty}>
                {clinician.specializations?.[0]?.name ?? "Assigned clinician"}
              </Text>
              <Text style={styles.doctorEmail}>{clinician.email}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.emptyText}>
            No assigned clinician found for {activeChild?.firstName ?? "this child"}.
          </Text>
        )}
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!clinician || !entitlements?.canBookAppointments) &&
              styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!clinician || !entitlements?.canBookAppointments}
        >
          <Text style={styles.nextButtonText}>Choose Date & Time</Text>
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
  content: { paddingHorizontal: spacing.xxl, paddingTop: spacing.lg },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: "#5A7A8F",
    marginBottom: spacing.xl,
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 2,
    borderColor: "#0C4A6E",
  },
  doctorInfo: { gap: 6 },
  doctorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  doctorSpecialty: { fontSize: typography.fontSize.sm, color: "#5A7A8F" },
  doctorEmail: { fontSize: typography.fontSize.sm, color: "#94A3B8" },
  emptyText: { color: "#94A3B8", fontSize: 16, lineHeight: 24 },
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
