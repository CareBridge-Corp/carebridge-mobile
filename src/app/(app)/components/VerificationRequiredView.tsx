import { colors, spacing } from "@/shared/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export const VerificationRequiredView = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const handleMChat = () => {
    router.push("/(app)/mchat-privacy" as Href);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <MaterialCommunityIcons
            name="shield-lock"
            size={44}
            color={colors.primary}
          />
        </View>

        <Text style={styles.title}>
          {t("verification.title", "Verification Required")}
        </Text>
        <Text style={styles.subtitle}>
          {t(
            "verification.subtitle",
            "To unlock your personalized schedule and therapy roadmap, we need to complete a brief assessment.",
          )}
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.benefitText}>
              {t("verification.benefit1", "Personalized activity plans")}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.benefitText}>
              {t("verification.benefit2", "Progress tracking")}
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.benefitText}>
              {t("verification.benefit3", "Clinician guidance")}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleMChat}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {t("verification.startButton", "Start M-CHAT Assessment")}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>

        <Text style={styles.infoText}>
          {t("verification.duration", "Takes about 5-10 minutes")}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: colors.backgroundBlue,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: spacing.xxxl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F9FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0C4A6E",
    textAlign: "center",
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: spacing.xxl,
  },
  benefitsList: {
    width: "100%",
    marginBottom: spacing.xxl,
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: "#F8FAFC",
    padding: spacing.md,
    borderRadius: 12,
  },
  benefitText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  button: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: 60,
    borderRadius: 18,
    gap: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: spacing.lg,
    fontWeight: "500",
  },
});
