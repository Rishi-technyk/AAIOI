import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Header from "../../components/Header";
import { useSelector } from "react-redux";
import moment from "moment";
import { Dropdown } from "react-native-element-dropdown";
import {
  FONT_FAMILY,
  LIGHT_GREEN,
  LIGHT_RED,
  RED_COLOR,
  SECONDARY_COLOR,
} from "../../util/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Switch } from "react-native-paper";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { useTee } from "../../services/TeeService";
import CalendarStrip from "../../components/CalendarStrip";
import { javascriptPost } from "../../util/api";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import { RootState } from "../../store/store";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
type Props = NativeStackScreenProps<AppStackParamList, 'Tee'>;
const Tee: React.FC<Props> = ({ navigation }) => {
  const userData = useSelector((state:RootState) => state.auth);
const [currentTime, setCurrentTime] = useState(Date.now());

  const [session, setSession] = useState({ id: 0 });
  const [hole, setHole] = useState({ id: 0 });
  
  const [loading, setLoading] = useState(false);
  const [isSwitchEnabled, setIsSwitchEnabled] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(
    moment().add(1, "days").format("YYYY-MM-DD")
  );
  const [remainingTime, setRemainingTime] = useState(null);
  const [windowStatus, setWindowStatus] = useState("closed");
  const { data, isLoading, refetch } = useTee(userData, tempStartDate,session);

  // normalize API response → so UI stays the same
  const normalizedData = React.useMemo(() => {
    if (!data) return {};
 return {
      sessions: data.tee_sessions || [],
      holes: data.tee_holes || [],
      booking_start_time: data.settings?.booking_start_time || "06:00",
      hour_before_booking: data.settings?.hour_before_booking || 0,
      hour_booking_range: data.settings?.hour_booking_range || 0,
      day_open_booking: data.settings?.day_open_booking || 1,
      tee_sheets: data.tee_sheets || [],
    };
  }, [data]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    refetch().finally(() => setLoading(false));
  }, [refetch]);

  const formatTime = (seconds) => {
    const duration = moment.duration(seconds, "seconds");
    const h = String(duration.hours()).padStart(2, "0");
    const m = String(duration.minutes()).padStart(2, "0");
    const s = String(duration.seconds()).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  const checkBookingWindow = () => {
    if (!normalizedData?.booking_start_time) return;
  const now = moment();
    const selectedDay = moment(tempStartDate).format("YYYY-MM-DD");

    const bookingStartMoment = moment(
      `${selectedDay} ${normalizedData.booking_start_time}`,
      "YYYY-MM-DD HH:mm"
    );

    const openTime = bookingStartMoment
      .clone()
      .subtract(Number(normalizedData.hour_before_booking), "hours");

    const closeTime = openTime
      .clone()
      .add(Number(normalizedData.hour_booking_range), "hours");

    if (now.isBetween(openTime, closeTime) && normalizedData.tee_sheets.length) {
      setWindowStatus("open");
      setRemainingTime(closeTime.diff(now, "seconds"));
    } else if (now.isBefore(openTime)) {
      setWindowStatus("upcoming");
      setRemainingTime(openTime.diff(now, "seconds"));
    } else {
      setWindowStatus("closed");
      setRemainingTime(null);
    }
  };
  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentTime(Date.now());
  }, 3000); // 1 sec

  return () => clearInterval(interval);
}, []);

const getStatusInfo = useCallback((item: any) => {
  const now = new Date(currentTime);
const lockedTill = item.locked_till
  ? moment(item.locked_till, "YYYY-MM-DD HH:mm:ss").toDate()
  : null;
switch (true) {
    case item.is_locked_by_admin === 1:
      return { label: "Reserved", color: "black", backgroundColor: "#e0e0e0" };

    case item.is_booked === 1:
      return { label: "Booked", color: "orange", backgroundColor: "#fff5e6" };

    case lockedTill && lockedTill > now && item.locked_by_user !== userData?.user?.id:
      return { label: "Under Process 🕖",color: "black", backgroundColor: "#e0e0e0" };

    case item.is_active === 0:
      return { label: "Inactive", color: RED_COLOR, backgroundColor: LIGHT_RED };

    default:
      return { label: "Available", color: SECONDARY_COLOR, backgroundColor: LIGHT_GREEN };
  } 
}, [userData?.user?.id, currentTime]);
console.log( data, '---------------------- data ---------------------');

 useEffect(() => {
    checkBookingWindow();
    const timer = setInterval(checkBookingWindow, 15000);
    return () => clearInterval(timer);
  }, [tempStartDate, normalizedData]);

const handleToBeReserved = useCallback(async (item) => {
      const res=await javascriptPost({
        path:'member/lock/tee',
        Token:userData.token,
        body:{
             session_id:item.session_id,
    tee_off_hole_id:item.tee_off_hole_id,
    tee_sheet_id:item.id,
        }
      })
      if(res.status == true){
          navigation.navigate("TeeBuddies", {
            data: item,
            timer:res.locked_till,
            refetch: refetch,
            date: tempStartDate,
            session: normalizedData?.sessions?.find(
              (s) => s.id == item.session_id
            ),
          })
      }else{
        refetch();
        Alert.alert(res.message||'Slote not found.')
      }
    }, [userData.token, tempStartDate, navigation, refetch, normalizedData.sessions]
);

const filteredSheets = useMemo(() => {
  let sheets = normalizedData?.tee_sheets || [];

  if (isSwitchEnabled) {
    sheets = sheets.filter(
      item => item.is_active === 1 && item.is_booked !== 1
    );
  }

  if (hole?.id) {
    sheets = sheets.filter(
      item => item.hole_number === hole.hole_number
    );
  }

  return sheets;
}, [normalizedData?.tee_sheets, isSwitchEnabled, hole?.id]);

  const renderTeeSheets = React.useCallback(({ item }) => {
    const statusInfo = getStatusInfo(item);
  const now = new Date(currentTime);
 const lockedTill = item.locked_till
  ? moment(item.locked_till, "YYYY-MM-DD HH:mm:ss").toDate()
  : null;
  const isReservedByOther =
    lockedTill &&
    lockedTill > now &&
    item.locked_by_user !== userData?.user?.id;

   return (
      <Pressable
        disabled={
        item.is_active === 0 ||
        item.is_booked === 1 ||
        item.is_locked_by_admin === 1 ||
        isReservedByOther
      }
        
        onPress={() =>
      handleToBeReserved(item)
        }
        style={styles.card}
      >
        <View style={{ padding: 10 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
              flexDirection: "row",
              marginBottom: 5,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Icon name={"sports-golf"} size={20} color={"#012970"} />

              <Text
                style={{
                  fontSize: 16,
                  fontFamily: FONT_FAMILY.bold,
                  color: "black",
                  marginLeft: 10,
                }}
              >
                {item.tee_time}
              </Text>
            </View>
            <View>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: FONT_FAMILY.normal,
                  color: "black",
                  textAlign: "right",
                }}
              >
                Tee:{item.hole_number}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: FONT_FAMILY.normal,
                  color: "black",
                }}
              >
                {normalizedData?.sessions?.find(
                  (s) => s.id == parseInt(item?.session_id)
                )?.session_name || "N/A"}
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: statusInfo.backgroundColor,
              alignItems: "center",
              padding: 5,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontFamily: FONT_FAMILY.bold,
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  }, [getStatusInfo, handleToBeReserved, userData?.user?.id, currentTime]);
  const emptyList = React.useCallback(
    () => (
      <FlatList
        data={[1, 1, 1, 1, 1, 1]}
        numColumns={2}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20, margin: 10 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={() => (
          <View style={[styles.card]}>
            <View style={{ flex: 1, alignItems: "center", margin: 10 }}>
              <ShimmerPlaceholder style={styles.imgStyle} />
              <ShimmerPlaceholder style={styles.imgStyle} />
           
            </View>
          </View>
        )}
      />
    ),
    []
  );
   return (
    <View style={{ flex: 1, backgroundColor: "#f0f0f0" }}>
      <Header toHome={false} title={"All slots"} >
         <Pressable
          style={{
            borderColor: "#f0f0f0",
            borderWidth: 0.5,
            borderRadius: 5,
            padding: 5,
          }}
          onPress={()=>{navigation.navigate('Buddies')}}
        >
          <Text style={{ fontFamily: FONT_FAMILY.normal, color: "white" }}>
            Manage Buddies
          </Text>
        </Pressable>
      </Header>

      <ScrollView
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={{ backgroundColor: "white" }}>
          <CalendarStrip
            dayOpenBooking={data?.settings?.day_open_booking || 3}
            selectedDate={tempStartDate}
            onSelectDate={setTempStartDate}
          />

          <View style={{ marginTop: 20 }}>
            {windowStatus === "open" && (
              <View>
                <Text
                  style={{ fontSize: 18, color: "green", textAlign: "center" }}
                >
                  Window Open ⏳ {formatTime(remainingTime)}
                </Text>
                <View style={{ flexDirection: "row", marginTop: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.normaltext}>Sessions</Text>
                    <Dropdown
                      style={[styles.dropdown]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      containerStyle={{
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                      itemTextStyle={styles.itemContainerStyle}
                      iconStyle={styles.iconStyle}
                      data={[
                        { id: 0, session_name: "All Sessions" }, // default item at the top
                        ...(normalizedData?.sessions
                          ? normalizedData?.sessions
                          : []),
                      ]}
                      maxHeight={300}
                      labelField="session_name"
                      valueField="id"
                      placeholder={"Select session"}
                      value={session?.id ?? 0}
                      onChange={(item) => {
                        setSession(item);
                      }}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.normaltext}>Hole Number</Text>
                    <Dropdown
                      style={[styles.dropdown]}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      containerStyle = {{
                        backgroundColor: "white",
                        borderRadius: 10,
                        marginTop: 10,
                      }}
                      itemTextStyle={styles.itemContainerStyle}
                      iconStyle={styles.iconStyle}
                       data=
                       {[
    { id: 0, hole_number: "All Holes" },
    ...(normalizedData?.holes || []),
  ]}
  
                      maxHeight={300}
                      labelField="hole_number"
                      valueField="id"
                      placeholder={"Select session"}
                      value={hole?.id ?? 0}
                      onChange={(item) => {
                        setHole(item);
                      }}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            marginTop: 10,
            alignItems: "center",
            
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexWrap: "wrap",
              // justifyContent: "space-between",
            }}
          >
            <Text style={styles.normaltext}>Show Active Only</Text>
            <Switch
              value={isSwitchEnabled}
              onValueChange={setIsSwitchEnabled}
              color={ '#012970' }
              style={{ marginLeft: 10 }}
            />
          </View>
        </View>
        <FlatList
          data={
          filteredSheets
          }
          renderItem={renderTeeSheets}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20, margin: 10 }}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          ListEmptyComponent={isLoading && emptyList}
        />
        {windowStatus == "closed" && !isLoading && (
          <View style={styles.noNotificationContainer}>
            <Image
              height={100}
              width={100}
              style={{ height: 100, width: 100 ,marginBottom:10,borderRadius:10}}
              source={require("../../../assets/images/53139.png")}
            />
            <Text style={{ fontFamily: FONT_FAMILY.normal, color: "red" }}>
             {data?.notes || 'Booking window is closed. Please check back later.'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default Tee;

const styles = StyleSheet.create({
  dropdown: {
    backgroundColor: "white",
    margin: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.3,
    flex: 1,
  },
  itemContainerStyle: { color: "grey", fontFamily: FONT_FAMILY.normal },
  container: {
    margin: 20,
    backgroundColor: "white",
    padding: 10,
    // marginTop: -40,
    flex: 1,
  },
  placeholderStyle: {
    color: "grey",
    fontFamily: FONT_FAMILY.normal,
  },
  selectedTextStyle: { color: "black", fontFamily: FONT_FAMILY.normal },
  text: {
    fontSize: 16,
    color: "black",
    fontFamily: FONT_FAMILY.bold,
    marginVertical: 10,
    textAlign: "center",
  },
  normaltext: {
    fontSize: 16,
    color: "black",
    fontFamily: FONT_FAMILY.normal,
    marginLeft: 10,
  },
  card: {
    flex: 0.49,
    backgroundColor: "white",
    marginTop: 10,
    borderRadius: 8,
    elevation: 1,
    opacity: 1,
  },
  imgStyle: {
    height: 20,
    margin: 10,
    width: "80%",
    borderRadius: 8,
  },
  noNotificationContainer: {
    alignItems: "center",
    // justifyContent: "center",
    // backgroundColor:'red',
    // height:'100%'
  },
});
