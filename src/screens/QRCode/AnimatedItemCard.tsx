import { Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { FONT_FAMILY } from "../../util/colors";

interface AnimatedfProps {
  item:any,
  qty:number,onAdd:()=>void,
  onRemove:number,
  index:number,
  modifiers:any,
  setModifierModalItem:()=>void,
  isMember:boolean
}
const AnimatedItemCard:React.FC<AnimatedfProps> = ({ item, qty, onAdd, onRemove, index , modifiers,setModifierModalItem ,isMember=false}) => {
 
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300, delay: index * 50 });
    opacity.value = withTiming(1, { duration: 300, delay: index * 50 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));
const ItemCard = React.memo(({ item, qty, onAdd, onRemove }) => (
    <View
      style={[styles.card]}
    
    >
      <Pressable
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        disabled={!item?.ModifierAllow  }
        onPress={() => {

          setModifierModalItem(item)}}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.Displayas}</Text>
          <Text
            style={[styles.price, { color: item.OpenItem ? "red" : "#977c7cff" }]}
          >
            ₹{item.SP}
          </Text>
        </View>

        {qty === 0 ? (
          <Pressable onPress={onAdd} style={styles.addButton}>
            <Text style={styles.addText}>Add+</Text>
          </Pressable>
        ) : (
          <View style={styles.qtyContainer}>
            <Pressable onPress={onRemove} style={styles.qtyButton}>
              <Text style={styles.qtyText}>−</Text>
            </Pressable>
            <Text style={styles.qtyNumber}>{qty}</Text>
            <Pressable onPress={onAdd} style={styles.qtyButton}>
              <Text style={styles.qtyText}>+</Text>
            </Pressable>
          </View>
        )}
      </Pressable>
{item.Remarks && <Text
        style={{
          marginTop: 5,
          fontFamily: FONT_FAMILY.Muli,
          color: "grey",
        }}
      >
        Remarks: {item.Remarks}
      </Text>}


    </View>
  ));
  
  return (
    <Animated.View style={animatedStyle}>
     {isMember && item.OpenItem ? null :  <ItemCard item={item} qty={qty} onAdd={onAdd} onRemove={onRemove} />}
    </Animated.View>
  );
};

export default AnimatedItemCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor:'white',
    marginHorizontal: 10,
    marginTop:5,
    padding: 10,
    borderRadius: 6,
    
  },
  title: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
  },
  title: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
  },
  price: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
  },
  addButton: {
    borderWidth: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    borderColor: 'green',
    backgroundColor: "white",
  },
  addText: {
    fontFamily: FONT_FAMILY.bold,
    color: 'green',
    fontSize:25,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'green',
    paddingHorizontal: 5,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyText: {
    fontSize: 30,
    color: 'green',
    fontFamily: FONT_FAMILY.bold,
  },
  qtyNumber: {
    color: "black",
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },
});
