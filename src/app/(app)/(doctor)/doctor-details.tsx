import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";
import { useClinicianStore } from "../store/clinicianStore";

export default function DoctorDetailsScreen() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const clinician = useClinicianStore((state) => 
    childId ? state.cliniciansByChild[childId] : null
  );

  if (!clinician) {
    return (
      <View style={styles.centered}>
        <Text>Doctor information not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.primary, marginTop: 10 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Doctor Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            {clinician.profilePictureUrl ? (
              <Image source={{ uri: clinician.profilePictureUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.placeholderAvatar]}>
                <Ionicons name="person" size={50} color={colors.white} />
              </View>
            )}
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{clinician.status}</Text>
            </View>
          </View>
          
          <Text style={styles.doctorName}>
            {clinician.surname} {clinician.firstName} {clinician.lastName}
          </Text>
          <Text style={styles.licenseText}>License: {clinician.licenseNumber}</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.chatButton]}
              onPress={() => router.push("/(app)/chat")}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          {clinician.specializations.map((spec) => (
            <View key={spec.specializationId} style={styles.specCard}>
              <View style={styles.specHeader}>
                <Text style={styles.specName}>{spec.name}</Text>
                <View style={[styles.focusBadge, { backgroundColor: spec.riskLevelFocus === 'HIGH' ? '#FEE2E2' : '#E0F2FE' }]}>
                  <Text style={[styles.focusText, { color: spec.riskLevelFocus === 'HIGH' ? '#EF4444' : '#0EA5E9' }]}>
                    {spec.riskLevelFocus} RISK
                  </Text>
                </View>
              </View>
              <Text style={styles.specDescription}>{spec.description}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{clinician.email}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
  },
  backButton: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: colors.text },
  profileHeader: { alignItems: "center", padding: spacing.xl },
  avatarContainer: { position: "relative", marginBottom: spacing.md },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  placeholderAvatar: { backgroundColor: colors.primary, justifyContent: "center", alignItems: "center" },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#10B981",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.white,
  },
  statusText: { color: colors.white, fontSize: 10, fontWeight: "bold" },
  doctorName: { fontSize: 22, fontWeight: "bold", color: colors.text, marginBottom: 4 },
  licenseText: { fontSize: 14, color: colors.textLight, marginBottom: spacing.lg },
  actionButtons: { flexDirection: "row", gap: spacing.md },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
  },
  chatButton: { backgroundColor: colors.primary },
  actionButtonText: { color: colors.white, fontWeight: "600" },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: spacing.md },
  specCard: {
    backgroundColor: "#F8FAFC",
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  specHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  specName: { fontSize: 15, fontWeight: "600", color: colors.text },
  focusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  focusText: { fontSize: 10, fontWeight: "bold" },
  specDescription: { fontSize: 13, color: colors.textMedium, lineHeight: 18 },
  contactItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12 },
  contactText: { fontSize: 14, color: colors.text },
});
