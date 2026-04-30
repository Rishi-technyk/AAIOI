import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import {SigninWithOTPScreenService} from '../services/SigninWithOTPScreenService'
import messaging, {
} from '@react-native-firebase/messaging';
import { useDispatch } from 'react-redux';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { Toast } from 'react-native-toast-notifications';
import { Loginstyles } from '../Styles/LoginStyles';
import Button2 from '../components/Button2.tsx';
import { FONT_FAMILY } from '../util/colors';
import { loginWithOTP } from '../store/slices/authSlice';
import DeviceInfo from "react-native-device-info";
import { useAppTheme } from '../theme/AppThemeProvider';
const VerifyOTP = ({ route, navigation }) => {
  const [usernameTextValue, setUsernameTextValue] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const dispatch = useDispatch();
  const userType = route?.params?.type;
  const [, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const formatTime = secs => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };


async function getIOSFCMToken() {
  try {
    // 1. Request permission
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log("Notification permission denied");
      return null;
    }

    // 2. Required for iOS
    await messaging().registerDeviceForRemoteMessages();

    // 3. Safe APNS token (iOS)
    const apns = await messaging().getAPNSToken();
    console.log("APNS Token:", apns);

    // 4. Safe FCM token
    const fcm = await messaging().getToken();

    return fcm;
  } catch (e) {
    console.log("iOS FCM ERROR:", e);
    return null;
  }
}


 const VerifySignInOTP = async () => {
  Toast.hideAll();

  if (!usernameTextValue.trim()) {
    Toast.show('Please enter OTP', { type: 'warning' });
    return;
  }

  const permission = await messaging().hasPermission();
  const deviceId=await getIOSFCMToken()
 console.log(deviceId,"hdkewjdwed dsjhdskjsdf s")
   const Version=DeviceInfo.getVersion();
  const payload = {
    member_id: route.params?.memberID,
    otp: usernameTextValue,
    has_notification_permission: permission,
    device_type: Platform.OS.toUpperCase(),
    device_app_version: Version,
    device_id: deviceId,
  };

  setLoadingData(true);

  try {
    const apiRequestObject = {
      body: payload,
    };

    // ⭐ IMPORTANT: store the result
    const response = await dispatch(
      loginWithOTP({ apiRequestObject })
    ).unwrap();
    if (response?.user && response?.token) {
      Toast.show('OTP verified successfully', { type: 'success' });

      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     { name:  'Home' },
      //   ],
      // });

    } else {
      // Handle unexpected payload
      Toast.show('Invalid response from server', {
        type: 'danger',
      });
    }

  } catch (error) {
    // ⭐ Show backend error
    Toast.show(error || 'OTP verification failed', {
      type: 'danger',
    });
  }

  setLoadingData(false);
};



  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);


 

  const resendOTP = async() => {
       let response = await SigninWithOTPScreenService(route?.params?.memberID)
      if (response.status === true) {
 setTimeLeft(300);
     setCanResend(false);
      Alert.alert('Signin With OTP',response.message||'OTP send successfully');
       }else{
         Alert.alert('Signin With OTP', response.message||'Failed to resend OTP.', [
                            {
                                text: 'OK', onPress: () => {
                                    navigation.navigate('LoginScreen')
                                }
                            },
                        ], { cancelable: false });
       }
  };
  return (
    <AuthScreenLayout  title={'Verify OTP'}>
        <View style={{margin:8}}>
          <Text style={[Loginstyles.versionText, styles.helperText]}>
            Please Enter The Valid OTP For{' '}
            {userType === 'waiter' ? 'User Name' : 'Member ID'}:{' '}
            <Text
              style={styles.memberText}
            >
              {route.params?.memberID}
            </Text>
          </Text>
        </View>

        <TextInput
        // ref={userRef}
        maxLength={6}
        placeholder="Enter Your OTP"
        placeholderTextColor={colors.placeholder}

        value={usernameTextValue}
        onChangeText={setUsernameTextValue}
        style={[Loginstyles.input, styles.input]}
        autoCapitalize="none"
        returnKeyType="done"
        keyboardType="decimal-pad"
        onSubmitEditing={VerifySignInOTP}
      />
        {!timeLeft ? (
          <TouchableOpacity style={styles.resendButton} onPress={resendOTP}>
            <Text style={styles.resendText}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.timerText}>
            Resend OTP in {formatTime(timeLeft)}
          </Text>
        )}
        <Button2
          onPress={VerifySignInOTP}
          text={'Verify OTP'}
          loading={loadingData}
        />
     
    </AuthScreenLayout>
  );
};
export default VerifyOTP;
const createStyles = (colors: {
  primary: string;
  text: string;
  textMuted: string;
  border: string;
  surface: string;
}) =>
  StyleSheet.create({
    resendText: { fontFamily: FONT_FAMILY.bold, color: colors.primary },
    timerText: {
      fontFamily: FONT_FAMILY.bold,
      color: colors.primary,
      alignSelf: 'flex-end',
    },
    resendButton: { alignSelf: 'flex-end' },
    helperText: {
      color: colors.textMuted,
    },
    memberText: {
      color: colors.text,
      fontSize: 15,
      fontFamily: FONT_FAMILY.bold,
    },
    input: {
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
    },
  });

