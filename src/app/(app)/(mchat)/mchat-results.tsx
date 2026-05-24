import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  ProgressBar,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";

export default function MChatResultsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const totalQuestions = 7;
  const concernAnswers = 3;
  const riskLevel = t("mchat.riskMedium");
  const riskPercentage = 43;

  const nextSteps = [
    {
      title: t("mchat.nextStep1Title"),
      body: t("mchat.nextStep1Body"),
    },
    {
      title: t("mchat.nextStep2Title"),
      body: t("mchat.nextStep2Body"),
    },
    {
      title: t("mchat.nextStep3Title"),
      body: t("mchat.nextStep3Body"),
    },
  ];

  const handleClose = () => router.replace("/(app)" as Href);
  const handleConsultDoctor = () =>
    router.push("/(app)/doctor-consultation" as Href);

  return (
    <Screen padded={false} background={colors.surfaceMuted} scroll>
      <ScreenHeader title={t("mchat.resultsTitle")} onBack={handleClose} />

      <View style={styles.body}>
        <Card variant="elevated" padding="lg">
          <Badge label={t("mchat.resultsBadge")} tone="warning" icon="alert-circle" />
          <Text variant="display" style={styles.riskLabel}>
            {t("mchat.riskLevel", { level: riskLevel })}
          </Text>
          <Text variant="body" tone="secondary">
            {t("mchat.riskDescription")}
          </Text>

          <View style={styles.progressRow}>
            <ProgressBar
              value={riskPercentage}
              fillColor={colors.warning}
              trackColor={colors.warningBackground}
              height={10}
            />
            <Text variant="caption" tone="secondary" style={styles.progressLabel}>
              {t("mchat.riskScore", { percent: riskPercentage })}
            </Text>
          </View>
        </Card>

        <Card variant="flat" padding="lg" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text variant="display" tone="brand">
                {totalQuestions}
              </Text>
              <Text variant="caption" tone="secondary">
                {t("mchat.questionsLabel")}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text variant="display" tone="brand">
                {concernAnswers}
              </Text>
              <Text variant="caption" tone="secondary">
                {t("mchat.concernAnswers")}
              </Text>
            </View>
          </View>
        </Card>

        <Card variant="elevated" padding="lg">
          <Text variant="title2">{t("mchat.whatThisMeans")}</Text>
          <Text variant="body" tone="secondary" style={styles.interpretation}>
            {t("mchat.interpretation")}
          </Text>
        </Card>

        <View>
          <SectionHeader title={t("mchat.nextSteps")} />
          <Card variant="flat" padding="lg" style={styles.stepsCard}>
            {nextSteps.map((step, idx) => (
              <View key={step.title} style={styles.step}>
                <View style={styles.stepNum}>
                  <Text variant="body" tone="brand" weight="semibold">
                    {idx + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">
                    {step.title}
                  </Text>
                  <Text variant="bodySmall" tone="secondary" style={styles.stepBody}>
                    {step.body}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        <View style={styles.actions}>
          <Button
            label={t("mchat.consultDoctor")}
            onPress={handleConsultDoctor}
            leadingIcon="medical"
          />
          <Button
            label={t("mchat.backHome")}
            variant="ghost"
            onPress={handleClose}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  riskLabel: {
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  progressRow: {
    marginTop: spacing[4],
    gap: spacing[2],
  },
  progressLabel: {
    textAlign: "right",
  },
  summaryCard: {
    paddingVertical: spacing[5],
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryStat: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.borderSubtle,
  },
  interpretation: {
    marginTop: spacing[3],
  },
  stepsCard: {
    gap: spacing[4],
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing[3],
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBody: {
    marginTop: spacing[1],
  },
  actions: {
    gap: spacing[3],
  },
});
