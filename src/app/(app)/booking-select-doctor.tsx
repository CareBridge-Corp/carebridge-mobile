import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: any;
  rating: number;
  experience: string;
}

export default function BookingSelectDoctorScreen() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Walter White",
      specialty: "Neurology specialist",
      image: require("../../../assets/docs/doc1.png"),
      rating: 4.8,
      experience: "15 years",
    },
    {
      id: "2",
      name: "Dr. Ermias Lema",
      specialty: "Pediatrician",
      image: require("../../../assets/docs/doc2.png"),
      rating: 4.9,
      experience: "12 years",
    },
    {
      id: "3",
      name: "Dr. Sarah Johnson",
      specialty: "Child Psychologist",
      image: require("../../../assets/docs/doc1.png"),
      rating: 4.7,
      experience: "10 years",
    },
  ];

  const handleNext = () => {
    if (selectedDoctor) {
      router.push("/(app)/booking-select-date" as Href);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Doctor</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressStepActive]}>
          <Text style={styles.progressStepTextActive}>1</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <Text style={styles.progressStepText}>2</Text>
        </View>
        <View style={styles.progressLine} />
        <View style={styles.progressStep}>
          <Text style={styles.progressStepText}>3</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Choose a doctor for your consultation
        </Text>

        {doctors.map((doctor) => (
          <TouchableOpacity
            key={doctor.id}
            style={[
              styles.doctorCard,
              selectedDoctor === doctor.id && styles.doctorCardSelected,
            ]}
            onPress={() => setSelectedDoctor(doctor.id)}
            activeOpacity={0.7}
          >
            <Image source={doctor.image} style={styles.doctorImage} />
            <View style={styles.doctorInfo}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
              <View style={styles.doctorMeta}>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.ratingText}>{doctor.rating}</Text>
                </View>
                <Text style={styles.experienceText}>{doctor.experience}</Text>
              </View>
            </View>
            {selectedDoctor === doctor.id && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={20} color={colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !selectedDoctor && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedDoctor}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
  },
  progressStep: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  progressStepActive: {
    backgroundColor: "#0C4A6E",
  },
  progressStepText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#A0B8C8",
  },
  progressStepTextActive: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: "#5A7A8F",
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.xl,
  },
  doctorCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  doctorCardSelected: {
    borderColor: "#0C4A6E",
    backgroundColor: "#F0F7FB",
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: spacing.md,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: "center",
  },
  doctorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  doctorSpecialty: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginBottom: spacing.sm,
  },
  doctorMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  experienceText: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  nextButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
