import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerPushToken } from "../../app/(app)/hooks/useNotifications";

type NotificationsModule = typeof import("expo-notifications");

let notificationsModule: NotificationsModule | null = null;
let handlerConfigured = false;
let notificationsUnavailable = false;

async function getNotificationsModule(): Promise<NotificationsModule | null> {
  if (notificationsUnavailable) {
    return null;
  }

  if (!notificationsModule) {
    try {
      notificationsModule = await import("expo-notifications");
    } catch (error) {
      notificationsUnavailable = true;
      console.warn("expo-notifications is unavailable in this build:", error);
      return null;
    }
  }

  return notificationsModule;
}

async function ensureNotificationHandler() {
  if (handlerConfigured) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

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
    await ensureNotificationHandler();

    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return null;
    }

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

export async function addNotificationListeners(
  onReceived?: (
    notification: import("expo-notifications").Notification,
  ) => void,
  onResponse?: (
    response: import("expo-notifications").NotificationResponse,
  ) => void,
) {
  try {
    await ensureNotificationHandler();

    const Notifications = await getNotificationsModule();
    if (!Notifications) {
      return () => {};
    }

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
  } catch (error) {
    console.warn("Failed to attach notification listeners:", error);
    return () => {};
  }
}

export async function showLocalNotification(title: string, body: string) {
  try {
    await ensureNotificationHandler();

    const Notifications = await getNotificationsModule();
    if (!Notifications) return;

    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: null,
    });
  } catch (error) {
    console.warn("Failed to show local notification:", error);
  }
}
