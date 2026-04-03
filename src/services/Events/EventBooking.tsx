import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import TicketShimmer from "../../components/TicketShimmer";
import Header from "../../components/Header";
import { javascriptGet } from "../../util/api";
import {PUBLIC_URL} from '@env';
import { ENDPOINT } from "../../util/constant";
import { FONT_FAMILY } from "../../util/colors";
import {  AppStackParamList } from "../../navigation/AppDrawer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery,  } from "@tanstack/react-query";
import { Dropdown } from "react-native-element-dropdown";

type Props = NativeStackScreenProps<AppStackParamList,'EventBooking'>
const EventBooking :React.FC<Props> = ({navigation})=> {
  const userData = useSelector((state: any) => state.auth);
  const [SelectedEvent, setselectedEvent] = useState<any>(null);

const { data: Events } = useQuery({
  queryKey: ['all-event'],
  enabled: false,   // ❌ prevents refetch
});

useEffect(() => {
  if (Events?.length && !SelectedEvent) {
    setselectedEvent(Events[0]); // auto select first event
  }
}, [Events]);

  const [type, setType] = useState<"upcoming" | "past">("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookingsAdmin = async () => {
    setLoading(true);
    const res = await javascriptGet({
      path: `${ENDPOINT.event_admin_bookings}?type=${type}&id=${SelectedEvent?.id}`,
      Token: userData?.token,
    });
console.log( res, '---------------------- res ---------------------');
    if (res?.status) {
      setBookings(res.data);
    }
    setLoading(false);
  };



  useEffect(() => {
     
      fetchBookingsAdmin();
 
  }, [type, SelectedEvent]);

  const renderItem = ({ item }: any) => {
    return(
   <Pressable
   disabled={item.ticket_count +item.waiter_count ==0}
    style={styles.card}
    onPress={() =>
      navigation.navigate("EventBookingDetails", {
        bookingId: item.booking_id,
      })
    }
  >
      <Image
        source={{ uri: `${PUBLIC_URL}event/${item.event_image}` }}
        style={styles.image}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.eventName}>{item.event_name}</Text>

        <View style={styles.row}>
          <Icon name="calendar-today" size={14} color="#6b7280" />
          <Text style={styles.date}>{item.event_date}</Text>
        </View>
{item.ticket_count > 0 &&<View>

         <Text style={styles.subText}>
          {item.ticket_count} Tickets • {item.ticket_types.join(", ")}
        </Text>
</View>}
      </View>

      <View style={styles.right}>
        <Text style={styles.amount}>₹{item.total_amount}</Text>

        <View
          style={[
            styles.badge,
            item.status === "confirmed"
              ? styles.confirmed
              : styles.pending,
          ]}
        >
          <Text style={styles.badgeText}>
            {item.is_staff ? "COMPLIMENTRY" : item.status.toUpperCase()}
          </Text>
        </View>
      {item.waiter_count > 0 && (
  <Text style={styles.subText}>
    {item.waiter_count} Waiter{item.waiter_count > 1 ? "s" : ""} • ₹{item.waiter_amount}
  </Text>
)}
      </View>

    </Pressable>
  )};
  return (
    <View style={{flex:1}}>
      {/* Segmented Control */}

      <Header title={'Event Bookings'}/>
    <View style={styles.container}>
      <View style={styles.segment}>
        <Pressable
          onPress={() => setType("upcoming")}
          style={[styles.segmentBtn, type === "upcoming" && styles.activeSeg]}
        >
          <Text style={styles.segText}>Upcoming</Text>
        </Pressable>
        <Pressable
          onPress={() => setType("past")}
          style={[styles.segmentBtn, type === "past" && styles.activeSeg]}
        >
          <Text style={styles.segText}>Past</Text>
        </Pressable>
      </View>
  <Dropdown
            data={Events || []}
            labelField="name"
            valueField="id"
            placeholder="Choose Event"
            value={SelectedEvent}
            onChange={setselectedEvent}
            style={styles.dropdown}
            placeholderStyle={{ color: '#999' }}
          />
          {!SelectedEvent && (
            <Text style={{ textAlign: 'center', marginTop: 10, color: '#999' }}>
              Please select an event to view dashboard
            </Text>
          )}
      <FlatList
      showsVerticalScrollIndicator={false}
        data={bookings}
        keyExtractor={(item) => item.booking_id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
         ListEmptyComponent={() =>
    loading ? (
      <>
        <TicketShimmer />
        <TicketShimmer />
        <TicketShimmer />
      </>
    ) : (
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          No bookings found
        </Text>
      </View>
    )
  }
      />
    
    </View>
    </View>
  );
}

export default  EventBooking;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f8",
    padding: 16,
  },

  segment: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 16,
  },

  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },

  activeSeg: {
    backgroundColor: "#fff",
  },

  segText: {
    fontFamily: FONT_FAMILY.bold,
    color: "#135bec",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
    alignItems: "center",
  },

  image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },

  eventName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 15,
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },

  date: {
    fontSize: 12,
    color: "#6b7280",
  },

  subText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },

  right: {
    alignItems: "flex-end",
  },

  amount: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: "#111827",
  },

  badge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  confirmed: {
    backgroundColor: "#dcfce7",
  },

  pending: {
    backgroundColor: "#fef3c7",
  },

  badgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.bold,
    color: "#065f46",
  },
   dropdown: {
    backgroundColor: '#f4f6fa',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },

});
