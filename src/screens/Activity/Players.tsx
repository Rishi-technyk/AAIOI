import {
  Alert,
  FlatList,
  Image,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import _ from "lodash";
import React, { useEffect, useState } from "react";
import { usePlayers, usePlayersQuery } from "../../services/Activity/FacilityService";
import { useSelector } from "react-redux";
import { ENDPOINT,  } from "../../util/constant";
import { Toast } from "react-native-toast-notifications";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Icons from "react-native-vector-icons/AntDesign";
import {
  DARK_BLUE,
  LIGHT_BLUE,
  LIGHT_GREEN,
  LIGHT_RED,
  FONT_FAMILY,
  SECONDARY_COLOR,
} from "../../util/colors";
import Header from "../../components/Header";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { javascriptPost } from "../../util/api";
import UniversalModal from "../../components/UniversalModal";
import NewButton from "../../components/Button";
import { ActivityIndicator, Switch } from "react-native-paper";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import InvoiceStyles from "../../Styles/InvoiceStyle";

type Props=NativeStackScreenProps<AppStackParamList,'Players'>

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const Players:React.FC<Props> = ({navigation}) => {
  const userData = useSelector((state) => state.auth);
  const [players, setPlayers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchText);
  const [showModal, setShowModal] = useState(false);
  const [loading,setLoading]=useState(false)
  const [PlayerType, setPlayerType] = useState([
    { id: 1, title: "Favorite", is_active: false },
    { id: 2, title: "Non-member", is_active: false },
    { id: 3, title: "Member", is_active: false },
  ]);
  const { playersQuery } = usePlayersQuery(userData,PlayerType[0].is_active,PlayerType[1].is_active,PlayerType[2].is_active);
  
  const handleSearch = (text) => {
    setSearchText(text);
  };
  const [addNewPlayer, setAddNewPlayer] = useState({
    name: "",
    mobile: "",
    email: "",
    
  });
  const handlePlayerChange = (value, label) => {
    setAddNewPlayer((prev) => ({ ...prev, [label]: value }));
  };
  const handleAddNewGuest = async () => {
    if (!addNewPlayer.name.trim()) {
      Alert.alert("Name is required");
      return;
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(addNewPlayer.mobile)) {
      Alert.alert("Enter a valid 10-digit mobile number");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addNewPlayer.email)) {
      Alert.alert("Enter a valid email address");
      return;
    }
    
    const apiobject = {
      path: addNewPlayer.is_update
        ? ENDPOINT.update_activity_guest + addNewPlayer.id
        : ENDPOINT.create_activity_guest,
      body: {
        name: addNewPlayer.name,
        email: addNewPlayer.email,
        mobile: addNewPlayer.mobile,
        occupant_id: 2,
      },
      Token: userData?.token,
    };
    setLoading(true)
    const response = addNewPlayer.is_update
      ? await javascriptPost(apiobject)
      : await javascriptPost(apiobject);
      console.log( response, '---------------------- response ---------------------');
   setLoading(false)
    if (response.success) {
      setAddNewPlayer({
        name: "",
        email: "",
        mobile: "",
      });
      setShowModal(false);

      Toast.show(response.message, {
        type: "success",
      });
      playersQuery.refetch();
    }
    if (!response.success) {
      // Loop through the message object and show an alert for each error
      for (let field in response.message) {
        response.message[field].forEach((error) => {
          Alert.alert(` ${error}`);
        });
      }
    }
  };
  useEffect(() => {
    fetch;
    if (playersQuery.isSuccess) {
      if (playersQuery.data.status) {
        setPlayers(playersQuery.data.data);
      } else {
        Toast.show(playersQuery.data.message, {
          type: "danger",
        });
      }
    }
    if (playersQuery.isError) {
      Toast.hideAll();
      Toast.show(playersQuery.error.message, {
        type: "danger",
      });
    }
  }, [
    playersQuery.isSuccess,
    playersQuery.isError,
    playersQuery.error,
    playersQuery.data,
  ]);

  const { guestQuery } = usePlayers(1, debouncedSearch, null, userData);
  useEffect(() => {
    const handler = _.debounce(() => {
      setDebouncedSearch(searchText);
    }, 500);

    handler();

    return () => handler.cancel();
  }, [searchText]);
  const emptyList = () => (
    <FlatList
      data={[...Array(4).keys()]}
      renderItem={() => (
        <View
          style={[styles.mainView, { marginHorizontal: 10, borderRadius: 20 }]}
        >
          <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
              <ShimmerPlaceholder
                shimmerStyle={{ borderRadius: 10 }}
                style={{ margin: 5, height: 70, width: "auto" }}
              />
              <ShimmerPlaceholder
                shimmerStyle={{ borderRadius: 10 }}
                style={{ margin: 5, height: 70, width: "auto" }}
              />
            </View>
          </View>
        </View>
      )}
    />
  );
  const editPlayers = async (item, action) => {
    if (action === "Edit") {
      setAddNewPlayer({
        name: item.name,
        mobile: item.mobile || "",
        email: item.email || "",
        is_update: true,
        id: item.id,
      });
      setShowModal(true);
      return;
    }
    const apiRequestObject = {
      body: {
        type: action,
        id: item.id,
      },
      path: ENDPOINT.editPlayer,
      Token: userData?.token,
    };
    const response = await javascriptPost(apiRequestObject);
   if (response.status) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    playersQuery.refetch()
    
    }
  };
  const togglePlayerType = async (id) => {
    const updatedPlayerType = PlayerType.map((item) => {
      if (item.id === id) {
        return { ...item, is_active: !item.is_active };
      }
      return item;
    });
   setPlayerType(updatedPlayerType);
    // playersQuery.refetch()
  
  };
 const renderGuest = ({ item, index }) => {
   return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          margin: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.price}>
          {item.DisplayName.trim()}{" "}
          <Text style={styles.price2}>
            {" "}
            ({item.occupant_id == 2 ? "Non Memeber" : item.MemberID}){" "}
          </Text>
        </Text>
        <Text style={styles.price}>₹{item.charge || 0}</Text>
      </TouchableOpacity>
    );
  };
  const renderPlayers = ({ item, index }) => {
  return (
      <View
        style={{
          flex: 1,
          margin: 10,
          backgroundColor: index % 2 == 0 ? "white" : LIGHT_BLUE,
          padding: 5,
          borderRadius: 10,
          elevation: 0.4,
          justifyContent: "space-between",
          flexDirection: "row",
        }}
      >
        <View style={{}}>
          <Text
            style={{
              flex: 1,
              fontFamily: FONT_FAMILY.bold,
              color: "rgb(105, 125, 240)",
              fontSize: 15,
              // backgroundColor: "rgba(105, 125, 240, 0.1)",
              padding: 5,
              borderRadius: 5,
              alignSelf: "flex-start",
            }}
          >
            {item.name}{" "}
            <Text
              style={{
                fontFamily: FONT_FAMILY.normal,
                color: "black",
                // fontSize: 15,

                marginTop: 5,
              }}
            >
              {item.occupant_id == 1 ? item.player_memberId : "Non-member"}
            </Text>
          </Text>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <Icon
              name={"email"}
              size={20}
              color={"black"}
              style={{ alignSelf: "flex-end", marginRight: 5 }}
            />
            <Text
              style={{
                fontFamily: FONT_FAMILY.normal,
                color: "grey",
                fontSize: 15,
              }}
            >
              {item.email}
            </Text>
          </View>
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
          >
            <Icon name={"phone"} size={20} color={"black"} />
            <Text
              style={{
                fontFamily: FONT_FAMILY.normal,
                color: "grey",
                fontSize: 15,
              }}
            >
              {item.mobile || "N/A"}
            </Text>
          </View>
        </View>
        <View
          style={{
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity onPress={() => editPlayers(item, "Like")}>
            <Icons
              name={item.is_favorite == 1 ? "star" : "staro"}
              size={20}
              color={item.is_favorite == 1 ? "orange" : "grey"}
              style={{ alignSelf: "flex-end", marginTop: 5 }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: LIGHT_GREEN,
              padding: 5,
              borderRadius: 5,
            }}
            onPress={() => editPlayers(item, "Edit")}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY.normal,
                color: SECONDARY_COLOR,
                fontSize: 10,
              }}
            >
              Edit
            </Text>
            {/* <Icon name="delete-empty" size={20} color="red" /> */}
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: LIGHT_RED,
              padding: 5,
              borderRadius: 5,
            }}
            onPress={() => editPlayers(item, "Delete")}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY.normal,
                color: "red",
                fontSize: 10,
              }}
            >
              Remove
            </Text>
            {/* <Icon name="delete-empty" size={20} color="red" /> */}
          </TouchableOpacity>

          {/* <CancelButton text={'Remove'}/> */}
        </View>
      </View>
    );
  };
  return (
    <View style={{backgroundColor:'white',flex:1}}>
      <Header title={"My Players"}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            borderWidth: 0.8,
            borderColor: "white",
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            setAddNewPlayer({
              name: "",
              mobile: "",
              email: "",
            });
            setShowModal(true);
          }}
        >
          <Text style={{ fontFamily: FONT_FAMILY.normal, color: "white" }}>
            Add Player
          </Text>
        </TouchableOpacity>
      </Header>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: LIGHT_BLUE,
          borderRadius: 10,
          borderWidth: 0.5,
          margin: 10,
          borderColor: DARK_BLUE,
        }}
      >
        <Icon
          name="magnify"
          size={20}
          color={DARK_BLUE}
          style={{ left: 10 }}
        />
        <TextInput
          placeholder="Search"
          placeholderTextColor={'grey'}
          style={styles.input}
          maxLength={40}
          onChangeText={handleSearch}
          cursorColor={SECONDARY_COLOR}
        />
       {guestQuery.isLoading && <ActivityIndicator
        color={SECONDARY_COLOR}
        size={15}
        style={{marginRight:10}}

        />}
      </View>

      {searchText ? (
        <FlatList
          data={guestQuery?.data?.data?.data || []}
          renderItem={renderGuest}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          numColumns={1}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              No Player Found.
            </Text>
          }
        />
      ) : (
        <FlatList
          data={players || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderPlayers}
          
          ListEmptyComponent={
            playersQuery.isLoading ?
            emptyList: <View
                            style={{
                              flex:1,
                              alignItems: "center",
                              justifyContent: "center",
                              
                            }}
                          >
                            <Image
                              style={InvoiceStyles.alertImage}
                              source={require("../../../assets/images/norecord.png")}
                            />
                            <Text style={InvoiceStyles.noRecord}>
                              No players found.
                            </Text>
                          </View>}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20,flexGrow:1 }}
          numColumns={1}
          ListHeaderComponent={
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 10,
                paddingVertical: 5,
                justifyContent: "space-between",
              }}
            >
              {PlayerType.map((item, index) => (
                <View
                  key={index}
                  style={{
                    alignItems: "center",
                    marginRight: 10,
                  }}
                >
                  <Switch
                    key={index}
                    color={DARK_BLUE}
                    value={item.is_active}
                    onValueChange={() => togglePlayerType(item.id)}
                  />
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY.normal,
                      color: "black",
                      marginLeft: 5,
                    }}
                  >
                    {item.title}
                  </Text>
                </View>
              ))}
            </View>
          }
        />
      )}

      <UniversalModal
        isFull={true}
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={addNewPlayer.is_update ? "Edit Player" : "Add Player"}
        setVisible={setShowModal}
      >
        {/* Add Player Form */}
        <View style={{ padding: 30, flex: 1 }}>
          <TextInput
            value={addNewPlayer.name}
            placeholderTextColor="grey"
            style={styles.dropdown}
            onChangeText={(text) => handlePlayerChange(text, "name")}
            placeholder="Enter player name"
            cursorColor={SECONDARY_COLOR}
            maxLength={50}
          />
          <TextInput
            value={addNewPlayer.mobile}
            placeholderTextColor="grey"
            style={styles.dropdown}
            onChangeText={(text) => handlePlayerChange(text, "mobile")}
            placeholder="Enter player mobile"
            keyboardType="decimal-pad"
            cursorColor={SECONDARY_COLOR}
            maxLength={10}
          />
          <TextInput
            value={addNewPlayer.email}
            cursorColor={SECONDARY_COLOR}
            placeholderTextColor="grey"
            style={[styles.dropdown, { marginBottom: 30 }]}
            onChangeText={(text) => handlePlayerChange(text, "email")}
            placeholder="Enter player email"
            keyboardType="email-address"
            maxLength={100}
          />
          <NewButton
          loading={loading}
            onPress={handleAddNewGuest}
            text={addNewPlayer.is_update ? "Update" : "+ Add"}
          />
        </View>
      </UniversalModal>
    </View>
  );
};

export default Players;

const styles = StyleSheet.create({
  dropdown: {
    borderBottomWidth: 1,
    borderColor: DARK_BLUE,
    padding: 10,
    borderRadius: 10,
    marginVertical: 10,
    fontFamily: FONT_FAMILY.normal,
    color: "black",
  },
  mainView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  imgStyle: {
    width: 50,
    height: 100,
    borderRadius: 25,
  },
  input: {
    flex: 1,
    padding: 10,
    fontFamily: FONT_FAMILY.normal,
    color: "black",
  },
    price: {
      fontSize: 14,
      fontFamily: FONT_FAMILY.normal,
      color: DARK_BLUE,
    },
    price2: {
      fontSize: 14,
      fontFamily: FONT_FAMILY.normal,
      color: "grey",
    },
});
