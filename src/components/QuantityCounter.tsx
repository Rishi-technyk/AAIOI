import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Icon from 'react-native-vector-icons/Entypo'
import { FONT_FAMILY } from "../util/colors";

export default function QuantityCounter({ value, onChange, max, disabled }: any) {
  return (
    <View style={{ flexDirection: "row",alignItems:'center',justifyContent:'space-between'}}>
        <Text style={{fontFamily:FONT_FAMILY.bold,color:'grey',fontSize:15}}>Quantity</Text>
        <View style={{ flexDirection: "row",borderRadius:6,padding:4,alignItems:'center',justifyContent:'space-between',backgroundColor:'#F6F6F8'}}>

      <TouchableOpacity
          activeOpacity={0.8}
        disabled={value === 0 || disabled}
        style={{backgroundColor:'white',borderRadius:2,}}
        onPress={() => onChange(value - 1)}
      >
       <Icon name='minus' size={25} color={value === 0||disabled ?'grey':"#135bec"} />
      </TouchableOpacity>

      <Text style={{ marginHorizontal: 16, fontSize: 18,color:"black",fontFamily:FONT_FAMILY.bold }}>{value}</Text>

      <TouchableOpacity
      activeOpacity={0.8}
        disabled={disabled || (max && value >= max)}
         style={{backgroundColor:'white',borderRadius:2}}
        onPress={() => onChange(value + 1)}
      >
       <Icon name='plus' size={25} color={disabled || (max && value >= max)?'grey':"#135bec"} />
      </TouchableOpacity>
        </View>

    </View>
  );
}
