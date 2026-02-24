import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import AuthScreenLayout from '../components/AuthScreenLayout';
import Button2 from '../components/Button2.tsx';
import { Loginstyles } from '../Styles/LoginStyles';
import { ENDPOINT } from '../util/constant';
import { javascriptPost } from '../util/api';
import { Toast } from 'react-native-toast-notifications';
const ForgotPassword = ({navigation}) => {

  const [usernameTextValue, setUsernameTextValue] = useState("");
    const [loadingData, setLoadingData] = useState(false);
  const forgotPasswordHandler = async () => {
    Toast.hideAll()
    // navigation.navigate('VerifyForgotPassOTPScreen', { memberID: usernameTextValue })
    const trimmedUsername = usernameTextValue.replace(/ /g, "");

    if (trimmedUsername.length === 0) {
      Toast.show( "Please enter valid Member ID", {
        type: "warning",
      });
      return;
    }

    try {
      setLoadingData(true);
      const apiRequestObject = {
            path: ENDPOINT.forgot_password,
            body: {member_id : trimmedUsername}
        }
        const response = await javascriptPost(apiRequestObject);

      if (response.status) {
        Toast.show(response.message, {
          type: "success",
        });
        navigation.navigate("VerifyForgotPassOTPScreen", {
          memberID: usernameTextValue,
        });
        setUsernameTextValue("");
      } else {
        Toast.show("Failed to send OTP", {
          type: "warning",
        });
        navigation.navigate("LoginScreen");
      }
    } catch (error) {
      console.error("Forgot Password Error:", error);
      Toast.show("An unexpected error occurred", { type: "danger" });
    } finally {
      setLoadingData(false);
    }
  };
  return (
   <AuthScreenLayout title={'Forgot Password'}>
      <Text style={Loginstyles.inputLabel}>Member ID</Text>
        <TextInput
        style={Loginstyles.input}
        placeholderTextColor={'grey'}

      onDone={forgotPasswordHandler}
        maxLength={10}
        keyboardType="email-address"
        placeholder="Enter your Member ID (001A)"
       onSubmitEditing={forgotPasswordHandler}
        onChangeText={setUsernameTextValue}
      />
       <Button2
          onPress={forgotPasswordHandler}
          text={"Forgot Password"}
          loading={loadingData}
        />
   </AuthScreenLayout>
  )
}


export default ForgotPassword
const styles = StyleSheet.create({})
