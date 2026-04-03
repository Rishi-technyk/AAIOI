import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import {PUBLIC_URL} from '@env'
import { useSelector } from "react-redux";
import { javascriptGet } from "../../util/api";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icons from "react-native-vector-icons/Entypo";
import TicketShimmer from "../../components/TicketShimmer";
import { Animated, Easing } from "react-native";
import TicketCard from "../../components/TicketCard";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { Modal } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { DARK_BLUE } from "../../util/colors";
import { TextInput } from "react-native-gesture-handler";
import { ENDPOINT } from "../../util/constant";
import { FONT_FAMILY } from "../../util/colors";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import { RootState } from "../../store/store";
import { Toast } from "react-native-toast-notifications";


type Props=NativeStackScreenProps<AppStackParamList,'Event'>
const Events:React.FC<Props>=({ navigation,route })=> {
  const [loading, setLoading] = useState(true);
  const [waiters, setWaiters] = useState(0);
  const [memberVerifyModal, setMemberVerifyModal] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const userData = useSelector((state:RootState) => state.auth);
  const [isSeatsAvailable, setIsSeatsAvailable] = useState(false);
  const [member, setMember] = useState("");
  const [error, seterror] = useState("");
  const [event, setEvent] = useState<any>(null);
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const slideAnim = useRef(new Animated.Value(100)).current; // start off-screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fetchSettings = async (id: any) => {
    const apiObj = {
      path: ENDPOINT.event_setting + `${route.params.data}?memberid=${id || 0}`,
      Token: userData?.token,
      body: {},
    };
    const res = await javascriptGet(apiObj);
    if (res?.status) {
      setTickets(res.tickets);
      setEvent(res.event);
      setLoading(false);
      setIsSeatsAvailable(res.is_seat_booking_available||false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      // Reset state if needed
      setLoading(true);
      setCart({}); // optional: reset cart
      setTickets([]);
      setEvent(null);
      setWaiters(0);
      fetchSettings();

      return () => {
        // cleanup if needed
      };
    }, [])
  );

  const updateQty = (id: number, qty: number) => {
    setCart((prev) => ({ ...prev, [id]: qty }));
  };

  const ticketTotal = tickets?.reduce(
    (sum, t) => sum + (cart[t.id] || 0) * t.price,
    0
  );

  const waiterTotal =
    event?.waiter && waiters > 0 ? waiters * event.waiter.price : 0;

  const totalAmount = ticketTotal + waiterTotal;

  const totalTickets = Object.values(cart).reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (userData?.user?.role === "Event Admin") {
      setMemberVerifyModal(true);
    }
  }, []);
  const hasSelection = totalTickets > 0 || waiters > 0;
  useEffect(() => {
    if (totalTickets > 0 || waiters > 0) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [totalTickets, waiters]);

  console.log( tickets, '---------------------- event ---------------------');
  const verifyMember = async () => {
    setLoading(true);
    const response = await javascriptGet({
      path: `member/verify/${member}`,
      Token: userData?.token,
      body: {},
    });
    setLoading(false);
    if (response.success) {
      setMember(response.data);
      seterror("");
      setMemberVerifyModal(false);
      fetchSettings(response.data.id);
    } else {
      seterror(response.message || "Invalid Member ID");
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140,backgroundColor:'white' }}
        stickyHeaderIndices={[0]}
        bounces={false}

        showsVerticalScrollIndicator={false}
      >
        {event && (
          <>
            <Image
              source={{
                uri: `${PUBLIC_URL}event/${event.image}`,
              }}
              style={styles.banner}
                resizeMode="stretch"
            />
            <View style={styles.eventBox}>
              <Text style={styles.title}>{event.name}</Text>
              <View style={styles.rowstart}>
                <Icon
                  name="date-range"
                  size={20}
                  color={"#135bec"}
                  style={{ marginRight: 8 }}
                />

                <Text style={styles.meta}>
                  {moment(event.date).format("DD, MMM yy [at] h:m A")}
                </Text>
              </View>

              <View style={styles.rowstart}>
                <Icon
                  name="location-pin"
                  size={20}
                  color={"#135bec"}
                  style={{ marginRight: 8 }}
                />

                <Text style={styles.meta}>{event.location}</Text>
              </View>
              {/* </ScrollView> */}
            </View>
          </>
        )}
        {member?.MemberID && (
          <View
            style={{
              margin: 10,
              padding: 10,
              borderRadius: 10,
              backgroundColor: "white",
            }}
          >
            <Text
              style={{
                color: "black",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
              }}
            >
              Member ID:{member?.MemberID}
            </Text>
            <Text
              style={{
                color: "black",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
              }}
            >
              Member Name:{member?.DisplayName}
            </Text>
          </View>
        )}
        {member?.role=== "Event Admin" && (
          <View>
           {member.Mobile ?
           <Text
              style={{
                color: "black",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
                marginHorizontal: 10,
              }}>Mobile Number</Text> 
           : <Text
              style={{
                color: "red",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
                marginHorizontal: 10,
              }}>Please enter a valid Mobile Number</Text>}
              <TextInput 
              style={{
                backgroundColor: "#f0f0f0",
                padding: 10,
                color: "black",
                borderWidth: error ? 1 : 0,
                borderColor: error && "red",
                marginHorizontal: 10,
                borderRadius: 5,
              }}
              maxLength={10}
              keyboardType="numeric"
              placeholderTextColor={"grey"}
              placeholder="Enter Mobile Number"
              value={member.Mobile}
              onSubmitEditing={verifyMember}
              onChangeText={(val) => {
                setMember((prev) => ({ ...prev, Mobile: val }));
              }}
              />
          </View>
        )}
        {member?.role=== "Event Admin" && (
          <View>
          {member.DisplayName ?
          <Text
              style={{
                color: "black",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
                marginHorizontal: 10,
              }}>Name</Text>
          :  <Text
              style={{
                color: "red",
                fontFamily: FONT_FAMILY.semiBold,
                marginBottom: 10,
                marginHorizontal: 10,
              }}>Please enter a valid Name</Text>}
              <TextInput 
              style={{
                backgroundColor: "#f0f0f0",
                padding: 10,
                color: "black",
                borderWidth: error ? 1 : 0,
                borderColor: error && "red",
                marginHorizontal: 10,
                borderRadius: 5,
              }}
              maxLength={50}
              keyboardType="default"
              placeholderTextColor={"grey"}
              placeholder="Enter Name"
              value={member.DisplayName}
              onSubmitEditing={verifyMember}
              onChangeText={(val) => {
                setMember((prev) => ({ ...prev, DisplayName: val }));
              }}
              />
          </View>
        )}
        <Text style={styles.sectionTitle}>Select Tickets</Text>

        {loading
          ? [1, 2, 3, 4].map((i) => <TicketShimmer key={i} />)
          : tickets?.map((ticket) =>
              ticket.max == 0 ? null : (
                <TicketCard
                  key={ticket.id}
                  data={ticket}
                  quantity={cart[ticket.id] || 0}
                  onChange={(qty) => updateQty(ticket.id, qty)}
                />
              )
            )}
        <View
          style={{
            flex: 1,
            borderWidth: 0.3,
            marginTop: 20,
            marginHorizontal: 20,
          }}
        />
        {event?.waiter && event?.waiter.remaining > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginBottom: 10 }]}>
              Waiter
            </Text>

            <View
              style={{
                marginHorizontal: 16,
                backgroundColor: "#fff",
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontFamily: FONT_FAMILY.bold, color: "black" }}>
                Personal Waiter
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ color: "#6b7280", marginVertical: 6 }}>
                  ₹{event.waiter.price} per waiter
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    borderRadius: 6,
                    padding: 4,
                    justifyContent: "space-between",
                    backgroundColor: "#F6F6F8",
                  }}
                >
                  <Pressable
                    style={{ backgroundColor: "white", borderRadius: 2 }}
                    disabled={waiters === 0}
                    onPress={() => setWaiters((w) => Math.max(0, w - 1))}
                  >
                    <Icons
                      name="minus"
                      size={26}
                      color={waiters === 0 ? "grey" : "#135bec"}
                    />
                  </Pressable>

                  <Text
                    style={{
                      marginHorizontal: 16,
                      fontSize: 16,
                      color: "black",
                      fontFamily: FONT_FAMILY.bold,
                    }}
                  >
                    {waiters}
                  </Text>

                  <Pressable
                    disabled={waiters >= event.waiter.remaining}
                    onPress={() => setWaiters((w) => w + 1)}
                  >
                    <Icons
                      name="plus"
                      size={26}
                      color={
                        waiters >= event.waiter.remaining ? "grey" : "#135bec"
                      }
                    />
                  </Pressable>
                </View>
              </View>

              <Text style={{ marginTop: 6, fontSize: 12, color: "#9ca3af" }}>
                Max allowed: {event.waiter.remaining}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      {/* Bottom Bar */}
      <Animated.View
        pointerEvents={!hasSelection ? "none" : "auto"}
        style={[
          styles.bottomBar,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View>
          <Text style={styles.totalLabel}>
            Total ({totalTickets} Ticket(s)
            {waiters ? ` + ${waiters} Waiter(s)` : ""})
          </Text>
          <Text style={styles.totalAmount}>₹{totalAmount}</Text>
        </View>

        <Pressable
          style={styles.nextBtn}
          // disabled={totalAmount === 0}
          
          onPress={() =>

         {
        if(member.role === "Event Admin" && (!member.Mobile || !member.DisplayName)){
          Toast.show("Please enter valid Guest details", {
            type:'warning',
            placement:'top',
            duration:3000
          });
          return;
        }

          isSeatsAvailable ? navigation.navigate("EventSeats",
            {
                event,
              tickets: tickets, // ✅ IMPORTANT
              cart,
              totalAmount,
              totalTickets,
              waiters,
             member:
                userData?.user?.role === "Event Admin" ? member : undefined,
            }
           ) : navigation.navigate("EventCheckOut", {
              event,
              tickets: tickets, // ✅ IMPORTANT
              cart,
              totalAmount,
              totalTickets,
              waiters,
              member:
                userData?.user?.role === "Event Admin" ? member : undefined,
            })}
          }
        >
          <Text style={styles.nextTxt}>{isSeatsAvailable ? 'Book Seats' : 'Check Out'}</Text>
          <Icon name="keyboard-arrow-right" size={20} color="white" />
        </Pressable>
      </Animated.View>

      {memberVerifyModal && (
        <Modal
          onDismiss={() => navigation.goBack()}
          visible={memberVerifyModal}
        >
          <KeyboardAwareScrollView>
            <View
              style={{
                backgroundColor: "white",
                margin: 10,
                borderRadius: 10,
                padding: 20,
                justifyContent: "flex-start",
              }}
            >
              <Text
                style={{
                  color: "black",
                  fontFamily: FONT_FAMILY.semiBold,
                  marginBottom: 10,
                }}
              >
                Verify Member
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#f0f0f0",
                  padding: 10,
                  color: "black",
                  borderWidth: error ? 1 : 0,
                  borderColor: error && "red",
                }}
                placeholderTextColor={"grey"}
                placeholder="Enter Member ID"
                value={member}
                onSubmitEditing={verifyMember}
                onChangeText={(val) => {
                  setMember(val);
                  if (error) {
                    seterror("");
                  }
                }}
                // error={true}
              />
              {error && (
                <Text
                  style={{
                    color: "red",
                    fontFamily: FONT_FAMILY.light,
                    marginBottom: 10,
                  }}
                >
                  {error}
                </Text>
              )}
              <Pressable
                onPress={verifyMember}
                style={{
                  backgroundColor: DARK_BLUE,
                  padding: 10,
                  borderRadius: 7,
                  marginTop: 20,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {loading && (
                  <ActivityIndicator
                    color={"white"}
                    style={{ marginRight: 10 }}
                  />
                )}
                <Text
                  style={{
                    color: "white",
                    fontFamily: FONT_FAMILY.normal,
                  }}
                >
                  Verify
                </Text>
              </Pressable>
            </View>
          </KeyboardAwareScrollView>
        </Modal>
      )}
    </View>
  );
}

export default Events; 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f8",
  },

  /* 🔹 Banner Image */
  banner: {
    width: "100%",
    height: 260,
    resizeMode: "cover",
  },

  /* 🔹 Event Card */
  eventBox: {
    marginHorizontal: 16,
    marginTop: -40,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  title: {
    fontSize: 20,
    color: "#111827",
    fontFamily: FONT_FAMILY.bold,
  },

  meta: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
    fontFamily: FONT_FAMILY.normal,
  },

  /* 🔹 Section Title */
  sectionTitle: {
    marginTop: 24,
    marginHorizontal: 16,
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: "#111827",
  },

  /* 🔹 Bottom Bar */
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },

  totalLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: FONT_FAMILY.bold,
  },

  totalAmount: {
    fontSize: 20,
    color: "#111827",
    marginTop: 4,
    fontFamily: FONT_FAMILY.bold,
  },

  nextBtn: {
    backgroundColor: "#135bec",
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    flexDirection: "row",
  },
  nextTxt: {
    color: "white",
    fontFamily: FONT_FAMILY.semiBold,
  },
  rowstart: {
    flexDirection: "row",
    alignItems: "center",
  },
});
