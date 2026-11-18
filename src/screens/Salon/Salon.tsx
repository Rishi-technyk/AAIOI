import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
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
import RenderHTML from 'react-native-render-html';
import { useAppTheme } from '../../theme/AppThemeProvider';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const {  width } = Dimensions.get("window");
const Salon = ({navigation}) => {
  const userData = useSelector((state: RootState) => state.auth);

  const today = moment().add(1,'day').format('YYYY-MM-DD');

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<any>(null);
  const [selectedVenue, setSelectedVenue] = useState<any>(null);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [message, setMessage] = useState('');
const [hasChecked, setHasChecked] = useState(false);
const {colors}=useAppTheme()
 const styles = useMemo(() => createStyles(colors), [colors]);
  /* ==========================
     SINGLE API CALL
  ========================== */

const { data, isLoading, refetch, isFetching } = useQuery({
  queryKey: ['salonavailability', selectedDate, hasChecked],
  queryFn: async () => {
    let url = `member/salon/avaiablity?date=${selectedDate}`;

    if (hasChecked && selectedMeal && selectedTime && selectedVenue) {
      url += `&meal_id=${selectedMeal}&time_id=${selectedTime}&venue_id=${selectedVenue}`;
    }
  console.log( url, '---------------------- url ---------------------');
    const res = await javascriptGet({
      path: url,
      Token: userData.token,
    });
 if(res.status == true){
  setMessage('');
  if(res.data.venues.length){
    setSelectedVenue(res.data.venues[0].id)
  }
  return res.data;
}else{
  setMessage(res.message); // ✅ store message
  // Toast.show(res.message,{type:'danger'})
  return res.data || {};
}
  },
  enabled: true,
});

const { data: bookingData, isLoading: bookingLoading, refetch: refetchBookings } = useQuery({
  queryKey: ['my-upcoming-salon-bookings'],
  queryFn: async () => {
    const res = await javascriptGet({
      path: 'member/salon/my-upcoming-bookings',
      Token: userData.token,
    });
    if (!res.status) {
           setMessage( res.message || 'Failed to fetch bookings')
      return {
   
        data:[]
      };
    }

    return res.data;
  },
});

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
  return meals
    .find((m: any) => m.id === selectedMeal)
    ?.times
    // ?.filter((t: any) => {
    
    //   if (selectedDate !== today) return true;
    //   return moment(t.end_time, 'HH:mm:ss').isAfter(moment());
    // }) || [];
}, [selectedMeal, meals, selectedDate]);
console.log( data, '---------------------- times ---------------------');

const tables = hasChecked
  ? (data?.tables || []).map(table => ({
      ...table,
      // label: `${table.name} (Cap. ${table.capacity})`,
    }))
  : [];
  /* ==========================
     RESET CASCADE
  ========================== */


const renderTableItem = ({ item }: { item: any }) => {
  const isCancelled = item.status === "Cancelled";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={[styles.card, { backgroundColor: colors.surface}]}
      onPress={() =>
        navigation.navigate("SalonBookingDetail", { bookingId: item.id })
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
        <Text style={styles.label}>Service</Text>
        <Text style={styles.value}>{item?.venue?.name}</Text>
      </View>

      {/* <View style={styles.divider} /> */}


    </TouchableOpacity>
  );
};
const bookMutation = useMutation({
  mutationFn: async () => {
    const res = await javascriptPost({
      path: 'member/salon/create',
      body: {
        meal_id: selectedMeal,
        time_id: selectedTime,
        venue_id: selectedVenue,
        table_id: selectedTable,
        booking_date: selectedDate,
      },
      Token: userData.token,
    });

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
       setMessage(error.message || 'Booking failed'); 
    Toast.show(error.message || 'Booking Failed', { type: 'danger' });
  },
});

console.log( venues, '---------------------- venues ---------------------');
const isTimeExpired = message === 'This time slot has already passed';

const isValid =
  selectedMeal && selectedTime && selectedVenue && !isTimeExpired;
  /* ==========================
     SHIMMER
  ========================== */

  return (
    <View style={{ flex: 1 }}>
      <Header title="Book Salon" />

      <ScrollView stickyHeaderIndices={[1]} style={{backgroundColor:colors.background}}>
        <View>
        <CalendarStrip
          dayOpenBooking={data?.days_Open_booking || 3}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

 <Dropdown
          style={styles.dropdown}
          selectedTextStyle={{color:colors.text}}
          data={venues}
          labelField="name"
          valueField="id"
          placeholder="Select Venue"
          placeholderStyle={{color:colors.placeholder}}
          value={selectedVenue}
          onChange={item => setSelectedVenue(item.id)}
        />

        <Dropdown
          style={styles.dropdown}
          data={meals}
           selectedTextStyle={{color:colors.text}}
          labelField="name"
          valueField="id"
          placeholder="Select Gender"
           placeholderStyle={{color:colors.placeholder}}
          value={selectedMeal}
          onChange={item => setSelectedMeal(item.id)}
        />

       

        <Dropdown
          style={styles.dropdown}
          data={times}
           selectedTextStyle={{color:colors.text}}
          labelField="time"
          valueField="id"
          placeholder="Select Time"
          placeholderStyle={{color:colors.placeholder}}
          value={selectedTime}
          onChange={item => setSelectedTime(item.id)}
        />
{message ? (
  <Text style={{ 
    color: 'red', 
    textAlign: 'center', 
    marginTop: 10,
    fontWeight: '600'
  }}>
    {message}
  </Text>
) : null}
    {tables.length > 0 && (
  <Dropdown
    style={styles.dropdown}
    data={tables}
    labelField="name"
    valueField="id"
    placeholder="Select Chair"
     selectedTextStyle={{color:colors.text}}
    placeholderStyle={{color:colors.placeholder}}
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
    : isTimeExpired
      ? 'Time Slot Expired'
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
        {
        tables.length && venues?.length
        && venues?.find((v: any) => v.id === selectedVenue)?.dress_code
       && (
       <RenderHTML
                source={{
                  html:venues?.find((v: any) => v.id === selectedVenue)?.dress_code||'',
                }}
                
                 imagesMaxWidth={width - 40}
                enableUserAgentStyles={true}
                        contentWidth={width - 40}
                         baseStyle={{ 
                          fontFamily: FONT_FAMILY.normal ,
                          color:'black',
                        textAlign:'auto',
                          margin:20,
                        flex:1
                        }}
                        tagsStyles={{
          img: {
            width: '100%',
            height: 'auto',
            alignSelf: 'center',
            resizeMode: 'contain',
          },}}
              />
       )
     }
</View>


      {!bookingLoading &&
      <View style={{backgroundColor:colors.background,paddingHorizontal:20,}}>

      <Text style={{ fontWeight: 'bold', fontSize: 16,color:colors.text }}>
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

export default Salon;
const ShimmerList = () => (
  <View style={{  flex: 1, }}>
    {[1, 2, 3, 4].map(i => (
      <View style={{    backgroundColor: '#f0f0f0',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 14,
        elevation: 2,}} key={i}>
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



const createStyles = (colors: {
  background: string;
  primary: string;
  secondary: string;
  onPrimary: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  danger: string;
}) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  dropdown: {
    marginHorizontal: 15,
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.border,
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
      color:  colors.text,
      fontFamily: FONT_FAMILY.normal,
    },
    value: {
        fontSize: 13,
        fontFamily: FONT_FAMILY.semiBold,
        color:  colors.text,
      },
    
      badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
      },
    
      badgeText: {
        color: colors.text,
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
    color: colors.success,
    maxWidth: '70%',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.background,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
});