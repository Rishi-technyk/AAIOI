import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import {SigninWithOTPScreenService} from '../services/SigninWithOTPScreenService'
import messaging, {
  AuthorizationStatus,
} from '@react-native-firebase/messaging';
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import AuthScreenLayout from '../components/AuthScreenLayout';
import { Toast } from 'react-native-toast-notifications';
import { Loginstyles } from '../Styles/LoginStyles';
import Button2 from '../components/Button2.tsx';
import { DARK_BLUE, FONT_FAMILY } from '../util/colors';
import { javascriptPost } from '../util/api';
import { ENDPOINT } from '../util/constant';
import { loginWithOTP } from '../store/slices/authSlice.js';
import DeviceInfo from "react-native-device-info";
const VerifyForgotPasswordOTPScreen = ({ route, navigation }) => {
  const [usernameTextValue, setUsernameTextValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
  const [loadingData, setLoadingData] = useState(false);
  const dispatch = useDispatch();
  const userType = route?.params?.type;
  const data = useSelector(state => state.auth);
  const { width, height } = Dimensions.get('window');
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const formatTime = secs => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  

 const VerifySignInOTP = async () => {
    Toast.hideAll()
    if (usernameTextValue === '') {
      Toast.show('Please enter OTP',{type:'warning'});
      return;
    }

    const cleanedOTP = usernameTextValue.replace(/ /g, '');
    if (cleanedOTP.length === 0) {
      Toast.show(
        'Please enter OTP',
        {type:'warning'}
      );
      return;
    }

    try {
      setLoadingData(true);

       const apiRequestObject = {
            path: ENDPOINT.verify_otp,
            body: {
        member_id: route.params?.memberID,
        otp: usernameTextValue,
        password: passwordValue,
      }
        }

        const response = await javascriptPost(apiRequestObject);
        console.log(response)
      if (response.status==true) {
        setLoadingData(false);
        Toast.show(
          response.message,
        {type:'success'}
        );
        if (response.status === true) {
          // Assuming loginUserSuccessOTP and navigation to home are handled elsewhere
          navigation.navigate('Login')
        }
      } else {
        setLoadingData(false);
        Toast.show( 'Unable to verify OTP',{type:'danger'});
      }
    } catch (error) {
      setLoadingData(false);
      Toast.show( error.message,{type:'danger'});
    }
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
          <Text style={Loginstyles.versionText}>
            Please Enter The Valid OTP For{' '}
            {userType === 'waiter' ? 'User Name' : 'Member ID'}:{' '}
            <Text
              style={{
                color: 'black',
                fontSize: 15,
                fontFamily: FONT_FAMILY.bold,
              }}
            >
              {route.params?.memberID}
            </Text>
          </Text>
        </View>

        <TextInput
        // ref={userRef}
        placeholderTextColor={'grey'}

        maxLength={6}
        keyboardType="email-address"
        placeholder="Enter Your OTP"
        value={usernameTextValue}
        onChangeText={setUsernameTextValue}
        style={Loginstyles.input}
        autoCapitalize="none"
        returnKeyType="next"
       
        onSubmitEditing={VerifySignInOTP}
      />
        <TextInput
        // ref={userRef}
           placeholderTextColor={'grey'}
        keyboardType="email-address"
        placeholder="Enter Password"
        value={passwordValue}
        onChangeText={setPasswordValue}
        style={Loginstyles.input}
        autoCapitalize="none"
        returnKeyType="next"
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
export default VerifyForgotPasswordOTPScreen;
const styles = StyleSheet.create({
  resendText: { fontFamily: FONT_FAMILY.bold, color: DARK_BLUE },
  timerText: {
    fontFamily: FONT_FAMILY.bold,
    color: DARK_BLUE,
    alignSelf: 'flex-end',
  },
  resendButton: { alignSelf: 'flex-end' },
});


