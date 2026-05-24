import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  Badge,
  Button,
  Card,
  Screen,
  ScreenHeader,
  Text,
} from "../../shared/components/ui";
import { colors, layout, spacing } from "../../shared/theme";
import {
  initializePayment,
  PaymentPurpose,
  useEntitlements,
  verifyPayment,
} from "./hooks/useEntitlements";

const PLANS: Array<{
  purpose: PaymentPurpose;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { purpose: "SUBSCRIPTION", icon: "sparkles" },
  { purpose: "EXTRA_CHILD", icon: "person-add" },
  { purpose: "APPOINTMENT", icon: "medical" },
];

export default function PaymentScreen() {
  const router = useRouter();
  const { purpose: purposeParam } = useLocalSearchParams<{ purpose?: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: entitlements, isLoading } = useEntitlements();
  const [processingPurpose, setProcessingPurpose] =
    useState<PaymentPurpose | null>(null);

  const handlePay = async (purpose: PaymentPurpose) => {
    try {
      setProcessingPurpose(purpose);
      const response = await initializePayment({ purpose });
      const checkoutUrl =
        response.data?.checkout_url || response.checkout_url || null;
      const txRef = response.txRef;

      if (!checkoutUrl) {
        Alert.alert("Payment error", "Could not start checkout.");
        return;
      }

      await WebBrowser.openBrowserAsync(checkoutUrl);

      if (txRef) {
        await verifyPayment(txRef);
      }

      await queryClient.invalidateQueries({ queryKey: ["entitlements"] });
      Alert.alert("Payment", "If payment succeeded, your access is now unlocked.");
    } catch (error: any) {
      Alert.alert("Payment failed", error?.message ?? "Unable to initialize payment.");
    } finally {
      setProcessingPurpose(null);
    }
  };

  const getAmount = (purpose: PaymentPurpose) => {
    if (!entitlements) return "";
    if (purpose === "SUBSCRIPTION") {
      return `${entitlements.pricing.subscriptionAmount} ${entitlements.pricing.currency}`;
    }
    if (purpose === "EXTRA_CHILD") {
      return `${entitlements.pricing.extraChildAmount} ${entitlements.pricing.currency}`;
    }
    return `${entitlements.pricing.appointmentAmount} ${entitlements.pricing.currency}`;
  };

  if (isLoading) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const visiblePlans = PLANS.filter(
    (plan) => !purposeParam || plan.purpose === purposeParam,
  );

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title={t("payment.title")} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          {t("payment.subtitle")}
        </Text>

        <Card variant="elevated" padding="lg" style={styles.statusCard}>
          <Text variant="caption" tone="secondary">
            {t("payment.subscriptionStatus").toUpperCase()}
          </Text>
          <View style={styles.statusRow}>
            <Text variant="title2">
              {entitlements?.hasActiveSubscription
                ? t("payment.active")
                : t("payment.inactive")}
            </Text>
            <Badge
              label={
                entitlements?.hasActiveSubscription
                  ? t("payment.active")
                  : t("payment.inactive")
              }
              tone={entitlements?.hasActiveSubscription ? "success" : "warning"}
            />
          </View>
          {entitlements?.subscriptionExpiresAt ? (
            <Text variant="caption" tone="tertiary" style={styles.statusMeta}>
              {t("payment.expires")}{" "}
              {new Date(entitlements.subscriptionExpiresAt).toLocaleDateString()}
            </Text>
          ) : null}
        </Card>

        {visiblePlans.map((plan) => {
          const processing = processingPurpose === plan.purpose;
          return (
            <Card
              key={plan.purpose}
              variant="elevated"
              padding="lg"
              style={styles.planCard}
            >
              <View style={styles.planHeader}>
                <View style={styles.planIcon}>
                  <Ionicons
                    name={plan.icon}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.planText}>
                  <Text variant="title3">
                    {t(`payment.plan.${plan.purpose}.title`)}
                  </Text>
                  <Text variant="bodySmall" tone="secondary">
                    {t(`payment.plan.${plan.purpose}.description`)}
                  </Text>
                </View>
              </View>

              <View style={styles.planFooter}>
                <View>
                  <Text variant="caption" tone="secondary">
                    AMOUNT
                  </Text>
                  <Text variant="title2" tone="brand">
                    {getAmount(plan.purpose)}
                  </Text>
                </View>
                <Button
                  label={t("payment.payNow")}
                  onPress={() => handlePay(plan.purpose)}
                  loading={processing}
                  fullWidth={false}
                  size="sm"
                  trailingIcon="arrow-forward"
                />
              </View>
            </Card>
          );
        })}

        <Button
          label={t("payment.backHome")}
          variant="ghost"
          onPress={() => router.push("/(app)" as Href)}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
    gap: spacing[3],
  },
  subtitle: {
    marginBottom: spacing[2],
  },
  statusCard: {
    gap: spacing[1],
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[1],
  },
  statusMeta: {
    marginTop: spacing[1],
  },
  planCard: {
    gap: spacing[4],
  },
  planHeader: {
    flexDirection: "row",
    gap: spacing[3],
    alignItems: "flex-start",
  },
  planIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
  planText: {
    flex: 1,
    gap: spacing[1],
  },
  planFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing[3],
  },
});
