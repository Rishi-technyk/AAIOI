import {
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {FlatList, TextInput} from 'react-native-gesture-handler';
import { DARK_BLUE, FONT_FAMILY, SECONDARY_COLOR } from '../util/colors';
import Icon from "react-native-vector-icons/MaterialIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import Icons from "react-native-vector-icons/Entypo";
import {createShimmerPlaceholder} from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import * as api from '../util/api';
import {ENDPOINT} from '../util/constant';
import Header from '../components/Header';
import { Avatar, Card } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppDrawer';
import DatePickerComponent from '../components/DatePicker';

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
type Porps=NativeStackScreenProps<AppStackParamList,'AffilatedClub'>
const AffilatedClubScreen:React.FC<Porps> = ({}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredClubs, setFilteredClubs] = useState<any[]>();
  const [startdate, setstartDate] = useState('From Date');
  const [enddate, setendDate] = useState('To Date');
  const [visible, setVisible] = useState(false);
  const [clubs, setClubs] = useState([]);

  // const handleVisit = name => {

  //   Alert.alert(name,"Feature Coming Soon..")
  // };
  const fetchClubs = async () => {
    const body={}
    const apiRequestObject = {
      path:ENDPOINT.affilated_clubs,
      body: body
    };
    const response = await api.javascriptGet(apiRequestObject);
    
    if (response.status) {
      setClubs(response.data)
      
    }
  };
  useEffect(() => {
    if (clubs?.length === 0) {
      
      fetchClubs();
    } else {
      const filtered = clubs?.filter((club:any) =>
        club.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredClubs(filtered); 
    }
  }, [searchQuery, clubs]);

  const Datefrom = (date:string, type:string) => {
    type === 'startdate' ? setstartDate(date) : setendDate(date);
  };

  const handleSubmit = () => {
    if (!startdate.includes('-') || !enddate.includes('-')) return;
    if (startdate > enddate || startdate === enddate) {
      Alert.alert('Please enter a valid date');
      return;
    }
    setVisible(false);
    Alert.alert('Booked');
  };

 
  // const openGoogleMaps = (latitude, longitude) => {
  //  Alert.alert("Please Search On Maps")
  // };

  const renderItems = ({ item }:{item:any}) => (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Avatar.Text
            label={item.name?.charAt(0).toUpperCase()}
            size={50}
            style={{ backgroundColor: DARK_BLUE, marginRight: 10 }}
          />
          {/* </View> */}
          <View style={{flex:1,}}>
          <Text style={styles.clubName}>{item.name}</Text>
          <Text style={[styles.clubName,{fontFamily:FONT_FAMILY.normal,fontSize:14}]}>{item.city}</Text>
            {Array.isArray(item.phone_numbers)&& item.phone_numbers?.length >0 &&<View style={{ flexDirection: "row" }}>
              <Icon name="call" size={20} color={"grey"} />
              <Text style={[styles.lightText]}>Phone: </Text>
              <Text  style={[styles.lightText, { color: "black" ,flex:1}]}>
                {item.phone_numbers || "N/A"}
              </Text>
            </View>}
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.phoneContainer}>
          <View style={{ flexDirection: "row" }}>
            <Icons name="globe" size={20} color={"grey"} />
            <Text style={styles.lightText}>Website:</Text>
            <Text style={[styles.lightText, { width: "75%", color: "black" }]}>
              {item.website ||"N/A"}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row" }}>
              <Icon name="outgoing-mail" size={25} color={"grey"} />
              <Text style={styles.lightText}>Email:</Text>
              <Text style={[styles.lightText, { color: "black" }]}>
                {item.email||"N/A"}
              </Text>
            </View>
            {/* <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                style={styles.mapIcon}
                source={require("../../assets/images/map.png")}
              />
              <Text style={styles.clubCity}>{item.City}</Text>
            </View> */}
          </View>
        </View>
      </View>
    </Card>
  );

  const emptyList = () => (
    <FlatList
      data={[1, 1, 1, 1, 1, 1]}
      renderItem={() => (
        <View style={styles.card}>
          <View style={{flex: 1, alignItems: 'center', flexDirection: 'row'}}>
            <ShimmerPlaceholder style={styles.roundShimmer} />
            <View style={{flex: 1, alignItems: 'flex-start', margin: 20}}>
              <ShimmerPlaceholder style={{}} />
              <ShimmerPlaceholder style={{width: 50, marginTop: 20}} />
            </View>
          </View>
          <ShimmerPlaceholder style={{margin: 5}} />
          <ShimmerPlaceholder style={{margin: 5}} />
        </View>
      )}
    />
  );
  return (
    <View style={styles.screen}>
    <Header title={'Affiliated Clubs'}/>
      <View style={styles.container}>
     
        <View style={{ marginBottom: 0, flex: 1}}>
          <View
            style={{
              backgroundColor: 'white',
            marginBottom:10,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 0.4,
              borderColor: 'grey',
            }}>
          <MaterialIcons
  name="search"
  size={22}
  color="black"
  style={{ marginLeft: 10 }}
/>

            <TextInput
              placeholder="Search Clubs"
              placeholderTextColor={'grey'}
              maxLength={30}
              cursorColor={SECONDARY_COLOR}
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={{
                flex: 1,fontFamily:FONT_FAMILY.normal,
                padding: 10,
              }}
            />
          </View>
          {filteredClubs?.length ===0  ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No Clubs found. Please try a different search.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredClubs}
              ListEmptyComponent={emptyList}
              style={{flex: 1}}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()} // Use item ID or index as key
              renderItem={renderItems}
            />
          )}
        </View>
      </View>
      {visible && (
        <Modal transparent={true} visible={visible} animationType="slide">
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.3)',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <View
              style={{
                backgroundColor: 'white',
                margin: 20,
                padding: 10,
                width: '87%',
                borderRadius: 10,
              }}>
              <View
                style={{
                  position: 'absolute',
                  alignSelf: 'center',
                  top: -20,
                  borderRadius: 30,
                  padding: 5,
                  backgroundColor: 'white',
                }}>
                <Image
                  source={require('../../assets/images/Logo.png')}
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 30,
                  }}
                />
              </View>

              <Text
                style={{
                  textAlign: 'center',
                  alignSelf: 'center',
                  width: '70%',
                  paddingVertical: 10,
                  marginTop: 10,
                  fontSize: 16,
                 fontFamily:FONT_FAMILY.bold
                }}>
                Affliated Clubs Visit {clubs}
              </Text>

              <View style={styles.dateInputContainer}>
                <DatePickerComponent
                  placeholder={startdate}
                  setResetDate={true}
                  stateDate={date => Datefrom(date, 'startdate')}
                />
              </View>
              <View style={styles.dateInputContainer}>
                <DatePickerComponent
                  placeholder={enddate}
                  setResetDate={true}
                  stateDate={date => Datefrom(date, 'enddate')}
                />
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  margin: 10,
                }}>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => setVisible(false)}
                  style={styles.modalButton}>
                  <Text style={{color: 'white'}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.5}
                  style={styles.modalButton}
                  onPress={handleSubmit}>
                  <Text style={{color: 'white'}}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

export default AffilatedClubScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    padding: 20,
  paddingBottom:0
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    height: 25,
    width: 25,
    borderRadius: 15,
    marginLeft: 5,
  },
  clubTitle: {
    marginLeft: 5,
    color: 'black',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
    alignSelf: 'center',
  },
  emptyView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',fontFamily:FONT_FAMILY.normal
  },
  modalButton: {
    backgroundColor: SECONDARY_COLOR,
    padding: 10,
    borderRadius: 5,
    paddingHorizontal: 20,
  },
  card: {
    flex: 1,
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    elevation: 10,
    shadowColor: 'grey',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  cardHeader: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  cardContent: {
    flexDirection: 'row',
    flex: 1,
  },
  dateInputContainer: {
    margin: 10,
  },
  initialContainer: {
    height: 30,
    width: 30,
    backgroundColor: '#222642',
    marginRight: 10,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  initialText: {
    color: 'white',
   fontFamily:FONT_FAMILY.bold,fontSize:18
  },
  clubName: {
    color: 'black',
    fontFamily: FONT_FAMILY.bold,
    fontSize:16,
    marginVertical: 2,
  },
  clubCity: {
    color: 'black',
    fontFamily: FONT_FAMILY.normal,
  },
  mapIcon: {
    height: 20,
    width: 20,
   marginRight:10,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  phoneContainer: {
    flex: 1,
  },
  lightText: {
    color: 'grey',
    marginVertical: 2,
    marginLeft: 8,
    fontFamily:FONT_FAMILY.normal
  },

  visitButton: {
    backgroundColor: SECONDARY_COLOR,
    alignContent: 'center',
    alignSelf: 'center',
    padding: 10,
    borderRadius: 10,
  },
  visitButtonText: {
    color: 'white',
    marginHorizontal: 20,
    fontWeight: 'bold',
  },
  roundShimmer: {
    width: 50, 
    height: 50, 
    borderRadius: 50,
  },
});