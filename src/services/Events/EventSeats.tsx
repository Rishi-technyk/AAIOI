import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Header from '../../components/Header';
import { useQuery } from '@tanstack/react-query';
import { javascriptGet } from '../../util/api';
import LinearGradient from 'react-native-linear-gradient';
import ShimmerPlaceholder from 'react-native-shimmer-placeholder';
import { ScrollView } from 'react-native-gesture-handler';
import { Toast } from 'react-native-toast-notifications';
import TicketShimmer from '../../components/TicketShimmer';

const Legend = ({ color, label }: { color: string; label: string }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendBox, { backgroundColor: color }]} />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const useGetEventSeatsQuery = (params: any) => {
  return useQuery({
    queryKey: ['eventSeats', params.event_id],
    queryFn: async () => {
      const res = await javascriptGet({
        path: `member/events/get-event-seats/${params.event_id}`,
        Token: params.token,
      });
      return res;
    },
    enabled: !!params.event_id,
  });
};


type Props = NativeStackScreenProps<AppStackParamList, 'EventSeats'>;

const EventSeats: React.FC<Props> = ({ route, navigation }) => {
  const userData = useSelector((state: RootState) => state.auth);
 
  const { event, tickets, cart, totalTickets, member, totalAmount, waiters } =
    route.params;

  const selectedTickets = tickets
    .map((t: any) => (cart[t.id] ? { ...t, quantity: cart[t.id] } : null))
    .filter((t: any) => t !== null);
  const { data, isLoading, error } = useGetEventSeatsQuery({
    event_id: event.id,
    token: userData.token,
    member_id: member?.id||undefined,

  });
  const [selectedSeats, setSelectedSeats] = useState<any[]>([]);

  const handleNavigation = () => {
    navigation.navigate('EventCheckOut', {
      event,
      tickets: tickets,
      cart,
      totalAmount,
      totalTickets,
      waiters,
      member,
      selectedSeats,
    });
  };
  const toggleSeat = (seat: any, seatType: string) => {
    const exists = selectedSeats.find(s => s.id === seat.id);
    Toast.hideAll();
    if (exists) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (seat.status !== 'available') {
        Toast.show('This seat is not available', {
          type: 'danger',
        });
        return;
      }
      const complemenrtaryCount = selectedTickets.reduce(
        (acc, t) =>
          t.type === 'member' || t.type === 'spouse' ? acc + t.quantity : acc,
        0,
      );
      const compSeatsCount = selectedSeats.filter(
        s => s.category?.seat_type === 'complimentary',
      ).length;

      if (
        seatType === 'complimentary' &&
        compSeatsCount >= complemenrtaryCount
      ) {
        Toast.show(
          'You have already selected the maximum number of complimentary seats',
          {
            type: 'warning',
          },
        );
        return;
      }
      if (selectedSeats.length >= totalTickets) {
        Toast.show(`You can only select ${totalTickets} seats`, {
          type: 'warning',
        });
        return;
      }

      setSelectedSeats(prev => [...prev, seat]);
    }
  };

  /** SHIMMER LOADING */
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Header title="Event Seats" />
<TicketShimmer/>
        <FlatList
          data={Array(30).fill(0)}
          numColumns={7}
          contentContainerStyle={{alignItems:'center'}}
          renderItem={() => (
            <ShimmerPlaceholder
              LinearGradient={LinearGradient}
              style={styles.shimmerSeat}
            />
          )}
        />
      </View>
    );
  }

  /** ERROR STATE */
  if (error) {
    return (
      <View style={styles.container}>
        <Header title="Event Seats" />
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Unable to load seats. Please try again.
          </Text>
        </View>
      </View>
    );
  }
 const layouts = data?.layouts || [];

// flatten seats
const allSeats = layouts.flatMap((l: any) => l.seats || []);

// group by row
const seatsByBlock = allSeats.reduce((acc: any, seat: any) => {
  const block = seat.category?.name || 'General';

  if (!acc[block]) {
    acc[block] = {
      price: seat.category?.price,
      color: seat.category?.color,
      seats: [],
    };
  }

  acc[block].seats.push(seat);

  return acc;
}, {});
  return (
    <View style={styles.container}>
      <Header title="Select Seats" />

      <View style={styles.stageContainer}>
        <View style={styles.stage}>
          <Text style={styles.stageText}>STAGE</Text>
        </View>
      </View>


      <View style={styles.legendRow}>
        <Legend color="#ccc" label="Blocked" />

        <Legend color="#a7a5a5" label="Booked" />

        <Legend color="#012970" label="Selected" />
      </View>


      {data?.status ? (
    
<View style={styles.seatContainer}>
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <ScrollView 
    showsVerticalScrollIndicator={false}>

      {Object.keys(seatsByBlock).map((block) => {
        const blockData = seatsByBlock[block];

        const seatsByRow = blockData.seats.reduce((acc: any, seat: any) => {
          if (!acc[seat.row_label]) acc[seat.row_label] = [];
          acc[seat.row_label].push(seat);
          return acc;
        }, {});

        return (
          <View key={block} style={{ marginBottom: 20 }}>

            {/* Block Title */}
            <Text style={styles.blockTitle}>
              {block} (₹{blockData.price})
            </Text>

            {Object.keys(seatsByRow).map((row) => (
              <View key={row} style={styles.row}>

                {seatsByRow[row]
                  .sort((a: any, b: any) => a.seat_number - b.seat_number)
                  .map((seat: any) => {

                    const selected = selectedSeats.find(s => s.id === seat.id);
                    const status = seat.status;
                    const isDisabled =
                      userData?.user?.role !== 'Event Admin' ?
                      ((seat.category?.seat_type === 'vip' && !data?.vip_allowed) ||
                        seat.category?.seat_type === 'complimentary') &&
                      !data?.complimentary_allowed: ((seat.category?.seat_type === 'vip' && data?.vip_allowed) ||
                        seat.category?.seat_type === 'complimentary') &&
                      !data?.complimentary_allowed

                    return (
                      <TouchableOpacity
                        key={seat.id}
                        disabled={isDisabled || status !== 'available'}
                        style={[
                          styles.seat,
                          {
                            backgroundColor: isDisabled
                              ? '#ccc'
                              : status === 'blocked'
                              ? '#ccc'
                              : status === 'booked'
                              ? '#a7a5a5'
                              : seat.category?.color || '#4CAF50',
                          },
                          selected && styles.selectedSeat,
                        ]}
                        onPress={() =>
                          toggleSeat(seat, seat.category?.seat_type || 'regular')
                        }
                      >
                        <Text style={styles.seatText}>{seat.seat_code}</Text>
                      </TouchableOpacity>
                    );
                  })}
              </View>
            ))}

          </View>
        );
      })}

    </ScrollView>
  </ScrollView>
</View>
      
      ) : (
        <View style={styles.center}>
          <Image
            source={require('../../../assets/images/no-seat.png')}
            style={{ width: 150, height: 150 }}
          />
          <Text style={styles.errorText}>
            {data?.message || 'Seat booking is not available'}
          </Text>
        </View>
      )}

      <View style={styles.bottomBar}>
        <Text style={styles.summaryText}>
          Seats Selected: {selectedSeats.length}
        </Text>

        <TouchableOpacity style={styles.bookBtn} onPress={handleNavigation}>
          <Text style={styles.bookText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default EventSeats;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },

  stageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },

  stage: {
    width: '70%',
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eaeaea',
    justifyContent: 'center',
    alignItems: 'center',
  },

  stageText: {
    fontWeight: '700',
    color: '#666',
    letterSpacing: 2,
  },

  seatContainer: {
    flex:1,
    alignItems: 'center',
    paddingBottom: 80,
  },

seat: {
  width: 38,
  height: 38,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  margin: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
  selectedSeat: {
    backgroundColor: '#012970',
  },

  seatText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 15,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  legendBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },

  legendText: {
    fontSize: 13,
    color: '#333',
  },
  miniMapContainer: {
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
 
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },

  summaryText: {
    fontSize: 15,
    fontWeight: '600',
  },

  bookBtn: {
    backgroundColor: '#012970',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  bookText: {
    color: '#fff',
    fontWeight: '700',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
row: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: 10,
},
  errorText: {
    fontSize: 16,
    color: '#555',
    marginTop: 10,
  },

  shimmerSeat: {
    width: 38,
    height: 38,
    margin: 6,
    borderRadius: 8,
  },
  blockTitle: {
  fontSize: 16,
  fontWeight: '700',
  marginBottom: 10,
  textAlign: 'center',
  color: '#333',
},
});
