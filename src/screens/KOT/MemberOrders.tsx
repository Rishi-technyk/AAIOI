import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  Alert,
  TouchableOpacity,
} from "react-native";
import React, { useState,  useRef, useEffect } from "react";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { FlatList, Pressable } from "react-native-gesture-handler";

import { Card } from "react-native-paper";
import { Toast } from "react-native-toast-notifications";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import Header from "../../components/Header";
import { javascriptGet, javascriptPost } from "../../util/api";
import { FONT_FAMILY } from "../../util/colors";
import { useSelector } from "react-redux";

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "0" },
  { label: "Completed", value: "1" },
];
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const MemberOrders :React.FC = ({ navigation,route }) => {
  const userData = useSelector((state) => state.auth);
  const [cancelDurations, setCancelDurations] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const queryClient = useQueryClient();
  const fetchOrders = async ({ pageParam = 1 }) => {
    const apiobj = {
      Token: userData?.token,
      path: `member/orders?page=${pageParam}&status=${selectedFilter}`,
      body: {},
    };

    const response = await javascriptGet(apiobj);

    setCancelDurations(response.cancel_durations ?? 0);
    if (response?.cancel_durations !== undefined) {
      setCancelDurations(response.cancel_durations || 0);
    }
    return response.data;
  };
  const handleViewBill = async (order) => {
    if (!order.BillNo || !order.YearCode || !order.LocationCode) {
      return Toast.show("Unable to download bill.");
    } else {
      navigation.navigate("KotReceipt", {
        token: userData?.token,
        table: { LocationCode: order.LocationCode },
        bill: order,
        isMember: true,
      });
    }
  };
  const flatListRef = useRef();

  useEffect(() => {
    const index = filters.findIndex((f) => f.value === selectedFilter);
    if (index >= 0 && flatListRef.current) {
      flatListRef.current.scrollToIndex({ index, animated: true });
    }
  }, [selectedFilter]);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    refetch,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["member_orders", selectedFilter],
    queryFn: fetchOrders,
    getNextPageParam: (lastPage) => {
      if (lastPage?.current_page < lastPage?.last_page) {
        return lastPage?.current_page + 1;
      }
      return undefined;
    },
  });
console.log( data, '---------------------- data ---------------------');
  const allOrders = data?.pages?.flatMap((page) => page?.data) || [];

  const handleCancelOrder = async (order) => {
    try {
      Alert.alert(
        "Confirm Cancellation",
        "Are you sure you want to cancel this order?",
        [
          {
            text: "No",
            style: "cancel",
          },
          {
            text: "Yes",
            onPress: async () => {
              await cancelOrderApi(order);
            },
          },
        ]
      );
    } catch (error) {
      Toast.show("An error occurred while cancelling the order.");
    }
  };

  const cancelOrderApi = async (order) => {
    
    try {
      const apiobj = {
        Token: userData?.token,
        path: `member/orders/cancel`,
        body: {
          YearCode: order.YearCode,
          LocationCode: order.LocationCode,
          BillNo: order.BillNo,
          Remark:'denwfj'
        },
      };
      const response = await javascriptPost(apiobj);
     
      if (response?.status) {
        Toast.show("Order cancelled successfully.",{type:'success'});
        refetch();
         queryClient.invalidateQueries(["foodorder"])
         route.params.fetchGroupsData()
      } else {
        Toast.show(response?.message || "Failed to cancel order.");
      }
    } catch (error) {
      Toast.show("An error occurred while cancelling the order.");
    }
  };
  const getDeliveryDateTime = (item) => {
    console.log( item?.delivery_time, '---------------------- item?.delivery_time ---------------------');
    if (!item?.delivery_time) return null;

    // Case 1: delivery_time is only "18:20"
    if (item.delivery_time.length === 5) {
      const orderDate = moment(item.CreationDate).format("YYYY-MM-DD");
      return moment(`${orderDate} ${item.delivery_time}`, "YYYY-MM-DD HH:mm");
    }

    // Case 2: already a full datetime
    return moment(item.delivery_time, "YYYY-MM-DD HH:mm:ss");
  };
  // Load more
  const loadMore = () => {
    if (hasNextPage) fetchNextPage();
  };
  const renderShimmerPlaceholder = () => (
    <View style={{ padding: 10 }}>
      {[...Array(10)].map((_, i) => (
        <ShimmerPlaceholder
          key={i}
          style={{
            width: "100%",
            height: 90,
            borderRadius: 10,
            marginBottom: 10,
          }}
        />
      ))}
    </View>
  );
  return (
    <View style={{ flex: 1 }}>
      <Header title="Orders" backButton={true} />

      {/* Filters */}
      <View style={{ paddingVertical: 10, maxHeight: 60 }}>
        <FlatList
          ref={flatListRef}
          horizontal
          data={filters}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.value}
          getItemLayout={(data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          Item={({ item }) => (
            <Pressable
              onPress={() => setSelectedFilter(item.value)}
              style={[
                styles.filterBtn,
                selectedFilter === item.value && styles.activeFilter,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedFilter === item.value && styles.activeFilterText,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
        {cancelDurations > 0 && allOrders.length > 0 && (
          <Text
            style={{
              textAlign: "center",
              color: "gray",
              fontSize: 12,
              marginTop: 5,
            }}
          >
            Note: Orders can be cancelled up to {cancelDurations} minutes before
            delivery time.
          </Text>
        )}
      </View>

      {/* Loader */}
      {isLoading ? (
        renderShimmerPlaceholder()
      ) : (
        <FlatList
          data={allOrders}
          keyExtractor={(item) => item?.id?.toString()}
          onEndReached={loadMore}
          onEndReachedThreshold={0.2}
          refreshing={false}
          contentContainerStyle={{ flexGrow: 1 }}
          onRefresh={refetch}
          ListEmptyComponent={() => (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Image
                source={require("../../../assets/images/norecord.png")}
                style={{ width: 100, height: 100, alignSelf: "center" }}
              />
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          )}
          ListFooterComponent={
            isFetchingNextPage && (
              <ActivityIndicator style={{ marginVertical: 20 }} />
            )
          }
          renderItem={({ item }) => {
            const deliveryMoment = getDeliveryDateTime(item);

            return (
              <Card onPress={() => handleViewBill(item)} style={styles.card}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={styles.billText}>Bill No: {item?.BillNo}</Text>
                  {item?.BillType == "10" ? (
                    <Text style={[styles.billText, { color: "#ada026ff" }]}>
                      [Dine-In]
                    </Text>
                  ) : item?.BillType == "101" ? (
                    <Text style={[styles.billText, { color: "#4caf50" }]}>
                      [Takeaway]
                    </Text>
                  ) : item?.BillType == "102" ? (
                    <Text style={[styles.billText, { color: "#2196f3" }]}>
                      [Home-Delivery]
                    </Text>
                  ) : null}
                </View>
                <View style={[styles.statusBox]}>
                  <Text style={styles.dateText}>
                    Order On: {moment(item?.CreationDate).format("YYYY-MMM-DD, HH:mm")}
                  </Text>
                  {item?.BillStatus !== "0" ? (
                    <View
                      style={[
                        {
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 5,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          item?.BillStatus == "1" && Number(item?.Amount )> 0
                            ? styles.Completed
                            : styles.Cancelled,
                        ]}
                      >
                        {item?.BillStatus == "1" && Number(item?.Amount )> 0 ? "Completed" : "Cancelled"}
                      </Text>
                    </View>
                  ) : (
                    <Text
                      style={{
                        color: item?.BillStatus == "0" ? "blue" : "#4caf50",
                        fontFamily: FONT_FAMILY.bold,
                      }}
                    >
                      {item?.BillStatus == "0" ? "Running..." : "Completed"}
                    </Text>
                  )}
                </View>
               {Number(item?.Amount )> 0 && <View style={[styles.statusBox]}>
                  <Text style={styles.amountText}>
                    Amount: ₹{Math.round(item?.Amount).toFixed(2)}
                  </Text>
                  {item.BillType === "102" &&
                    deliveryMoment &&
                    moment() <
                      deliveryMoment.subtract(cancelDurations, "minutes") && (
                      <TouchableOpacity
                      activeOpacity={0.8}
                        onPress={() => handleCancelOrder(item)}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          backgroundColor: "#f44336",
                          borderRadius: 5,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontFamily: FONT_FAMILY.bold,
                          }}
                        >
                          Cancel Order
                        </Text>
                      </TouchableOpacity>
                    )}
                </View>}
              {Number(item?.Amount )> 0 && <View>
                  {item.BillType === "102"  && (
                    <Text style={styles.dateText}>
                      Delivery Time:{" "}
                      {deliveryMoment?.format("YYYY-MMM-DD HH:mm")}
                    </Text>
                  )}
                </View>}
              </Card>
            );
          }}
        />
      )}
    </View>
  );
};

export default MemberOrders;

const styles = StyleSheet.create({
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: "#f2f2f2",
    marginHorizontal: 5,
    borderRadius: 20,
  },
  activeFilter: {
    backgroundColor: "black",
  },
  filterText: {
    color: "#555",
  },
  activeFilterText: {
    color: "white",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "white",
    marginHorizontal: 15,
    marginVertical: 8,
    padding: 15,
    borderRadius: 10,
    elevation: 3,
  },
  billText: { fontFamily: FONT_FAMILY.bold, fontSize: 15, color: "#333" },
  tableText: { marginTop: 5, fontSize: 14, color: "#555",fontFamily:FONT_FAMILY.bold },
  amountText: { marginTop: 5, fontSize: 16, fontFamily:FONT_FAMILY.bold, color: "#000" 
  },

  Pending: { color: "#ffeb3b" },
  Completed: { color: "#4caf50" },
  Cancelled: { color: "#f44336" },
  statusText: { color: "black", fontWeight: "bold" },
  dateText: {
    marginTop: 8,
    fontSize: 12,
    color: "black",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "gray",
    fontSize: 16,
  },
  statusBox: {
    flex: 1,
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "space-between",
  },
});
