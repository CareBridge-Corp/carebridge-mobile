import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import VerifyChildScreen from "../(child)/verify-child";
import VerifyParentScreen from "../(parent)/verify-parent";
import { colors, spacing, typography } from "../../../shared/theme";
import { useProfile } from "../hooks/useProfile";
import { useChildrenStore } from "../store/childrenStore";

export default function VerificationStepperWrapper() {
  const router = useRouter();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { activeChild } = useChildrenStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [initializing, setInitializing] = useState(true);

  const parentStatus = profile?.status || "UNVERIFIED";
  const childStatus = activeChild?.status || "UNVERIFIED";

  useEffect(() => {
    if (!profileLoading) {
      // Determine which step to start on based on verification status
      if (parentStatus === "VERIFIED" && childStatus !== "VERIFIED") {
        // Parent already verified, go to child verification
        setStep(2);
      } else if (parentStatus !== "VERIFIED") {
        // Parent not verified, start with parent
        setStep(1);
      } else if (parentStatus === "VERIFIED" && childStatus === "VERIFIED") {
        // Both verified, go back
        router.back();
        return;
      }
      setInitializing(false);
    }
  }, [profileLoading, parentStatus, childStatus]);

  const handleParentSuccess = () => {
    if (childStatus === "VERIFIED") {
      // Child already verified, go back
      router.back();
    } else {
      // Move to child verification
      setStep(2);
    }
  };

  const handleChildSuccess = () => {
    router.back();
  };

  const handleBack = () => {
    if (step === 2 && parentStatus !== "VERIFIED") {
      // Can go back to parent verification if parent not verified
      setStep(1);
    } else {
      router.back();
    }
  };

  if (profileLoading || initializing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading verification status...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color={colors.primary} />
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.stepIndicator}>
            <View
              style={[
                styles.progressDot,
                (step >= 1 || parentStatus === "VERIFIED") &&
                  styles.progressDotActive,
                parentStatus === "VERIFIED" && styles.progressDotCompleted,
              ]}
            >
              {parentStatus === "VERIFIED" && (
                <Ionicons name="checkmark" size={8} color={colors.white} />
              )}
            </View>
            <Text style={styles.stepLabel}>Parent</Text>
          </View>

          <View
            style={[
              styles.progressLine,
              parentStatus === "VERIFIED" && styles.progressLineActive,
            ]}
          />

          <View style={styles.stepIndicator}>
            <View
              style={[
                styles.progressDot,
                (step >= 2 || childStatus === "VERIFIED") &&
                  styles.progressDotActive,
                childStatus === "VERIFIED" && styles.progressDotCompleted,
              ]}
            >
              {childStatus === "VERIFIED" && (
                <Ionicons name="checkmark" size={8} color={colors.white} />
              )}
            </View>
            <Text style={styles.stepLabel}>Child</Text>
          </View>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <VerifyParentScreen onSuccess={handleParentSuccess} hideHeader />
        ) : (
          <VerifyChildScreen onSuccess={handleChildSuccess} hideHeader />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    padding: spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepIndicator: {
    alignItems: "center",
    gap: spacing.xs,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardLightBlue,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.success,
  },
  stepLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textLight,
    fontWeight: typography.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
});
