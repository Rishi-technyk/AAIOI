import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  GestureResponderEvent,
} from "react-native";
import { FONT_FAMILY, PURPLE, RED_COLOR } from "../util/colors";

interface Button2Props {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
}

const CancelButton: React.FC<Button2Props> = ({ text, onPress, loading = false }) => {
  return (
    <TouchableOpacity
      style={{ marginVertical: 10 }}
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
    >
      <View style={styles.submitButton}>
        {loading && (
          <ActivityIndicator color={PURPLE} style={{ marginRight: 10 }} />
        )}
        <Text style={styles.buttonText}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CancelButton;

/* -----------------------------------------
   Styles
----------------------------------------- */

const styles = StyleSheet.create({
  submitButton: {
    borderColor: RED_COLOR,
    borderWidth: 2,
    paddingVertical: 20,
    marginHorizontal: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 50,
    flexDirection: "row",
  },
  buttonText: {
    color: RED_COLOR,
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
  },
});
