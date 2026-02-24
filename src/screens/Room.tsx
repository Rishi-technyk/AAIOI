import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import moment from 'moment';
import { FONT_FAMILY } from '../util/colors';
import { javascriptGet } from '../util/api';
import { useSelector } from 'react-redux';
import Header from '../components/Header';
import DatePickerComponent from '../components/DatePicker';
import { RootState } from '../store/store';
import { AppStackParamList } from '../navigation/AppDrawer';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props=NativeStackScreenProps<AppStackParamList,'Rooms'>
const RoomAvailability:React.FC<Props> = () => {
  const userData = useSelector((state:RootState) => state.auth);

  const [minDate, setMinDate] = useState<moment.Moment | null>(null);
  const [maxDate, setMaxDate] = useState<moment.Moment | null>(null);
  const [availabilitycount, setAvailabilitycount] = useState<number>(0);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<'room' | 'banquet'| null>(null);

  const [roomData, setRoomData] = useState([]);
  const [banquetData, setBanquetData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /** 🔥 Load settings (min/max days) */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await javascriptGet({
          path: 'member/get/setting',
          Token: userData.token,
        });
      
        const min = parseInt(res.data.min_days);
        const max = parseInt(res.data.max_days);

        const minAllowed = moment().add(min, 'days');
        const maxAllowed = moment().add(max, 'days');
        setSettings(res.data);
        if(res.data.room_booking_availability == 'Active'){
          setSelectedTab('room');
        }else if( res.data.banquest_booking_availability ==='Active'){
          setSelectedTab('banquet');
        }else{
          setSelectedTab(null);
        }
        setMinDate(minAllowed);
        setMaxDate(maxAllowed);

        setStartDate(minAllowed.format('YYYY-MM-DD'));
        setEndDate(minAllowed.clone().add(2, 'days').format('YYYY-MM-DD'));

        setSettingsLoaded(true);
      } catch (err) {
        console.log('SETTINGS ERROR:', err);
        setErrorMsg('Unable to load settings. Please try again.');
      }
    };

    loadSettings();
  }, []);

  /** 🔥 Fetch availability safely with error handling */
  const fetchAvailability = useCallback(async () => {
    if (!settingsLoaded) return;
    if (!startDate || !endDate) return;

    try {
      setLoading(true);
      setErrorMsg(null);

      const url = `member/${selectedTab}-availability?startdate=${startDate}&enddate=${endDate}`;


      const response = await javascriptGet({
        path: url,
        Token: userData.token,
      });
console.log( response, '---------------------- response ---------------------');
      if (!response.status) {
        setErrorMsg(response.message || 'Something went wrong');
        setRoomData([]);
        setBanquetData([]);
        return;
      }

      if (selectedTab === 'room') {
        setRoomData(response.rooms || []);
        setAvailabilitycount(response.total_available_rooms || 0);
      } else {
        setBanquetData(response.banquets || []);
        setAvailabilitycount(response.total_available_venues || 0);
      }
    } catch (err) {
      console.log('API ERROR:', err);
      setErrorMsg('Failed to load availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [settingsLoaded, selectedTab, startDate, endDate]);

  /** Fetch when any dependency changes */
  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);
  return (
    <View style={styles.container}>
      <Header title="Availability" />

    {selectedTab ? <ScrollView
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 20, padding: 10 }}
      >
        {/* 🔹 Tabs */}
        <View style={styles.tabcontainer}>
         {settings?.room_booking_availability == 'Active' && <Pressable
            style={[styles.tab, selectedTab === 'room' && styles.selctedTab]}
            onPress={() => setSelectedTab('room')}
          >
            <Text style={styles.tabText}>Room</Text>
          </Pressable>}
         {settings?.banquest_booking_availability == 'Active' && <Pressable
            style={[styles.tab, selectedTab === 'banquet' && styles.selctedTab]}
            onPress={() => setSelectedTab('banquet')}
          >
            <Text style={styles.tabText}>Banquet</Text>
          </Pressable>}
        </View>

        {/* 🔹 Date Range Pickers */}
        <View style={{backgroundColor:'#F2F2F7',paddingBottom:10}}>
          <View style={styles.sliderContainer}>
            <Text style={styles.monthTitle}>Select a Date {selectedTab=='room'&&`Range`}</Text>

            <View style={styles.buttonHeader}>
              <DatePickerComponent
                placeholder={
                  startDate
                    ? moment(startDate).format('DD MMM YYYY')
                    : 'Select Start Date'
                }
                stateDate={setStartDate}
                minDate={minDate?.toDate()}
                maxDate={maxDate?.toDate()}
              />

              {selectedTab=='room'&& <DatePickerComponent
                placeholder={
                  endDate
                    ? moment(endDate).format('DD MMM YYYY')
                    : 'Select End Date'
                }
                stateDate={setEndDate}
                minDate={
                  startDate ? moment(startDate).toDate() : minDate?.toDate()
                }
                maxDate={maxDate?.toDate() || new Date()}
              />}
            </View>
          </View>

          <Text style={styles.availabilityHeading}>
            {selectedTab === 'room'
              ? `Total ${availabilitycount} Room(s) Available`
              : `Total ${availabilitycount} Banquet(s) Available`}
          </Text>
        </View>

        {/* 🔹 Error Message */}
        {errorMsg && (
          <Text style={{ color: 'red', textAlign: 'center', marginTop: 10 }}>
            {errorMsg}
          </Text>
        )}

        {/* 🔹 Loading Indicator */}
        {loading && (
          <ActivityIndicator
            size="large"
            color="black"
            style={{ marginTop: 20 }}
          />
        )}

        {/* 🔹 CONTENT */}
        {!loading && (
          <>
            {selectedTab === 'room' ? (
              roomData.length === 0 ? (
                <Text style={styles.emptyText}>No rooms available</Text>
              ) : (
                roomData.map((room, index) => (
                  <View key={index} style={styles.roomCard}>
                    <View style={styles.iconCircle}>
                      <Text style={styles.icon}>🛏</Text>
                    </View>
                    <View>
                      <Text style={styles.roomName}>{room.name}</Text>
                      <Text
                        style={[
                          styles.roomCount,
                          {
                            color: room.available_rooms ? '#2ECC71' : '#FF4D4D',
                          },
                        ]}
                      >
                        ● {room.available_rooms} Available
                      </Text>
                    </View>
                  </View>
                ))
              )
            ) : banquetData.length === 0 ? (
              <Text style={styles.emptyText}>No banquets available</Text>
            ) : (
              banquetData.map((banquet, index) => (
                <View key={index} style={styles.banquetCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.iconCircle}>
                      <Text style={styles.icon}>🏛️</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.roomName}>{banquet.venue_name}</Text>
                      <Text style={{ color: 'grey' }}>
                        Capacity: {banquet.capacity}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      marginTop: 5,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    {banquet.sessions?.map(session => (
                      <View
                        key={session.session_id}
                        style={{
                          width: '48%',
                          marginBottom: 10,
                          backgroundColor: session.bgc,
                          padding: 10,
                          borderRadius: 8,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={[
                            styles.roomCount,
                            { fontFamily: FONT_FAMILY.semiBold },
                          ]}
                        >
                          {session.session_name}
                        </Text>
                        <Text
                          style={[styles.roomCount, { color: session.color }]}
                        >
                          ● {session.status}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
      :(
        settingsLoaded ? <Text style={styles.emptyText}>No booking availability at the moment</Text> : <ActivityIndicator
        size="large"
        color="black"
        style={{ marginTop: 20 }}
      />
      )}
    </View>
  );
};

export default RoomAvailability;

// ===================== STYLES ======================
const styles = StyleSheet.create({
  buttonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    // paddingHorizontal: 20,
    marginBottom: 10,
  },

  navBtn: {
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
  },

  weekRowButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },

  dateBox: {
    width: 50,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedDateBox: {
    backgroundColor: '#E3F1FF',
    borderColor: '#1F6FEB',
    borderWidth: 0.7,
  },
  selectedDateText: {
    color: '#1F6FEB',
  },

  dayText: {
    color: 'black',
    fontSize: 18,
    fontFamily: FONT_FAMILY.semiBold,
  },

  selectedDayText: {
    color: '#fff',
  },

  weekShort: {
    color: 'black',
    fontSize: 12,
  },

  availCount: {
    color: '#2ECC71',
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: 3,
  },

  sliderContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 15,
    marginTop: 12,
  },

  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },

  container: { flex: 1, backgroundColor: '#F2F2F7' },

  headerTitle: {
    color: 'black',
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 10,
    textAlign: 'center',
  },

  calendarCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
  },

  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  monthTitle: {
    color: 'black',
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
    textAlign: 'center',
  },

  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  weekDay: {
    width: 35,
    textAlign: 'center',
    color: '#8B949E',
    fontSize: 14,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },

  dateCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 10,
  },

  dateText: {
    color: 'black',
    fontSize: 16,
    fontFamily: FONT_FAMILY.normal,
  },

  selectedDate: {
    backgroundColor: '#1F6FEB',
    borderRadius: 10,
  },

  dateTextSelected: {
    color: 'black',
  },

  subCount: {
    fontSize: 12,
    marginTop: 4,
    color: '#8B949E',
  },

  availabilityHeading: {
    color: 'black',
    fontSize: 18,
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: 18,
  },

  roomCard: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },
  banquetCard: {
    backgroundColor: '#FFF',
    // alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 12,
  },

  iconCircle: {
    backgroundColor: '#F2F2F7',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  icon: {
    fontSize: 22,
  },

  roomName: {
    color: 'black',
    fontSize: 17,
    fontFamily: FONT_FAMILY.semiBold,
  },

  roomCount: {
    marginTop: 4,
    fontSize: 14,
  },
  tabcontainer: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#E1E7EF',
    borderRadius: 8,
    padding: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.semiBold,
    color: 'black',
    textAlign: 'center',
  },
  tab: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    //
    borderRadius: 5,
  },
  selctedTab: {
    backgroundColor: '#FFF',
  },
  emptyText: {
    color: 'black',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: FONT_FAMILY.semiBold,
  },
});
