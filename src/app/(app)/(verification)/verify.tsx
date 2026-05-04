import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from "react-native";
import VerifyChildScreen from "../(child)/verify-child";
import VerifyParentScreen from "../(parent)/verify-parent";
import { colors, spacing } from "../../../shared/theme";

export default function VerificationStepperWrapper() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (step === 2 ? setStep(1) : router.back())}
        >
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View
            style={[styles.progressDot, step >= 1 && styles.progressDotActive]}
          />
          <View style={styles.progressLine} />
          <View
            style={[styles.progressDot, step >= 2 && styles.progressDotActive]}
          />
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.content}>
        {step === 1 ? (
          <VerifyParentScreen onSuccess={() => setStep(2)} hideHeader />
        ) : (
          <VerifyChildScreen onSuccess={() => router.back()} hideHeader />
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 20,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E8F0F5",
  },
  progressDotActive: {
    backgroundColor: "#0C4A6E",
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: "#E8F0F5",
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
});
