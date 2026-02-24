import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FONT_FAMILY, LIGHT_BLUE, SECONDARY_COLOR } from "../util/colors";
import UniversalModal from "./UniversalModal";
import NewButton from "./Button";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Props {
  onPress: () => void;
}

const AIFilterButton: React.FC<Props> = ({ onPress }) => {
  const [aiModal,setOpenModal]=useState(false)
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  // 🔥 Continuous glow effect
  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, { duration: 1200 }),
      -1, // infinite
      true // reverse
    );

    scale.value = withRepeat(
      withTiming(1.05, { duration: 1200 }),
      -1,
      true
    );
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: interpolate(glow.value, [0, 1], [0, 0.9]),
      shadowRadius: interpolate(glow.value, [0, 1], [0, 18]),
      shadowColor: SECONDARY_COLOR,
    };
  });


  return (
    <Animated.View style={[{ marginLeft: 10 }, animatedStyle]}>
      <TouchableOpacity
        onPress={()=>setOpenModal(true)}
        activeOpacity={0.8}
        style={{
          borderColor: '#1cafffff',
          borderWidth:0.9,
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Icon
          name="robot"
          size={18}
          color={'#1cafffff'}
          style={{ marginRight: 5 }}
        />
        <Text
          style={{
            color: '#1cafffff',
            fontFamily: FONT_FAMILY.bold,
            fontSize: 12,
          }}
        >
          AI Filter
        </Text>
      </TouchableOpacity>
      <UniversalModal setVisible={setOpenModal} visible={aiModal} isFull={true} title="AI Filter">


          <TextInput 
          style={{    borderWidth: 0.3,
            borderRadius: 10,
            padding: 10,
            margin: 15,
            fontFamily: FONT_FAMILY.normal,
            minHeight: 150 ,
            textAlignVertical: "top",
            color: "black",}}
            placeholder='Enter Prompt'
            placeholderTextColor={'grey'}
            
            />
          <View style={{marginHorizontal:20}}>

          <NewButton text="Apply" onPress={onPress}/>
          </View>
      
      </UniversalModal>
    </Animated.View>
  );
};

export default AIFilterButton;
