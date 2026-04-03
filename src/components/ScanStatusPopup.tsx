import React from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import LottieView from "lottie-react-native";
import { FONT_FAMILY } from "../util/colors";

export default function ScanStatusPopup({ visible, type, message, onClose }) {
  const showButton = type === "success" || type === "fail";

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          {/* 🔄 Loading Animation */}
          {type === "loading" && (
            <LottieView
              source={require("../screens/Animations/wave_animation.json")}
              autoPlay
              loop
               style={styles.animationContainer}
            />
          )}

          {/* ✔ Success */}
          {type === "success" && (
            <LottieView
              source={require("../screens/Animations/Success.json")}
              autoPlay
              loop={false}
               style={styles.animationContainer}
            />
          )}

          {/* ❌ Failed */}
          {type === "fail" && (
            <LottieView
              source={require("../screens/Animations/Cross_loop.json")}
              autoPlay
              loop={false}
              style={styles.animationContainer}
            />
          )}

          {/* Message */}
          {type !== "loading" && (
            <Text
              style={[
                styles.msg,
                { color: type === "success" ? "#0a8f45" : "#d32f2f" },
              ]}
            >
              {message}
            </Text>
          )}

          {/* ✅ Done Button */}
          {showButton && (
            <Pressable onPress={onClose} style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    //  flex: 1,
    width: 260,
    backgroundColor: "white",
    paddingVertical: 25,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  msg: {
    marginTop: 5,
    fontSize: 18,
    textAlign: "center",
    fontFamily: FONT_FAMILY.bold,
  },
  doneBtn: {
    marginTop: 15,
    backgroundColor: "#0057ff",
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  doneText: {
    fontSize: 16,
    color: "white",
    fontFamily: FONT_FAMILY.bold,
  },
  animationContainer: { width: 220, height: 220 }
});
