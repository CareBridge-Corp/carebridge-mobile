import { ToastComponent } from "@iqorlobanov/react-native-toast";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect } from "react";
import { StatusBar, Text, TextInput } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { queryClient } from "../shared/api/queryClient";
import { socketService } from "../shared/api/socket";
import "../shared/localization/i18n";
import { typography } from "../shared/theme";

SplashScreen.preventAutoHideAsync().catch(() => {
  /* it's fine if this rejects (e.g. fast refresh) */
});

/**
 * Apply Inter as the default font family for any legacy `<Text>` / `<TextInput>`
 * that hasn't migrated to the typed `<Text>` primitive yet. Done once at module
 * scope so it survives Fast Refresh without re-applying.
 *
 * NOTE: We intentionally do not monkey-patch `Text.render` — that approach is
 * brittle with React 19 and was the source of the broken font handling.
 */
applyDefaultFontFamily();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    socketService.setQueryClient(queryClient);

    let cleanupNotifications = () => {};

    void import("../shared/services/pushNotifications").then(
      ({ addNotificationListeners }) => {
        void addNotificationListeners(() => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }).then((cleanup) => {
          cleanupNotifications = cleanup;
        });
      },
    );

    return () => {
      cleanupNotifications();
    };
  }, []);

  const onLayoutReady = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutReady}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
          <Stack screenOptions={{ headerShown: false }} />
          <ToastComponent />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function applyDefaultFontFamily() {
  const defaultStyle = { fontFamily: typography.fontFamily.regular };

  const TextAny = Text as unknown as {
    defaultProps?: { style?: unknown };
  };
  TextAny.defaultProps = TextAny.defaultProps || {};
  TextAny.defaultProps.style = [defaultStyle, TextAny.defaultProps.style];

  const InputAny = TextInput as unknown as {
    defaultProps?: { style?: unknown };
  };
  InputAny.defaultProps = InputAny.defaultProps || {};
  InputAny.defaultProps.style = [defaultStyle, InputAny.defaultProps.style];
}
