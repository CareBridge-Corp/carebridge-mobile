import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StatusModal from "../../shared/components/StatusModal";
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
  openCheckoutAndReturnTxRef,
  waitForPaymentVerification,
} from "./hooks/paymentCheckout";
import {
  initializePayment,
  PaymentPurpose,
  useEntitlements,
} from "./hooks/useEntitlements";

const PLANS: Array<{
  purpose: PaymentPurpose;
  icon: keyof typeof Ionicons.glyphMap;
}> = [
  { purpose: "SUBSCRIPTION", icon: "sparkles" },
  { purpose: "EXTRA_CHILD", icon: "person-add" },
  { purpose: "APPOINTMENT", icon: "medical" },
];

type ModalState = {
  visible: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
  primaryLabel?: string;
  onPrimary?: () => void;
};

const MODAL_HIDDEN: ModalState = {
  visible: false,
  type: "info",
  title: "",
  message: "",
};

export default function PaymentScreen() {
  const router = useRouter();
  const { purpose: purposeParam } = useLocalSearchParams<{ purpose?: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data: entitlements, isLoading } = useEntitlements();
  const [processingPurpose, setProcessingPurpose] =
    useState<PaymentPurpose | null>(null);
  const [modal, setModal] = useState<ModalState>(MODAL_HIDDEN);

  const closeModal = () => setModal(MODAL_HIDDEN);

  const showModal = (next: Omit<ModalState, "visible">) => {
    setModal({ ...next, visible: true });
  };

  const handlePay = async (purpose: PaymentPurpose) => {
    try {
      setProcessingPurpose(purpose);
      const response = await initializePayment({ purpose });
      const checkoutUrl =
        response.data?.checkout_url || response.checkout_url || null;
      const txRef = response.txRef;

      if (!checkoutUrl || !txRef) {
        showModal({
          type: "error",
          title: t("payment.failed"),
          message: t("payment.checkoutUnavailable"),
          primaryLabel: t("common.ok"),
          onPrimary: closeModal,
        });
        return;
      }

      const verifyTxRef = await openCheckoutAndReturnTxRef(checkoutUrl, txRef);
      const verifyResult = await waitForPaymentVerification(verifyTxRef);
      await queryClient.invalidateQueries({ queryKey: ["entitlements"] });

      const paid =
        verifyResult.payment?.status === "PAID" ||
        verifyResult.entitlements?.hasActiveSubscription;

      if (paid) {
        showModal({
          type: "success",
          title: t("common.success"),
          message: t("payment.successMessage"),
          primaryLabel: t("common.ok"),
          onPrimary: () => {
            closeModal();
            router.replace("/(app)" as Href);
          },
        });
        return;
      }

      if (verifyResult.payment?.status === "FAILED") {
        showModal({
          type: "error",
          title: t("payment.failed"),
          message: t("payment.notCompletedMessage"),
          primaryLabel: t("common.ok"),
          onPrimary: closeModal,
        });
        return;
      }

      showModal({
        type: "info",
        title: t("payment.pendingTitle"),
        message: t("payment.verifyPending"),
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
    } catch (error: unknown) {
      const responseData =
        error && typeof error === "object" && "response" in error
          ? (error as { response?: { data?: { details?: string; error?: string } } })
              .response?.data
          : undefined;
      const details =
        responseData?.details ||
        responseData?.error ||
        (error instanceof Error ? error.message : t("payment.initFailed"));
      showModal({
        type: "error",
        title: t("payment.failed"),
        message: details,
        primaryLabel: t("common.ok"),
        onPrimary: closeModal,
      });
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

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        primaryButtonText={modal.primaryLabel ?? t("common.ok")}
        onPrimaryPress={modal.onPrimary ?? closeModal}
      />
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
