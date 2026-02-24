import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  LayoutAnimation,
  TouchableOpacity,
  Animated
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import LinearGradient from "react-native-linear-gradient";

import { useGroupItems } from "./KOTservice";
import { addToCart, removeFromCart } from "../store/actions/cartActions";
import Icon from "react-native-vector-icons/Entypo";
import { Header } from "@react-navigation/stack";
import { FONT_FAMILY, SECONDARY_COLOR } from "../../util/colors";
const SelectedGroup = ({ route ,navigation}) => {
  const { group, member ,tableData} = route.params;

  const dispatch = useDispatch();
// 🔹 Fetch token from redux user data
  const data = useSelector((state) => state.auth.userData?.data || {});

  // 🔹 Fetch group items
  const groupItems = useGroupItems(data.token, {
    Code: group.Code,
    GroupCode: group.GroupCode,
  });

  // 🔹 Member-specific cart
  const cart = useSelector((state) => state.cart.cart[member?.MemberId] || []);
  const slideAnim = useRef(new Animated.Value(100)).current; // for slide up
  const opacityAnim = useRef(new Animated.Value(0)).current; // for fade in
 useEffect(() => {
    if (cart?.items?.length > 0) {
      // Animate in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [cart]);
  const getItemQuantity = (itemCode) => {
    const found = cart?.items?.find((i) => i.ItemCode === itemCode);
    return found ? found.qty : 0;
  };
   const totalItems = cart?.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0;
  const renderGroupItems = ({ item }) => {
    const qty = getItemQuantity(item.ItemCode);
 return (
      <LinearGradient
        start={{ x: 1, y: 1 }}
        colors={["#f0f0f0", "white"]}
        style={styles.card}
      >
        <View>
          <Text style={styles.title}>{item.Displayas}</Text>
          <Text style={styles.price}>₹{item.SP}</Text>
        </View>

        {qty === 0 ? (
          <Pressable
            onPress={() => {
              dispatch(addToCart(String(member.MemberId), item,tableData));
            }}
            style={styles.addButton}
          >
            <Text style={styles.addText}>Add+</Text>
          </Pressable>
        ) : (
          <View style={styles.qtyContainer}>
            <Pressable
              onPress={() =>
                dispatch(removeFromCart(String(member.MemberId), item))
              }
              style={styles.qtyButton}
            >
              <Text style={styles.qtyText}>−</Text>
            </Pressable>

            <Text style={styles.qtyNumber}>{qty}</Text>

            <Pressable
              onPress={() => dispatch(addToCart(String(member.MemberId), item,tableData))}
              style={styles.qtyButton}
            >
              <Text style={styles.qtyText}>+</Text>
            </Pressable>
          </View>
        )}
      </LinearGradient>
    );
  };
return (
    <View style={{ flex: 1 }}>
      <Header title={group.SubgroupDisplyas} />
      <FlatList
        data={groupItems.data || []}
        renderItem={renderGroupItems}
        keyExtractor={(item) => item?.Code?.toString()}
      />
      
    <Animated.View
      style={{
        position: "absolute",
        alignSelf: "center",
        bottom: 20,
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {cart?.items?.length > 0 && (
        <TouchableOpacity
        onPress={()=>navigation.navigate('Cart')}
          activeOpacity={0.7}
          style={{
            flexDirection: "row",
            backgroundColor: "#025a0fff",
            padding: 10,
            borderRadius: 30,
            elevation: 5,
          }}
        >
          <View style={{ marginLeft: 10 }}>
            <Text
              style={{ fontFamily: FONT_FAMILY.bold, color: "white", fontSize: 15 }}
            >
              View Cart
            </Text>
            <Text
              style={{ fontFamily: FONT_FAMILY.normal, color: "white", fontSize: 13 }}
            >
              {totalItems} {totalItems > 1 ? "items" : "item"}
            </Text>
          </View>
          <Icon
            name="chevron-small-right"
            color="white"
            size={25}
            style={{
              backgroundColor: "#114a16ff",
              borderRadius: 20,
              marginLeft: 10,
              alignSelf: "center",
            }}
          />
        </TouchableOpacity>
      )}
    </Animated.View>
    </View>
  );
};

export default SelectedGroup;

const styles = StyleSheet.create({
  card: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderColor: SECONDARY_COLOR,
    backgroundColor: "white",
  },
  addText: {
    fontFamily: FONT_FAMILY.bold,
    color: SECONDARY_COLOR,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: SECONDARY_COLOR,
    paddingHorizontal: 5,
  },
  qtyButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  qtyText: {
    fontSize: 16,
    color: SECONDARY_COLOR,
    fontFamily: FONT_FAMILY.bold,
  },
  qtyNumber: {
    color: "black",
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },
});
