import React, {  useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import moment from 'moment';
import Header from '../../../components/Header';
import { javascriptPost } from '../../../util/api';
import { useSelector } from 'react-redux';
import { Toast } from 'react-native-toast-notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../navigation/AppDrawer';
import { RootState } from '../../../store/store';

type Props=NativeStackScreenProps<AppStackParamList,'RoomReview'>
const RoomReview: React.FC<Props> = ({ navigation, route }) => {
  const { booking } = route.params;
const token=useSelector((state:RootState)=>state.auth.token);
const user=useSelector((state:RootState)=>state.auth.user);
const [loading, setLoading] = React.useState(false);
console.log( user, '---------------------- token ---------------------');
  const nights = useMemo(() => {
    return moment(booking.dates.checkOut).diff(
      moment(booking.dates.checkIn),
      'days',
    );
  }, [booking.dates]);
const handlePayment = async () => {
  try {
    setLoading(true)
    const payload = {
      check_in: moment(booking.dates.checkIn).format('YYYY-MM-DD'),
      check_out: moment(booking.dates.checkOut).format('YYYY-MM-DD'),
      rooms: booking.selectedRooms.map((room:any) => ({
        category_id: room.category_id ?? 1,          // from backend mapping
        category_type_id: room.category_type_id ?? 1,
        room_category_id: room.roomId,
        occupant_id: room.occupantId,
        quantity: room.quantity,
        price_per_night: room.pricePerNight,
        gst_per: room.gstPer,
        adults: room.adults,
        children: room.children,
        guest_name: room.guestName,
        guest_email: room.guestEmail,
        guest_mobile: room.guestMobile,
      })),
    };

    const res = await javascriptPost({
      body: payload,
      Token:token,
      path:'member/room/payment/initiate'
    });
     setLoading(false)
    if(res.status ===true){
       navigation.navigate('UniversalPayment', {
             type:'Room Booking',
           
            orderData:res.data
          });
        }
        else{
          Toast.show(res.message||'Payment initiation failed'
            ,{type:'danger',duration:3000});
        }

  } catch (error) {
    console.log('Payment Initiation Failed', error);
  }
};

  return (
    <View style={styles.container}>
      <Header title="Room Details" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* ---------- Stay Details ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Stay Details</Text>

          <View style={styles.row}>
            <Text style={styles.label}>Check-in</Text>
            <Text style={styles.value}>
              {moment(booking.dates.checkIn).format('DD MMM YYYY')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Check-out</Text>
            <Text style={styles.value}>
              {moment(booking.dates.checkOut).format('DD MMM YYYY')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Nights</Text>
            <Text style={styles.value}>{nights}</Text>
          </View>
        </View>

        {/* ---------- Rooms ---------- */}
        {booking.selectedRooms.map((room :any, index:number) => {
          const roomTotal =
            room.totalPerNight * room.quantity * nights;

          return (
            <View key={index} style={styles.card}>
              <Text style={styles.cardTitle}>
                {room.name} × {room.quantity}
              </Text>

              <View style={styles.row}>
                <Text style={styles.label}>Booked For</Text>
                <Text style={styles.value}>{room.occupantName}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Price / Night</Text>
                <Text style={styles.value}>
                  ₹ {room.totalPerNight} (incl. GST)
                </Text>
              </View>

              {room.requiresGuestInfo && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.subTitle}>Guest Details</Text>

                  <Text style={styles.subValue}>Name: {room.guestName}</Text>
                  <Text style={styles.subValue}>Email: {room.guestEmail}</Text>
                  <Text style={styles.subValue}>Mobile: {room.guestMobile}</Text>
                </>
              )}

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Adults</Text>
                <Text style={styles.value}>{room.adults}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Children</Text>
                <Text style={styles.value}>{room.children}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.totalLabel}>Room Total</Text>
                <Text style={styles.totalValue}>
                  ₹ {roomTotal.toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* ---------- Price Summary ---------- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Price Summary</Text>

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              ₹ {booking.totalAmount.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ---------- CTA ---------- */}
      <View style={styles.bottomBar}>
        <Text style={styles.amount}>
          ₹ {booking.totalAmount.toFixed(2)}
        </Text>

        <TouchableOpacity
          style={styles.cta}
          onPress={handlePayment}
        >
          {loading && <ActivityIndicator animating={loading} style={styles.margin} size="small" color="#FFF" />}
          <Text style={styles.ctaText}>Confirm & Pay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RoomReview;

const styles = StyleSheet.create({
  margin:{ marginRight: 8 },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    paddingBottom: 120,
  },

  card: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1d4184ff',
  },

  subTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },

  subValue: {
    fontSize: 13,
    color: '#444',
    marginBottom: 2,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    color: '#666',
  },

  value: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4184ff',
  },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1d4184ff',
  },

  cta: {
    backgroundColor: '#1d4184ff',
    paddingHorizontal: 24,
    flexDirection:'row',
    alignItems:'center',
    paddingVertical: 12,
    borderRadius: 10,
  },

  ctaText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
