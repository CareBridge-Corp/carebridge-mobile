import { Ionicons } from "@expo/vector-icons";
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

export function DoctorsSection() {
  return (
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
  );
}

const styles = StyleSheet.create({
  doctorsSection: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
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
});
