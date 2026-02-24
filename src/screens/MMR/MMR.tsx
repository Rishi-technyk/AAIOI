import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import Header from '../../components/Header';
import { javascriptGet, javascriptPost } from '../../util/api';
import { ENDPOINT } from '../../util/constant';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import moment from 'moment';
import { DARK_BLUE, FONT_FAMILY, RED_COLOR } from '../../util/colors';
import { Toast } from 'react-native-toast-notifications';
import { FlatList } from 'react-native-gesture-handler';
import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';


type Props = NativeStackScreenProps<AppStackParamList, 'MMR'>;

interface SettingsProps {
  mmr_id: string | number;
  already_registered?: boolean;
  current_day?: number;
  days_remaining?: number;
  is_open?: true;
  registration_end?: Date;
  registration_start?: Date;
  server_time?: Date;
  today?: Date;
  total_days?: number;
  reg_message?: string;
}

const MMR: React.FC<Props> = () => {
  const userData = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<boolean>(false);
  const [tempStartDate, setTempStartDate] = useState(
    moment().format('YYYY-MM-DD'),
  );
  const [settings, setSettings] = useState<SettingsProps>();
  const [history, setHistory] = useState<any[]>([]);
  console.log( history, '---------------------- history ---------------------');
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastPage, setLastPage] = useState(1);

  const fetchHistory = async (pageNumber = 1, isRefresh = false) => {
    if (pageNumber > lastPage && !isRefresh) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await javascriptGet({
        path: `${ENDPOINT.mmr_history}?page=${pageNumber}`,
        Token: userData?.token,
      });

      if (response.status) {
        const newData = response.data.data;

        setLastPage(response.data.last_page);

        if (isRefresh) {
          setHistory(newData);
        } else {
          setHistory(prev =>
            pageNumber === 1 ? newData : [...prev, ...newData],
          );
        }

        setPage(pageNumber);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  const fetchMMRSettings = async () => {
    const response = await javascriptGet({
      path: ENDPOINT.get_mmr_settings,
      Token: userData?.token,
    });
    if (response.status == true) {
      setSettings(response.data);
    }
  };
  useEffect(() => {
    fetchMMRSettings();
    fetchHistory(1);
  }, []);
  const onRefresh = () => {
    fetchHistory(1, true);
  };
  const loadMore = () => {
    if (!loadingMore && page < lastPage) {
      fetchHistory(page + 1);
    }
  };

  const handleRegisterMember = async () => {
    setLoading(true);
    try {
      const response = await javascriptPost({
        path: ENDPOINT.register_mmr_member,
        Token: userData.token,
        body: {
          mmr_id: settings?.mmr_id,
        },
      });
    
      if (response.status === true) {
        Toast.show(response.message || 'Registration successful', {
          type: 'success',
          duration: 2000,
        });
        fetchMMRSettings();
        onRefresh()
      } else {
        Toast.show(response.message || 'Registration unsuccessful', {
          type: 'danger',
          duration: 2000,
        });
      }
    } catch (error) {
      Toast.show('Registration unsuccessful', {
        type: 'danger',
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      <Header title="MMR Registration" />
      <ScrollView 
         showsVerticalScrollIndicator={false}
      contentContainerStyle={{flexGrow:1}}
      stickyHeaderIndices={[2]}
      >
      {settings?.registration_start ? (
        <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={[styles.text, { fontFamily: FONT_FAMILY.bold }]}>
              Registration Started On:{' '}
            </Text>
            <Text style={[styles.text, { color: 'green' }]}>
              {moment(settings?.registration_start).format('DD-MM: ddd')}
            </Text>
          </View>
          <View style={styles.inner}>
            <Text style={[styles.text, { fontFamily: FONT_FAMILY.bold }]}>
              Registration Ends On:{' '}
            </Text>
            <Text style={[styles.text, { color: 'green' }]}>
              {moment(settings?.registration_end).format('DD-MM: ddd')}
            </Text>
          </View>
      
      
      <View style={{ backgroundColor: 'white', marginTop: 20 }}>
        {/* <View style={{}}>
          <CalendarStrip
            dayOpenBooking={settings?.days_remaining || 3}
            selectedDate={tempStartDate}
            onSelectDate={setTempStartDate}
          />
        </View> */}
        <View style={{}}>
          {settings?.already_registered ? (
            <View style={styles.regCont}>
              <Text
                style={[
                  styles.text,
                  { fontFamily: FONT_FAMILY.bold, color: RED_COLOR },
                ]}
              >
                {settings?.reg_message}
              </Text>
            </View>
          ) : (
            <View style={styles.regCont}>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Alert',
                    `Do you want Register on ${moment(tempStartDate).format(
                      'DD-MMM',
                    )} ?`,
                    [
                      {
                        text: 'No',
                        style: 'cancel',
                      },
                      { text: 'Yes', onPress: () => handleRegisterMember() },
                    ],
                  )
                }
                style={styles.btn}
              >
                {loading && (
                  <ActivityIndicator
                    size={'small'}
                    color={'white'}
                    style={{ marginRight: 10 }}
                  />
                )}
                <Text
                  style={[
                    styles.text,
                    { fontFamily: FONT_FAMILY.bold, color: 'white' },
                  ]}
                >
                  Register Now
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
        </View>
      ):
          <View style={styles.container}>
          <View style={styles.inner}>
            <Text style={[styles.text, { fontFamily: FONT_FAMILY.bold,color:RED_COLOR }]}>
              Registration not started yet.
            </Text>
          </View>
         
        </View>}
         <View style={{marginTop:10,padding:20,backgroundColor:'#f0f0f0'}}>
              <Text
                style={[
                  styles.text,
                  { fontFamily: FONT_FAMILY.bold, },
                ]}
              >
                Previous Registrations
              </Text>
     
      </View>
     

        <FlatList
          data={history}
       
          keyExtractor={(item, index) => index.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          scrollEnabled={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item }) => (
            <View style={styles.eventcard}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: FONT_FAMILY.bold }}>
                  {moment(item?.start_date).format('DD MMM YYYY')}
                </Text>
                <Text style={{ color: 'gray' }}>
                  Registered at {moment(item?.created_at).format('hh:mm A')}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
           loadingMore && history.length === 0 ? (
    <View>{renderShimmer()}</View>
  ) : (
    <View style={{ alignItems: 'center', marginTop: 40 }}>
      <Text style={{ color: 'gray' }}>
        No Previous Registrations
      </Text>
    </View>
  )
            
          }
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator size="small" color={DARK_BLUE} />
            ) : null
          }
        />
           
      
      </ScrollView>
    </View>
  );
};
const renderShimmer = () => {
  return Array(20)
    .fill(0)
    .map((_, index) => (
      <View key={index} style={styles.eventcard}>
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ height: 20, width: '60%', marginBottom: 10 }}
        />
        <ShimmerPlaceHolder
          LinearGradient={LinearGradient}
          style={{ height: 15, width: '40%' }}
        />
      </View>
    ));
};

export default MMR;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  btn: {
    backgroundColor: '#135bec',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  text: {
    fontFamily: FONT_FAMILY.normal,
    color: DARK_BLUE,
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom:10,
  },
  regCont: {
    backgroundColor: '#ffff',
    padding: 20,
    alignItems: 'center',
  },
  eventcard: {
   
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
});
