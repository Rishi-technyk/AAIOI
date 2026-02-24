import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { FlatList } from "react-native-gesture-handler";
import { useGroupItems, useGroupItemsForMember } from "../QRCode/KOTservice";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Icons from "react-native-vector-icons/Entypo";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import AnimatedItemCard from "../QRCode/AnimatedItemCard";
import { Toast } from "react-native-toast-notifications";
// import { addRemark, addToCart, clearAllCart, removeFromCart } from "../../store/actions/cartActions";
// import ModifierModal from "../../components/ModifierModal";
import Header from "../../components/Header";
import { javascriptGet } from "../../util/api";
import { DARK_BLUE, FONT_FAMILY, SECONDARY_COLOR } from "../../util/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
type Props=NativeStackScreenProps<AppStackParamList,'FoodOrder'>
const FoodOrder :React.FC<Props> = ({ navigation,route }) => {
  const { orderType } = route.params || {};
  const userData = useSelector((state) => state.auth);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [groups, setGroups] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedSubGroup, setSelectedSubGroup] = useState(null);
  const [activeBill, setActiveBill] = useState(null);
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);
  const dispatch = useDispatch();
  const [modifierModalItem, setModifierModalItem] = useState(null);
  const cart = useSelector(
    (state) =>
      state?.cart?.cart[`${groups?.member?.MemberId}/Order/Online`] || [],
    shallowEqual
  );
  const totalItems = useMemo(
    () => cart.items?.reduce((sum, item) => sum + (item.qty || 0), 0) || 0,
    [cart.items]
  );
  const getDisplayItem = useCallback(
    (item) => {
      const cartItem = cart?.items?.find((i) => i.ItemCode === item.ItemCode);
      return cartItem ? { ...item, ...cartItem } : item;
    },
    [cart.items]
  );
  const groupItems = useGroupItemsForMember(
    userData.token,
    {
      Code: selectedSubGroup?.Code,
      GroupCode: selectedSubGroup?.GroupCode,
    },
    true,
   orderType?.fetch_from
  );
  const fetchFoodOrderData = async () => {
    const apiobj = {
      path: "locations",
      Token: userData.token,
    };
    return await javascriptGet(apiobj);
  };
  const { data, isRefreshing, refetch } = useQuery({
    queryKey: "foodorder",
    queryFn: fetchFoodOrderData,
  });
  const totalAmount = useMemo(() => {
    return (
      cart?.items?.reduce(
        (sum, item) => sum + (item.qty * parseFloat(item.SP) || 0),
        0
      ) || 0
    );
  }, [cart?.items]);
  const handleAdd = useCallback(
    (item) => {
      if (item.OpenItem && !item.qty) {
        Alert.alert("Info", "Open items not allowed for members");
        return;
      }
      if (groups.card_balance < totalAmount + parseFloat(item.SP)) {
        Toast.show("Low Balance", { type: "warning" });
        return;
      }

      return dispatch(
        addToCart(
          `${groups?.member?.MemberId}/Order/Online`,
          { ...item, discount: "0" },
          {
            LocationCode: selectedLocation,
            MemberId: groups?.member?.MemberId,
            card_balance: parseFloat(groups.card_balance),
            yearCode: groups?.yearCode,
            activeBill: activeBill,
            orderType: orderType,
          }
        )
      );
    },
    [dispatch, groups, totalAmount]
  );
  const handleRemove = useCallback(
    (item) =>
      dispatch(
        removeFromCart(`${groups?.member?.MemberId}/Order/Online`, item)
      ),
    [dispatch, groups]
  );
  const fetchGroupsData = async (locationCode) => {
    const apiObj = {
      path: "member/food_groups?LocationCode=" + locationCode||selectedLocation,
      body: {},
      Token: userData.token,
    };
    const response = await javascriptGet(apiObj);
    setGroups(response.data);
    setSelectedSubGroup(response.data.group[0].group_master.sub_groups[0]);
    setSelectedGroup(response.data.group[0]);
  };
  useEffect(() => {
    if (data?.data) {
      if(totalItems){

        setSelectedLocation(cart?.tableData.LocationCode);
        fetchGroupsData(cart?.tableData.LocationCode);
      }else{

        setSelectedLocation(data.data[0].code);
        fetchGroupsData(data.data[0].code);
      }
    }
   
  }, [data,cart?.tableData?.LocationCode]);
  
  useEffect(() => {
    if (cart?.items?.length > 0) {
      translateY.value = withTiming(0, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      translateY.value = withTiming(100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [cart.items]);

  const animatedCartStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));
  // 🔹 Shimmer for Groups (Left side)
  const renderShimmerGroups = () => (
    <View style={{ backgroundColor: "white", maxWidth: 100 }}>
      {[...Array(8)].map((_, i) => (
        <ShimmerPlaceholder
          key={i}
          style={{
            width: "100%",
            height: 50,
            marginVertical: 6,
            borderRadius: 6,
          }}
        />
      ))}
    </View>
  );

  // 🔹 Shimmer for SubGroups (Top horizontal list)
  const renderShimmerSubGroups = () => (
    <View style={{ flexDirection: "row" }}>
      {[...Array(5)].map((_, i) => (
        <ShimmerPlaceholder
          key={i}
          style={{
            width: 80,
            height: 50,
            borderRadius: 8,
            marginRight: 8,
          }}
        />
      ))}
    </View>
  );

  // 🔹 Shimmer for Items
  const renderShimmerItems = () => (
    <View style={{ padding: 10 }}>
      {[...Array(10)].map((_, i) => (
        <ShimmerPlaceholder
          key={i}
          style={{
            width: "100%",
            height: 60,
            borderRadius: 10,
            marginBottom: 10,
          }}
        />
      ))}
    </View>
  );
  const SubGroupItem = React.memo(
    ({ item, index, selectedSubGroup, onSelect }) => {
      const isSelected = selectedSubGroup?.Code === item?.Code;
      const scale = useSharedValue(isSelected ? 1.1 : 1);
      const translateX = useSharedValue(20);
      useEffect(() => {
        translateX.value = withTiming(0, { duration: 300, delay: index * 50 });
        scale.value = withSpring(isSelected ? 1.1 : 1);
      }, [isSelected]);

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateX: translateX.value }],
      }));
      return (
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={() => onSelect(item)}
            style={[
              styles.subGroupButton,
              {
                backgroundColor: isSelected ? "#f0f0f0" : "white",
                borderRadius: isSelected ? 8 : 0,
                flexDirection: "row",
                // borderBottomColor: isSelected ? DARK_BLUE : "transparent",
              },
            ]}
          >
            <MaterialCommunityIcons
              name="food-variant"
              size={20}
              color={isSelected ? "#1E88E5" : "#757575"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={[
                styles.subGroupTitle,
                {
                  fontFamily: isSelected
                    ? FONT_FAMILY.normal
                    : FONT_FAMILY.normal,
                  color: isSelected ? "#1e88e5" : "grey",
                },
              ]}
            >
              {item.SubgroupDisplyas}{" "}
              <Text
                style={[
                  styles.subGroupCount,
                  {
                    fontFamily: isSelected
                      ? FONT_FAMILY.normal
                      : FONT_FAMILY.normal,
                    color: isSelected ? "#1e88e5" : "grey",
                  },
                ]}
              >
                ({item.item_count})
              </Text>
            </Text>
          </Pressable>
        </Animated.View>
      );
    }
  );
  const GroupItem = React.memo(
    ({ item, index, selectedGroup, setSelectedGroup, setSelectedSubGroup }) => {
      const isSelected =
        item?.group_master?.Code === selectedGroup?.group_master?.Code;
      const scale = useSharedValue(isSelected ? 1.1 : 1);
      const translateY = useSharedValue(20);
      useEffect(() => {
        scale.value = withSpring(isSelected ? 1.1 : 1);
        translateY.value = withTiming(0, { duration: 300, delay: index * 50 });
      }, [isSelected]);

      const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }, { translateY: translateY.value }],
      }));
      return (
        <Animated.View style={animatedStyle}>
          <Pressable
            onPress={() => {
              setSelectedGroup(item);
              setSelectedSubGroup(item.group_master.sub_groups[0]);
            }}
            style={[
              styles.groupButton,
              {
                backgroundColor: isSelected ? SECONDARY_COLOR : "transparent",
                borderTopRightRadius: isSelected ? 10 : 0,
                borderBottomRightRadius: isSelected ? 10 : 0,
              },
            ]}
          >
            <Text
              style={{
                color: isSelected ? "white" : "grey",
                fontFamily: isSelected
                  ? FONT_FAMILY.semiBold
                  : FONT_FAMILY.light,
              }}
            >
              {item.group_master.GroupDisplyas}
            </Text>
          </Pressable>
        </Animated.View>
      );
    }
  );
  const renderGroup = useCallback(
    ({ item, index }) => (
      <GroupItem
        item={item}
        index={index}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        setSelectedSubGroup={setSelectedSubGroup}
      />
    ),
    [selectedGroup]
  );
  const renderSubGroup = useCallback(
    ({ item, index }) => (
      <SubGroupItem
        item={item}
        index={index}
        selectedSubGroup={selectedSubGroup}
        onSelect={setSelectedSubGroup}
      />
    ),
    [selectedSubGroup]
  );
  const getItemQuantity = useCallback(
    (itemCode) => cart?.items?.find((i) => i.ItemCode === itemCode)?.qty || 0,
    [cart.items]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="Food Order">
        <Pressable onPress={() => navigation.navigate("MemberOrders",{fetchGroupsData})}>
          <Text
            style={{
              color: "white",
              marginLeft: 4,
              fontFamily: FONT_FAMILY.semiBold,
            }}
          >
            View Orders
          </Text>
        </Pressable>
      </Header>
    {groups?.card_balance &&  <View
        style={{
          backgroundColor: DARK_BLUE,
          padding: 10,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={{ color: "white", fontFamily: FONT_FAMILY.bold,fontSize:16 }}>
          Card Balance:
        </Text>
        <Text style={{ color: SECONDARY_COLOR, fontFamily: FONT_FAMILY.bold,fontSize:16 }}>
          ₹{Number(groups?.card_balance).toFixed(2)}
        </Text>
      </View>}
     <View
        style={{
          backgroundColor: DARK_BLUE,
          padding: 10,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <Text style={{ color: "white", fontFamily: FONT_FAMILY.bold,fontSize:16 }}>
          Order Type
        </Text>
        <Text style={{ color: 'white', fontFamily: FONT_FAMILY.bold,fontSize:16 }}>
          {orderType?.name || 'N/A'}
        </Text>
      </View>
        <FlatList
          data={data?.data}
          horizontal={true}
          keyExtractor={(item) => item.code.toString()}
          style={{ maxHeight: 70 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
               
                if(totalItems){
                  Alert.alert(
                         "Confirm Selection",
                         "Change of location will clear the cart",
                         [
                           {
                             text: "No",
                             style: "cancel",
                           },
                           {
                             text: "Yes",
                             onPress: () => {
                                dispatch(clearAllCart())
                              setSelectedLocation(item.code);
                fetchGroupsData(item.code);
                             },
                           },
                         ]
                       );
                }else{
                  setSelectedLocation(item.code);
                fetchGroupsData(item.code);
                }
                
              }}
              style={[
                styles.locationcontainer,
                selectedLocation === item.code
                  ? {
                      borderColor: DARK_BLUE,
                      borderWidth: 1,
                      backgroundColor: "#dde3ffff",
                    }
                  : {},
              ]}
            >
              <Text
                style={[
                  styles.locationtext,
                  selectedLocation === item.code
                    ? { color: DARK_BLUE, fontFamily: FONT_FAMILY.semiBold }
                    : {},
                ]}
              >
                {item.LocationName}
              </Text>
            </Pressable>
          )}
        />
        <View
          style={{ flex: 1, backgroundColor: "#f0f0f0", flexDirection: "row" }}
        >
          <View>
            <FlatList
              data={groups?.group || []}
              style={{
                backgroundColor: "white",
                borderRightWidth: 0.6,
                borderRightColor: "grey",
                paddingRight: 5,
                maxWidth: 100,
              }}
              ListEmptyComponent={renderShimmerGroups()}
              renderItem={renderGroup}
              keyExtractor={(item) => item.group_master.Code.toString()}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View>
              <FlatList
                data={selectedGroup?.group_master?.sub_groups || []}
                horizontal
                renderItem={renderSubGroup}
                style={{
                  borderBottomWidth: 0.6,
                  borderBottomColor: "grey",
                  backgroundColor: "white",
                  paddingVertical: 4,
                }}
                contentContainerStyle={{
                  marginLeft: 5,
                  marginVertical: 5,
                  paddingHorizontal: 8,
                }}
                ListEmptyComponent={renderShimmerSubGroups()}
                keyExtractor={(item) => item.Code.toString()}
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <FlatList
              data={groupItems.data || []}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
              renderItem={({ item, index }) => {
                const displayItem = getDisplayItem(item);

                return (
                  <AnimatedItemCard
                    item={displayItem} // 👈 use updated one
                    index={index}
                    qty={getItemQuantity(displayItem.ItemCode)}
                    onAdd={() => handleAdd(displayItem)}
                    setModifierModalItem={setModifierModalItem}
                    modifiers={(modifier, itemCode) => {
                    const hasModifier =
                        displayItem.Remarks?.includes(modifier);
                      if (hasModifier) {
                        dispatch(
                          removeRemark(
                            modifier,
                            itemCode,
                            groups.member.MemberId
                          )
                        );
                      } else {
                        dispatch(
                          addRemark(modifier, itemCode, groups.member.MemberId)
                        );
                      }
                    }}
                    onRemove={() => handleRemove(displayItem)}
                    isMember={true}
                  />
                );
              }}
              ListEmptyComponent={
                groupItems.isLoading
                  ? renderShimmerItems()
                  : () => (
                      <View
                        style={{
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          source={require("../../../assets/images/norecord.png")}
                          style={{ height: 100, width: 100 }}
                        />
                        <Text
                          style={{
                            color: "grey",
                            fontFamily: FONT_FAMILY.normal,
                          }}
                        >
                          No Items Found.
                        </Text>
                      </View>
                    )
              }
              keyExtractor={(item) => item.ItemCode.toString()}
              initialNumToRender={10}
              maxToRenderPerBatch={15}
              windowSize={10}
              removeClippedSubviews
            />
          </View>
        </View>
      <Animated.View style={[styles.cartContainer, animatedCartStyle]}>
        {cart.items?.length > 0 && (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Cart", { activeBill: activeBill })
            }
            activeOpacity={0.8}
            style={styles.cartButton}
          >
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.cartTitle}>View Cart</Text>
              <Text style={styles.cartSubtitle}>
                {totalItems} {totalItems > 1 ? "items" : "item"}
              </Text>
            </View>
            <Icons
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

      <ModifierModal
        visible={modifierModalItem}
        qty={
          modifierModalItem?.ItemCode
            ? getItemQuantity(modifierModalItem?.ItemCode)
            : 0
        }
        onClose={() => setModifierModalItem(null)}
        onAdd={(modifier) => {
          if (
            groups.card_balance <
            totalAmount + parseFloat(modifierModalItem.SP)
          ) {
            Toast.show("Low Balance", { type: "warning" });
            return;
          }
          dispatch(
            addToCart(
              `${groups?.member?.MemberId}/Order/Online`,
              { ...modifierModalItem, discount: "0" },
              {
                 LocationCode: selectedLocation,
                card_balance: parseFloat(groups.card_balance),
                yearCode: groups?.yearCode,
                qty: 1,
              }
            )
          );
          dispatch(
            addRemark(
              modifier,
              modifierModalItem?.ItemCode,
              groups.member.MemberId
            )
          );
          setModifierModalItem(null);
        }}
        token={userData.token}
      />
    </View>
  );
};

export default FoodOrder;

const styles = StyleSheet.create({
  locationcontainer: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 10,
    borderRadius: 10,
    justifyContent: "center",
  },
  locationtext: {
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  groupText: {
    // flex:1,
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  groupButton: {
    padding: 10,
    margin: 5,
  },
  subGroupButton: {
    padding: 11,
  },
  subGroupTitle: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
  },
  subGroupCount: {
    color: "#1e88e5",
  },
  cartContainer: {
    position: "absolute",
    alignSelf: "center",
    bottom: 20,
  },
  cartButton: {
    flexDirection: "row",
    backgroundColor: "#025a0fff",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  cartTitle: {
    fontFamily: FONT_FAMILY.bold,
    color: "white",
    fontSize: 15,
  },
  cartSubtitle: {
    fontFamily: FONT_FAMILY.light,
    color: "white",
    fontSize: 15,
  },
});
