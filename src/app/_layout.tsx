import { ToastComponent } from "@iqorlobanov/react-native-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import * as Font from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { StatusBar, Text } from "react-native";
import { queryClient } from "../shared/api/queryClient";
import { socketService } from "../shared/api/socket";
import "../shared/localization/i18n";
import {
  addNotificationListeners,
  initializePushNotifications,
  showLocalNotification,
} from "../shared/services/pushNotifications";
import { typography } from "../shared/theme/typography";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

interface CustomTextProps {
  style?: any;
  children?: any;
}

// Function to set default font globally by wrapping Text.render or modifying prototype if needed
// However, the cleanest way in modern React Native is often a custom component,
// but for a quick global fix, we can try to intercept the Text component.
const OriginalText = (Text as any).render;
if (OriginalText) {
  (Text as any).render = function (...args: any[]) {
    const result = OriginalText.apply(this, args);
    return {
      ...result,
      props: {
        ...result.props,
        style: [
          { fontFamily: typography.fontFamily.regular },
          result.props.style,
        ],
      },
    };
  };
} else {
  // Legacy / Other versions approach
  // @ts-ignore
  if (Text.defaultProps == null) {
    // @ts-ignore
    Text.defaultProps = {};
  }
  // @ts-ignore
  Text.defaultProps.style = {
    fontFamily: typography.fontFamily.regular,
  };
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Font.loadAsync({
          "Inter-Regular": require("../../assets/fonts/Inter-Regular.ttf"),
          "Inter-Medium": require("../../assets/fonts/Inter-Medium.ttf"),
          "Inter-SemiBold": require("../../assets/fonts/Inter-SemiBold.ttf"),
          "Inter-Bold": require("../../assets/fonts/Inter-Bold.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    socketService.setQueryClient(queryClient);
    initializePushNotifications();

    const cleanupNotifications = addNotificationListeners(
      (notification) => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
      },
    );

    return cleanupNotifications;
  }, []);

  useEffect(() => {
    if (appIsReady) {
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar barStyle="dark-content" backgroundColor="#F7FAFC" />
      <Stack screenOptions={{ headerShown: false }} />
      <ToastComponent />
    </QueryClientProvider>
  );
}
