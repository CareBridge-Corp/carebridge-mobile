import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import StatusModal from "../shared/components/StatusModal";
import { Screen, Text } from "../shared/components/ui";
import { colors, spacing } from "../shared/theme";
import { waitForPaymentVerification } from "./(app)/hooks/paymentCheckout";

type ModalState = {
  visible: boolean;
  type: "success" | "error" | "info";
  title: string;
  message: string;
};

export default function PaymentReturnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ tx_ref?: string; trx_ref?: string }>();
  const [message, setMessage] = useState(t("payment.verifying"));
  const [modal, setModal] = useState<ModalState>({
    visible: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    const txRef = params.tx_ref || params.trx_ref;
    if (!txRef) {
      setMessage(t("payment.returnReceived"));
      const timer = setTimeout(() => {
        router.replace("/(app)/payment" as Href);
      }, 1500);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    void (async () => {
      try {
        const result = await waitForPaymentVerification(txRef);
        await queryClient.invalidateQueries({ queryKey: ["entitlements"] });
        if (cancelled) return;

        const paid =
          result.payment?.status === "PAID" ||
          result.entitlements?.hasActiveSubscription;

        if (paid) {
          setMessage(t("payment.verifiedRedirect"));
          setModal({
            visible: true,
            type: "success",
            title: t("common.success"),
            message: t("payment.successMessage"),
          });
          return;
        }

        if (result.payment?.status === "FAILED") {
          setMessage(t("payment.notCompletedMessage"));
          setModal({
            visible: true,
            type: "error",
            title: t("payment.failed"),
            message: t("payment.notCompletedMessage"),
          });
          return;
        }

        setMessage(t("payment.verifyPending"));
        setModal({
          visible: true,
          type: "info",
          title: t("payment.pendingTitle"),
          message: t("payment.verifyPending"),
        });
      } catch {
        if (!cancelled) {
          setMessage(t("payment.verifyPending"));
          setModal({
            visible: true,
            type: "info",
            title: t("payment.pendingTitle"),
            message: t("payment.verifyPending"),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.tx_ref, params.trx_ref, queryClient, router, t]);

  return (
    <Screen background={colors.surfaceMuted}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" align="center" style={styles.text}>
          {message}
        </Text>
      </View>

      <StatusModal
        visible={modal.visible}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        primaryButtonText={t("common.ok")}
        onPrimaryPress={() => {
          setModal((current) => ({ ...current, visible: false }));
          router.replace(
            modal.type === "success" ? ("/(app)" as Href) : ("/(app)/payment" as Href),
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: spacing[4],
  },
});
