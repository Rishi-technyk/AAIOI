import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import { FONT_FAMILY, LIGHT_GREEN, LIGHT_RED, SECONDARY_COLOR } from '../../util/colors';
import * as api from '../../util/api';
import { useSelector } from 'react-redux';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import Header from '../../components/Header';
import { ScrollView } from 'react-native-gesture-handler';
import { DOMAIN, ENDPOINT } from '../../util/constant';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { RootState } from '../../store/store';
import Icon from "react-native-vector-icons/MaterialIcons";
import { ActivityIndicator } from 'react-native-paper';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
type Props = NativeStackScreenProps<AppStackParamList, 'MyBookings'>;
type UrlItem = string;

const MyBookings: React.FC<Props> = ({ navigation ,route }) => {

  const userData = useSelector((state: RootState) => state.auth);
  const [toggle, settoggle] = useState(route.params.toggle);
  const scrollRef = React.useRef<ScrollView>(null);
  const tabPositions = React.useRef<Record<string, number>>({});

  const [data, setData] = useState<any[]>([]);
const [page, setPage] = useState(1);
const [lastPage, setLastPage] = useState(1);
const [loading, setLoading] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const isInitialLoading = loading && page === 1;
const isEmpty = !loading && data.length === 0;

const TAB_API_MAP: Record<string, string> = {
  Room: 'member/room/transaction',
  Banquet: 'member/banquet/transactions',
  Activity: ENDPOINT.get_booking_details,
  Event: ENDPOINT.event_bookings,
  Tee: ENDPOINT.get_tee_bookings,
   Table: 'member/table-bookings',
};
const fetchData = useCallback(
  async (pageNumber = 1, refresh = false) => {
    console.log( page, '---------------------- page ---------------------');
    if (loadingMore || (pageNumber > lastPage && !refresh)) return;

    pageNumber === 1 ? setLoading(true) : setLoadingMore(true);

    try {
      const endpoint = TAB_API_MAP[toggle];

      const res = await api.javascriptGet({
        path: `${endpoint}?page=${pageNumber}`,
        Token: userData.token,
      });
console.log( res, '---------------------- res ---------------------');

      if (res?.status) {
      const responseData = res.data.data;
const newData = Array.isArray(responseData)
  ? responseData
  : responseData.data || [];

setLastPage(responseData.last_page || 1);


        setData(prev => (refresh ? newData : [...prev, ...newData]));
   
        setPage(pageNumber);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  },
  [toggle, loadingMore, lastPage]
);

useEffect(() => {
  setData([]);
  setPage(1);
  fetchData(1, true);
}, [toggle]);
const onRefresh = async () => {
  setRefreshing(true);
  await fetchData(1, true);
};

const renderItemByTab = (item:any) => {
  console.log( item,toggle, '---------------------- toggle ---------------------');

  switch (toggle) {
    case 'Room':
      return renderRoomItem({ item });

    case 'Banquet':
      return renderHallItem({ item });

    case 'Activity':
      return renderActivityItems({ item });

    case 'Event':
      return renderEventItems({ item });

    case 'Tee':
      return renderTeeItems({ item });
      case 'Table':
  return renderTableItem({ item });

    default:
      return   null;
  }
};

const loadMore = () => {
  if (!loadingMore && page < lastPage) {
    fetchData(page + 1);
  }
};

  useEffect(() => {
    if (toggle && tabPositions.current[toggle] !== undefined) {
      scrollRef.current?.scrollTo({
        x: tabPositions.current[toggle],
        animated: true,
      });
    }
  }, [toggle]);

  useEffect(() => {
      if (Array.isArray(route.params?.url)) {
      settoggle(route.params?.url[0]);
    }
  }, []);
 


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


  const renderRoomItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InvoiceDetails', { id: item.id })}
    >
      {/* Header */}
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.memberName}
        </Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: item.status === 'Active' ? '#28A745' : '#F0AD4E',
            },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      {/* Booking Info */}
      <View style={styles.infoRow}>
        <Text style={styles.label}>Booking No</Text>
        <Text style={styles.value}>{item.bookingId}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Member ID</Text>
        <Text style={styles.value}>{item.memberID}</Text>
      </View>

      <View style={styles.divider} />

      {/* Dates */}
      <View style={[styles.rowBetween]}>
        <View>
          <Text style={styles.label}>Check In</Text>
          <Text style={styles.value}>
            {moment(item.checkin).format('DD MMM YYYY')}
          </Text>
        </View>

        <View>
          <Text style={styles.label}>Check Out</Text>
          <Text style={styles.value}>
            {moment(item.checkout).format('DD MMM YYYY')}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Payment */}
      {item.payment && (
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Payment</Text>
          <Text
            style={[
              styles.value,
              {
                color:
                  item.payment.payment_status === 'Paid'
                    ? '#28A745'
                    : '#DC3545',
              },
            ]}
          >
          {item.payment.payment_status}
          </Text>
        </View>
      )}

      {/* CTA */}
      <View style={styles.ctaRow}>
        <Text style={styles.linkText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
  const renderHallItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('InvoiceHallDetails', { id: item.id })}
    >
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.memberName}</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor:
                item.status === 'Completed' || item.status == 'Active'
                  ? '#28A745'
                  : '#F0AD4E',
            },
          ]}
        >
          <Text style={styles.badgeText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Booking ID</Text>
        <Text style={styles.value}>{item.booking_ID}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Persons</Text>
        <Text style={styles.value}>{item.noofPerson}</Text>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Function Date</Text>
        <Text style={styles.value}>
          {moment(item.funDate).format('DD MMM YYYY')}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Payment</Text>
        <Text
          style={[
            styles.value,
            {
              color: item.payment_status === 'Paid' ? '#28A745' : '#DC3545',
            },
          ]}
        >
          {item.payment_status}
        </Text>
      </View>

      <View style={styles.ctaRow}>
        <Text style={styles.linkText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );
  const renderTeeItems = ({ item }: { item: any }) => {
    return(
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('TeeBookingDetail', {
          data: item,
          tee_booking_detail_id: item.tee_booking_detail_id,
        })
      }
    >
      <View style={styles.rowBetween}>
        <Text style={styles.cardTitle}>{item.bookingId}</Text>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: Number(item.is_cancelled)
                ? '#F0AD4E'
                : item.is_active
                ? '#28A745'
                : '#F0AD4E',
            },
          ]}
        >
          <Text style={styles.badgeText}>
            {Number(item.is_cancelled)
              ? 'Cancelled'
              : item.is_active
              ? 'Active'
              : 'Pending'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Text style={styles.label}>Booking Date</Text>
        <Text style={styles.value}>
          {moment(item.booking_date).format('DD MMM YYYY')}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.label}>Tee Time</Text>
        <Text style={styles.value}>{item.tee_sheet_time}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.rowBetween}>
        <Text style={styles.label}>Player 1:</Text>
        <Text style={styles.value}>
          {item.player1_name} ({item.player1_member_id})
        </Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Player 2:</Text>
        <Text style={styles.value}>
          {item.player2_name} ({item.player2_member_id})
        </Text>
      </View>
      <View style={styles.rowBetween}>
        <Text style={styles.label}>Player 3:</Text>
        <Text style={styles.value}>
          {item.player3_name} ({item.player3_member_id})
        </Text>
      </View>
      {item.player4_member_id && (
        <View style={styles.rowBetween}>
          <Text style={styles.label}>Player 4:</Text>
          <Text style={styles.value}>
            {item.player4_name} ({item.player4_member_id})
          </Text>
        </View>
      )}

      <View style={styles.ctaRow}>
        <Text style={styles.linkText}>View Details →</Text>
      </View>
    </TouchableOpacity>
  );}

  const renderEventItems = ({ item }: { item: any }) => {
    return (
      <Pressable
        disabled={item.ticket_count + item.waiter_count == 0}
        style={styles.eventcard}
        onPress={() =>
          navigation.navigate('EventBookingDetails', {
            bookingId: item.booking_id,
          })
        }
      >
        <Image
          source={{
            uri: `${DOMAIN.IMG}event/${item.event_image}`,
          }}
          style={styles.image}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.event_name}</Text>

          <View style={styles.check}>
            <Icon name="calendar-today" size={14} color="#6b7280" />
            <Text style={styles.value}> {item.event_date}</Text>
          </View>
          {item.ticket_count > 0 && (
            <View>
              <Text style={styles.label}>
                {item.ticket_count} Tickets • {item.ticket_types.join(', ')}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.right}>
          <Text style={styles.amount}>₹{item.total_amount}</Text>

          <View
            style={[
              styles.badge,
              item.status === 'confirmed' ? styles.confirmed : styles.pending,
            ]}
          >
            <Text style={styles.badgeText}>
              {item.is_staff ? 'COMPLIMENTRY' : item.status.toUpperCase()}
            </Text>
          </View>
          {item.waiter_count > 0 && (
            <Text style={styles.subText}>
              {item.waiter_count} Waiter{item.waiter_count > 1 ? 's' : ''} • ₹
              {item.waiter_amount}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };
  console.log( data, '---------------------- data -ddd--------------------');
  const renderActivityItems = ({ item }: { item: any }) => {
    console.log( item, '---------------------- item ---------------------');
    return (
 <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => {
         navigation.navigate('ActivityBookingDetail',{bookingId:item.id})
        }}
        style={[styles.card, { backgroundColor: "white", borderTopWidth: 0.2 }]}
       
      >
        <View
          style={[
            // styles.rowBetween,
            {
           
              padding: 5,
              flexDirection: "row",
            },
          ]}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle}>{item?.facility_name}</Text>
              <Icon
                name="chevron-right"
                size={20}
                color={"black"}
                style={{ marginLeft: "auto" }}
              />
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.cardContent}>Booking Number: </Text>
              <Text style={styles.cardContent}>{item?.booking_number}</Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 5,
              }}
            >
              <Icon
                name="calendar-month"
                size={20}
                // color={SECONDARY_COLOR}
                color={"black"}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.cardContent}>
                Booked {moment(item?.booking_date).format("Do MMM [on] h:mm A")}
              </Text>
            </View>
           
          </View>
        </View>

        <View style={[styles.rowBetween, { marginTop: 5 }]}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Icon
              name="access-time"
              size={20}
              // color={"rgb(83, 112, 255)"}
              color={"black"}
              style={{ marginRight: 5 }}
            />
            <Text>
              Slot Date: {moment(item?.slot_date).format("Do MMM YY")} at{" "}
              {item?.slot_label}
            </Text>
          </View>
          <Text
            style={[
              styles.cardContent,
              {
                backgroundColor:
                  item?.status === "Cancelled" ? LIGHT_RED : LIGHT_GREEN,
                color: item?.status === "Cancelled" ? "red" : SECONDARY_COLOR,
                padding: 5,
                borderRadius: 5,
                fontFamily: FONT_FAMILY.bold,
              },
            ]}
          >
            {item?.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  const urls = route.params?.url as UrlItem[] | undefined;
  return (
    <View style={{ flex: 1 }}>
      <Header title={`${toggle} Booking`} />

      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ padding: 10 }}
          contentContainerStyle={{ paddingRight: 20 }}
        >
          {urls?.map((item, index) => {
            const isSelected = toggle === item;

            return (
              <Pressable
                key={index}
                onLayout={event => {
                  const layout = event.nativeEvent.layout;
                  tabPositions.current[item] = layout.x;
                }}
                focusable
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => settoggle(item)}
                style={({ pressed, focused }) => [
                  {
                    minWidth: 100,
                    padding: 10,
                    marginHorizontal: 10,
                    borderRadius: 15,
                    alignItems: 'center',
                    backgroundColor: isSelected
                      ? '#222642'
                      : pressed || focused
                      ? '#8f90a6'
                      : '#bfc0bdff',
                    transform: [{ scale: pressed ? 0.96 : 1 }],
                  },
                ]}
              >
                <Text
                  style={{
                    fontSize: 17,
                    fontFamily: FONT_FAMILY.semiBold,
                    color: isSelected ? 'white' : '#333',
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

       {isInitialLoading ? (
  <ShimmerList />
) : (
  <FlatList
    data={data}
    keyExtractor={(item, index) => index.toString()}
    renderItem={({ item }) => renderItemByTab(item)}

    refreshing={refreshing}
    onRefresh={onRefresh}

    onEndReached={loadMore}
    onEndReachedThreshold={0.4}

    ListEmptyComponent={EmptyComponent}

    ListFooterComponent={
      loadingMore ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : null
    }

    initialNumToRender={6}
    maxToRenderPerBatch={6}
    windowSize={5}
    removeClippedSubviews
  />
)}

    </View>
  );
};

const ShimmerList = () => (
  <FlatList
    data={[1,2,3,4,5,6]}
    keyExtractor={(i)=>i.toString()}
    renderItem={() => (
      <View style={[styles.card, {marginHorizontal:16}]}>
        <ShimmerPlaceholder height={18} style={{marginBottom:10}} />
        <ShimmerPlaceholder height={14} style={{marginBottom:6}} />
        <ShimmerPlaceholder height={14} style={{marginBottom:6}} />
        <ShimmerPlaceholder height={14} width={120} />
      </View>
    )}
  />
);
const EmptyComponent = () => (
  <View style={{marginTop:80, alignItems:'center'}}>
    <Image
      source={require('../../../assets/images/norecord.png')}
      style={{height:120,width:120,}}
    />
    <Text style={styles.empty}>No bookings found</Text>
  </View>
);

export default MyBookings;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
 eventcard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
    alignItems: "center",
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
  cancelBtn: {
  marginTop: 10,
  padding: 10,
  borderRadius: 8,
  backgroundColor: "#ffe6e6",
  alignItems: "center",
},
cancelText: {
  color: "red",
  fontFamily: FONT_FAMILY.bold,
},

  mainView: { margin: 20, backgroundColor: 'white', padding: 20 },
  dateBox: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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
cardContent:{},
confirmed:{},

  linkText: {
    color: '#1d4184ff',
    fontSize: 13,
    fontFamily: FONT_FAMILY.semiBold,
  },
  subText:{},
  dateContainer: {
    padding: 10,
    marginHorizontal: 20,
    marginVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: 'grey',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  check: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 6,
    color: '#1d4184ff',
  },

  groupLabel: {
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#555',
  },
  upcomingCard: {
    backgroundColor: '#E8F1FF',
    padding: 12,
    borderRadius: 12,
    marginLeft: 12,
    width: 180,
  },

  upcomingId: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#1d4184ff',
  },

  upcomingDate: {
    fontSize: 11,
    color: '#555',
    marginVertical: 4,
  },
amount:{},
pending:{},
  right:{},

  badgeTextSmall: {
    color: '#fff',
    fontSize: 10,
  },

  viewBtn: {
    marginTop: 8,
    backgroundColor: '#1d4184ff',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },

  viewBtnText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
  },
    image: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 12,
  },

});

// import React, { useState, useEffect, useCallback } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
//   Pressable,
// } from 'react-native';
// import {PUBLIC_URL} from '@env' 
// import { FONT_FAMILY, LIGHT_GREEN, LIGHT_RED, SECONDARY_COLOR } from '../../util/colors';
// import * as api from '../../util/api';
// import { useSelector } from 'react-redux';
// import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
// import LinearGradient from 'react-native-linear-gradient';
// import moment from 'moment';
// import { useRoute } from '@react-navigation/native';
// import Header from '../../components/Header';
// import { ScrollView } from 'react-native-gesture-handler';
// import { ENDPOINT } from '../../util/constant';
// import { NativeStackScreenProps } from '@react-navigation/native-stack';
// import { AppStackParamList } from '../../navigation/AppDrawer';
// import { RootState } from '../../store/store';
// import Icon from "react-native-vector-icons/MaterialIcons";
// import { SvgUri } from 'react-native-svg';

// const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
// type Props = NativeStackScreenProps<AppStackParamList, 'MyBookings'>;
// type UrlItem = string;

// const MyBookings: React.FC<Props> = ({ navigation }) => {
//   const route = useRoute();
//   const userData = useSelector((state: RootState) => state.auth);
//   const [toggle, settoggle] = useState(route.params.toggle);
//   const scrollRef = React.useRef<ScrollView>(null);
//   const tabPositions = React.useRef<Record<string, number>>({});
//   const [eventBookings, setEventBookings] = useState([]);
//   const [activityBooking,setActivityBooking]=useState<any[]>([])
//   const [isloading, setisloading] = useState(false);
//   const [filter, setfilter] = useState(false);
//   const [roomTransactions, setRoomTransactions] = useState([]);
//   const [hallTransactions, setHallTransactions] = useState([]);
//   const [TeeBooking, setTeeBooking] = useState([]);

//   useEffect(() => {
//     if (toggle && tabPositions.current[toggle] !== undefined) {
//       scrollRef.current?.scrollTo({
//         x: tabPositions.current[toggle],
//         animated: true,
//       });
//     }
//   }, [toggle]);

//   useEffect(() => {
//       if (Array.isArray(route.params?.url)) {
//       settoggle(route.params?.url[0]);
//     }
//   }, []);
//   const invoice_Tee_details = useCallback(async ():Promise<void> => {
   
//     setisloading(true);
//     try {
//       const response = await api.javascriptGet({
//         path: ENDPOINT.get_tee_bookings,
//         Token: userData?.token,
//         body: {},
//       });
//       if (response.status) {
//         setTeeBooking(response.data);
//         setisloading(false);
//       } else {
//         return null;
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   },[]);

//   const invoice_details = useCallback(async (): Promise<void> => {
//     setisloading(true);

//     try {
//       const json = await api.javascriptGet({
//         path: 'member/room/transaction',
//         Token: userData?.token,
//       });

//       if (json?.status) {
//         setRoomTransactions(json.data.data);
//         setfilter(false);
//       } else {
//         console.log('API Failed');
//       }
//     } catch (error) {
//       console.error('Invoice API error:', error);
//     } finally {
//       // ✅ always runs once
//       setisloading(false);
//     }
//   },[]);
//   const invoice_Event_details = useCallback(async (): Promise<void> => {
//     setisloading(true);
//     const res = await api.javascriptGet({
//       path: `${ENDPOINT.event_bookings}`,
//       Token: userData.token,
//     });
//     console.log(res, '---------------------- res ---------------------');
//     if (res?.status ==true) {
//       setEventBookings(res.data);
//     }
//     setisloading(false);
//   },[]);
//  const invoice_hall_details =useCallback( async () => {
//     setisloading(true);
//     try {
//       const json = await api.javascriptPost({
//         path: 'member/banquet/transactions',
//         Token: userData.token,
//       });
//       setisloading(false);
//       if (json?.status == true) {
//         setHallTransactions(json.data.data);
//       } else {
//         setisloading(false);

//         console.log('API Failed');
//       }
//     } catch {}
//   },[]);
//   const invoice_Activity_details = useCallback(async (): Promise<void> => {
//     setisloading(true);
//      try {
//     const apiRequestObject = {
//       path: `${
//         ENDPOINT.get_booking_details 
//       }?page=${1}&type=${''}&status=${''}`,
// Token:userData.token,
//       body: {},
//     };
//     const response = await api.javascriptGet(apiRequestObject);
//     console.log( response, '---------------------- response ---------------------');
//    setActivityBooking(response.data.data)
//   } catch (error) {
   
//   }
//   },[]);

//   useEffect(() => {
//     switch (toggle) {
//       case 'Room':
//         invoice_details();
//         break;
//       case 'Banquet':
//         invoice_hall_details();
//         break;
//       case 'Tee':
//         invoice_Tee_details();
//         break;
//       case 'Event':
//         invoice_Event_details();
//         break;
//       case 'Activity':
//         invoice_Activity_details();
//         break;
//       default:
//         false;
//     }
// }, [
//   toggle,
//   invoice_details,
//   invoice_hall_details,
//   invoice_Tee_details,
//   invoice_Event_details,
//   invoice_Activity_details
// ]);



//   const emptyList = () => (
//     <FlatList
//       data={[1, 1, 1, 1, 1, 1]}
//       renderItem={() => (
//         <View
//           style={[styles.mainView, { marginHorizontal: 10, borderRadius: 20 }]}
//         >
//           <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
//             <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 10 }}>
//               <ShimmerPlaceholder style={{ margin: 5 }} />
//               <ShimmerPlaceholder style={{ margin: 5 }} />
//               <ShimmerPlaceholder style={{ margin: 5 }} />
//               <View
//                 style={{
//                   flexDirection: 'row',
//                   justifyContent: 'space-around',
//                 }}
//               >
//                 <ShimmerPlaceholder width={70} style={{ margin: 5 }} />
//                 <ShimmerPlaceholder width={70} style={{ margin: 5 }} />
//               </View>
//             </View>
//           </View>
//         </View>
//       )}
//     />
//   );
 

//   const renderRoomItem = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate('InvoiceDetails', { id: item.id })}
//     >
//       {/* Header */}
//       <View style={styles.rowBetween}>
//         <Text style={styles.cardTitle} numberOfLines={1}>
//           {item.memberName}
//         </Text>

//         <View
//           style={[
//             styles.badge,
//             {
//               backgroundColor: item.status === 'Active' ? '#28A745' : '#F0AD4E',
//             },
//           ]}
//         >
//           <Text style={styles.badgeText}>{item.status}</Text>
//         </View>
//       </View>

//       {/* Booking Info */}
//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Booking No</Text>
//         <Text style={styles.value}>{item.bookingId}</Text>
//       </View>

//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Member ID</Text>
//         <Text style={styles.value}>{item.memberID}</Text>
//       </View>

//       <View style={styles.divider} />

//       {/* Dates */}
//       <View style={[styles.rowBetween]}>
//         <View>
//           <Text style={styles.label}>Check In</Text>
//           <Text style={styles.value}>
//             {moment(item.checkin).format('DD MMM YYYY')}
//           </Text>
//         </View>

//         <View>
//           <Text style={styles.label}>Check Out</Text>
//           <Text style={styles.value}>
//             {moment(item.checkout).format('DD MMM YYYY')}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.divider} />

//       {/* Payment */}
//       {item.payment && (
//         <View style={styles.rowBetween}>
//           <Text style={styles.label}>Payment</Text>
//           <Text
//             style={[
//               styles.value,
//               {
//                 color:
//                   item.payment.payment_status === 'Paid'
//                     ? '#28A745'
//                     : '#DC3545',
//               },
//             ]}
//           >
//           {item.payment.payment_status}
//           </Text>
//         </View>
//       )}

//       {/* CTA */}
//       <View style={styles.ctaRow}>
//         <Text style={styles.linkText}>View Details →</Text>
//       </View>
//     </TouchableOpacity>
//   );
//   const renderHallItem = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => navigation.navigate('InvoiceHallDetails', { id: item.id })}
//     >
//       <View style={styles.rowBetween}>
//         <Text style={styles.cardTitle}>{item.memberName}</Text>

//         <View
//           style={[
//             styles.badge,
//             {
//               backgroundColor:
//                 item.status === 'Completed' || item.status == 'Active'
//                   ? '#28A745'
//                   : '#F0AD4E',
//             },
//           ]}
//         >
//           <Text style={styles.badgeText}>{item.status}</Text>
//         </View>
//       </View>

//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Booking ID</Text>
//         <Text style={styles.value}>{item.booking_ID}</Text>
//       </View>

//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Persons</Text>
//         <Text style={styles.value}>{item.noofPerson}</Text>
//       </View>

//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Function Date</Text>
//         <Text style={styles.value}>
//           {moment(item.funDate).format('DD MMM YYYY')}
//         </Text>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.rowBetween}>
//         <Text style={styles.label}>Payment</Text>
//         <Text
//           style={[
//             styles.value,
//             {
//               color: item.payment_status === 'Paid' ? '#28A745' : '#DC3545',
//             },
//           ]}
//         >
//           {item.payment_status}
//         </Text>
//       </View>

//       <View style={styles.ctaRow}>
//         <Text style={styles.linkText}>View Details →</Text>
//       </View>
//     </TouchableOpacity>
//   );
//   const renderTeeItems = ({ item }: { item: any }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() =>
//         navigation.navigate('TeeBookingDetail', {
//           data: item,
//           tee_booking_detail_id: item.tee_booking_detail_id,
//         })
//       }
//     >
//       <View style={styles.rowBetween}>
//         <Text style={styles.cardTitle}>{item.bookingId}</Text>

//         <View
//           style={[
//             styles.badge,
//             {
//               backgroundColor: item.is_cancelled
//                 ? '#F0AD4E'
//                 : item.is_active
//                 ? '#28A745'
//                 : '#F0AD4E',
//             },
//           ]}
//         >
//           <Text style={styles.badgeText}>
//             {item.is_cancelled
//               ? 'Cancelled'
//               : item.is_active
//               ? 'Active'
//               : 'Pending'}
//           </Text>
//         </View>
//       </View>

//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Booking Date</Text>
//         <Text style={styles.value}>
//           {moment(item.booking_date).format('DD MMM YYYY')}
//         </Text>
//       </View>
//       <View style={styles.infoRow}>
//         <Text style={styles.label}>Tee Time</Text>
//         <Text style={styles.value}>{item.tee_sheet_time}</Text>
//       </View>

//       <View style={styles.divider} />

//       <View style={styles.rowBetween}>
//         <Text style={styles.label}>Player 1:</Text>
//         <Text style={styles.value}>
//           {item.player1_name} ({item.player1_member_id})
//         </Text>
//       </View>
//       <View style={styles.rowBetween}>
//         <Text style={styles.label}>Player 2:</Text>
//         <Text style={styles.value}>
//           {item.player2_name} ({item.player2_member_id})
//         </Text>
//       </View>
//       <View style={styles.rowBetween}>
//         <Text style={styles.label}>Player 3:</Text>
//         <Text style={styles.value}>
//           {item.player3_name} ({item.player3_member_id})
//         </Text>
//       </View>
//       {item.player4_member_id && (
//         <View style={styles.rowBetween}>
//           <Text style={styles.label}>Player 4:</Text>
//           <Text style={styles.value}>
//             {item.player4_name} ({item.player4_member_id})
//           </Text>
//         </View>
//       )}

//       <View style={styles.ctaRow}>
//         <Text style={styles.linkText}>View Details →</Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const renderEventItems = ({ item }: { item: any }) => {
//     return (
//       <Pressable
//         disabled={item.ticket_count + item.waiter_count == 0}
//         style={styles.eventcard}
//         onPress={() =>
//           navigation.navigate('EventBookingDetails', {
//             bookingId: item.booking_id,
//           })
//         }
//       >
//         <Image
//           source={{
//             uri: `${PUBLIC_URL}event/${item.event_image}`,
//           }}
//           style={styles.image}
//         />

//         <View style={{ flex: 1 }}>
//           <Text style={styles.cardTitle}>{item.event_name}</Text>

//           <View style={styles.check}>
//             <Icon name="calendar-today" size={14} color="#6b7280" />
//             <Text style={styles.value}> {item.event_date}</Text>
//           </View>
//           {item.ticket_count > 0 && (
//             <View>
//               <Text style={styles.label}>
//                 {item.ticket_count} Tickets • {item.ticket_types.join(', ')}
//               </Text>
//             </View>
//           )}
//         </View>

//         <View style={styles.right}>
//           <Text style={styles.amount}>₹{item.total_amount}</Text>

//           <View
//             style={[
//               styles.badge,
//               item.status === 'confirmed' ? styles.confirmed : styles.pending,
//             ]}
//           >
//             <Text style={styles.badgeText}>
//               {item.is_staff ? 'COMPLIMENTRY' : item.status.toUpperCase()}
//             </Text>
//           </View>
//           {item.waiter_count > 0 && (
//             <Text style={styles.subText}>
//               {item.waiter_count} Waiter{item.waiter_count > 1 ? 's' : ''} • ₹
//               {item.waiter_amount}
//             </Text>
//           )}
//         </View>
//       </Pressable>
//     );
//   };
//   const renderActivityItems = ({ item }: { item: any }) => {
//     return (
//  <TouchableOpacity
//         activeOpacity={0.8}
//         onPress={() => {
//          navigation.navigate('ActivityBookingDetail',{bookingId:item.id})
//         }}
//         style={[styles.card, { backgroundColor: "white", borderTopWidth: 0.2 }]}
       
//       >
//         <View
//           style={[
//             // styles.rowBetween,
//             {
           
//               padding: 5,
//               flexDirection: "row",
//             },
//           ]}
//         >
//           <View style={{ flex: 1 }}>
//             <View style={styles.rowBetween}>
//               <Text style={styles.cardTitle}>{item?.facility_name}</Text>
//               <Icon
//                 name="chevron-right"
//                 size={20}
//                 color={"black"}
//                 style={{ marginLeft: "auto" }}
//               />
//             </View>
//             <View style={styles.rowBetween}>
//               <Text style={styles.cardContent}>Booking Number: </Text>
//               <Text style={styles.cardContent}>{item?.booking_number}</Text>
//             </View>
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 marginTop: 5,
//               }}
//             >
//               <Icon
//                 name="calendar-month"
//                 size={20}
//                 // color={SECONDARY_COLOR}
//                 color={"black"}
//                 style={{ marginRight: 5 }}
//               />
//               <Text style={styles.cardContent}>
//                 Booked {moment(item?.booking_date).format("Do MMM [on] h:mm A")}
//               </Text>
//             </View>
           
//           </View>
//         </View>

//         <View style={[styles.rowBetween, { marginTop: 5 }]}>
//           <View style={{ flexDirection: "row", alignItems: "center" }}>
//             <Icon
//               name="access-time"
//               size={20}
//               // color={"rgb(83, 112, 255)"}
//               color={"black"}
//               style={{ marginRight: 5 }}
//             />
//             <Text>
//               Slot Date: {moment(item?.slot_date).format("Do MMM YY")} at{" "}
//               {item?.slot_label}
//             </Text>
//           </View>
//           <Text
//             style={[
//               styles.cardContent,
//               {
//                 backgroundColor:
//                   item?.status === "Cancelled" ? LIGHT_RED : LIGHT_GREEN,
//                 color: item?.status === "Cancelled" ? "red" : SECONDARY_COLOR,
//                 padding: 5,
//                 borderRadius: 5,
//                 fontFamily: FONT_FAMILY.bold,
//               },
//             ]}
//           >
//             {item?.status}
//           </Text>
//         </View>
//       </TouchableOpacity>
//     );
//   };
//   const urls = route.params?.url as UrlItem[] | undefined;
//   return (
//     <View style={{ flex: 1 }}>
//       <Header title={`${toggle} Booking`} />

//       <View>
//         <ScrollView
//           ref={scrollRef}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           style={{ padding: 10 }}
//           contentContainerStyle={{ paddingRight: 20 }}
//         >
//           {urls?.map((item, index) => {
//             const isSelected = toggle === item;

//             return (
//               <Pressable
//                 key={index}
//                 onLayout={event => {
//                   const layout = event.nativeEvent.layout;
//                   tabPositions.current[item] = layout.x;
//                 }}
//                 focusable
//                 accessibilityRole="button"
//                 accessibilityState={{ selected: isSelected }}
//                 onPress={() => settoggle(item)}
//                 style={({ pressed, focused }) => [
//                   {
//                     minWidth: 100,
//                     padding: 10,
//                     marginHorizontal: 10,
//                     borderRadius: 15,
//                     alignItems: 'center',
//                     backgroundColor: isSelected
//                       ? '#222642'
//                       : pressed || focused
//                       ? '#8f90a6'
//                       : '#bfc0bdff',
//                     transform: [{ scale: pressed ? 0.96 : 1 }],
//                   },
//                 ]}
//               >
//                 <Text
//                   style={{
//                     fontSize: 17,
//                     fontFamily: FONT_FAMILY.semiBold,
//                     color: isSelected ? 'white' : '#333',
//                   }}
//                 >
//                   {item}
//                 </Text>
//               </Pressable>
//             );
//           })}
//         </ScrollView>
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         {toggle === 'Banquet' ? null : (
//           <View
//             style={{
//               flexDirection: 'row',
//               justifyContent: 'space-between',
//             }}
//           >
//             {filter == true ? (
//               <TouchableOpacity
//                 onPress={() => invoice_details()}
//                 style={{
//                   backgroundColor: '#7AC915',
//                   alignSelf: 'center',
//                   borderRadius: 10,
//                   height: 30,
//                   alignItems: 'center',
//                   justifyContent: 'center',
//                   width: '20%',
//                 }}
//               >
//                 <Text
//                   style={{ color: 'white', fontWeight: '500', fontSize: 14 }}
//                 >
//                   {'Reset'}
//                 </Text>
//               </TouchableOpacity>
//             ) : null}
//           </View>
//         )}

//         {toggle === 'Room' ? (
//           <FlatList
//             data={roomTransactions}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderRoomItem}
//             ListEmptyComponent={
//               !isloading ? (
//                 <View
//                   style={{
//                     marginTop: 50,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Image
//                     source={require('../../../assets/images/norecord.png')}
//                     style={{ height: 100, width: 100 }}
//                   />

//                   <Text style={styles.empty}>No Booking available.</Text>
//                 </View>
//               ) : (
//                 emptyList()
//               )
//             }
//           />
//         ) : toggle === 'Banquet' ? (
//           <FlatList
//             data={hallTransactions}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderHallItem}
//             ListEmptyComponent={
//               !isloading ? (
//                 <View
//                   style={{
//                     marginTop: 50,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Image
//                     source={require('../../../assets/images/norecord.png')}
//                     style={{ height: 100, width: 100 }}
//                   />

//                   <Text style={styles.empty}>No Booking available.</Text>
//                 </View>
//               ) : (
//                 emptyList()
//               )
//             }
//           />
//         ) : toggle === 'Tee' ? (
//           <FlatList
//             data={TeeBooking}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderTeeItems}
//             ListEmptyComponent={
//               !isloading ? (
//                 <View
//                   style={{
//                     marginTop: 50,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Image
//                     source={require('../../../assets/images/norecord.png')}
//                     style={{ height: 100, width: 100 }}
//                   />

//                   <Text style={styles.empty}>No Booking available.</Text>
//                 </View>
//               ) : (
//                 emptyList()
//               )
//             }
//           />
//         ) : toggle === 'Event' ? (
//           <FlatList
//             data={eventBookings}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderEventItems}
//             ListEmptyComponent={
//               !isloading ? (
//                 <View
//                   style={{
//                     marginTop: 50,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Image
//                     source={require('../../../assets/images/norecord.png')}
//                     style={{ height: 100, width: 100 }}
//                   />

//                   <Text style={styles.empty}>No Booking available.</Text>
//                 </View>
//               ) : (
//                 emptyList()
//               )
//             }
//           />
//         ) : toggle === 'Activity' ? (
//           <FlatList
//             data={activityBooking}
//             keyExtractor={(item, index) => index.toString()}
//             renderItem={renderActivityItems}
//             ListEmptyComponent={
//               !isloading ? (
//                 <View
//                   style={{
//                     marginTop: 50,
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                   }}
//                 >
//                   <Image
//                     source={require('../../../assets/images/norecord.png')}
//                     style={{ height: 100, width: 100 }}
//                   />

//                   <Text style={styles.empty}>No Booking available.</Text>
//                 </View>
//               ) : (
//                 emptyList()
//               )
//             }
//           />
//         ) : (
//           <View
//             style={{
//               marginTop: 50,
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}
//           >
//             <Image
//               source={require('../../../assets/images/norecord.png')}
//               style={{ height: 100, width: 100 }}
//             />
//             <Text style={styles.empty}>No Booking available.</Text>
//           </View>
//         )}
//       </ScrollView>
//     </View>
//   );
// };

// export default MyBookings;
// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: '#FFF',
//     marginHorizontal: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 2,
//   },
//  eventcard: {
//     flexDirection: "row",
//     backgroundColor: "#fff",
//     marginHorizontal: 16,
//     marginVertical: 8,
//     padding: 16,
//     borderRadius: 14,
//     elevation: 2,
//     alignItems: "center",
//   },
//   cardTitle: {
//     fontSize: 15,
//     fontFamily: FONT_FAMILY.bold,
//     color: '#1d4184ff',
//     maxWidth: '70%',
//   },

//   rowBetween: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },

//   infoRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginTop: 6,
//   },

//   label: {
//     fontSize: 12,
//     color: '#666',
//     fontFamily: FONT_FAMILY.normal,
//   },
//   mainView: { margin: 20, backgroundColor: 'white', padding: 20 },
//   dateBox: {
//     backgroundColor: '#FFFFFF',
//     marginHorizontal: 16,
//     marginTop: 12,
//     padding: 14,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 6,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-around',
//   },
//   value: {
//     fontSize: 13,
//     fontFamily: FONT_FAMILY.semiBold,
//     color: '#333',
//   },

//   badge: {
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 6,
//   },

//   badgeText: {
//     color: '#FFF',
//     fontSize: 11,
//     fontFamily: FONT_FAMILY.semiBold,
//   },

//   divider: {
//     height: 1,
//     backgroundColor: '#EEE',
//     marginVertical: 10,
//   },
//   empty: {
//     textAlign: 'center',
//     marginTop: 40,
//     fontFamily: FONT_FAMILY.normal,
//     color: '#999',
//     fontSize: 15,
//   },
//   ctaRow: {
//     alignItems: 'flex-end',
//     marginTop: 8,
//   },

//   linkText: {
//     color: '#1d4184ff',
//     fontSize: 13,
//     fontFamily: FONT_FAMILY.semiBold,
//   },
//   dateContainer: {
//     padding: 10,
//     marginHorizontal: 20,
//     marginVertical: 10,
//     borderWidth: 1,
//     borderRadius: 8,
//     borderColor: 'grey',
//     alignItems: 'center',
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//   },
//   check: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   upcomingTitle: {
//     fontSize: 16,
//     fontFamily: FONT_FAMILY.bold,
//     marginBottom: 6,
//     color: '#1d4184ff',
//   },

//   groupLabel: {
//     fontSize: 13,
//     marginTop: 10,
//     marginBottom: 4,
//     fontFamily: FONT_FAMILY.semiBold,
//     color: '#555',
//   },
//   upcomingCard: {
//     backgroundColor: '#E8F1FF',
//     padding: 12,
//     borderRadius: 12,
//     marginLeft: 12,
//     width: 180,
//   },

//   upcomingId: {
//     fontSize: 13,
//     fontFamily: FONT_FAMILY.semiBold,
//     color: '#1d4184ff',
//   },

//   upcomingDate: {
//     fontSize: 11,
//     color: '#555',
//     marginVertical: 4,
//   },

//   upcomingBadge: status => ({
//     alignSelf: 'flex-start',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 6,
//     backgroundColor: status === 'Paid' ? '#28A745' : '#F0AD4E',
//   }),

//   badgeTextSmall: {
//     color: '#fff',
//     fontSize: 10,
//   },

//   viewBtn: {
//     marginTop: 8,
//     backgroundColor: '#1d4184ff',
//     paddingVertical: 6,
//     borderRadius: 6,
//     alignItems: 'center',
//   },

//   viewBtnText: {
//     color: '#fff',
//     fontSize: 12,
//     fontFamily: FONT_FAMILY.semiBold,
//   },
//     image: {
//     width: 70,
//     height: 70,
//     borderRadius: 10,
//     marginRight: 12,
//   },
// });
