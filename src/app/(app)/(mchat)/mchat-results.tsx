import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";

export default function MChatResultsScreen() {
  const router = useRouter();

  // Demo results data
  const totalQuestions = 7;
  const concernAnswers = 3;
  const riskLevel = "Medium";
  const riskPercentage = 43;

  const handleClose = () => {
    router.replace("/(app)" as Href);
  };

  const handleConsultDoctor = () => {
    router.push("/(app)/doctor-consultation" as Href);
  };

  const handleViewDetails = () => {
    // TODO: Navigate to detailed results
    console.log("View details pressed");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>M-CHAT Results</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Risk Level Card */}
        <View style={styles.riskCard}>
          <View style={styles.riskIconContainer}>
            <Ionicons name="alert-circle" size={48} color="#F59E0B" />
          </View>
          <Text style={styles.riskLevel}>{riskLevel} Risk</Text>
          <Text style={styles.riskDescription}>
            Based on the M-CHAT screening results
          </Text>

          {/* Risk Percentage */}
          <View style={styles.percentageContainer}>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{riskPercentage}%</Text>
            </View>
            <Text style={styles.percentageLabel}>Risk Score</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Summary</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{totalQuestions}</Text>
              <Text style={styles.summaryLabel}>Total Questions</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{concernAnswers}</Text>
              <Text style={styles.summaryLabel}>Concern Answers</Text>
            </View>
          </View>
        </View>

        {/* Interpretation Card */}
        <View style={styles.interpretationCard}>
          <View style={styles.interpretationHeader}>
            <Ionicons name="information-circle" size={24} color="#0C4A6E" />
            <Text style={styles.interpretationTitle}>What This Means</Text>
          </View>

          <Text style={styles.interpretationText}>
            Your child's screening indicates a medium risk for autism spectrum
            disorder. This does not mean your child has autism, but it suggests
            that further evaluation by a healthcare professional is recommended.
          </Text>

          <View style={styles.interpretationNote}>
            <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            <Text style={styles.interpretationNoteText}>
              Early screening helps in early intervention
            </Text>
          </View>
        </View>

        {/* Recommendations Card */}
        <View style={styles.recommendationsCard}>
          <Text style={styles.recommendationsTitle}>Next Steps</Text>

          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>1</Text>
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationItemTitle}>
                Consult a Pediatrician
              </Text>
              <Text style={styles.recommendationItemText}>
                Schedule an appointment with a developmental pediatrician for
                comprehensive evaluation
              </Text>
            </View>
          </View>

          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>2</Text>
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationItemTitle}>
                Monitor Development
              </Text>
              <Text style={styles.recommendationItemText}>
                Keep track of your child's developmental milestones and
                behaviors
              </Text>
            </View>
          </View>

          <View style={styles.recommendationItem}>
            <View style={styles.recommendationNumber}>
              <Text style={styles.recommendationNumberText}>3</Text>
            </View>
            <View style={styles.recommendationContent}>
              <Text style={styles.recommendationItemTitle}>
                Early Intervention
              </Text>
              <Text style={styles.recommendationItemText}>
                Consider early intervention services if recommended by your
                doctor
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleConsultDoctor}
            activeOpacity={0.8}
          >
            <Ionicons name="medical" size={20} color={colors.white} />
            <Text style={styles.primaryButtonText}>Consult a Doctor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleViewDetails}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>View Detailed Report</Text>
            <Ionicons name="document-text-outline" size={20} color="#0C4A6E" />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F5",
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
  scrollView: {
    flex: 1,
  },
  riskCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxxl,
    alignItems: "center",
  },
  riskIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  riskLevel: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  riskDescription: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginBottom: spacing.xl,
  },
  percentageContainer: {
    alignItems: "center",
    marginTop: spacing.lg,
  },
  percentageCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  percentageText: {
    fontSize: 40,
    fontWeight: typography.fontWeight.bold,
    color: "#F59E0B",
  },
  percentageLabel: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    fontWeight: typography.fontWeight.medium,
  },
  summaryCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  summaryTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    textAlign: "center",
  },
  summaryDivider: {
    width: 1,
    height: 60,
    backgroundColor: "#D1DFE8",
  },
  interpretationCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  interpretationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  interpretationTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  interpretationText: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing.lg,
  },
  interpretationNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: "#ECFDF5",
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  interpretationNoteText: {
    fontSize: typography.fontSize.sm,
    color: "#059669",
    fontWeight: typography.fontWeight.medium,
  },
  recommendationsCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  recommendationsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.lg,
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  recommendationNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  recommendationNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  recommendationContent: {
    flex: 1,
  },
  recommendationItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  recommendationItemText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  actionButtons: {
    marginHorizontal: spacing.xxl,
    gap: spacing.md,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: "#0C4A6E",
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
});
