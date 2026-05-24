import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import {
  verifyPayment,
  VerifyPaymentResponse,
} from "./useEntitlements";

export function extractTxRefFromUrl(url: string, fallback: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get("tx_ref") || fallback;
  } catch {
    const match = url.match(/[?&]tx_ref=([^&]+)/);
    return match?.[1] ? decodeURIComponent(match[1]) : fallback;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitForPaymentVerification(
  txRef: string,
  options?: { maxAttempts?: number; delayMs?: number },
): Promise<VerifyPaymentResponse> {
  const maxAttempts = options?.maxAttempts ?? 6;
  const delayMs = options?.delayMs ?? 2000;
  let lastResult: VerifyPaymentResponse | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    lastResult = await verifyPayment(txRef);
    const status = lastResult.payment?.status;

    if (
      status === "PAID" ||
      status === "FAILED" ||
      lastResult.entitlements?.hasActiveSubscription
    ) {
      return lastResult;
    }

    if (attempt < maxAttempts - 1) {
      await delay(delayMs);
    }
  }

  return lastResult ?? verifyPayment(txRef);
}

export async function openCheckoutAndReturnTxRef(
  checkoutUrl: string,
  fallbackTxRef: string,
): Promise<string> {
  let resolvedTxRef: string | null = null;

  const subscription = Linking.addEventListener("url", (event) => {
    if (!event.url.includes("payment-return")) {
      return;
    }

    resolvedTxRef = extractTxRefFromUrl(event.url, fallbackTxRef);
    void WebBrowser.dismissBrowser();
  });

  try {
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      dismissButtonStyle: "close",
      showInRecents: true,
    });
  } finally {
    subscription.remove();
  }

  return resolvedTxRef ?? fallbackTxRef;
}
