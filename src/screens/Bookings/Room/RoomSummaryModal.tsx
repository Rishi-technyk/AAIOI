import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { BookingState } from '../types/booking';

interface Props {
  visible: boolean;
  booking: BookingState;
  onClose: () => void;
}

const RoomSummaryModal: React.FC<Props> = ({
  visible,
  booking,
  onClose,
}) => {

  /* ---------------- GRAND TOTAL ---------------- */

  const grandTotal = useMemo(() => {
    return booking.selectedRooms.reduce((sum, room) => {
      return sum + room.totalPerNight * room.quantity * room.nights;
    }, 0);
  }, [booking.selectedRooms]);

  /* ---------------- UI ---------------- */

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.header}>Booking Summary</Text>

          {booking.selectedRooms.length === 0 ? (
            <Text style={styles.emptyText}>No rooms selected</Text>
          ) : (
            <FlatList
              data={booking.selectedRooms}
              keyExtractor={item => item.roomId.toString()}
              renderItem={({ item }) => {
                const roomTotal =
                  item.totalPerNight * item.quantity * item.nights;

                return (
                  <View style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.roomName}>
                        {item.name} ({item.occupantName})
                      </Text>

                      <Text style={styles.subText}>
                        ₹ {item.totalPerNight} × {item.quantity} room
                        {item.quantity > 1 ? 's' : ''} × {item.nights} night
                        {item.nights > 1 ? 's' : ''} (incl. GST)
                      </Text>
                    </View>

                    <Text style={styles.roomPrice}>
                      ₹ {roomTotal.toFixed(2)}
                    </Text>
                  </View>
                );
              }}
            />
          )}

          <View style={styles.divider} />

          {/* Grand Total */}
          <View style={styles.row}>
            <Text style={styles.totalText}>Grand Total</Text>
            <Text style={styles.totalText}>
              ₹ {grandTotal.toFixed(2)}
            </Text>
          </View>

          {/* Close */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default RoomSummaryModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },

  header: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1A1A1A',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  roomName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  subText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  roomPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },

  totalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D8454',
  },

  closeBtn: {
    marginTop: 20,
    alignSelf: 'center',
  },

  closeText: {
    color: '#DC3545',
    fontSize: 14,
    fontWeight: '600',
  },
});

// import React, { useMemo } from 'react';
// import {
//   Modal,
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';
// import { BookingState } from '../types/booking';

// interface Props {
//   visible: boolean;
//   booking: BookingState;
//   onClose: () => void;
// }

// const RoomSummaryModal: React.FC<Props> = ({
//   visible,
//   booking,
//   onClose,
// }) => {
//   /* ---------------- CALCULATIONS ---------------- */

//   const gstAmount = useMemo(() => {
//     return booking.selectedRooms.reduce((sum, room) => {
//       const gstPercent = room.gst ?? 0;
//       const roomTotal =
//         room.pricePerNight * room.quantity * room.nights;
//       return sum + (roomTotal * gstPercent) / 100;
//     }, 0);
//   }, [booking.selectedRooms]);

// const grandTotal = booking.selectedRooms.reduce((sum, room) => {
//   return sum + room.totalPerNight * room.quantity * room.nights;
// }, 0);


//   /* ---------------- UI ---------------- */

//   return (
//     <Modal visible={visible} animationType="slide" transparent>
//       <View style={styles.overlay}>
//         <View style={styles.container}>
//           <Text style={styles.header}>Booking Summary</Text>

//           {/* Rooms */}
//           <FlatList
//             data={booking.selectedRooms}
//             keyExtractor={item => item.roomId.toString()}
//             renderItem={({ item }) => {
//               const roomTotal =
//                 item.pricePerNight * item.quantity * item.nights;

//               return (
//                 <View style={styles.row}>
//                   <View>
//                     <Text style={styles.roomName}>{item.name}</Text>
//                     <Text style={styles.subText}>
//                       ₹ {item.pricePerNight} × {item.quantity} room
//                       {item.quantity > 1 ? 's' : ''} × {item.nights} night
//                       {item.nights > 1 ? 's' : ''}
//                     </Text>
//                   </View>
//                   <Text style={styles.roomPrice}>₹ {roomTotal}</Text>
//                 </View>
//               );
//             }}
//           />

//           <View style={styles.divider} />

//           {/* GST */}
//           {gstAmount > 0 && (
//             <View style={styles.row}>
//               <Text style={styles.subText}>GST</Text>
//               <Text style={styles.roomPrice}>₹ {gstAmount.toFixed(2)}</Text>
//             </View>
//           )}

//           {/* Total */}
//           <View style={styles.row}>
//             <Text style={styles.totalText}>Grand Total</Text>
//             <Text style={styles.totalText}>₹ {grandTotal.toFixed(2)}</Text>
//           </View>

//           {/* Close */}
//           <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
//             <Text style={styles.closeText}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// export default RoomSummaryModal;
// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.45)',
//     justifyContent: 'flex-end',
//   },

//   container: {
//     backgroundColor: '#FFFFFF',
//     borderTopLeftRadius: 22,
//     borderTopRightRadius: 22,
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     paddingBottom: 30,
//   },

//   header: {
//     fontSize: 18,
//     fontWeight: '700',
//     marginBottom: 12,
//     color: '#1A1A1A',
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 10,
//   },

//   roomName: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#333',
//   },

//   subText: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 2,
//   },

//   roomPrice: {
//     fontSize: 14,
//     fontWeight: '500',
//     color: '#333',
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#EEE',
//     marginVertical: 10,
//   },

//   totalText: {
//     fontSize: 16,
//     fontWeight: '700',
//     color: '#1D8454',
//   },

//   closeBtn: {
//     marginTop: 20,
//     alignSelf: 'center',
//   },

//   closeText: {
//     color: '#DC3545',
//     fontSize: 14,
//     fontWeight: '600',
//   },
// });
