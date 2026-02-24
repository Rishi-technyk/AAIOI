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

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const Tables = () => {
  const userData = useSelector((state: RootState) => state.auth);

  const today = moment().format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);

  /* ==========================
     SINGLE API CALL
  ========================== */

  const { data, isLoading,refetch } = useQuery({
    queryKey: ['availability'],
    queryFn: async () => {
      const res = await javascriptGet({
        path: 'member/table/avaiablity',
        Token: userData.token,
      });
      console.log( res, '---------------------- res ---------------------');
      return res.data;
    },
  });

  /* ==========================
     FILTERING LOGIC
  ========================== */

  const dayData = useMemo(
    () => data?.find((d: any) => d.date === selectedDate),
    [data, selectedDate]
  );

  const meals = dayData?.meals || [];

  const times = useMemo(() => {
    if (!selectedMeal) return [];
    return meals.find((m: any) => m.id === selectedMeal)?.times || [];
  }, [selectedMeal, meals]);

  const venues = useMemo(() => {
    if (!selectedTime) return [];
    return times.find((t: any) => t.id === selectedTime)?.venues || [];
  }, [selectedTime, times]);

  const tables = useMemo(() => {
    if (!selectedVenue) return [];
    return venues.find((v: any) => v.id === selectedVenue)?.tables || [];
  }, [selectedVenue, venues]);

  /* ==========================
     RESET CASCADE
  ========================== */

  React.useEffect(() => {
    setSelectedMeal(null);
    setSelectedTime(null);
    setSelectedVenue(null);
    setSelectedTable(null);
  }, [selectedDate]);

  React.useEffect(() => {
    setSelectedTime(null);
    setSelectedVenue(null);
    setSelectedTable(null);
  }, [selectedMeal]);

  React.useEffect(() => {
    setSelectedVenue(null);
    setSelectedTable(null);
  }, [selectedTime]);

  React.useEffect(() => {
    setSelectedTable(null);
  }, [selectedVenue]);

  /* ==========================
     BOOKING
  ========================== */

  const bookMutation = useMutation({
    mutationFn: async () => {
      return javascriptPost({
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
    },
    onSuccess: () => {
      Toast.show('Booking Successful', { type: 'success' });
      refetch()
    },
    onError: () => {
      Toast.show('Booking Failed', { type: 'danger' });
    },
  });

  const isValid =
    selectedMeal && selectedTime && selectedVenue && selectedTable;

  /* ==========================
     SHIMMER
  ========================== */

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <Header title="Book Table" />
        <ShimmerList />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header title="Book Table" />

      <ScrollView>
        <CalendarStrip
          dayOpenBooking={data?.length || 3}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <Dropdown
          style={styles.dropdown}
          data={meals}
          labelField="name"
          valueField="id"
          placeholder="Select Meal"
          value={selectedMeal}
          onChange={(item) => setSelectedMeal(item.id)}
        />

        <Dropdown
          style={styles.dropdown}
          data={times}
          labelField="time"
          valueField="id"
          placeholder="Select Time"
          value={selectedTime}
          onChange={(item) => setSelectedTime(item.id)}
        />

        <Dropdown
          style={styles.dropdown}
          data={venues}
          labelField="name"
          valueField="id"
          placeholder="Select Venue"
          value={selectedVenue}
          onChange={(item) => setSelectedVenue(item.id)}
        />

        <Dropdown
          style={styles.dropdown}
          data={tables}
          labelField="name"
          valueField="id"
          placeholder="Select Table"
          value={selectedTable}
          onChange={(item) => setSelectedTable(item.id)}
        />

        <TouchableOpacity
          style={[
            styles.bookBtn,
            { backgroundColor: isValid ? '#012970' : '#ccc' },
          ]}
          disabled={!isValid || bookMutation.isPending}
          onPress={() => bookMutation.mutate()}
        >
          {bookMutation.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Confirm Booking
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default Tables;
const ShimmerList = () => (
  <View style={{ padding: 20 }}>
    {[1, 2, 3, 4].map((i) => (
      <ShimmerPlaceholder
        key={i}
        height={50}
        style={{ marginBottom: 20, borderRadius: 10 }}
      />
    ))}
  </View>
);

// import React, { useState, useMemo } from 'react';
// import {
//   StyleSheet,
//   View,
//   Text,
//   TouchableOpacity,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../navigation/AppDrawer';
// import Header from '../../components/Header';
// import CalendarStrip from '../../components/CalendarStrip';
// import { Dropdown } from 'react-native-element-dropdown';
// import { useQuery, useMutation } from '@tanstack/react-query';
// import { javascriptGet, javascriptPost } from '../../util/api';
// import { RootState } from '../../store/store';
// import { useSelector } from 'react-redux';
// import { Toast } from 'react-native-toast-notifications';
// import moment from 'moment';
// import LinearGradient from 'react-native-linear-gradient';
// import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';

// const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

// type Props = NativeStackScreenProps<AppStackParamList, 'Table'>;

// const Tables: React.FC<Props> = () => {
//   const userData = useSelector((state: RootState) => state.auth);

//   const today = moment().format('YYYY-MM-DD');

//   const [selectedDate, setSelectedDate] = useState(today);
//   const [meal, setMeal] = useState(null);
//   const [time, setTime] = useState(null);
//   const [venue, setVenue] = useState(null);
//   const [table, setTable] = useState(null);

//   /* ==============================
//      🔹 API CALLS
//   ============================== */

//   const {
//     data: meals,
//     isLoading: mealsLoading,
//   } = useQuery({
//     queryKey: ['meals'],
//     queryFn: async () => {
//       const res = await javascriptGet({
//         path: 'member/table/meals',
//         Token: userData.token,
//       });
//       return res.data;
//     },
//   });

//   const {
//     data: times,
//     isLoading: timeLoading,
//   } = useQuery({
//     queryKey: ['times', meal],
//     queryFn: async () => {
//       const res = await javascriptGet({
//         path: `member/table/times/${meal}`,
//         Token: userData.token,
//       });
//       return res.data;
//     },
//     enabled: !!meal,
//   });

//   const {
//     data: venues,
//     isLoading: venueLoading,
//   } = useQuery({
//     queryKey: ['venues'],
//     queryFn: async () => {
//       const res = await javascriptGet({
//         path: 'member/table/venues',
//         Token: userData.token,
//       });
//       return res.data;
//     },
//   });

//   const {
//     data: availableTables,
//     refetch,
//     isFetching: checkingAvailability,
//   } = useQuery({
//     queryKey: ['availability', meal, time, venue, selectedDate],
//     queryFn: async () => {
//       const res = await javascriptPost({
//         path: 'member/table/check-availability',
//         body: {
//           meal_id: meal,
//           time_id: time,
//           venue_id: venue,
//           booking_date: selectedDate,
//         },
//         Token: userData.token,
//       });
//       return res.available_tables;
//     },
//     enabled: false,
//   });

//   const bookMutation = useMutation({
//     mutationFn: async () => {
//       return javascriptPost({
//         path: 'member/table/create',
//         body: {
//           meal_id: meal,
//           time_id: time,
//           venue_id: venue,
//           table_id: table,
//           booking_date: selectedDate,
//         },
//         Token: userData.token,
//       });
//     },
//     onSuccess: () => {
//       Toast.show('Booking Successful', { type: 'success' });
//       resetForm();
//     },
//     onError: () => {
//       Toast.show('Booking Failed', { type: 'danger' });
//     },
//   });

//   const isValid = useMemo(() => {
//     return selectedDate && meal && time && venue && table;
//   }, [selectedDate, meal, time, venue, table]);

//   const handleCheckAvailability = () => {
//     if (!selectedDate || !meal || !time || !venue) {
//       Toast.show('Please select all fields', { type: 'warning' });
//       return;
//     }
//     refetch();
//   };

//   const handleBooking = () => {
//     if (!isValid) {
//       Toast.show('All fields required', { type: 'warning' });
//       return;
//     }
//     bookMutation.mutate();
//   };

//   const resetForm = () => {
//     setMeal(null);
//     setTime(null);
//     setVenue(null);
//     setTable(null);
//   };

//   /* ==============================
//      🔹 SHIMMER UI
//   ============================== */

//   if (mealsLoading) {
//     return (
//       <View style={{ flex: 1 }}>
//         <Header title="Book Table" />
//         <ShimmerList />
//       </View>
//     );
//   }
// console.log( availableTables, '---------------------- availableTables ---------------------');
//   return (
//     <View style={styles.container}>
//       <Header title="Book Table" />

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <CalendarStrip
//           dayOpenBooking={availableTables?.day||5}
//           selectedDate={selectedDate}
//           onSelectDate={setSelectedDate}
//         />

//         <Dropdown
//           style={styles.dropdown}
//           data={meals || []}
//           labelField="name"
//           valueField="id"
//           placeholder="Select Meal"
//           value={meal}
//           onChange={item => {
//             setMeal(item.id);
//             setTime(null);
//             setTable(null);
//           }}
//         />

//         {timeLoading ? (
//           <ActivityIndicator style={{ marginTop: 20 }} />
//         ) : (
//           <Dropdown
//             style={styles.dropdown}
//             data={times || []}
//             labelField="time"
//             valueField="id"
//             placeholder="Select Time"
//             value={time}
//             onChange={item => setTime(item.id)}
//           />
//         )}

//         {venueLoading ? (
//           <ActivityIndicator style={{ marginTop: 20 }} />
//         ) : (
//           <Dropdown
//             style={styles.dropdown}
//             data={venues || []}
//             labelField="name"
//             valueField="id"
//             placeholder="Select Venue"
//             value={venue}
//             onChange={item => setVenue(item.id)}
//           />
//         )}

//         <TouchableOpacity
//           style={styles.checkBtn}
//           onPress={handleCheckAvailability}
//           disabled={checkingAvailability}
//         >
//           {checkingAvailability ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.btnText}>Check Availability</Text>
//           )}
//         </TouchableOpacity>

//         {availableTables && (
//           <Dropdown
//             style={styles.dropdown}
//             data={availableTables}
//             labelField="name"
//             valueField="id"
//             placeholder="Select Table"
//             value={table}
//             onChange={item => setTable(item.id)}
//           />
//         )}

//         <TouchableOpacity
//           style={[
//             styles.bookBtn,
//             { backgroundColor: isValid ? '#012970' : '#ccc' },
//           ]}
//           disabled={!isValid || bookMutation.isPending}
//           onPress={handleBooking}
//         >
//           {bookMutation.isPending ? (
//             <ActivityIndicator color="white" />
//           ) : (
//             <Text style={styles.btnText}>Confirm Booking</Text>
//           )}
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };

// export default Tables;
// const ShimmerList = () => (
//   <View style={{ padding: 20 }}>
//     {[1, 2, 3, 4].map(i => (
//       <View key={i} style={{ marginBottom: 20 }}>
//         <ShimmerPlaceholder height={50} style={{ borderRadius: 10 }} />
//       </View>
//     ))}
//   </View>
// );

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
});
