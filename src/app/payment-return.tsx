import { useQueryClient } from "@tanstack/react-query";
import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Screen, Text } from "../shared/components/ui";
import { colors, spacing } from "../shared/theme";
import { verifyPayment } from "./(app)/hooks/useEntitlements";

export default function PaymentReturnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ tx_ref?: string; trx_ref?: string }>();
  const [message, setMessage] = useState(t("payment.verifying"));

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
        await verifyPayment(txRef);
        await queryClient.invalidateQueries({ queryKey: ["entitlements"] });
        if (!cancelled) {
          setMessage(t("payment.verifiedRedirect"));
        }
      } catch {
        if (!cancelled) {
          setMessage(t("payment.verifyPending"));
        }
      } finally {
        if (!cancelled) {
          setTimeout(() => {
            router.replace("/(app)/payment" as Href);
          }, 1500);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params.tx_ref, params.trx_ref, queryClient, router]);

  return (
    <Screen background={colors.surfaceMuted}>
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text variant="body" align="center" style={styles.text}>
          {message}
        </Text>
      </View>
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
