import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";

// Mock data for pediatricians
const doctors = [
  {
    id: "1",
    name: "Dr. Ermias A. Belay",
    specialty: "Neurology specialist",
    image: require("../../../../assets/docs/doc1.png"),
  },
  {
    id: "2",
    name: "Dr. Sarah Johnson",
    specialty: "Pediatrician",
    image: require("../../../../assets/docs/doc2.png"),
  },
  {
    id: "3",
    name: "Dr. Michael Chen",
    specialty: "Child Psychologist",
    image: require("../../../../assets/docs/doc1.png"),
  },
];

export function EmptyChildView() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {/* Doctors Section */}
      <View style={styles.doctorsSection}>
        <Text style={styles.sectionTitle}>More than 20{"\n"}Pediatricians</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.doctorsScroll}
        >
          {doctors.map((doctor) => (
            <View key={doctor.id} style={styles.doctorCard}>
              <Image source={doctor.image} style={styles.doctorImage} />
              <View style={styles.doctorInfoOverlay}>
                <View style={styles.doctorTextContainer}>
                  <Text style={styles.doctorName}>{doctor.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
                </View>
                <TouchableOpacity style={styles.doctorActionCircle}>
                  <Ionicons name="heart-outline" size={18} color="#0C4A6E" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <View style={styles.infoCardTitleContainer}>
            <Text style={styles.infoCardTitle}>
              Provide us your{"\n"}child's info
            </Text>
            <Text style={styles.infoCardSubtitle}>
              Lorem ipsum doler situm amet and his{"\n"}Your information is safe
              with us
            </Text>
          </View>
          <View style={styles.infoCardCircle} />
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyIconContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#0C4A6E"
            />
          </View>
          <View style={styles.safetyTexts}>
            <Text style={styles.safetyTitle}>Safety and regulations</Text>
            <Text style={styles.safetySubtitle}>
              Your information is safe with us
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push("/(app)/create-child" as Href)}
          activeOpacity={0.8}
        >
          <View style={styles.continueIconCircle}>
            <View style={styles.continueIconInner} />
          </View>
          <Text style={styles.continueButtonText}>Register Children</Text>

          <MaterialCommunityIcons
            name="forwardburger"
            size={24}
            color="#0C4A6E"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },
  doctorsSection: {
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
  },
  doctorsScroll: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.lg,
  },
  doctorCard: {
    width: 200,
    height: 200,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    position: "relative",
    backgroundColor: "#E8F0F5",
  },
  doctorImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  doctorInfoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  doctorTextContainer: {
    flex: 1,
  },
  doctorName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: typography.fontSize.xs,
    color: "#5A7A8F",
  },
  doctorActionCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  infoCard: {
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.xxl,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xxxl,
  },
  infoCardTitleContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  infoCardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
    marginBottom: spacing.md,
  },
  infoCardCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  infoCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  safetySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  safetyIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  safetyTexts: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  safetySubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  continueButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  continueIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
  },
  continueIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0A3A54",
  },
  continueButtonText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.medium,
  },
  chevronSecond: {
    marginLeft: -16,
  },
});
