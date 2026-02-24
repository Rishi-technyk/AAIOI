import { useEffect } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { FONT_FAMILY } from "../util/colors";

interface MemberTabPorps{
  id:string,
  selectedMember:any,
  setSelectedMember:()=>void
}
const  MemberTab : React.FC<MemberTabPorps> = ({ id, selectedMember, setSelectedMember }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (selectedMember === id) {
      scale.value = withSpring(1.1, { damping: 8, stiffness: 120 });
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 150 });
    }
  }, [selectedMember]);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  opacity: withSpring(scale.value < 1 ? 0.85 : 1),
}));
 return (
      <Pressable
        onPress={() => setSelectedMember(id)}
        style={[
              styles.memberButton,
          selectedMember === id && styles.activeMemberButton,
        ]}
      >
            <Animated.View style={[animatedStyle]}>
        <Text
          style={[
            styles.memberButtonText,
            selectedMember === id && styles.activeMemberText,
          ]}
        >
          {id}
        </Text>
    </Animated.View>
      </Pressable>
  );
};
export default MemberTab;
const styles = StyleSheet.create({
  memberTabs: {
   flex:1,
   backgroundColor:'red'
  },
  memberButton: {
  
    paddingVertical: 6,
    paddingHorizontal: 14,
   
    borderRadius: 20,
    marginHorizontal: 5,
    // flex:1
  },
  memberButtonText: {
//    fontSize:20,
    fontFamily: FONT_FAMILY.semiBold,
    color: "#333",
  },
 activeMemberButton: {
    backgroundColor: "green",
    borderWidth: 1,
    borderColor: "#537256ff",
  },
   activeMemberText: { color: "#fff" },
});
