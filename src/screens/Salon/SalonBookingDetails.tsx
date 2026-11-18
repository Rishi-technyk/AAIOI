import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import moment from 'moment';
import { javascriptGet, javascriptPost } from '../../util/api';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Header from '../../components/Header';
import { Toast } from 'react-native-toast-notifications';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import BookingHeroCard from '../../components/booking/BookingHeroCard';
import { useAppTheme } from '../../theme/AppThemeProvider';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const SalonBookingDetail = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const userData = useSelector((state: RootState) => state.auth);
const {colors}= useAppTheme();
const styles = createStyles(colors);
  /* ==========================
     FETCH BOOKING DETAILS
  ========================== */

  const {
    data: booking,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['salonBookingDetail', bookingId],
    queryFn: async () => {
      const res = await javascriptGet({
        path: `member/salon/details/${bookingId}`,
        Token: userData.token,
      });
      return res.data;
    },
  });

  /* ==========================
     EDIT RULE (Before 1 Day Only)
  ========================== */

  const canEdit = useMemo(() => {
    if (!booking) return false;

    const bookingDate = moment(booking.booking_date);
    const today = moment();

    return (
      bookingDate.diff(today, 'days') > 1 &&
      booking.status !== 'Cancelled'
    );
  }, [booking]);

  /* ==========================
     CANCEL BOOKING
  ========================== */

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return javascriptPost({
        path: `member/salon/cancel/${bookingId}`,
        Token: userData.token,
      });
    },
    onSuccess: () => {
      Toast.show('Booking Cancelled', { type: 'success' });
      refetch();
    },
    onError: () => {
      Toast.show('Unable to cancel booking', { type: 'danger' });
    },
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No' },
        { text: 'Yes', onPress: () => cancelMutation.mutate() },
      ]
    );
  };

  /* ==========================
     SHIMMER
  ========================== */
console.log( booking, '---------------------- booking.booking_date ---------------------');
  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Salon Details" />
        <ShimmerView />
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>No Booking Found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Salon Booking Details" />
   <BookingHeroCard 
         title={booking?.meal?.name}
         eyebrow={`Booked On ${moment(booking.created_at).format('DD MMM YYYY , HH:mm:ss')}`}
        status={booking.status}
        subtitle={moment(booking.booking_date).format('DD MMM YYYY')}
meta={[
  { label: 'Time', value: booking?.time?.time },
  { label: 'Service', value: booking?.venue?.name },
  { label: 'Chair', value: booking?.table?.name },
]}

     
     />
    
      {booking.status !== 'Cancelled' && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancel}
          disabled={cancelMutation.isPending}
        >
          {cancelMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btnText}>Cancel Booking</Text>
          )}
        </TouchableOpacity>
      )}

      {/* {!canEdit && booking.status !== 'Cancelled' && (
        <Text style={styles.note}>
          Editing allowed only before one day of booking.
        </Text>
      )} */}
    </View>
  );
};

const ShimmerView = () => (
  <View style={{ padding: 20 }}>
    {[1, 2, 3, 4, 5].map((i) => (
      <ShimmerPlaceholder
        key={i}
        height={20}
        style={{ marginBottom: 15, borderRadius: 8 }}
      />
    ))}
  </View>
);

export default SalonBookingDetail;

const createStyles=(colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 16,
    padding: 18,
    borderRadius: 12,
    backgroundColor: 'white',
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  label: {
    fontWeight: '600',
    color: '#666',
  },
  value: {
    fontWeight: '600',
  },
  editBtn: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#012970',
    alignItems: 'center',
  },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 16,
    borderRadius: 10,
    backgroundColor: '#d9534f',
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: '700',
  },
  note: {
    textAlign: 'center',
    marginTop: 15,
    color: 'gray',
  },
});
