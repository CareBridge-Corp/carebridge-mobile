import { Ionicons } from "@expo/vector-icons";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function ScheduleScreen() {
  // Demo data
  const weekDays = [
    { date: 14, day: "Sat" },
    { date: 15, day: "Sun" },
    { date: 16, day: "Mon" },
    { date: 17, day: "Tue", selected: true },
    { date: 18, day: "Tue" },
    { date: 19, day: "Wed" },
    { date: 20, day: "Thu" },
  ];

  const progressCircles = [1, 2, 3, 4, 5];
  const completedCircles = 2;
  const progressPercentage = 45;

  const handleContinue = () => {
    // TODO: Navigate to task details
    console.log("Continue task pressed");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>Abenezer</Text>
        </View>
        <View style={styles.avatar}>
          <Ionicons name="person" size={28} color={colors.text} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Calendar Card */}
        <View style={styles.calendarCard}>
          <View style={styles.weekContainer}>
            {weekDays.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayItem,
                  item.selected && styles.dayItemSelected,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.dateText,
                    item.selected && styles.dateTextSelected,
                  ]}
                >
                  {item.date}
                </Text>
                <Text
                  style={[
                    styles.dayText,
                    item.selected && styles.dayTextSelected,
                  ]}
                >
                  {item.day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Therapy Progress */}
          <View style={styles.therapySection}>
            <View style={styles.therapyHeader}>
              <View style={styles.therapyInfo}>
                <Text style={styles.therapyTitle}>Speech therapy Phase 1</Text>
                <Text style={styles.therapyStatus}>In Progress</Text>
              </View>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{progressPercentage}%</Text>
              </View>
            </View>

            {/* Progress Circles */}
            <View style={styles.progressCirclesContainer}>
              {progressCircles.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.progressDot,
                    index < completedCircles && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Task Card */}
          <View style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>Task 1: playing something</Text>
                <Text style={styles.taskStatus}>In Progress</Text>
              </View>
              <View style={styles.taskIconCircle}>
                <View style={styles.taskIconInner} />
              </View>
            </View>

            <Text style={styles.taskDescription}>
              Speech therapy Phase 1 Fill out the information and start the
              treatment Fill out the information and start the treatment
            </Text>

            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  calendarCard: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.xxl,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xxxl,
  },
  dayItem: {
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.xxl,
    minWidth: 50,
  },
  dayItemSelected: {
    backgroundColor: "#0C4A6E",
  },
  dateText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  dateTextSelected: {
    color: colors.white,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  dayTextSelected: {
    color: colors.white,
  },
  therapySection: {
    marginBottom: spacing.xl,
  },
  therapyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  therapyInfo: {
    flex: 1,
  },
  therapyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  therapyStatus: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.lg,
  },
  progressText: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  progressCirclesContainer: {
    flexDirection: "row",
    gap: spacing.md,
  },
  progressDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#D1DFE8",
  },
  progressDotCompleted: {
    backgroundColor: "#B8D4E6",
  },
  taskCard: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginTop: spacing.lg,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.md,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  taskStatus: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  taskIconInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0F5",
  },
  taskDescription: {
    fontSize: typography.fontSize.md,
    color: "#A0B8C8",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  continueButton: {
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
