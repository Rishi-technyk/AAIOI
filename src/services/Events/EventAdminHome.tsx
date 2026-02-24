import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Pressable,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import Icon from "react-native-vector-icons/AntDesign";
import Icons from "react-native-vector-icons/Ionicons";
import { ENDPOINT, FONT_FAMILY } from "../util/constant";
import { useDispatch, useSelector } from "react-redux";
import { FlatList } from "react-native-gesture-handler";
import { javascriptGet } from "../util/api";
import { useQuery } from "@tanstack/react-query";
import DatePicker from "react-native-date-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { triggerLogout } from "../store/actions/authActions";

// 🔹 API Function — returns summary
const getEventAdminDashboard = async (token: string) => {
  const res = await javascriptGet({
    path: ENDPOINT.event_admin_dashboard,
    Token: token,
  });
  console.log(res, "---------------------- res ---------------------");
  console.log(token, "---------------------- res ---------------------");

  if (!res?.status) {
    throw new Error(res.message || "Failed to fetch data");
  }

  return res.summary;
};

const EventAdminHome = ({ navigation }) => {
  const userData = useSelector((state) => state.auth.userData);
  const token = userData?.data?.token;
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
const dispatch = useDispatch();
  // 🔹 React Query Fetch
  const {
    data: summery,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["event-admin-dashboard"],
    queryFn: () => getEventAdminDashboard(token),
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  if (error) {
    Alert.alert("Error", error.message);
  }

  const Menues = {
    EventAdmin: [
      {
        id: 1,
        name: "Ticket Validation",
        img: "https://club26.org/mobileAPI/icons/qr.png",
        navigate: "TicketValidation",
      },
      {
        id: 2,
        name: "Member Tickets",
        img: "https://club26.org/mobileAPI/icons/ticket.png",
        navigate: "Event",
      },
      {
        id: 3,
        name: "My Bookings",
        img: "https://club26.org/mobileAPI/icons/98786876.png",
        navigate: "EventBooking",
      },
    ],
  };

  const renderMenues = ({ item }) =>
   {
       if(userData?.data?.data[0]?.role !== "Admin" && (item.id == 2|| item.id == 3)){
      return null;
    }
    return  (
 
    <Pressable
      onPress={() => navigation.navigate(item.navigate)}
      style={{ maxHeight: 150, alignItems: "center", marginBottom: 30 }}
    >
      <Image source={{ uri: item.img }} height={100} width={100} />
      <Text style={styles.menuText}>{item.name}</Text>
    </Pressable>
  );}

  const fetchSummary = async (date) => {
    try {
      setLoading(true);

      const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD

      const res = await javascriptGet({
        path: `${ENDPOINT.admin_event_summary}?date=${formatted}`,
        Token: userData.data.token,
      });
      setLoading(false);
      if (!res?.status) {
        Alert.alert("Error", res.message || "Failed to fetch summary");
        return;
      }
      console.log(res, "---------------------- res ---------------------");
      // SUCCESS
      Alert.alert("Summary Ready", "Summary downloaded successfully!");
      navigation.navigate("SummeryPDFViewer", {
        html: res.html,
        date: formatted,
      });
      console.log("SUMMARY => ", res.data);
    } catch (error) {
      setLoading(false);
      Alert.alert("Error", "Something went wrong");
    }
  };

  const openDatePicker = () => {
    setOpen(true);
  };
const handleLogOut = async() => {
 Alert.alert(
          "Logout",
          "Are you sure, you want to logout?",
          [
            {
              text: "Yes",
              onPress: async () => {
                await AsyncStorage.clear();

                dispatch(triggerLogout());
                navigation.reset({
                  routes: [{ name: "LoginScreen" }],
                });
              },
            },
            { text: "No" },
          ],
          { cancelable: false }
        );
}
  return (
    <View style={{ flex: 1 }}>
      {/* 🔹 Header */}
         <Pressable style={{position:'absolute',right:20,top:15,zIndex:10}} >
              <Icons
                name="exit-outline"
                size={28}
                color="white"
                onPress={handleLogOut}
              />
            </Pressable>
          <View style={styles.header}>
           
        <View style={styles.headerRow}>
        
          <View style={styles.headerCenter}>
            <Image
              source={require("../assets/images/AeptaLogo.png")}
              style={{ height: 30, width: 30 }}
            />
            <Text style={styles.headerTitle}>Holiday Club</Text>
          </View>
        </View>
      </View>

       {userData?.data?.data[0]?.role == "Admin" && (     <View style={styles.summaryCard}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text style={styles.summaryTitle}>Event Summary</Text>
          <Pressable
            onPress={openDatePicker}
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
          >
            <Icon name="download" size={22} color="#0537ff" />
            <Text>Download Summary</Text>
          </Pressable>
          <DatePicker
            modal
            mode="date"
            open={open}
            date={selectedDate}
            maximumDate={new Date()}
            onConfirm={(date) => {
              setOpen(false);
              setSelectedDate(date);
              fetchSummary(date); // 🔥 Fetch API after picking date
            }}
            onCancel={() => {
              setOpen(false);
            }}
          />
        </View>
        <View style={styles.topStats}>
          <View style={styles.statBox}>
            <Icon name="profile" size={22} color="#0537ff" />
            <Text style={styles.statLabel}>Total Passes</Text>
            <Text style={styles.statValue}>{summery?.total_tickets || 0}</Text>
          </View>

          <View style={styles.statBox}>
            <Icon name="login" size={22} color="#0537ff" />
            <Text style={styles.statLabel}>Total Entry</Text>
            <Text style={styles.statValue}>{summery?.total_entry | 0}</Text>
          </View>

          <View style={styles.statBox}>
            <Icon name="rest" size={22} color="#0537ff" />
            <Text style={styles.statLabel}>Total Buffet</Text>
            <Text style={styles.statValue}>{summery?.total_buffet || 0}</Text>
          </View>
        </View>

        <Text style={styles.breakdownTitle}>Ticket Breakdown</Text>

        <View style={styles.breakdownWrap}>
          {summery?.breakup?.map((item, i) => (
            <View key={i} style={styles.breakdownChip}>
              <Text style={styles.breakdownChipText}>
                {item.ticket_type.toUpperCase()}: {item.total}
              </Text>
            </View>
          ))}
        </View>
      </View>)}

      {/* 🔹 Menus */}
      {/* {userData.data.data[0].role == "Admin" && ( */}
      <View style={{ flex: 1 }}>
        <FlatList
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={()=>refetch()}/>}
          numColumns={2}
          style={{ flex: 1, marginTop: 20 }}
          contentContainerStyle={{ flexGrow: 1 }}
          columnWrapperStyle={{ justifyContent: "space-around" }}
          data={Menues.EventAdmin}
          renderItem={renderMenues}
        />
      </View>
      {/* )} */}
    </View>
  );
};

export default EventAdminHome;

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#151831",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCenter: {
    flex: 0.9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
    fontSize: 25,
    marginLeft: 5,
    fontFamily: FONT_FAMILY.semiBold,
  },

  summaryCard: {
    backgroundColor: "#5a8effff",
    margin: 12,
    padding: 16,
    borderRadius: 16,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    color: "white",
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 12,
  },

  topStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statBox: {
    width: "30%",
    backgroundColor: "#fdfdfd",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    color: "#555",
    fontFamily: FONT_FAMILY.normal,
  },
  statValue: {
    marginTop: 4,
    fontSize: 18,
    color: "#0537ff",
    fontFamily: FONT_FAMILY.bold,
  },

  breakdownTitle: {
    fontSize: 16,
    color: "white",
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 10,
  },
  breakdownWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  breakdownChip: {
    backgroundColor: "white",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#0537ff",
  },
  breakdownChipText: {
    fontFamily: FONT_FAMILY.semiBold,
    color: "#0537ff",
  },

  menuText: {
    fontFamily: FONT_FAMILY.bold,
    color: "grey",
    textAlign: "center",
    marginTop: 20,
  },
});
