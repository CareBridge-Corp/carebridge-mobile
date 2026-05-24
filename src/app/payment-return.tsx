import { Href, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { verifyPayment } from "./(app)/hooks/useEntitlements";
import { colors, spacing, typography } from "../shared/theme";

export default function PaymentReturnScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ tx_ref?: string; trx_ref?: string }>();
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const txRef = params.tx_ref || params.trx_ref;
    if (!txRef) {
      setMessage("Payment return received.");
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
          setMessage("Payment verified. Redirecting...");
        }
      } catch {
        if (!cancelled) {
          setMessage("Could not verify payment yet. Check your subscription status.");
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
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.backgroundBlue,
    padding: spacing.xxl,
  },
  text: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    textAlign: "center",
  },
});
