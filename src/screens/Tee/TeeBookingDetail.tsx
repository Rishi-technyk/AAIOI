import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import { useSelector } from "react-redux";
import moment from "moment";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { FONT_FAMILY, LIGHT_BLUE, LIGHT_RED, RED_COLOR } from "../../util/colors";
import { Toast } from "react-native-toast-notifications";
import { ENDPOINT } from "../../util/constant";
import { javascriptGet } from "../../util/api";
import { ScrollView } from "react-native-gesture-handler";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const TeeBookingDetail = ({ navigation, route }) => {
  const userData = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);

  const fetchBookingDetails = async () => {
    const apiObj = {
      path:
        ENDPOINT.tee_booking_detail + route.params?.tee_booking_detail_id,
      Token: userData?.token,
      body: {},
    };
    
    const response = await javascriptGet(apiObj);
    if (response?.status) {
      setDetails(response.data);
    }
    // Fetch booking details logic here
  };
  useEffect(() => {
    fetchBookingDetails();
  }, []);

  const cancelBooking = async () => {
    const apiObj = {
      path: ENDPOINT.tee_cancel_booking + details.id,
      Token: userData?.token,
      body: {},
    };
    setLoading(true);

    const respons = await javascriptGet(apiObj);

    setLoading(false);
    if (respons.status) {
      Toast.show(respons.message || "Booking cancelled successfully.", {
        type: "success",
      });
      fetchBookingDetails();
      route.params?.refetch()
    } else {
      Toast.show(respons.message || "Unable to cancel Booking.", {
        type: "success",
      });
    }
  };
console.log( details, '---------------------- details ---------------------');


const refetchdetails=()=>{
    route?.params?.refetch()
    fetchBookingDetails()
}
return (
  <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
    <Header title="Booking Details" />

    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={styles.card}>
        {/* 🔹 Header Row */}
        <View style={styles.rowBetween}>
          <Text style={styles.bookingId}>{details?.bookingId}</Text>

          <View
            style={[
              styles.badge,
              {
                backgroundColor:
                  details?.is_cancelled === 1
                    ? "#DC3545"
                    : moment(
                        `${details?.booking_date} ${details?.tee_time}`
                      ).isAfter(moment())
                    ? "#28A745"
                    : "#F0AD4E",
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {details?.is_cancelled === 1
                ? "Cancelled"
                : "Active"}
            </Text>
          </View>
        </View>

        {/* 🔹 Booked date */}
        <Text style={styles.subText}>
          Booked on{" "}
          {moment(details?.created_at).format("DD MMM YYYY, h:mm A")}
        </Text>

        <View style={styles.divider} />

        {/* 🔹 Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {moment(details?.booking_date).format("DD MMM")}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Tee Time</Text>
            <Text style={styles.value}>
              {details?.tee_time || "N/A"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>Hole</Text>
            <Text style={styles.value}>{details?.hole_number}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* 🔹 Players */}
        <Text style={styles.sectionTitle}>Players</Text>

        {[
          details?.player1_name,
          details?.player2_name,
          details?.player3_name,
          details?.player4_name,
        ]
          .filter(Boolean)
          .map((name, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerIndex}>{index + 1}</Text>
              <Text style={styles.playerName}>{name}</Text>
            </View>
          ))}

        {/* 🔹 Buttons */}
        {moment(
          `${details?.booking_date} ${details?.tee_time}`
        ).isAfter(moment()) &&
          details?.is_cancelled === 0 && details?.created_by === userData?.user?.id  && (
            <View style={{flexDirection:'row',justifyContent:'space-around'}}>
              <Pressable
                style={[styles.editBtn,{backgroundColor:LIGHT_BLUE}]}
                onPress={() =>
                  navigation.navigate("TeeBuddies", {
                    data: details,
                    refetch: refetchdetails,
                  })
                }
              >
                <Text style={styles.editText}>Edit Players</Text>
              </Pressable>
              <Pressable
                style={[styles.editBtn,{borderColor:RED_COLOR,flexDirection:'row',backgroundColor:LIGHT_RED}]}
               onPress={cancelBooking}
              >
                {loading && <ActivityIndicator color={RED_COLOR} style={{marginRight:5}}/>}
                <Text style={[styles.editText,{color:RED_COLOR,}]}>Cancel Booking</Text>
              </Pressable>

            </View>
          )}
      </View>
          <Text style={[styles.sectionTitle,{fontFamily:FONT_FAMILY.light,marginTop:20}]}>Booked By: {details?.player1_name}</Text>

    </ScrollView>
  </View>
);

};
const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1, 1, 1]}
    renderItem={() => (
      <View style={[styles.buddyContainer]}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceholder style={styles.imgStyle} />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ShimmerPlaceholder style={styles.imgStyle} />
            <ShimmerPlaceholder style={styles.imgStyle2} />
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ShimmerPlaceholder style={styles.imgStyle} />
            <ShimmerPlaceholder style={styles.imgStyle2} />
          </View>
        </View>
      </View>
    )}
  />
);
export default TeeBookingDetail;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  bookingId: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: "#012970",
  },

  subText: {
    marginTop: 4,
    color: "#777",
    fontSize: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 14,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: FONT_FAMILY.bold,
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoBox: {
    alignItems: "center",
    flex: 1,
  },

  label: {
    fontSize: 11,
    color: "#888",
  },

  value: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 3,
  },

  sectionTitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 10,
  },

  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  playerIndex: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E8F1FF",
    textAlign: "center",
    lineHeight: 26,
    marginRight: 10,
    fontFamily: FONT_FAMILY.bold,
  },

  playerName: {
    fontFamily: FONT_FAMILY.semiBold,
  },

  editBtn: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },

  editText: {
    // color: SECONDARY_COLOR,
    fontFamily: FONT_FAMILY.bold,
  },
});
