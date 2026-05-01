import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function MChatPrivacyScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push("/(app)/mchat-questionnaire" as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#E8F0F5" />

      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Ionicons name="close" size={32} color="#0C4A6E" />
      </TouchableOpacity>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { flex: 1 }]} />
        <View style={[styles.progressBar, { flex: 4, opacity: 0.3 }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.spacer} />

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Data Security and{"\n"}privacy policy
          </Text>
        </View>
      </View>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0F5",
  },
  closeButton: {
    position: "absolute",
    top: 60,
    left: spacing.xl,
    zIndex: 10,
    padding: spacing.xs,
  },
  progressContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.md,
    gap: 6,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0C4A6E",
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  spacer: {
    flex: 1,
  },
  titleContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxxl,
    padding: spacing.xxxl,
    paddingVertical: spacing.huge,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    lineHeight: 42,
  },
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
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
