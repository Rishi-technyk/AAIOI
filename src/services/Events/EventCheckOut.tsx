import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { ENDPOINT } from "../../util/constant";
import { javascriptGet, javascriptPost } from "../../util/api";
import { useSelector } from "react-redux";
import { FONT_FAMILY, } from "../../util/colors";
import { ICONS } from "../../../assets/icons.ts";
import { useQueryClient } from "@tanstack/react-query";
import { RootState } from "../../store/store.tsx";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer.tsx";

type Props = NativeStackScreenProps<AppStackParamList,'EventCheckOut'>;
const  EventCheckOut:React.FC<Props>=()=> {
  const route = useRoute<any>();
  const paymentProcessing = useRef(false);
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [loading,setLoading]=useState(false)
  const userData = useSelector((state:RootState) => state.auth);
  const [selectedPayment, setSelectedPayment] = useState(null);
    const [settings, setSettings] = useState<null | []>(null); 
  const { event, tickets, cart, totalAmount,waiters,member ,selectedSeats=[]} = route.params;
  const [referenceNo, setReferenceNo] = useState('');
const waiterAmount =
  event.waiter ? waiters * event.waiter.price : 0;
  const selectedTickets = tickets.filter(
    (t: any) => cart[t.id] > 0
  );

  const serviceChargePercent = Number(event?.service_charge || 0);
const gstPercent = Number(event?.gst || 0);

const serviceChargeAmount =
  (totalAmount * serviceChargePercent) / 100;

const gstAmount =
  (totalAmount * gstPercent) / 100;
const handleFreeBooking = async () => {
  const payload = {
    event_id: event.id,
    is_free: true,
    waiters,
    tickets: selectedTickets.map((t) => ({
      id: t.id,
      type: t.type,
      quantity: cart[t.id],
    })),
    seatGroups
  };

  const res = await javascriptPost({
    path: ENDPOINT.process_event_payment,
    Token: userData.token,
    body: payload,
  });
console.log( res, '---------------------- res --from APio-------------------');
  setLoading(false);

  if (res?.status) {
    navigation.replace("EventBookingDetails", {
      bookingId: res.booking_id,
    });
  } else {
    Alert.alert(res.message || "Free booking failed");
  }
};
  const fetchSettings = useCallback(async () => {
    const apiObj = {
      path: ENDPOINT.event_admin_payment_type,
      Token: userData.token,
      body: {},
    };
    const res = await javascriptGet(apiObj);
    if (res?.status) {

      setSettings(res.payment_types);
      setLoading(false);
    }
  }, [userData.token]);
useEffect(()=>{
  if (userData?.user?.role === "Event Admin") {
    fetchSettings()
  }
},[fetchSettings, userData?.user?.role])
const groupedSeats = selectedSeats.reduce((acc: any, seat: any) => {

  const type = seat.category?.seat_type || 'other'

  if (!acc[type]) {
    acc[type] = {
      type,
      price: Number(seat.category?.price || 0),
      seats: []
    }
  }

  acc[type].seats.push(seat)

  return acc

}, {})
const seatGroups = Object.values(groupedSeats)

const bookTickets = async () => {
  if (paymentProcessing.current) return;

  paymentProcessing.current = true;

  try {
    if (userData?.user?.role === "Event Admin") {
      if (!selectedPayment?.id) {
        Alert.alert("Missing Payment Type", "Please select a payment type.");
        paymentProcessing.current = false;
        return;
      }

      if (selectedPayment?.ref_no && referenceNo.trim() === "") {
        Alert.alert("Reference Required", "Please enter reference number.");
        paymentProcessing.current = false;
        return;
      }
      setLoading(true);
      const payload = {
        event_id: event.id,
        tickets: selectedTickets.map((t: any) => ({
          id: t.id,
          quantity: cart[t.id],
        })),
        waiters,
        member: member,
        
        payment_type: settings?.find(i => i.id === selectedPayment.id)?.name,
        reference_no: referenceNo || "N/A",
        seatGroups
      };
      const res = await javascriptPost({
        path: ENDPOINT.process_admin_payment,
        Token: userData.token,
        body: payload,
      });

      setLoading(false);
      paymentProcessing.current = false;

      if (!res?.status) {
        Alert.alert("Booking Failed", res?.message || "Something went wrong.");
        return;
      }

      await queryClient.invalidateQueries(["eventAdminDashboard"]);

      navigation.replace("EventBookingDetails", {
        bookingId: res.booking_id,
      });

      return;
    }

    /**
     * MEMBER FLOW
     */

    setLoading(true);

    const payload = {
      event_id: event.id,
      tickets: selectedTickets.map((t: any) => ({
        id: t.id,
        quantity: cart[t.id],
      })),
      waiters,
      seatGroups
    };
   
    const res = await javascriptPost({
      path: ENDPOINT.ticket_preview,
      Token: userData.token,
      body: payload,
    });

    if (res?.status !==true) {
      setLoading(false);
      paymentProcessing.current = false;
      Alert.alert(res.message || "Payment initiation failed");
      return;
    }

    /**
     * FREE BOOKING
     */
    if (res.is_free) {
      await handleFreeBooking();
      paymentProcessing.current = false;
      return;
    }
    const orderData = {
      ...(res?.payment || {}),
      ...(res?.payment ? {} : res),
      end_point: ENDPOINT.process_event_payment,
      order_id: res?.payment?.order_id || res?.order_id,
      merchant_order_id: res?.payment?.merchant_order_id || res?.merchant_order_id,
      amount: res?.payment?.amount || res?.amount,
      gateway: res?.payment?.gateway || res?.gateway,
      checkout: res?.payment?.checkout || res?.checkout,
      payment_url: res?.payment?.payment_url || res?.payment_url,
      access_key: res?.payment?.access_key || res?.payment_session_id,
      status_reference:
        res?.payment?.status_reference ||
        res?.merchant_order_id ||
        res?.order_id,
    };

    setLoading(false);
    paymentProcessing.current = false;
    navigation.navigate('UniversalPayment', {
      type: 'Event Booking',
      orderData: {
        ...orderData,
        event_id: event.id,
      },
    });
  } catch (error: any) {
    setLoading(false);
    paymentProcessing.current = false;

    Alert.alert("Error", error?.message || "Something went wrong.");
  }
};

const calculateSeatsTotal = () => {
  return selectedSeats.reduce((total: number, seat: any) => {
    const price = Number(seat.category?.price || 0);
    return total + price;
  }, 0);
}
const grandTotal =
  totalAmount + serviceChargeAmount + gstAmount + calculateSeatsTotal();
  return (
    <View style={styles.container}>
      {/* 🔹 Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Icon name="arrow-back-ios-new" size={22} color={'black'} />
        </Pressable>
        <Text style={styles.headerTitle}>Review & Pay</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 🔹 Order Summary */}
        <View style={styles.section}>
          <View style={styles.rowBetween}>
            <Text style={styles.h1}>Order Summary</Text>
            <View style={styles.badge}>
             <Text style={styles.badgeText}>Pending Payment</Text>
            </View>
          </View>

          <Text style={styles.refText}>
            Booking Ref: #TK-{Date.now().toString().slice(-5)}
          </Text>
        </View>

        {/* 🔹 Ticket Items */}
        {selectedTickets.map((item: any) => (
          <View key={item.id} style={styles.ticketItem}>
            <View style={styles.iconBox}>
              <Icon name="confirmation-number" size={22} color="#135bec" />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.ticketTitle}>{item.title}</Text>
              <Text style={styles.qtyText}>
                Qty: {cart[item.id]}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.ticketPrice}>
                ₹{item.price}
              </Text>
              <Text style={styles.qtyText}>x{cart[item.id]}</Text>
            </View>
          </View>
        ))}
{waiters > 0 && (
   <View  style={styles.waiterItem}>
  <View style={styles.rowBetween}>
    <Text style={styles.grayText}>
      Waiter ({waiters} × ₹{event.waiter.price})
    </Text>
    <Text style={styles.grayText}>₹{waiterAmount.toFixed(2)}</Text>
  </View>
  </View>
)}

{seatGroups.map((group: any) => (

  <View key={group.type} style={[styles.waiterItem,]}>
    <View style={[styles.rowBetween,]}>
  <Text   style={[styles.grayText,{maxWidth:'80%'}]}>
        {group.type.toUpperCase()} ({group.seats.length})
        {" "}
        {group.seats.map((s:any)=>s.seat_code).join(', ')}
      </Text>
    

      <Text style={styles.grayText}>
        ₹{(group.seats.length * group.price).toFixed(2)}
      </Text>

    </View>
  </View>

))}

        {/* 🔹 Price Breakdown */}
  <View style={styles.breakdown}>
  <View style={styles.rowBetween}>
    <Text style={styles.grayText}>Subtotal</Text>
    
    <Text style={styles.grayText}>₹{totalAmount.toFixed(2)}</Text>
  </View>
 {seatGroups.length > 0 && (
<View style={styles.rowBetween}>
    <Text style={styles.grayText}>Seats Total</Text>
    
    <Text style={styles.grayText}>₹{calculateSeatsTotal().toFixed(2)}</Text>
  </View>)}

  {serviceChargePercent > 0 && (
    <View style={styles.rowBetween}>
      <Text style={styles.grayText}>
        Service Fee ({serviceChargePercent}%)
      </Text>
      <Text style={styles.grayText}>
        ₹{serviceChargeAmount.toFixed(2)}
      </Text>
    </View>
  )}

  {gstPercent > 0 && (
    <View style={styles.rowBetween}>
      <Text style={styles.grayText}>
        GST ({gstPercent}%)
      </Text>
      <Text style={styles.grayText}>
        ₹{gstAmount.toFixed(2)}
      </Text>
    </View>
  )}

  <View style={styles.divider} />

  <View style={styles.rowBetween}>
    <Text style={styles.totalText}>Total</Text>
    <Text style={styles.totalAmount}>
      ₹{grandTotal .toFixed(2)}
    </Text>
  </View>
</View>
{/* 🔹 Payment Type Selection (Only for EventAdmin) */}
{userData?.user?.role === "Event Admin" && settings && (
  <View style={styles.paymentSection}>

    <Text style={styles.sectionTitle}>Select Payment Method</Text>

 
{selectedPayment?.ref_no  &&(
          <View style={{flex:1,marginBottom:12,}}>
            <Text style={styles.grayText}>Reference No:</Text>
            <TextInput
            placeholder="Please Enter Ref No."
              style={[styles.textInput,]}
              placeholderTextColor={'grey'}
              value={referenceNo}
              onChangeText={setReferenceNo}

            />
          </View>
)}
    <View style={styles.paymentList}>
      {settings.map((p: any) => {
       const IconComponent = ICONS[p.icon_type] || ICONS.MaterialIcons;

        const isSelected = selectedPayment?.id === p.id;

        return (
          <Pressable
            key={p.id}
            onPress={() => setSelectedPayment(p)}
            style={[
              styles.paymentItem,
              isSelected && styles.paymentItemSelected,
            ]}
          >
            <IconComponent
              name={p.icon}
              size={28}
              color={isSelected ? "#fff" : "#135bec"}
            />

            <Text style={[styles.paymentName, isSelected && { color: "#fff" }]}>
              {p.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
)}

      </ScrollView>

      {/* 🔹 Bottom Pay Button */}
      <View style={styles.footer}>
      <Pressable
  onPress={bookTickets}
  disabled={loading}
  style={[styles.payBtn, loading && { opacity: 0.6 }]}

>{loading&&<ActivityIndicator size={'small'} color={'white'} />}
          <Text style={styles.payText}>Pay Now</Text>
          <Icon name="arrow-forward" size={20} color="white" />
        </Pressable>

        <Text style={styles.footerNote}>
          Secured by the active club payment gateway. By paying, you agree to our Terms.
        </Text>
      </View>
    </View>
  );
}

export default EventCheckOut;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f8",
  },

  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  headerTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
  },

  content: {
    padding: 16,
    paddingBottom: 160,
  },

  section: {
    marginBottom: 16,
  },

  h1: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
  },

  badge: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  badgeText: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily: FONT_FAMILY.bold,
  },

  refText: {
    marginTop: 4,
    fontSize: 13,
    color: "#6b7280",
  },

  ticketItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  waiterItem:{ backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,}
,
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#e8efff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
textInput:{
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    color: 'black',
    minWidth: 150,
    
},
  ticketTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
  },

  qtyText: {
    fontSize: 12,
    color: "#6b7280",
    fontFamily:FONT_FAMILY.light
  },

  ticketPrice: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
  },

  breakdown: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  grayText: {
    fontSize: 14,
    color: "#6b7280",
    fontFamily:FONT_FAMILY.normal
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },

  totalText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
  },

  totalAmount: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.bold,
      color:'black'
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
  },

  payBtn: {
    backgroundColor: "#135bec",
    height: 54,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  payText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  footerNote: {
    marginTop: 8,
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
  },
  paymentSection: {
  backgroundColor: "#fff",
  padding: 16,
  borderRadius: 14,
  marginTop: 20,
  marginBottom: 20,
},

sectionTitle: {
  fontSize: 18,
  fontFamily: FONT_FAMILY.bold,
  marginBottom: 12,
  color: "black",
},

paymentList: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
},

paymentItem: {
  width: "48%",
  padding: 14,
  borderRadius: 14,
  backgroundColor: "#e8f0ff",
  alignItems: "center",
  marginBottom: 12,
  borderWidth: 2,
  borderColor: "transparent",
},

paymentItemSelected: {
  backgroundColor: "#135bec",
  borderColor: "#0b49c5",
},

paymentName: {
  fontSize: 14,
  marginTop: 6,
  fontFamily: FONT_FAMILY.semiBold,
  color: "#135bec",
},

});
