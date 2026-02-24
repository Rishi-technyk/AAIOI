import React, { useEffect } from "react";
import AppDrawer from "./navigation/AppDrawer";
import notifee from '@notifee/react-native';
import messaging, {
} from "@react-native-firebase/messaging";
import useFirebaseInit from "./hooks/useFirebaseInit";
import { PermissionsAndroid } from "react-native";
import { navigate } from "./navigation/RootNavigation";

const BaseContainer: React.FC = () => {

  const requestNotificationPermission = async (): Promise<void> => {
    try {
       await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      
    );
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
       
      } else {
        console.log("Notification permission denied ❌");
      }
    } catch (error) {
      console.log("Permission error:", error);
    }
  };
  const setupNotifications = async () => {
    try {
      await requestNotificationPermission();
      messaging().onMessage(async (remoteMessage) => {
        console.log('Received remote message------------------>>>>>>>>:', remoteMessage);
        await displayNotification(remoteMessage);
        if (remoteMessage?.data?.screen) {
          navigate(remoteMessage?.data?.screen, remoteMessage.data);
        }
      });

      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!===================>>>>>>', remoteMessage);
        await notifee.displayNotification({
          title: remoteMessage.notification?.title,
          body: remoteMessage.notification?.body,
          android: {
            channelId: 'default',
          },
        });
      });
      // messaging().onNotificationOpenedApp((remoteMessage) => {
      //   console.log('Notification opened:===================----------->', remoteMessage);
      //   // Handle navigation or other logic here
      // });
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log( remoteMessage.data, '---------------------- remoteMessage.data ---------------------');
      if (remoteMessage?.data?.screen) {
         setTimeout(() => {
        navigate(remoteMessage.data.screen, remoteMessage.data);
      }, 800); 
      }
    });

      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        console.log('Initial notification:=--------=========------===========000000099999', initialNotification);
        if (initialNotification?.data?.screen) {
        
          navigate(initialNotification?.data?.screen, initialNotification.data);
        }
        // Handle initial notification if needed
      }
    } catch (error) {
      console.error('Error setting up push notifications909090089089988798:', error);
    }
  };
  // Initialize background/foreground FCM listeners
  useFirebaseInit();
  useEffect(() => {
    requestNotificationPermission();
     setupNotifications();
  }, []);

  const displayNotification = async (remoteMessage) => {
    try {
      const { notification, data } = remoteMessage;
      await notifee.requestPermission();
      const channelId = await notifee.createChannel({
        id: 'default',
        name: 'Default Channel',
      });

      await notifee.displayNotification({
        title: notification.title,
        body: notification.body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
        data: data,
      });
    } catch (error) {
      console.error('Error displaying notification:', error);
    }
  };
  return  <AppDrawer />
};

export default BaseContainer;
