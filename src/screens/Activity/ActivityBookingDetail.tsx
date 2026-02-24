import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { javascriptGet, javascriptPost } from "../../util/api";
import { ActivityIndicator } from "react-native-paper";
import { ScrollView } from "react-native-gesture-handler";
import { Toast } from "react-native-toast-notifications";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { AppStackParamList } from "../../navigation/AppDrawer";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import moment from "moment";
import Header from "../../components/Header";

type Props = NativeStackScreenProps<
  AppStackParamList,
  "ActivityBookingDetail"
>;

const ActivityBookingDetail: React.FC<Props> = ({ route }) => {
  const userData = useSelector((state: RootState) => state.auth);
  const { bookingId } = route.params;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    const res = await javascriptGet({
      path: `member/booking-details/${bookingId}`,
      Token: userData.token,
    });

    if (res?.success) setData(res.data);
  };

  const cancelSlot = async (slotId: number) => {
    Alert.alert("Cancel Slot", "Do you want to cancel this slot?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          setLoading(true);

          const res = await javascriptPost({
            path: "member/cancel-booking",
            body: {
              booking_id: slotId,
              cancellation_per: 20,
              cancellation_amt: 100,
              cancellation_GST: 18,
              cancellation_GST_amt: 18,
              cancellation_deducation: 118,
            },
            Token: userData.token,
          });

          setLoading(false);
          Toast.show(res.message);
          fetchDetails();
        },
      },
    ]);
  };

  if (!data) return <ActivityIndicator style={{ marginTop: 40 }} />;

  const isFutureSlot = (date: string) =>
    moment(date).isSameOrAfter(moment(), "day");

  const statusColor = (status: string) => {
    if (status === "Cancelled") return "#ffdede";
    if (status === "Active") return "#e3f8e3";
    return "#fff4d6";
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f6fa" }}>
      <Header title="Activity Details" />

      <ScrollView>
        {/* Facility Image */}
        {/* {data.facility_image && (
          <Image
            source={{
              uri: `https://booking.panchshilaclub.org${data.facility_image}`,
            }}
            style={styles.image}
          />
        )} */}

        <View style={styles.card}>
          <Text style={styles.title}>{data.facility_name}</Text>
          <Text style={styles.sub}>
            Booking No: {data.booking_number}
          </Text>

          <View style={styles.rowBetween}>
            <Text style={styles.sub}>
              Booked on{" "}
              {moment(data.created_at).format("DD MMM YYYY")}
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    data.status === "Cancelled"
                      ? "#ff4d4f"
                      : data.status === "Active"
                      ? "#28a745"
                      : "#ff9800",
                },
              ]}
            >
              <Text style={styles.badgeText}>{data.status}</Text>
            </View>
          </View>
        </View>

        {/* SLOT LIST */}
        <Text style={styles.sectionTitle}>Slots</Text>

        {data.slots.map((slot: any) => (
          <View key={slot.id} style={styles.slotCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.slotText}>
                {moment(slot.slot_date).format("DD MMM")} |{" "}
                {slot.label}
              </Text>

              <Text
                style={[
                  styles.statusBadge,
                  { backgroundColor: statusColor(slot.status) },
                ]}
              >
                {slot.status}
              </Text>
            </View>

            {/* Players */}
            {slot.guests.map((p: any, i: number) => (
              <Text key={i} style={styles.player}>
                • {p.player_name}
              </Text>
            ))}

            {/* Cancellation info */}
            {slot.status === "Cancelled" && (
              <Text style={styles.cancelInfo}>
                Deduction: ₹{slot.cancellation_deducation}
              </Text>
            )}

            {/* Cancel Button */}
            {slot.status !== "Cancelled" && slot.status==='Active' &&
              isFutureSlot(slot.slot_date) && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => cancelSlot(slot.id)}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: "#fff" }}>
                      Cancel Slot
                    </Text>
                  )}
                </TouchableOpacity>
              )}
          </View>
        ))}

        {/* PAYMENT SUMMARY */}
        <View style={styles.summaryBox}>
          <Text>Total Amount: ₹{data.facility_amount}</Text>
          <Text>GST: ₹{data.facility_gst_amt}</Text>
          <Text style={styles.bold}>
            Payable: ₹{data.facility_total}
          </Text>
          <Text style={styles.bold}>
            Payment: {data.payment_status}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ActivityBookingDetail;
const styles = StyleSheet.create({
  image: { height: 170, width: "100%" },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 14,
  },

  title: { fontSize: 20, fontWeight: "bold" },
  sub: { color: "#777", marginTop: 4 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 16,
    marginBottom: 10,
  },

  slotCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
  },

  slotText: { fontWeight: "600" },
  player: { marginTop: 4, color: "#444" },

  cancelBtn: {
    backgroundColor: "#e53935",
    padding: 8,
    borderRadius: 6,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  cancelInfo: {
    marginTop: 6,
    color: "#d32f2f",
    fontWeight: "600",
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  summaryBox: {
    margin: 16,
    padding: 16,
    backgroundColor: "#eef6ff",
    borderRadius: 12,
  },

  bold: { fontWeight: "bold", marginTop: 4 },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: { color: "#fff", fontWeight: "bold" },
});
