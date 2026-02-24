import messaging, {
  FirebaseMessagingTypes,
} from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Request user permission
export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

// Get FCM token (modular safe)
export async function getFcmToken() {
  let token = await AsyncStorage.getItem("fcmToken");
  if (!token) {
    token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem("fcmToken", token);
    }
  }
  return token;
}

// Foreground messages
export function listenForeground(
  callback: (msg: FirebaseMessagingTypes.RemoteMessage) => void
) {
  return messaging().onMessage(callback);
}

// Background messages
messaging().setBackgroundMessageHandler(
  async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log("Background message:", remoteMessage);
  }
);

// Notification Taps
export function registerNavigationHandlers(navigationRef: any) {
  messaging().onNotificationOpenedApp((remoteMessage) => {
    if (remoteMessage?.data?.screen && navigationRef?.current) {
      navigationRef.current.navigate(remoteMessage.data.screen,remoteMessage.data);
    }
  });

  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data?.screen && navigationRef?.current) {
        setTimeout(
          () => navigationRef.current.navigate(remoteMessage.data.screen,remoteMessage.data),
          500
        );
      }
    });
}
