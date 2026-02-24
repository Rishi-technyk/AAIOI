import React from "react";
import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FONT_FAMILY, SECONDARY_COLOR, DARK_BLUE } from "../util/colors";

/* -------------------------------------------
   Types
------------------------------------------- */

interface NewButtonProps {
  text: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

/* -------------------------------------------
   Component
------------------------------------------- */

const NewButton: React.FC<NewButtonProps> = ({
  text,
  onPress,
  loading = false,
  style,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.buttonContainer, style]}
      disabled={loading}
      onPress={onPress}
    >
      {loading && (
        <ActivityIndicator color={"white"} style={{ marginRight: 10 }} />
      )}

      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

export default NewButton;

/* -------------------------------------------
   Styles
------------------------------------------- */

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: SECONDARY_COLOR,
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontFamily: FONT_FAMILY.semiBold,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: DARK_BLUE,
    borderRadius: 10,
  },
});

// import React from 'react';
// import {
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
// } from 'react-native';
// import { FONT_FAMILY, SECONDARY_COLOR,DARK_BLUE } from '../util/colors';

// const NewButton = ({text, onPress, loading}) => {
//   return (
//     <TouchableOpacity
//       activeOpacity={0.9}
//       style={{
//         // flex: 1,
//         alignItems: 'center',
//         justifyContent: 'center',
//         // alignSelf: "flex-end",
//         backgroundColor: SECONDARY_COLOR,
//         padding: 10,
//         borderRadius: 5,
//         flexDirection: 'row',
//       }}
//       disabled={loading}
//       onPress={onPress}>
//       {loading && (
//         <ActivityIndicator color={'white'} style={{marginRight: 10}} />
//       )}
//       <Text
//         style={{
//           color: 'white',
//           fontSize: 16,
//           fontFamily: FONT_FAMILY.semiBold,
//           textAlign: 'center',
//         }}>
//         {text}
//       </Text>
//     </TouchableOpacity>
//   );
// };
// const styles = StyleSheet.create({
//   submitButton: {
//     backgroundColor: DARK_BLUE,
//     borderRadius: 10,
//   },
// });
// export default NewButton;
