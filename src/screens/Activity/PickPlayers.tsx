import {
  Alert,
  FlatList,
  LayoutAnimation,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { ENDPOINT,  } from "../../util/constant";
import { DARK_BLUE, LIGHT_BLUE, FONT_FAMILY,SECONDARY_COLOR } from "../../util/colors";
import { Card, Checkbox } from "react-native-paper";
import UniversalModal from "../../components/UniversalModal";
import _ from "lodash";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/Entypo";
import NewButton from "../../components/Button";
import { javascriptPost } from "../../util/api";

const PickPlayers :React.FC = ({
  facility,
  searchPlayer = false,
  setSearchPlayer,
  selectedGameType,
  guestQuery,
  selectedSlot,
  setSelectedSlot,
  setSlot,
  slots,
  search,
  setSearch,
  toastRef
}) => {
  const userData = useSelector((state) => state.auth.userData);

  const [selectedPlayers, setSelectedPlayers] = useState(null);
  const [newPlayer, setNewPlayer] = useState(false);
  const [addNewPlayer, setAddNewPlayer] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const handlePlayerSelect = (item) => {
  
    if (!selectedGameType) {
      Alert.alert("Please select a game type first.");
      return;
    }
    if (selectedGameType?.no_of_players == selectedPlayers?.length) {
      Alert.alert(
        `You can only select up to ${selectedGameType.no_of_players} players.`
      );
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (!selectedPlayers) {
      setSelectedPlayers([
        {
          DisplayName: item.DisplayName,
          MemberID: item.MemberID,
          charge: item.charge || 0,
          occupant_id: item.occupant_id ||'1',
          mobile: item.mobile,
          email: item.email,
        },
      ]);
    } else {
      setSelectedPlayers((prev) => [
        {
          DisplayName: item.DisplayName,
          MemberID: item.MemberID,
       
          charge: item.charge || 0,
          occupant_id: item.occupant_id ||'1',
          mobile: item.mobile,
          email: item.email,
        },
        ...prev,
      ]);
    }
  };

  const handleDeletePlayer = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlayers(selectedPlayers.filter((_, i) => i !== index));
  };
  const renderMembers = ({ item }) => {
  
  if(selectedPlayers?.some((player) => player.DisplayName === item.DisplayName && player.MemberID === item.MemberID)) {
    return null; // Skip rendering if the player is already selected
  }
   
  
    return (
      <TouchableOpacity
        onPress={() => {
          handlePlayerSelect(item);
        }}
        style={{
          margin: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text style={styles.price}>{item.DisplayName}  <Text style={styles.price2}> ({item.occupant_id == 2 ?'Non Memeber': item.MemberID})  </Text></Text>
        <Text style={styles.price}>₹{item.charge ||0}</Text>
      </TouchableOpacity>
    );
  };
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
      //  ToastAndroid.TOP("Enter a valid email address");
      Alert.alert("Enter a valid email address");

      return;
    }
    const apiobject = {
      path: ENDPOINT.create_activity_guest,
      body: {
        name: addNewPlayer.name,
        email: addNewPlayer.email,
        mobile: addNewPlayer.mobile,
        game_type: selectedGameType?.id,
        occupant_id: 2,
      },
      Token: userData?.data?.token,
    };
   const response=await javascriptPost(apiobject)
    if (response.success) {
    
      setAddNewPlayer({ 
        name: "", 
        email: "", 
        mobile: ""
      });
      setNewPlayer(false);
      Alert.alert(response.message);
      guestQuery.refetch();
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
 
  const handleProceedPlayers = () => {
    setSlot(
      slots.map((item) => {
        if (
          item.day.id === selectedSlot.day.id &&
          item.time.id === selectedSlot.time.id
        ) {    
          return {
            ...item,
            players: selectedPlayers,
            game_type_id: selectedGameType?.id,
       
          };
        }
        return item;
      })
    );
    setSelectedSlot(null);
    setSearchPlayer(false);
  };

  return (
    <UniversalModal
      visible={searchPlayer}
      title={"Pick Player(s)"}
      isFull={true}
      setVisible={() => setSearchPlayer(false)}
    >
      
      {selectedPlayers?.map((item, index) => (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            margin: 10,
            padding: 10,
            elevation: 2,
            borderRadius: 10,
            backgroundColor: "white",
          }}
        >
        <Text style={styles.price}>{item.DisplayName}  <Text style={styles.price2}> ({item.occupant_id == 2 ?'Non Memebr':item.MemberID })  </Text></Text>
          <Text style={styles.price}>₹{item?.charge || "0"}</Text>
          <Icon
            name={"trash"}
            size={17}
            color={"red"}
            onPress={() => handleDeletePlayer(index)}
          />
        </View>
      ))}
      <View
        style={[
          styles.rowCenter,
          { justifyContent: "space-between", marginHorizontal: 10 },
        ]}
      >
        <Text
          onPress={() => {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut
            );
            setNewPlayer((prev) => !prev);
          }}
          style={[
            styles.price,
            { fontFamily: FONT_FAMILY.bold, color: SECONDARY_COLOR,marginTop:20 },
          ]}
        >
          {newPlayer ? "Search Member" : "+ Add Player"}
        </Text>
        {selectedGameType?.no_of_players == selectedPlayers?.length &&
          selectedGameType && (
            <NewButton onPress={handleProceedPlayers} text={"Proceed"} />
          )}
      </View>
      {newPlayer ? (
        <View>
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
            style={styles.dropdown}
            onChangeText={(text) => handlePlayerChange(text, "email")}
            placeholder="Enter player email"
            keyboardType="email-address"
            maxLength={100}
          />
          <NewButton onPress={handleAddNewGuest} text={"+ Add"} />
        </View>
      ) : (
        <TextInput
          value={search}
          placeholderTextColor="grey"
          style={[styles.dropdown,]}
          onChangeText={(text) => setSearch(text)}
          cursorColor={SECONDARY_COLOR}
          placeholder="Enter member name / id"
        />
      )}
      <FlatList
        //   scrollEnabled={false}
        data={guestQuery?.data?.data?.data}
        renderItem={renderMembers}
      />
   
    </UniversalModal>
  );
};

export default PickPlayers;

const styles = StyleSheet.create({
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
  price3: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: "black",
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  dropdown: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    margin: 16,
    backgroundColor: "#fff",
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
});
