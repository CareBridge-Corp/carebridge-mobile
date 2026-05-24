import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";

const BENEFITS = [
  { key: "benefit1", fallback: "Personalized activity plans" },
  { key: "benefit2", fallback: "Progress tracking" },
  { key: "benefit3", fallback: "Clinician guidance" },
];

/**
 * Empty-state shown on Schedule before verification + screening.
 */
export const VerificationRequiredView = () => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Card variant="elevated" padding="lg">
        <View style={styles.iconCircle}>
          <Ionicons name="lock-closed" size={28} color={colors.primary} />
        </View>

        <Text variant="title1" align="center">
          {t("verification.title", "Verification required")}
        </Text>
        <Text
          variant="body"
          tone="secondary"
          align="center"
          style={styles.subtitle}
        >
          {t(
            "verification.subtitle",
            "Complete a brief assessment to unlock your personalized schedule.",
          )}
        </Text>

        <View style={styles.benefits}>
          {BENEFITS.map((b) => (
            <View key={b.key} style={styles.benefitRow}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={colors.success}
              />
              <Text variant="bodySmall" tone="primary">
                {t(`verification.${b.key}`, b.fallback)}
              </Text>
            </View>
          ))}
        </View>

        <Button
          label={t("verification.startButton", "Start M-CHAT assessment")}
          onPress={() => router.push("/(app)/mchat-privacy" as Href)}
          trailingIcon="arrow-forward"
        />

        <Text
          variant="caption"
          tone="tertiary"
          align="center"
          style={styles.info}
        >
          {t("verification.duration", "Takes about 10 minutes")}
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing[5],
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: spacing[4],
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[5],
  },
  benefits: {
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
  },
  info: {
    marginTop: spacing[3],
  },
});
