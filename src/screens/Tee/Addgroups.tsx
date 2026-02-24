import {
  FlatList,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator
} from "react-native";
import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import {
  FONT_FAMILY,
  LIGHT_GREY,
  PRIMARY_COLOR,
  SECONDARY_COLOR,
} from "../../util/colors";
import { ENDPOINT } from "../../util/constant";
import { useSelector } from "react-redux";
import { useBuddies, userGroups } from "../../services/TeeService";
import Icon from "react-native-vector-icons/Ionicons";
import { Toast } from "react-native-toast-notifications";
import { javascriptPost } from "../../util/api";
const Addgroups = ({ navigation, route }) => {
  const userData = useSelector((state) => state.auth);
  const { type = "Buddy", data ,edit} = route.params;
  const [buddy, setBuddy] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupError, setGroupError] = useState(false);
  const [group, setGroup] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debouncedBuddy, setDebouncedBuddy] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedBuddy(buddy);
    }, 300);

    return () => clearTimeout(handler);
  }, [buddy]);
  useEffect(() => {
    if (edit?.group && type == "Group") {
      setGroup(edit.group);
      setGroupName(edit.group_name);
    }else if( type=="Group"){
       
      setGroup([
        {
          id: userData?.user.id,
          DisplayName: userData?.user.DisplayName,
          MemberID: userData?.user.MemberID,
        },
      ]);
    }
  }, [edit]);

  const addBuddy = async () => {
    const apiObj = {
      path: edit?.id ? ENDPOINT.tee_edit_buddy+edit.id : ENDPOINT.tee_add_buddy,
      Token: userData.token,
      body: {
       buddy_member_id: group[0].id,
       tee_session_id: data.id,
      },
    };

    if (group.length !== 1) {
      Toast.show("You can add only 1 buddy at a time.");
      return;
    }
    try {
      setLoading(true);
      const response = await javascriptPost(apiObj);
         setLoading(false);
      if (response.status) {
        Toast.show(response.message||"Buddy added successfully", { type: "success" });
        Groups.refetch()
        navigation.goBack();
      }
      else{
        Toast.show(response.message||"Failed to add buddy", { type: "danger" });
      }
    } catch (error) {}
  };
  const addGroup = async () => {
    const apiObj = {
      path: edit?.id ? ENDPOINT.tee_edit_group + edit.id : ENDPOINT.tee_add_group,
      Token: userData.token,
      body: {
        group_name: groupName,
        player1_id: group[0].id,
        player2_id: group[1].id,
        player3_id: group[2].id,
        player4_id: group[3].id,
        tee_session_id: data.id,
        category_type_code: userData?.user?.CategoryTypeCode,
      },
    };
    if (!groupName) {
      setGroupError(true);
      return;
    }
    if (!group.length >= 3) {
      Toast.show("You can add only 1 buddy at a time.");
      return;
    }
    try { 
      setLoading(true);
      const response = await javascriptPost(apiObj);
    setLoading(false);
    console.log('\x1b[32m%s\x1b[0m', response,apiObj, '---------------------- response ---------------------');
    if (response.status) {
        Toast.show(response.message||"Group added successfully", { type: "success" });
        Groups.refetch();
        navigation.goBack();
      }else{
        Toast.show(response.message||"Failed to add group", { type: "danger" });
      }
    } catch (error) {}
  };
  
  // Fetch buddies using React Query
  const Members = useBuddies(userData, data.id, debouncedBuddy);
  const Groups=userGroups(userData.token)

  const addNewBuddy = (item) => {
    if (type === "Group" && group.length == 4) {
      Toast.hideAll();
      Toast.show("You can add Maximum 4 Players in a group", {
        type: "warning",
      });
      return;
    }

    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
      delete: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.linear,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    if (type === "Buddy") {
      setGroup([item]);
    } else {
      setGroup((prev) => [...prev, item]);
    }
  };
  const renderBuddies = ({ item, index }) => {
    if(group.some(i=>i.id===item.id)) return null;
    return (
      <Pressable
        style={{
          flex: 1,
          marginHorizontal: 10,
          // borderRadius: 10,
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
        onPress={() => addNewBuddy(item)}
      >
        <View style={{}}>
          <Text style={{ fontFamily: FONT_FAMILY.semiBold, color: "black" }}>
            {item?.DisplayName}
          </Text>
          <Text style={{ fontFamily: FONT_FAMILY.semiBold, color: "black" }}>
            {item?.MemberID}
          </Text>
        </View>
        <Icon name="add" size={20} color="black" />
      </Pressable>
    );
  };

  return (
    <View>
      <Header title={`${edit?.id ? 'Edit' : 'Add New'} ${type}`} />
      <Text
        style={{ fontFamily: FONT_FAMILY.semiBold, color: "black", margin: 10 }}
      >
        Select New {type} for {data.session_name}
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        {group.map((item, index) => (
          <Pressable
            onPress={() => {
              if(!index && type ==='Group'){
                Toast.hideAll()
                Toast.show("You can't remove yourself from the group", { type: "warning" });
                return;
              }
              setGroup(group.filter((buddy, i) => i !== index))}}
            key={index}
            style={{
              padding: 10,
              borderRadius: 8,
              backgroundColor: LIGHT_GREY,
              margin: 5, // optional spacing between items
            }}
          >
            <Text
              style={{
                fontFamily: FONT_FAMILY.semiBold,
                color: "white",
              }}
            >
              {item.DisplayName ? item.DisplayName : item.MemberID}
              <Text style={{ color: "red" }}>{"   "}X</Text>
            </Text>
          </Pressable>
        ))}
      </View>
      {group.length >= 3 && type === "Group" ? (
        <View>
        <TextInput
        value={groupName}
        onChangeText={(text) =>{ setGroupName(text) , setGroupError(false)}}
        cursorColor={SECONDARY_COLOR}
        style={[styles.textInput,{borderWidth:1,borderColor:groupError? 'red': 'grey'}]}
        placeholderTextColor={"grey"}
        placeholder="Group Name"
        maxLength={50}
      />
        <Pressable
          onPress={addGroup}
          style={{ alignSelf: "flex-end", margin: 10,flexDirection:'row' }}
        >
          {loading &&<ActivityIndicator loading={loading}  color={SECONDARY_COLOR} />}
          <Text style={{ fontFamily: FONT_FAMILY.bold, color: PRIMARY_COLOR }}>
          {' '}{edit?.id ? 'Edit' : 'Create'} Group
          </Text>
        </Pressable>
        </View>
      ) : type === "Buddy" && group.length ? (
        <Pressable
          onPress={addBuddy}
          style={{ alignSelf: "flex-end", margin: 10 ,flexDirection:'row'}}
        >
           {loading &&<ActivityIndicator loading={loading}  color={SECONDARY_COLOR} />}
          <Text style={{ fontFamily: FONT_FAMILY.bold, color: PRIMARY_COLOR }}>
            {' '}{edit?.id? 'Edit' : 'Add'} Buddy
          </Text>
        </Pressable>
      ) : null}
      <TextInput
        value={buddy}
        onChangeText={(text) => setBuddy(text)}
        cursorColor={SECONDARY_COLOR}
        style={styles.textInput}
        placeholderTextColor={"grey"}
        placeholder="Search Buddies"
        maxLength={25}
      />
      <FlatList data={Members.data} renderItem={renderBuddies} />
    
    </View>
  );
};

export default Addgroups;

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 0.3,
    margin: 10,
    padding: 15,

    color: "black",
  },
  buddy: {
    color: "black",
    fontFamily: FONT_FAMILY.bold,
  },
});
