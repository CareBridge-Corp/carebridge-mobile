import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { registerPushToken } from "../../app/(app)/hooks/useNotifications";

let handlerConfigured = false;

function ensureNotificationHandler() {
  if (handlerConfigured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
}

export async function initializePushNotifications(): Promise<string | null> {
  try {
    ensureNotificationHandler();

    if (!Device.isDevice) {
      console.warn("Push notifications require a physical device.");
      return null;
    }

    const authToken = await SecureStore.getItemAsync("authToken");
    if (!authToken) {
      return null;
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("Push notification permission was not granted.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "CareBridge",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const tokenResult = await Notifications.getDevicePushTokenAsync();
    const token = tokenResult.data;

    if (token) {
      await registerPushToken(token);
      console.log("Registered device push token with backend.");
    }

    return token ?? null;
  } catch (error) {
    console.warn("Push notification setup failed:", error);
    return null;
  }
}

export function addNotificationListeners(
  onReceived?: (notification: Notifications.Notification) => void,
  onResponse?: (response: Notifications.NotificationResponse) => void,
) {
  ensureNotificationHandler();

  const receivedSub = Notifications.addNotificationReceivedListener(
    (notification) => onReceived?.(notification),
  );
  const responseSub = Notifications.addNotificationResponseReceivedListener(
    (response) => onResponse?.(response),
  );

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
}

export async function showLocalNotification(title: string, body: string) {
  try {
    ensureNotificationHandler();
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to show local notification:", error);
  }
}
