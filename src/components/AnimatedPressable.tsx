import React from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";


interface AnimatedProps {
  onPress:()=>void,
children:React.ReactNode
}
 const AnimatedPressable :React.FC<AnimatedProps> = ({ onPress, children }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View style={[animatedStyle,styles.anim]}>
      <Pressable
        onPressIn={() => (scale.value = withSpring(0.9))}
        onPressOut={() => (scale.value = withSpring(1))}
        onPress={onPress}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};
export default AnimatedPressable
const styles=StyleSheet.create({
  anim:{padding:7,marginHorizontal:5}
})