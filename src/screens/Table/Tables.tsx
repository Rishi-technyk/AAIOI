import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import { Dropdown } from 'react-native-element-dropdown';
import { javascriptGet, javascriptPost } from '../../util/api';
import { RootState } from '../../store/store';
import Header from '../../components/Header';
import CalendarStrip from '../../components/CalendarStrip';
import { Toast } from 'react-native-toast-notifications';
import { FONT_FAMILY, LIGHT_GREEN, LIGHT_RED, SECONDARY_COLOR } from '../../util/colors';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const Tables = ({navigation}) => {
  const userData = useSelector((state: RootState) => state.auth);

  const today = moment().add(1,'days').format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);

const [hasChecked, setHasChecked] = useState(false);
  /* ==========================
     SINGLE API CALL
  ========================== */
const { data, isLoading, refetch, isFetching } = useQuery({
  queryKey: ['availability', selectedDate, hasChecked],
  queryFn: async () => {
    let url = `member/table/avaiablity?date=${selectedDate}`;

    if (hasChecked && selectedMeal && selectedTime && selectedVenue) {
      url += `&meal_id=${selectedMeal}&time_id=${selectedTime}&venue_id=${selectedVenue}`;
    }

    const res = await javascriptGet({
      path: url,
      Token: userData.token,
    });
    if(res.status ==true){

      return res.data;
    }else{
      Toast.show(res.message,{type:'danger'})
    }
  },
  enabled: true,
});


const { data: bookingData, isLoading: bookingLoading, refetch: refetchBookings } = useQuery({
  queryKey: ['my-upcoming-table-bookings'],
  queryFn: async () => {
    const res = await javascriptGet({
      path: 'member/table/my-upcoming-bookings',
      Token: userData.token,
    });
    if (!res.status) {
      return {
        data:[]
      };
    }

    return res.data;
  },
});
console.log( bookingData, '---------------------- bookingData ---------------------');

  /* ==========================
     FILTERING LOGIC
  ========================== */

React.useEffect(() => {
  setSelectedTable(null);
  setHasChecked(false); // ❗ require recheck
}, [selectedMeal, selectedTime, selectedVenue]);
React.useEffect(() => {
  setSelectedMeal(null);
  setSelectedTime(null);
  setSelectedVenue(null);
  setSelectedTable(null);
  setHasChecked(false);

  refetch(); // only here
}, [selectedDate]);
  const meals = data?.meals || [];



  const venues =  data?.venues || [];



    const times = useMemo(() => {
    if (!selectedMeal) return [];
    return meals.find((m: any) => m.id === selectedMeal)?.times || [];
  }, [selectedMeal, meals]);


const tables = hasChecked ? data?.tables || [] : [];
  /* ==========================
     RESET CASCADE
  ========================== */


const renderTableItem = ({ item }: { item: any }) => {
  const isCancelled = item.status === "Cancelled";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: "#fff" }]}
      onPress={() =>
        navigation.navigate("TableBookingDetail", { bookingId: item.id })
      }
    >
      {/* Header */}
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>
          {item?.meal?.name} - {item?.table?.name}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: isCancelled ? LIGHT_RED : LIGHT_GREEN,
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: isCancelled ? "red" : SECONDARY_COLOR },
            ]}
          >
            {item.status}
          </Text>
        </View>
      </View>

      {/* Booking Info */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Booking Date</Text>
        <Text style={styles.value}>
          {moment(item.booking_date).format("DD MMM YYYY")}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Time Slot</Text>
        <Text style={styles.value}>{item?.time?.time}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Venue</Text>
        <Text style={styles.value}>{item?.venue?.name}</Text>
      </View>

      <View style={styles.divider} />


    </TouchableOpacity>
  );
};
const bookMutation = useMutation({
  mutationFn: async () => {
    const res = await javascriptPost({
      path: 'member/table/create',
      body: {
        meal_id: selectedMeal,
        time_id: selectedTime,
        venue_id: selectedVenue,
        table_id: selectedTable,
        booking_date: selectedDate,
      },
      Token: userData.token,
    });
console.log( res, '---------------------- res ---------------------');

    // 🔥 IMPORTANT: throw error if API says false
    if (!res.status) {
      throw new Error(res.message || 'Booking failed');
    }

    return res;
  },
    onSuccess: (data) => {
    Toast.show(data.message || 'Booking Successful', { type: 'success' });
    refetch();
      refetchBookings(); // 🔥 important
  },
  onError: (error: any) => {
    Toast.show(error.message || 'Booking Failed', { type: 'danger' });
  },
});
  const isValid =
    selectedMeal && selectedTime && selectedVenue ;

  /* ==========================
     SHIMMER
  ========================== */

  return (
    <View style={{ flex: 1 }}>
      <Header title="Book Table" />
      <ScrollView stickyHeaderIndices={[5]}>
        <CalendarStrip
          dayOpenBooking={data?.length || 3}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

 <Dropdown
          style={styles.dropdown}
          data={venues}
          labelField="name"
          valueField="id"
          placeholder="Select Venue"
          value={selectedVenue}
          onChange={item => setSelectedVenue(item.id)}
        />

        <Dropdown
          style={styles.dropdown}
          data={meals}
          labelField="name"
          valueField="id"
          placeholder="Select Meal"
          value={selectedMeal}
          onChange={item => setSelectedMeal(item.id)}
        />

       

        <Dropdown
          style={styles.dropdown}
          data={times}
          labelField="time"
          valueField="id"
          placeholder="Select Time"
          value={selectedTime}
          onChange={item => setSelectedTime(item.id)}
        />

    {tables.length > 0 && (
  <Dropdown
    style={styles.dropdown}
    data={tables}
    labelField="name"
    valueField="id"
    placeholder="Select Table"
    value={selectedTable}
    onChange={item => setSelectedTable(item.id)}
  />
)}

        <TouchableOpacity
          style={[
            styles.bookBtn,
            { backgroundColor: isValid ? '#012970' : '#ccc' },
          ]}
          disabled={!isValid || bookMutation.isPending}
    onPress={() => {
  if (!selectedMeal || !selectedTime || !selectedVenue) {
    Toast.show('Please select all fields', { type: 'warning' });
    return;
  }

  if (!hasChecked) {
 setHasChecked(true);
setTimeout(() => {
  refetch();
}, 0); // ✅ check availability
    return;
  }

  if (!selectedTable) {
    Toast.show('Please select table', { type: 'warning' });
    return;
  }

  bookMutation.mutate(); // ✅ confirm booking
}}
        >
          {bookMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
  {isFetching
    ? 'Checking...'
    : !hasChecked
      ? 'Check Availability'
      : tables.length > 0
        ? selectedTable
          ? 'Confirm Booking'
          : 'Select Table'
        : 'No Tables Available'}
</Text>
          )}
        </TouchableOpacity>

      {!bookingLoading &&
      <View style={{backgroundColor:'white',padding:20,}}>

      <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
  Upcoming Bookings
</Text>
      </View>
}
{bookingLoading ? (

    <ShimmerList />
) : bookingData?.length === 0 ? (
  <Text style={{ textAlign: 'center' ,marginTop:40}}>No bookings found</Text>
) : (
  bookingData?.map((item: any) => renderTableItem({ item }))
)
}
      </ScrollView>
    </View>

  );
};

export default Tables;
const ShimmerList = () => (
  <View style={{  flex: 1, }}>
    {[1, 2, 3, 4].map(i => (
      <View style={styles.card} key={i}>
        <View style={{flexDirection:'row',justifyContent:'space-between'}}>
      <ShimmerPlaceholder
        key={i}
        height={30}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />
      <ShimmerPlaceholder
        key={i}
        height={30}
        width={60}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />
          </View>
      <ShimmerPlaceholder
        key={i}
        height={20}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />
      <ShimmerPlaceholder
        key={i}
        height={20}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />
    </View>
    ))}
  </View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  dropdown: {
    marginHorizontal: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  checkBtn: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f39c12',
    alignItems: 'center',
  },
  bookBtn: {
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
  
    label: {
      fontSize: 12,
      color: '#666',
      fontFamily: FONT_FAMILY.normal,
    },
    value: {
        fontSize: 13,
        fontFamily: FONT_FAMILY.semiBold,
        color: '#333',
      },
    
      badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
      },
    
      badgeText: {
        color: '#FFF',
        fontSize: 11,
        fontFamily: FONT_FAMILY.semiBold,
      },
    
      divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 10,
      },
      empty: {
        textAlign: 'center',
        marginTop: 40,
        fontFamily: FONT_FAMILY.normal,
        color: '#999',
        fontSize: 15,
      },
      ctaRow: {
        alignItems: 'flex-end',
        marginTop: 8,
      },
      cardTitle: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: '#1d4184ff',
    maxWidth: '70%',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
});
