import React from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  Image,
  Platform,
  TouchableOpacity,
} from "react-native";
import {APP_NAME
} from '@env';
import Svg, { Path } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import DeviceInfo from "react-native-device-info";

import { DARK_BLUE, FONT_FAMILY, PURPLE } from "../util/colors";
import { Loginstyles } from "../Styles/LoginStyles";

// ----------------------- Types -----------------------

interface LoginScreenProps {
  title: string;
  children: React.ReactNode;
  forgotPasswordText?: boolean;
}

// ----------------------- Component -----------------------

const LoginScreen: React.FC<LoginScreenProps> = ({
  title,
  children,
  forgotPasswordText = false,
}) => {
  const navigation = useNavigation<any>();

  const { width, height } = Dimensions.get("window");
  const Version = DeviceInfo.getVersion();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: DARK_BLUE }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* ---------------- SVG Background Shape ---------------- */}
          <Svg
            width={width}
            height={height}
            pointerEvents="none"
            viewBox={`0 0 ${width} ${height}`}
            style={{ position: "absolute" }}
          >
            <Path
              d={`M 0 ${height * 0.45}
              C ${width * 0.5} ${height * 0.5}, 
                ${width * 0.2} ${height * 0.25}, 
                ${width} ${height * 0.2}
              L ${width} ${height} 
              L 0 ${height} Z`}
              fill={PURPLE}
            />
          </Svg>

          {/* ---------------- App Logo ---------------- */}
          <View style={Loginstyles.innerContainer}>
            <Image
              source={require("../../assets/images/Logo.png")}
              style={Loginstyles.logo}
            />
            <Text style={Loginstyles.headdingTitle}>{APP_NAME}</Text>
          </View>

          {/* ---------------- Title ---------------- */}
          <Text style={styles.title}>{title}</Text>

          {/* ---------------- Card Container ---------------- */}
          <View style={Loginstyles.card}>
            {children}

            {!forgotPasswordText && (
              <TouchableOpacity
                style={Loginstyles.backToSignInButton}
                activeOpacity={0.8}
                onPress={() => navigation.goBack()}
              >
                <Text style={Loginstyles.backToSignInText}>Go Back</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ---------------- Forgot Password Button ---------------- */}
          {forgotPasswordText && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={Loginstyles.forgotButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={Loginstyles.forgotPasswordText}>
                Forgot Password?
              </Text>
            </TouchableOpacity>
          )}

          {/* ---------------- App Version ---------------- */}
          <View style={Loginstyles.versionContainer}>
            <Text style={Loginstyles.versionText}>Version: {Version}</Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

// ----------------------- Styles -----------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontFamily: FONT_FAMILY.normal,
    color: "white",
  },
});

export default LoginScreen;
