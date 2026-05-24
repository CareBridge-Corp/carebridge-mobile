import { Href, useRouter } from "expo-router";
import React from "react";
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

const PRIVACY_POINTS = [
  {
    icon: "shield-checkmark" as const,
    title: "Your data stays private",
    body: "Only you and your assigned clinician can view this screening.",
  },
  {
    icon: "lock-closed" as const,
    title: "Encrypted end-to-end",
    body: "All answers are encrypted in transit and at rest.",
  },
  {
    icon: "person-remove" as const,
    title: "Delete anytime",
    body: "You can withdraw consent and delete a screening at any time.",
  },
];

export default function MChatPrivacyScreen() {
  const router = useRouter();

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.header}>
        <IconButton
          icon="close"
          accessibilityLabel="Close"
          onPress={() => router.back()}
        />
        <View style={styles.progressWrap}>
          <ProgressBar value={20} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <Text variant="label" tone="brand">
          Step 1 of 5
        </Text>
        <Text variant="display" style={styles.title}>
          Data security & privacy
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          {`Before we begin, here's how we protect what you share with us.`}
        </Text>

        <View style={styles.list}>
          {PRIVACY_POINTS.map((pt) => (
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
          label="I agree, continue"
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
