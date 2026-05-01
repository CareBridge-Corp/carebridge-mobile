import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function BookingSelectDateScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const dates = [
    { id: "1", date: "15", day: "Mon", month: "Dec" },
    { id: "2", date: "16", day: "Tue", month: "Dec" },
    { id: "3", date: "17", day: "Wed", month: "Dec" },
    { id: "4", date: "18", day: "Thu", month: "Dec" },
    { id: "5", date: "19", day: "Fri", month: "Dec" },
    { id: "6", date: "20", day: "Sat", month: "Dec" },
  ];

  const morningSlots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"];
  const afternoonSlots = ["02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"];
  const eveningSlots = ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"];

  const handleNext = () => {
    if (selectedDate && selectedTime) {
      router.push("/(app)/booking-confirmation" as Href);
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
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, styles.progressStepCompleted]}>
          <Ionicons name="checkmark" size={20} color={colors.white} />
        </View>
        <View style={[styles.progressLine, styles.progressLineActive]} />
        <View style={[styles.progressStep, styles.progressStepActive]}>
          <Text style={styles.progressStepTextActive}>2</Text>
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
        {/* Date Selection */}
        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.datesScroll}
          contentContainerStyle={styles.datesContainer}
        >
          {dates.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.dateCard,
                selectedDate === item.id && styles.dateCardSelected,
              ]}
              onPress={() => setSelectedDate(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dateMonth,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.month}
              </Text>
              <Text
                style={[
                  styles.dateNumber,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.date}
              </Text>
              <Text
                style={[
                  styles.dateDay,
                  selectedDate === item.id && styles.dateTextSelected,
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>Select Time</Text>

        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Morning</Text>
          <View style={styles.timeSlotsContainer}>
            {morningSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Afternoon</Text>
          <View style={styles.timeSlotsContainer}>
            {afternoonSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeSection}>
          <Text style={styles.timeSectionLabel}>Evening</Text>
          <View style={styles.timeSlotsContainer}>
            {eveningSlots.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeSlot,
                  selectedTime === time && styles.timeSlotSelected,
                ]}
                onPress={() => setSelectedTime(time)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeSlotText,
                    selectedTime === time && styles.timeSlotTextSelected,
                  ]}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (!selectedDate || !selectedTime) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedDate || !selectedTime}
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
  progressStepCompleted: {
    backgroundColor: "#10B981",
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
  progressLineActive: {
    backgroundColor: "#10B981",
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  datesScroll: {
    marginBottom: spacing.xl,
  },
  datesContainer: {
    paddingHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  dateCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 2,
    borderColor: "transparent",
  },
  dateCardSelected: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  dateMonth: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  dateDay: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  dateTextSelected: {
    color: colors.white,
  },
  timeSection: {
    paddingHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
  },
  timeSectionLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#5A7A8F",
    marginBottom: spacing.md,
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  timeSlot: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  timeSlotSelected: {
    backgroundColor: "#E8F0F5",
    borderColor: "#0C4A6E",
  },
  timeSlotText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: "#5A7A8F",
  },
  timeSlotTextSelected: {
    color: "#0C4A6E",
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
