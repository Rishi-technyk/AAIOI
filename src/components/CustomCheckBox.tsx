import React from "react";
import { TouchableOpacity,  StyleSheet, GestureResponderEvent, ViewStyle } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

/* -----------------------------------------
   Types
----------------------------------------- */

interface CustomCheckboxProps {
  checked: boolean;
  onToggle: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onToggle,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.8}
      style={[styles.container, style]}
    >
      <Icon
        name={checked ? "checkbox-marked" : "checkbox-blank-outline"}
        size={24}
        color={checked ? "#007AFF" : "#888"}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
});
