import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import { useRoute } from '@react-navigation/native';
import moment from 'moment';
import Header from '../../components/Header';
import { Toast } from 'react-native-toast-notifications';
import { DOMAIN } from '../../util/constant';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { RootState } from '../../store/store';

type Props=NativeStackScreenProps<AppStackParamList,'InvoiceDetails'>
const InvoiceDetails:React.FC<Props> = ({ route }) => {
  const userData = useSelector((state:RootState) => state.auth);
console.log( route, '---------------------- route ---------------------');
  const [invoice, setInvoice] = useState(null);
  const [roomDetails, setRoomDetails] = useState([]);
  const [canCancel, setCanCancel] = useState(false);
  useEffect(() => {
    fetchInvoice();
  }, [route.params.id]);
  const canCancelRoom = item => {
    const today = moment().startOf('day');
    const checkIn = moment(invoice.checkin);

    return (
      today.isBefore(checkIn) &&
      item.status === 'Active' &&
      invoice.payment_info?.payment_status === 'Paid'
    );
  };

const cancelRoom = (id) => {
  fetch(
    `${DOMAIN.BASE}member/room/booking/cancel/${id}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${userData?.token}`,
      },
    }
  )
    .then(res => res.json())
    .then(json => {
      console.log(json, '--- cancel room response ---');

      if (json?.status) {
        fetchInvoice();
        Toast.show(
          json.message || 'Room cancelled successfully',
          { type: 'success' }
        );
      } else {
        Toast.show(
          json.message || 'Unable to cancel room',
          { type: 'danger' }
        );
      }
    })
    .catch(err => {
      console.error(err);
      Toast.show('Something went wrong', { type: 'danger' });
    });
};
    
  const fetchInvoice = () => {
    fetch(
      `${DOMAIN.BASE}member/room/transaction/details/${route.params.id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userData?.token}`,
        },
      },
    )
      .then(res => res.json())
      .then(json => {
        if (json?.status) {
          setInvoice(json.data);
          setRoomDetails(json.data.room_details);

          const today = moment().startOf('day');
          const checkIn = moment(json.data.checkin);
          const checkOut = moment(json.data.checkout);

          if (today.isSameOrAfter(checkIn) && today.isSameOrBefore(checkOut)) {
            setCanCancel(true);
          }
        }
      });
  };

  if (!invoice) return null;

  const totalAmount = roomDetails.reduce(
    (sum, r) => sum + Number(r.room_charge_total),
    0,
  );

  const Info = ({color, label, value }) => (
    <View style={styles.infoRow}>
      <Text style={[styles.label]}>{label}</Text>
      <Text style={[styles.value,{color:color?color:'black'}]}>{value}</Text>
    </View>
  );
console.log( roomDetails, '---------------------- roomDetails ---------------------');
  return (
    <View style={styles.container}>
      <Header title="Invoice Details" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATUS CARD */}
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>
              Booking #{invoice.booking_number}
            </Text>

            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    invoice.payment_info.payment_status === 'Paid'
                      ? '#28A745'
                      : '#DC3545',
                },
              ]}
            >
              <Text style={styles.badgeText}>
                {invoice.payment_info.payment_status}
              </Text>
            </View>
          </View>

          <Info label="Booking Status" value={invoice.status} />
          <Info label="Member ID" value={invoice.memberID} />
          <Info
            label="Booking Date"
            value={moment(invoice.created_at).format('DD MMM YYYY')}
          />
          <Info
            label="Check In"
            value={moment(invoice.checkin).format('DD MMM YYYY')}
          />
          <Info
            label="Check Out"
            value={moment(invoice.checkout).format('DD MMM YYYY')}
          />
        </View>
        <Text style={styles.sectionTitle}>Rooms</Text>

        {roomDetails.map((item, index) => (
          <View key={index} style={styles.roomCard}>
            <View style={styles.roomHeader}>
              <Text style={styles.roomTitle}>{item.room_name}</Text>

              <View style={styles.statusPill(item.status)}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.infoColumn}>
              <Ionicons name="person-outline" size={18} color="#1d4184ff" />
              <Text style={styles.infoText}>
                Booked For:{' '}
                <Text style={styles.infoValue}>{item.occupant_name}</Text>
              </Text>
            </View>

            <View style={styles.infoColumn}>
              <Ionicons name="people-outline" size={18} color="#1d4184ff" />
              <Text style={styles.infoText}>
                Guests:{' '}
                <Text style={styles.infoValue}>
                  {item.adult} Adult / {item.child} Child
                </Text>
              </Text>
            </View>

            <View style={styles.infoColumn}>
              <Ionicons name="bed-outline" size={18} color="#1d4184ff" />
              <Text style={styles.infoText}>
                Rooms × Nights:{' '}
                <Text style={styles.infoValue}>
                  {item.no_of_rooms} × {item.no_of_days}
                </Text>
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Price / Night</Text>
              <Text style={styles.priceValue}>
                ₹ {Number(item.room_charges)}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>GST ({item.gst_per}%)</Text>
              <Text style={styles.priceValue}>₹ {Number(item.gst_amount)}</Text>
            </View>

            <View style={styles.priceRowTotal}>
              <Text style={styles.totalLabel}>Room Total</Text>
              <Text style={styles.totalValue}>
                ₹ {Number(item.room_charge_total)}
              </Text>
            </View>
            {/* TOTAL */}


{/* ✅ CANCEL BUTTON */}
{canCancelRoom(item) && (
  <TouchableOpacity
    style={styles.cancelBtn}
    onPress={() =>
      Alert.alert(
        'Cancel Room',
        'Are you sure you want to cancel this room?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes',
            style: 'destructive',
            onPress: () => cancelRoom(item.id),
          },
        ],
      )
    }
  >
    <Ionicons name="trash-outline" size={18} color="#FFF" />
    <Text style={styles.cancelText}>Cancel Room</Text>
  </TouchableOpacity>
)}

{/* 🔴 CANCELLATION SUMMARY */}
{item.status === 'Cancelled' && (
  <View style={styles.cancelSummary}>
    <Text style={styles.cancelTitle}>Cancellation Summary</Text>

    <Info
      label={`Cancellation (${item.cancellation_per}%)`}
      value={`₹ ${item.cancellation_amt}`}
    />
    <Info
      label="GST on Cancellation"
      value={`₹ ${item.cancellation_GST_amt}`}
    />
    <Info
    color='#DC3545'
      label="Total Deduction"
      value={`₹ ${item.cancellation_deducation}`}
    />

    <View style={styles.divider} />

    <Info
    color='#28A745'
      label="Refund Amount"
      value={`₹ ${
        Number(item.room_charge_total) -
        Number(item.cancellation_deducation || 0)
      }`}
    />

    <Text style={styles.cancelDate}>
      Cancelled on{' '}
      {moment(item.cancellation_date).format(
        'DD MMM YYYY, hh:mm A',
      )}
    </Text>
  </View>
)}

          </View>
        ))}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  roomCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4184ff',
    width: '70%',
  },

  statusPill: status => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor:
      status === 'Active'
        ? '#28A745'
        : status === 'Pending'
        ? '#FFC107'
        : '#DC3545',
  }),

  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  infoColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },

  infoText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#555',
  },

  infoValue: {
    fontWeight: '600',
    color: '#000',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 12,
  },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  priceRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },

  priceLabel: {
    fontSize: 13,
    color: '#666',
  },

  priceValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
  },

  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1d4184ff',
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
    color: '#1d4184ff',
  },

  roomName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },

  sectionTitle: {
    marginHorizontal: 16,
    marginTop: 10,
    fontSize: 16,
    fontWeight: '700',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
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

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },

  totalCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBox: {
    marginTop: 10,
    backgroundColor: '#FFF5F5',
    padding: 10,
    borderRadius: 8,
  },
  statusBadge: status => ({
    alignSelf: 'flex-start',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor:
      status === 'Active'
        ? '#28A745'
        : status === 'Pending'
        ? '#FFC107'
        : '#DC3545',
  }),
  cancelBtn: {
  marginTop: 12,
  backgroundColor: '#DC3545',
  paddingVertical: 10,
  borderRadius: 8,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},

cancelText: {
  color: '#FFF',
  fontWeight: '700',
  marginLeft: 8,
},

cancelSummary: {
  marginTop: 14,
  padding: 12,
  borderRadius: 10,
  backgroundColor: '#FFF5F5',
  borderWidth: 1,
  borderColor: '#F5C2C7',
},

cancelTitle: {
  fontSize: 14,
  fontWeight: '700',
  marginBottom: 8,
  color: '#DC3545',
},

cancelDate: {
  marginTop: 6,
  fontSize: 12,
  color: '#666',
  textAlign: 'right',
},

});

export default InvoiceDetails;
