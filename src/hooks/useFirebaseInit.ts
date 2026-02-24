import { useEffect } from "react";
import { useToast } from "react-native-toast-notifications";
import {
  requestUserPermission,
  getFcmToken,
  listenForeground,
  registerNavigationHandlers,
} from "../services/firebaseMessaging";
import { navigationRef } from "../navigation/RootNavigation";

export default function useFirebaseInit() {
  const toast = useToast();

  useEffect(() => {
    (async () => {
   await requestUserPermission();
  
    })();

    registerNavigationHandlers(navigationRef);

    const unsubscribe = listenForeground((remoteMessage) => {
      const msg =
        remoteMessage?.notification?.body ||
        remoteMessage?.data?.message ||
        "Notification received";

      toast.show(msg, { type: "normal" });
    });

    return unsubscribe;
  }, []);
}
