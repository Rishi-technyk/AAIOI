import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import Header from "../components/Header";
import { useSelector } from "react-redux";
import { javascriptGet } from "../util/api";
import Icon from "react-native-vector-icons/Entypo";
import { FONT_FAMILY } from "../util/constant";
import { Toast } from "react-native-toast-notifications";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";

// Enable animation for Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
type Props=NativeStackScreenProps<AppStackParamList,'ValidateMemberTickets'>
const ValidateMemberTickets:React.FC<Props> = ({ route,navigation }) => {
  const { memberData } = route.params;
  const userData = useSelector((state) => state.auth.userData);

  const [bookings, setBookings] = useState([]);
  const [openIndex, setOpenIndex] = useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Update only one participant (no full refresh)
  const updateLocalParticipant = (bookingId, updated) => {
    setBookings(prev =>
      prev.map(b => {
        if (b.id !== bookingId) return b;

        return {
          ...b,
          participants: b.participants.map(p =>
            p.id === updated.id ? updated : p
          )
        };
      })
    );
  };

  const fetchBookings = async (nextPage = 1) => {
    const res = await javascriptGet({
      path: `event/bookings/${memberData.id}?page=${nextPage}&limit=10`,
      Token: userData.data.token,
    });
   
    if (res?.status) {
      if (nextPage === 1) {
        setBookings(res.data.bookings);
      } else {
        setBookings(prev => [...prev, ...res.data.bookings]);
      }

      setHasMore(nextPage < res.data.pagination.last_page);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, []);

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    fetchBookings(page + 1);
    setPage(p => p + 1);
    setLoadingMore(false);
  };

  const toggleAccordion = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChangeStatus = (participantId, type, bookingId) => {
    if (!participantId || !type) return;
    if (!["entry", "food", "alcohol", "non_alcohol"].includes(type)) return;

    Alert.alert(
      "Confirm Status Change",
      `Mark ${type.toUpperCase()} as completed?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: () => updateParticipantStatus(participantId, type, bookingId),
        },
      ]
    );
  };

  const updateParticipantStatus = async (participantId, type, bookingId) => {
    const res = await javascriptGet({
      path: `event/participant/status/${participantId}/${type}`,
      Token: userData.data.token,
    });
    if (res?.status) {
      updateLocalParticipant(bookingId, res.participant);
      Toast.show(`${type} updated`, { type: "success" });
    } else {
      Toast.show(res.message, { type: "danger" });
    }
  };
const renderParticipant = (p, bookingId) => {
  const role = userData.data.data[0].role;
  // permissions matching backend
  const canEntry = ["Admin", "EventEntry"].includes(role);
  const canFood = ["Admin", "EventFood"].includes(role);
  const canDrink = ["Admin", "EventDrinks"].includes(role);

  // Drink eligibility (must match backend)
  const isSeniorComplimentary =
    Number(p.is_complimentary) === 1 &&
    ["member", "spouse"].includes(p.ticket_type?.name?.toLowerCase());

  return (
    <View key={p.id} style={styles.participantBox}>
      {/* Info */}
      <View>
        <Text style={styles.pText}>
          Type: <Text style={{ fontFamily: FONT_FAMILY.bold }}>{p.ticket_type?.name}</Text>
        </Text>
        <Text style={styles.pText}>
          Complimentary: {Number(p.is_complimentary) ? "Yes" : "No"}
        </Text>
      </View>

      {/* ENTRY + FOOD SECTION */}
      <View style={styles.participentCont}>

        {/* ENTRY BUTTON (role based) */}
        {canEntry && (
          <Pressable
            disabled={p.entry_status}
            onPress={() => handleChangeStatus(p.id, "entry", bookingId)}
            style={[
              styles.statusBtn,
              { backgroundColor: p.entry_status ? "#d4edda" : "#f8d7da", marginBottom: 10 }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: p.entry_status ? "#155724" : "#721c24" }
              ]}
            >
              Entry: {p.entry_status ? "Done" : "Pending"}
            </Text>
          </Pressable>
        )}

        {/* FOOD BUTTON (role based) */}
        {canFood && (
          <Pressable
            disabled={p.food_status}
            onPress={() => handleChangeStatus(p.id, "food", bookingId)}
            style={[
              styles.statusBtn,
              { backgroundColor: p.food_status ? "#d4edda" : "#f8d7da" }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: p.food_status ? "#155724" : "#721c24" }
              ]}
            >
              Buffet: {p.food_status ? "Done" : "Pending"}
            </Text>
          </Pressable>
        )}
      </View>

      {/* DRINK SECTION (only senior complimentary & correct role) */}
      {canDrink && isSeniorComplimentary && (
        <View style={styles.participentCont}>

          {/* ALCOHOL */}
          <Pressable
            disabled={Number(p.consumed_alcohol) >= 2}
            onPress={() => handleChangeStatus(p.id, "alcohol", bookingId)}
            style={[
              styles.statusBtn,
              { backgroundColor: p.consumed_alcohol ? "#d4edda" : "#f8d7da" }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: p.consumed_alcohol ? "#155724" : "#721c24" }
              ]}
            >
              Alcohol: {p.consumed_alcohol}
            </Text>
          </Pressable>

          {/* NON-ALCOHOL */}
          <Pressable
            disabled={Number(p.consumed_non_alcohol) >= 1}
            onPress={() => handleChangeStatus(p.id, "non_alcohol", bookingId)}
            style={[
              styles.statusBtn,
              { backgroundColor: p.consumed_non_alcohol ? "#d4edda" : "#f8d7da" }
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: p.consumed_non_alcohol ? "#155724" : "#721c24" }
              ]}
            >
              Non-Alcohol: {p.consumed_non_alcohol}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

  const renderBookings = ({ item, index }) => {
    const isOpen = openIndex === index;
    return (
      <View style={styles.card}>
    {userData?.data?.data[0]?.role == 'Admin'&&    <Pressable
                      onPress={() =>
                        navigation.navigate("EventPasses", { bookingId: item.id })
                      }
                      style={{
                        borderWidth: 0.4,
                        borderRadius: 6,
                        borderColor: "black",
                        padding: 5,
                        alignSelf:'flex-end'
                      }}
                    >
                      <Text style={{ color: "black" }}>View Passes</Text>
                    </Pressable>}
        <TouchableOpacity style={styles.headerRow} onPress={() => toggleAccordion(index)}>
          <View>
            <Text style={styles.eventName}>Booking No: {item.booking_no}</Text>
            <Text style={styles.eventSub}>Amount: ₹{item.total_amount}</Text>
            <Text style={styles.eventSub}>Payment: {item.payment_type}</Text>
          </View>

          <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={20} color="black" />
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Participants</Text>

            {item.participants?.length > 0 ? (
              item.participants.map(p => renderParticipant(p, item.id))
            ) : (
              <Text style={styles.noData}>No participants</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Header title="Validate Member Tickets"/>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookings}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default ValidateMemberTickets;


const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    margin: 10,
    padding: 12,
    borderRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eventName: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: "black",
  },
  eventSub: {
    color: "#555",
    fontFamily:FONT_FAMILY.normal,
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 12,
  },
  sectionTitle: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 14,
    color: "black",
    marginBottom: 10,
  },
  participantBox: {
    backgroundColor: "#f5f7fa",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    //   flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
  },
  participentCont:{
    // justifyContent: "space-evenly",
          flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pText: {
    fontFamily: FONT_FAMILY.normal,
    color: "#333",
    fontSize: 12,
    marginBottom: 2,
   
  },
  noData: {
    textAlign: "center",
    color: "#888",
  },
  statusBtn:{
    padding: 6,
    // paddingHorizontal: 12,
    borderRadius: 6,
  },
  statusText:{
    fontFamily: FONT_FAMILY.bold,
    fontSize: 12,
    textAlign:'center'
  }

});
