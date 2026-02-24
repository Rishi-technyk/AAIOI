import {
  FlatList,
  LayoutAnimation,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useCallback, useEffect,  useState } from "react";
import Header from "../../components/Header";
import { Pressable, RefreshControl, TextInput } from "react-native-gesture-handler";

import Icon from "react-native-vector-icons/Entypo";
import { useBuddies, userFavoriteGroups, userGroups } from "../../services/TeeService";
import Icons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import moment from "moment";
import { Toast } from "react-native-toast-notifications";
import NewButton from "../../components/Button";
import { javascriptPost } from "../../util/api";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import PlayerDetalModal from "./PlayerDetalModal";
import { FONT_FAMILY, PRIMARY_BUTTON_BLUE, SECONDARY_COLOR } from "../../util/colors";
import { ENDPOINT } from "../../util/constant";
import { useQueryClient } from "@tanstack/react-query";
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const TeeBuddies = ({ navigation, route }) => {
  const userData = useSelector((state) => state.auth);
  const [buddy, setBuddy] = useState("");
  const [refresh,setrefresh]=useState(false)
    const queryClient = useQueryClient();
  const [filters, setFilters] = useState([
    { id: 1, name: "All" },
    { id: 2, name: "Favorite 4s" },
    { id: 3, name: "Buddies" },
  ]);
  const [timer, setTimer] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState(1);
  const [selectedBuddy, setSelectedBuddy] = useState([
    {
      id: userData?.user?.id,
      DisplayName: userData?.user?.DisplayName,
      MemberID: userData?.user?.MemberID,
    },
  ]);
   const [debouncedBuddy, setDebouncedBuddy] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const Members = useBuddies(
    userData,
    route.params?.data?.session_id,
    debouncedBuddy
  );
  const Groups = userFavoriteGroups(
    userData?.token,
    route.params?.data?.session_id,
    debouncedBuddy
  )
   useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBuddy(buddy);
    }, 300);

    return () => clearTimeout(handler);
  }, [buddy]);
console.log( route.params, '---------------------- route.params ---------------------');
  useEffect(() => {
    const existing = route.params?.data;
    setTimer(route.params.timer ||300)
    if (existing?.bookingId) {
      setSelectedBuddy([{ id: existing?.player1_id, DisplayName: existing?.player1_name ,MemberID:existing?.player1_member_id},
      { id: existing?.player2_id, DisplayName: existing?.player2_name, MemberID:existing?.player2_member_id},
      { id: existing?.player3_id, DisplayName: existing?.player3_name, MemberID:existing?.player3_member_id},
      { id: existing?.player4_id, DisplayName: existing?.player4_name, MemberID:existing?.player4_member_id},])
   }
  }, []);
useEffect(() => {
  const interval = setInterval(() => {
    setTimer((prev) => {
      if (prev === 1) {
        clearInterval(interval);
         queryClient.invalidateQueries({queryKey:['booking']})
        navigation?.goBack();
      }
      return prev > 0 ? prev - 1 : 0;
    });
  }, 1000);

  return () => clearInterval(interval);
}, []);

  const selectBuddy = (index, item) => {
    Toast.hideAll();

    if (!item?.id) return;
    if (selectedBuddy.some((b) => b?.id == item.id)) {
      Toast.show("Buddy already selected", {
        type: "warning",
        duration: 2000,
      });
      return;
    }

    if (selectedBuddy.length + 1 == 5) {
      Toast.show("You can only select 4 buddies", {
        type: "warning",
        duration: 2000,
      });
      return;
    }
    setSelectedBuddy((prev) => [...prev, item]);
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    });
  };
  const removeBuddy = (index) => {
    Toast.hideAll();
    if (!selectedBuddy[index]) {
      Toast.show("Buddy not selected", {
        type: "warning",
        duration: 2000,
      });
      return;
    }
    LayoutAnimation.configureNext({
      duration: 300,
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleXY,
      },
    });
    setSelectedBuddy((prev) => prev.filter((_, i) => i !== index));
  };
  // console.log('\x1b[36m%s\x1b[0m', selectedBuddy, '---------------------- selectedBuddy ---------------------');
  const renderBuddies = useCallback(
    ({ item, index }) => {
      if (selectedBuddy.some((b) => b?.id == item?.id)) return null;
      return (
        <Pressable
          style={{
            flex: 1,
            marginHorizontal: 10,
            borderRadius:9,
            // borderRadius: 10,
            marginVertical:5,
            padding: 10,
            flexDirection: "row",
            backgroundColor:'white',
            justifyContent: "space-between",
          }}
          onPress={() => selectBuddy(index, item)}
        >
          <View style={{}}>
            <Text style={{ fontFamily: FONT_FAMILY.semiBold, color: "black" }}>
              {item?.DisplayName}
            </Text>
            <Text style={{ fontFamily: FONT_FAMILY.semiBold, color: "black" }}>
              {item?.MemberID}
            </Text>
          </View>
          <Icons name="add" size={20} color="black" />
        </Pressable>
      );
    },
    [selectedBuddy]
  );
  const handleRefresh=()=>{
    Groups.refetch().finally(setrefresh(false))
  }
  const reserveSlot = async () => {
    if (selectedBuddy.length < 3) {
      Toast.show("Please select at least 3 buddies", {
        type: "warning",
        duration: 2000,
      });
      return;
    }
    const body = {
      tee_session_id: route.params?.data?.session_id,
      tee_booking_id: parseInt(route.params?.data?.tee_booking_id),
      tee_sheet_id: route.params?.data?.bookingId? route.params?.data?.tee_sheet_id:route.params?.data?.id,
      player1_id: selectedBuddy[0]?.id,
      player2_id: selectedBuddy[1]?.id,
      player3_id: selectedBuddy[2]?.id,
      player4_id: selectedBuddy[3]?.id,
    };
    if(route.params?.data?.bookingId){
      body.tee_booking_detail_id=route.params?.data?.id
    }
    const apiObj = {
      Token: userData?.token,
      body: body,
      path: ENDPOINT.reserve_tee,
    };
    try {
      setLoading(true);
      const response = await javascriptPost(apiObj);
        setLoading(false);
      if (response.status) {
        Toast.show(response.message || "Tee time reserved successfully", {
          type: "success",
          duration: 2000,
        });
        navigation.goBack();
        
      } else {
        Toast.show(response.message || "Error reserving tee time", {
          type: "error",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error reserving tee time:", error);
    }finally{
      queryClient.invalidateQueries({queryKey:['booking']})
    }
  };
  const renderFevBuddies = useCallback(({ item, index }) => {
    if (selectedBuddy.some((b) => b?.id == item?.id)) return null;
    return (
      <Pressable
        style={styles.buddycontainer}
        onPress={() => setSelectedBuddy(item.players)}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 5,
          }}
        >
          <Text style={{ fontFamily: FONT_FAMILY.bold, color: "#012970" }}>
            {item.group_name}
          </Text>
          <Icons name="add" size={20} color="#012970" />
        </View>
        <View>
          {item.players
            .reduce((rows, player, index) => {
              if (index % 2 === 0) {
                rows.push([player]); // start a new row
              } else {
                rows[rows.length - 1].push(player); // push into last row
              }
              return rows;
            }, [])
            .map((row, rowIndex) => (
              <View
                key={rowIndex}
                style={{ flexDirection: "row", paddingBottom: 5 }}
              >
                {row.map((player, colIndex) => (
                  <View key={colIndex} style={{ flex: 1, paddingRight: 8 }}>
                    <Text
                      style={{
                        fontFamily: FONT_FAMILY.semiBold,
                        color: "black",
                      }}
                    >
                      {rowIndex * 2 + colIndex + 1}. {player?.DisplayName}
                    </Text>
                    <Text
                      style={{ fontFamily: FONT_FAMILY.normal, color: "black" }}
                    >
                      MemberID: {player?.MemberID}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
        </View>
      </Pressable>
    );
  }, []);
  return (
    <View style={{ flex: 1 }}>
      <Header title={"Book a slot"}>
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

      <Text
        style={{
          textAlign: "center",
          marginVertical: 10,
          color: "red",
          fontFamily: FONT_FAMILY.bold,
        }}
      >
        Time Remaining: {timer} seconds
      </Text>
      <View
        style={{
          backgroundColor: "#f0f0f0",
          margin: 6,
          padding: 5,
          borderRadius: 5,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: FONT_FAMILY.bold, color: "#012970" }}>
            Tee Details
          </Text>
          <Text style={styles.buddy}>
            Session: {route?.params.session?.session_name || "N/A"}
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={[styles.buddy, { fontFamily: FONT_FAMILY.normal }]}>
            Date: {moment(route?.params.date).format("ddd MMM DD, YYYY")}
          </Text>

          <Text style={[styles.buddy, { fontFamily: FONT_FAMILY.normal }]}>
            Tee Time: {route?.params.data?.tee_time}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Text
            style={[
              styles.buddy,
              { fontFamily: FONT_FAMILY.bold, color: "#012970" },
            ]}
          >
            Players
          </Text>

          <Text style={[styles.buddy, { fontFamily: FONT_FAMILY.normal }]}>
            Tee Hole: {route?.params.data?.hole_number}
          </Text>
        </View>
        <View style={{ padding: 5, flexDirection: "row", flexWrap: "wrap" }}>
          {selectedBuddy.map((isSelected, index) => (
            <View style={styles.player}>
              {index > 0 && (
                <Pressable
                  style={{ position: "absolute", top: -5, right: -5 }}
                  onPress={() => removeBuddy(index)}
                >
                  {<Icon name="circle-with-minus" size={20} color="red" />}
                </Pressable>
              )}
              <Text style={{ color: "black" }}>
                {isSelected?.DisplayName || ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        stickyHeaderIndices={[0]}
        refreshControl={<RefreshControl refreshing={refresh} onRefresh={handleRefresh}/>}
      >
        <View style={{ marginHorizontal: 10,padding:10,borderRadius:6, backgroundColor: "white" }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            {filters.map((item) => (
              <Pressable
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedFilter === item.id ? PRIMARY_BUTTON_BLUE : "lightgrey",
                  },
                ]}
                onPress={() => setSelectedFilter(item.id)}
                key={item.id}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: selectedFilter === item.id ? "white" : "black" },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            ))}
          </View>
         {selectedFilter == 1 && <TextInput
            value={buddy}
            onChangeText={(text) => setBuddy(text)}
            cursorColor={SECONDARY_COLOR}
            style={styles.textInput}
            placeholderTextColor={"grey"}
            placeholder="Search Buddies"
            maxLength={25}
          />}
        </View>

        {selectedFilter == 1 && (
          <FlatList data={Members.data} ListEmptyComponent={Members.isLoading?emptyList:<Text style={{textAlign:'center',color:'grey'}}>No Player Found</Text>} renderItem={renderBuddies} />
        )}
        {selectedFilter == 2 && (
          <FlatList data={Groups.data?.groups} ListEmptyComponent={Groups.isLoading?emptyList:<Text style={{textAlign:'center',color:'grey'}}>No Group Found</Text>} renderItem={renderFevBuddies} />
        )}
        {selectedFilter == 3 && (
          <FlatList data={Groups?.data?.buddies} ListEmptyComponent={Groups.isLoading?emptyList:<Text style={{textAlign:'center',color:'grey'}}>No Buddy Found</Text>} renderItem={renderBuddies} />
        )}
      </ScrollView>
      {selectedBuddy.length > 0 && (
        <View style={{ paddingHorizontal: 10, marginBottom: 20 }}>
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setVisible(true)}
            >
              <Text style={[styles.buddy, { fontFamily: FONT_FAMILY.bold }]}>
                {selectedBuddy.length} Players
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={[
                    styles.buddy,
                    {
                      fontFamily: FONT_FAMILY.normal,
                      textDecorationLine: "underline",
                    },
                  ]}
                >
                  Selected
                </Text>
                <Icon
                  name="chevron-up"
                  size={20}
                  color="black"
                  style={{ marginLeft: 10 }}
                />
              </View>
            </TouchableOpacity>
            {selectedBuddy.length >= 3 && (
              <NewButton loading={loading} text={route.params.data.bookingId ?'Edit Player': "Reserve"} onPress={() => reserveSlot()} />
            )}
          </View>
        </View>
      )}
      {visible && (
        <PlayerDetalModal
          visible={visible}
          onDismiss={() => setVisible(false)}
          buddy={selectedBuddy}
          sessionName={route?.params.session?.session_name || "N/A"}
        />
      )}
    </View>
  );
};

const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1,1,1,1, ]}
    renderItem={() => (
      <View style={{
            flex: 1,
            marginHorizontal: 10,
            // borderRadius: 10,
            padding: 10,
            flexDirection: "row",
            justifyContent: "space-between",
          }}>
        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ShimmerPlaceholder style={styles.imgStyle} />
            <ShimmerPlaceholder style={styles.imgStyle2} />
          </View>

        </View>
      </View>
    )}
  />
);
export default TeeBuddies;

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 0.3,
    padding: 10,
    paddingLeft: 10,
    color: "black",
  },
  buddy: {
    color: "black",
    fontFamily: FONT_FAMILY.bold,
  },
  filterText: {
    color: "white",
    fontFamily: FONT_FAMILY.bold,
  },
  filterButton: {
    flex: 1,
    backgroundColor: SECONDARY_COLOR,
    borderRadius: 8,
    padding: 5,
    margin: 5,
    alignItems: "center",
  },
  player: {
    flexDirection: "row",
    width: "46%",
    borderStyle: "dashed",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
    borderRadius: 5,
    margin: 3,
  },
   imgStyle: {
    margin: 8,
    borderRadius: 5,
  },
  imgStyle2: {
    height: 25,
    width: 25,
    borderRadius: 5,
    marginVertical: 5,
  },
  buddycontainer:{
          flex: 1,
          margin: 10,
          borderRadius: 5,
          backgroundColor: "white",
          padding: 10,
        }
});
