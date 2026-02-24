import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from "react-native-vector-icons/Feather";
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice.js';
import AuthScreenLayout from '../components/AuthScreenLayout';
import Button2 from '../components/Button2.tsx';
import { Loginstyles } from '../Styles/LoginStyles';
import { FONT_FAMILY } from '../util/colors';
import messaging ,{ getMessaging } from '@react-native-firebase/messaging';
import { Toast } from 'react-native-toast-notifications';
import { javascriptPost } from '../util/api';
import { ENDPOINT } from '../util/constant';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { width, height } = Dimensions.get('window');
  const loading = useSelector(s => s.auth.loading);
   const [loadingData, setLoadingData] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err) {
      console.warn('login failed', err);
    }
  };
  const passRef = useRef(null);
  const userRef = useRef(null);

  const authenticateUsers = async () => {

    Toast.hideAll();
    if (email === "") {
      Toast.show("Please enter Member ID", { type: "danger" });

      setLoadingData(false);
      return;
    }
    if (password === "") {
      Toast.show("Please enter password", { type: "danger" });
      setLoadingData(false);
      return;
    }
      setLoadingData(true);
         const apiRequestObject = {
      path: ENDPOINT.login,
      body: {
        memberid: email,
        password: password,
      
      },
    };
    console.log(apiRequestObject)
    const response = await javascriptPost(apiRequestObject);
  console.log(response);
      if (response.status) {
        // dispatch(loginSuccess(response));
        Alert.alert('OTP',response.message);
  navigation.navigate('VerifyOTP', {
          memberID: email,
        });
        setLoadingData(false);
        // navigation.reset({
        //   routes: [{ name: "Home" }],
        // });
      } else {
        Toast.show(
          response.message ? response.message : "incorrect id or password",
          {
            type: "danger",
          }
        );
      }
    
    setLoadingData(false);
  };
  return (
    <>
    <AuthScreenLayout title={'Sign in'} forgotPasswordText={true}>
      <TextInput
        ref={userRef}
        placeholder="MemberID (AA-01)"
        value={email}
        onChangeText={setEmail}
        style={Loginstyles.input}
        placeholderTextColor={'grey'}
        autoCapitalize="none"
        returnKeyType="next"
        // onSubmitEditing={passRef.current?.focus()}
      />
      <View>

      <TextInput
        ref={passRef}
        placeholder="Password(DOB:DDMMYYYY)"
        placeholderTextColor={'grey'}
        value={password}
        onChangeText={setPassword}
        style={Loginstyles.input}
        secureTextEntry={!showPassword}
        onSubmitEditing={authenticateUsers}
      />
 <Pressable
    onPress={() => setShowPassword(prev => !prev)}
    style={{
      position: 'absolute',
      right: 10,
      top: 15,
    }}
  >
    <Ionicons
      name={showPassword ? 'eye-off' : 'eye'}
      size={22}
      color="black"
    />
  </Pressable>
      </View>
      <Button2 text={'Sign In'} onPress={authenticateUsers} loading={loadingData} />

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={Loginstyles.dividor} />
        <Text style={Loginstyles.versionText}>or</Text>
        <View style={Loginstyles.dividor} />
      </View>

      <Button2
        text={'Sign In With OTP'}
        onPress={() => navigation.navigate('SigninWithOTP')}
      />
    </AuthScreenLayout>
           <Pressable
      onPress={() => navigation.navigate("StaffLogin")}
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "flex-end",
          padding:20
        }}
      >
        <Text style={Loginstyles.bottomText}>Staff Login</Text>
        <Icon
          name="arrow-right-circle"
          size={24}
          color="white"
          style={{ paddingHorizontal: 10 }}
        />
      </Pressable> 
      </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 20 },
 
  btn: {
    backgroundColor: '#0066cc',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '600' },
});

export default LoginScreen;
