import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Badge,
  Button,
  Card,
  Text,
} from "../../../shared/components/ui";
import { spacing } from "../../../shared/theme";

interface PaywallCardProps {
  title: string;
  description: string;
  purpose?: "SUBSCRIPTION" | "EXTRA_CHILD" | "APPOINTMENT";
}

export function PaywallCard({ title, description, purpose }: PaywallCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card variant="elevated" padding="lg" style={styles.card}>
      <Badge label="Premium" tone="warning" icon="star" />
      <Text variant="title2" style={styles.title}>
        {title}
      </Text>
      <Text variant="body" tone="secondary" style={styles.description}>
        {description}
      </Text>
      <View style={styles.actions}>
        <Button
          label={t("payment.unlock", "Unlock access")}
          onPress={() =>
            router.push(
              purpose
                ? (`/(app)/payment?purpose=${purpose}` as Href)
                : ("/(app)/payment" as Href),
            )
          }
          leadingIcon="lock-open-outline"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
  },
  title: {
    marginTop: spacing[3],
  },
  description: {
    marginTop: spacing[2],
  },
  actions: {
    marginTop: spacing[5],
  },
});
