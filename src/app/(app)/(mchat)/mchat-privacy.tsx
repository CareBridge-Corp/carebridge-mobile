import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  IconButton,
  ProgressBar,
  Screen,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";

export default function MChatPrivacyScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const privacyPoints = [
    {
      title: t("mchat.privacyPoint1Title"),
      body: t("mchat.privacyPoint1Body"),
    },
    {
      title: t("mchat.privacyPoint2Title"),
      body: t("mchat.privacyPoint2Body"),
    },
    {
      title: t("mchat.privacyPoint3Title"),
      body: t("mchat.privacyPoint3Body"),
    },
  ];

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          accessibilityLabel={t("common.cancel")}
          onPress={() => router.back()}
        />
        <View style={styles.progressWrap}>
          <ProgressBar value={20} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text variant="label" tone="brand">
          {t("mchat.privacyStep")}
        </Text>
        <Text variant="display" style={styles.title}>
          {t("mchat.dataSecurityTitle")}
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          {t("mchat.privacyIntro")}
        </Text>

        <View style={styles.list}>
          {privacyPoints.map((pt) => (
            <Card key={pt.title} variant="flat" padding="md" style={styles.point}>
              <View style={styles.pointIcon}>
                <Text variant="title2" tone="brand">
                  ✓
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" weight="semibold">
                  {pt.title}
                </Text>
                <Text variant="bodySmall" tone="secondary" style={styles.pointBody}>
                  {pt.body}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={t("mchat.agreeContinue")}
          onPress={() =>
            router.push("/(app)/mchat-questionnaire" as Href)
          }
          trailingIcon="arrow-forward"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    gap: spacing[3],
  },
  progressWrap: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  title: {
    marginTop: spacing[2],
  },
  subtitle: {
    marginTop: spacing[3],
    marginBottom: spacing[6],
  },
  list: {
    gap: spacing[3],
  },
  point: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  pointBody: {
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
  },
});
