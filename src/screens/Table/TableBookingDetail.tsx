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

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const TableBookingDetail = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const userData = useSelector((state: RootState) => state.auth);

  /* ==========================
     FETCH BOOKING DETAILS
  ========================== */

  const {
    data: booking,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['tableBookingDetail', bookingId],
    queryFn: async () => {
      const res = await javascriptGet({
        path: `member/table/details/${bookingId}`,
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
        path: `member/table/cancel/${bookingId}`,
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

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Table Details" />
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
      <Header title="Table Details" />

      <View style={styles.card}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>

        <Text style={styles.title}>{booking?.meal?.name}</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                booking.status === 'Cancelled'
                  ? '#ffe6e6'
                  : '#e6f4ea',
            },
          ]}
        >
          <Text
            style={{
              color:
                booking.status === 'Cancelled'
                  ? 'red'
                  : 'green',
              fontWeight: '600',
            }}
          >
            {booking.status}
          </Text>
        </View>
        </View>

        <InfoRow label="Date" value={moment(booking.booking_date).format('DD MMM YYYY')} />
        <InfoRow label="Time" value={booking?.time?.time} />
        <InfoRow label="Venue" value={booking?.venue?.name} />
        <InfoRow label="Table" value={booking?.table?.name} />
      </View>

      {/* EDIT */}
      {/* {canEdit && (
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() =>
            navigation.navigate('EditTableBooking', {
              bookingId,
            })
          }
        >
          <Text style={styles.btnText}>Edit Booking</Text>
        </TouchableOpacity>
      )} */}

      {/* CANCEL */}
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
const InfoRow = ({ label, value }: any) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);
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

export default TableBookingDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
