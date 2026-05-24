import { Ionicons } from "@expo/vector-icons";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";
import {
  initializePayment,
  PaymentPurpose,
  useEntitlements,
  verifyPayment,
} from "./hooks/useEntitlements";

const PLANS: Array<{
  purpose: PaymentPurpose;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}> = [
  { purpose: "SUBSCRIPTION", icon: "sparkles", color: "#2563EB" },
  { purpose: "EXTRA_CHILD", icon: "person-add", color: "#10B981" },
  { purpose: "APPOINTMENT", icon: "medical", color: "#F59E0B" },
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
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <Text style={styles.title}>{t("payment.title")}</Text>
      <Text style={styles.subtitle}>{t("payment.subtitle")}</Text>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>{t("payment.subscriptionStatus")}</Text>
        <Text style={styles.statusValue}>
          {entitlements?.hasActiveSubscription
            ? t("payment.active")
            : t("payment.inactive")}
        </Text>
        {entitlements?.subscriptionExpiresAt ? (
          <Text style={styles.statusMeta}>
            {t("payment.expires")}{" "}
            {new Date(entitlements.subscriptionExpiresAt).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      {PLANS.filter((plan) => {
        if (!purposeParam) return true;
        return plan.purpose === purposeParam;
      }).map((plan) => (
        <View key={plan.purpose} style={styles.planCard}>
          <View style={styles.planHeader}>
            <View style={[styles.iconCircle, { backgroundColor: plan.color }]}>
              <Ionicons name={plan.icon} size={22} color={colors.white} />
            </View>
            <View style={styles.planText}>
              <Text style={styles.planTitle}>
                {t(`payment.plan.${plan.purpose}.title`)}
              </Text>
              <Text style={styles.planDescription}>
                {t(`payment.plan.${plan.purpose}.description`)}
              </Text>
            </View>
          </View>
          <View style={styles.planFooter}>
            <Text style={styles.price}>{getAmount(plan.purpose)}</Text>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => handlePay(plan.purpose)}
              disabled={processingPurpose === plan.purpose}
            >
              {processingPurpose === plan.purpose ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.payButtonText}>{t("payment.payNow")}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => router.push("/(app)" as Href)}
      >
        <Text style={styles.linkButtonText}>{t("payment.backHome")}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundBlue },
  content: { padding: spacing.xxl, paddingTop: 60, paddingBottom: 40 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  backButton: { marginBottom: spacing.lg },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  statusLabel: { fontSize: typography.fontSize.sm, color: "#94A3B8" },
  statusValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginTop: 4,
  },
  statusMeta: { fontSize: typography.fontSize.sm, color: "#64748B", marginTop: 4 },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
  },
  planHeader: { flexDirection: "row", gap: spacing.lg, marginBottom: spacing.lg },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  planText: { flex: 1 },
  planTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  planDescription: {
    fontSize: typography.fontSize.sm,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 20,
  },
  planFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
    minWidth: 110,
    alignItems: "center",
  },
  payButtonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  linkButton: { alignItems: "center", marginTop: spacing.md },
  linkButtonText: { color: colors.textLink, fontWeight: typography.fontWeight.semibold },
});
