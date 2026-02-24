import React from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Header from "../../components/Header";
import { FONT_FAMILY, DARK_BLUE,  } from "../../util/colors";
import { ENDPOINT } from "../../util/constant";
import { AnimatedFAB, Portal, Dialog, } from "react-native-paper";
import { userGroups, useSession } from "../../services/TeeService";
import { useSelector } from "react-redux";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { javascriptGet } from "../../util/api";
import { Toast } from "react-native-toast-notifications";
import EditBuddyModal from "./EditBuddyModal";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const MyBuddies = ({
  navigation,
  data,
  buddies,
  token,
  refetch,
  isLoading,
}) => {
 
  const [visible, setVisible] = React.useState(false);

  const [isExtended, setIsExtended] = React.useState(false);
  const [editBuddy, setEditBuddy] = React.useState(null);
 
  const deleteBuddy = async (id) => {
    try {
      const response = await javascriptGet({
        path: ENDPOINT.tee_delete_buddy + id,
        Token: token,
        body: {},
      });

      if (response.status) {
        // Handle successful deletion
        Toast.show(response.message || "Deleted successfully", {
          type: "success",
        });

        refetch();
      } else {
        // Handle deletion error
        Toast.show(response.message || "Failed to delete", { type: "danger" });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.tabContainer}>
      {/* <ScrollView onScroll={onScroll}> */}

        <FlatList
          data={buddies?.buddies || []}
          style={{ flex: 1 }}
          ListEmptyComponent={
            isLoading === false  ? (
              <View style={styles.noNotificationContainer}>
                <Image
                  source={require("../../../assets/images/user-avatar.png")}
                  style={styles.noNotificationImage}
                />
                <Text style={styles.noNotificationText}>No buddies found.</Text>
              </View>
            ) : (
              emptyList
            )
          }
          renderItem={({ item }) => (
            <View
              style={styles.buddyContainer}
              onPress={() => setModalData({ buddy: item })}
            >
              <View style={styles.buddyInfoContainer}>
                <Text
                  style={[styles.buddyText, { fontFamily: FONT_FAMILY.bold }]}
                >
                  {item?.member.DisplayName}
                </Text>
                {data?.data && (
                  <Text
                    style={[
                      {
                        fontFamily: FONT_FAMILY.bold,
                        color: "grey",
                        marginRight: 10,
                      },
                    ]}
                  >
                    {data.data.find((group) => group.id == item.tee_session_id)
                      ?.session_name || "N/A"}
                  </Text>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.buddyText}>
                  Member ID: {item?.member?.MemberID}
                </Text>
                <Pressable
                  onPress={() => {
                    setVisible(true), setEditBuddy(item);
                  }}
                >
                  <Icon name="pencil" size={24} color="black" />
                </Pressable>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={styles.buddyText}>
                  Email: {item?.member?.Email || "N/A"}
                </Text>
                <Pressable
                  onPress={() => {
                    Alert.alert(
                      "Delete",
                      `Are you sure you want to delete ${item?.member?.DisplayName} ?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        {
                          text: "OK",
                          onPress: () => {
                            deleteBuddy(item.id);
                          },
                        },
                      ]
                    );
                  }}
                >
                  <Icon name="trash-can" size={24} color="red" />
                </Pressable>
              </View>
            </View>
          )}
          keyExtractor={(item) => item.id}
        />
      {/* </ScrollView> */}
      <Portal>
        <Dialog
        style={{
    borderRadius: 16,
    backgroundColor: "#fff",
  }}
        theme={{
      colors: {
        primary: DARK_BLUE,      // title / buttons
        surface: "#ffffff",          // dialog bg
        backdrop: "rgba(0,0,0,0.5)", // overlay bg
        onSurface: "#222",           // text color
      },
    }}
         visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title style={{color:'black'}}>
            Select Sessions for{" "}
            {editBuddy?.id ? editBuddy?.member?.DisplayName : "Buddy"}
          </Dialog.Title>
          <Dialog.Content>
            {Array.isArray(data?.data) && data?.data.length > 0 ? (
              data?.data.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    navigation.navigate("Addgroups", {
                      type: "Buddy",
                      data: item,
                      edit: editBuddy,
                    });
                    setVisible(false);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "#ddd" : "transparent", // visual feedback
                    },
                  ]}
                >
                  <Text style={styles.sessionText}>{item.session_name}</Text>
                </Pressable>
              ))
            ) : (
              <Text>No sessions available</Text>
            )}
          </Dialog.Content>
        </Dialog>
      </Portal>

      <AnimatedFAB
        icon={"plus"}
        label={"New Buddy"}
        extended={isExtended}
        onPress={() => setVisible(true)}
        visible={true}
        animateFrom={"right"}
        
        iconMode={"static"}
        style={styles.fabStyle}
      />
    </View>
  );
};

const Favorite4 = ({ navigation, data, groups, token, refetch, isLoading }) => {
  const [visible, setVisible] = React.useState(false);
  const [isExtended, setIsExtended] = React.useState(false);
  const [modalData, setModalData] = React.useState(null);

  return (
    <View style={styles.tabContainer}>
      {/* <ScrollView onScroll={onScroll}> */}
        <FlatList
          data={groups || []}
          style={{ flex: 1 }}
          contentContainerStyle={{}}
          ListEmptyComponent={
            isLoading === false ? (
              <View style={styles.noNotificationContainer}>
              <Image
                  source={require("../../../assets/images/user-avatar.png")}
                  style={styles.noNotificationImage}
                />
                <Text style={styles.noNotificationText}>No Groups found.</Text>
              </View>
            ) : (
              emptyList
            )
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.buddyContainer}
              onPress={() => setModalData({ buddy: item })}
            >
              <View style={styles.buddyInfoContainer}>
                <Text
                  style={[styles.buddyText, { fontFamily: FONT_FAMILY.bold }]}
                >
                  {item?.group_name}
                </Text>
                {data?.data && (
                  <Text
                    style={[
                      {
                        color: "grey",
                        marginRight: 10,
                        fontFamily: FONT_FAMILY.semiBold,
                      },
                    ]}
                  >
                    {data.data.find((group) => group.id == item.tee_session_id)
                      .session_name || "N/A"}
                  </Text>
                )}
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text numberOfLines={1} style={styles.buddyText}>
                  1. {item?.player1?.DisplayName}
                </Text>
                <Text numberOfLines={1} style={[styles.buddyText]}>
                  2. {item?.player2?.DisplayName}
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <Text numberOfLines={1} style={styles.buddyText}>
                  3. {item?.player3?.DisplayName}
                </Text>
                {item.player4 && (
                  <Text numberOfLines={1} style={styles.buddyText}>
                    4. {item?.player4?.DisplayName}
                  </Text>
                )}
              </View>
            </Pressable>
          )}
          keyExtractor={(item) => item.id}
        />
      {/* </ScrollView> */}
      <EditBuddyModal
        visible={modalData}
        onDismiss={() => setModalData(null)}
        buddy={modalData?.buddy}
        token={token}
      />
      <Portal>
        <Dialog 
              style={{
    borderRadius: 16,
    backgroundColor: "#fff",
  }}
        theme={{
      colors: {
        primary: DARK_BLUE,      // title / buttons
        surface: "#ffffff",          // dialog bg
        backdrop: "rgba(0,0,0,0.5)", // overlay bg
        onSurface: "#222",           // text color
      },}}
        visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title style={{color:'black'}}>Select Sessions for Group</Dialog.Title>
          <Dialog.Content>
            {Array.isArray(data?.data) && data?.data.length > 0 ? (
              data?.data?.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    navigation.navigate("Addgroups", {
                      type: "Group",
                      data: item,
                    });
                    setVisible(false);
                  }}
                  style={({ pressed }) => [
                    {
                      backgroundColor: pressed ? "transparent" : "transparent", // visual feedback
                    },
                  ]}
                >
                  <Text style={styles.sessionText}>{item.session_name}</Text>
                </Pressable>
              ))
            ) : (
              <Text>No sessions available</Text>
            )}
          </Dialog.Content>
        </Dialog>
      </Portal>

      <AnimatedFAB
        icon={"plus"}
        label={"New Group"}
        extended={isExtended}
        onPress={() => setVisible(true)}
        visible={true}
        animateFrom={"right"}
        iconMode={"static"}
        
        style={styles.fabStyle}
      />
    </View>
  );
};

const BuddiesTabs = ({navigation}) => {
  const userData = useSelector((state) => state.auth);

  const sessionsData = useSession(userData.token);
  const { data, refetch } = userGroups(userData?.token );
  const [activeTab, setActiveTab] = React.useState<"buddies" | "group">("buddies");

  return (
    <View style={{ flex: 1 }}>
      <Header title="Manage Buddies and Favorite 4" />

      {/* 🔥 Custom Tabs */}
      <View style={styles.tabRow}>
        <Pressable
          onPress={() => setActiveTab("buddies")}
          style={[
            styles.tabBtn,
            activeTab === "buddies" && styles.activeTabBtn,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "buddies" && styles.activeTabText,
            ]}
          >
            Buddies
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("group")}
          style={[
            styles.tabBtn,
            activeTab === "group" && styles.activeTabBtn,
          ]}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "group" && styles.activeTabText,
            ]}
          >
            Favorite 4
          </Text>
        </Pressable>
      </View>

      {/* 🔥 Render Screen */}
      <View style={{ flex: 1 }}>
        {activeTab === "buddies" ? (
          <MyBuddies
          navigation={navigation}
            data={sessionsData?.data}
            buddies={data}
            token={userData?.token}
            refetch={refetch}
            isLoading={sessionsData.isLoading}
          />
        ) : (
          <Favorite4
             navigation={navigation}
            data={sessionsData?.data}
            groups={data?.groups}
            token={userData?.token}
            refetch={refetch}
            isLoading={sessionsData.isLoading}
          />
        )}
      </View>
    </View>
  );
};


// const BuddiesTabs = () => {
//   const userData = useSelector((state) => state.auth);
//   const sessionsData = useSession(userData.token); // API data
//   const { data, refetch } = userGroups(userData.token);

//   return (
//     <View style={{ flex: 1 }}>
//       <Header title={"Manage Buddies and Favorite 4"} />
//       <Tab.Navigator
//         screenOptions={{
//           tabBarActiveTintColor: DARK_BLUE,
//           tabBarInactiveTintColor: "grey",
//           tabBarStyle: { backgroundColor: "white" },
//           tabBarIndicatorStyle: { backgroundColor: DARK_BLUE },
//           tabBarLabelStyle: { fontFamily: FONT_FAMILY.bold },
//         }}
//       >
//         <Tab.Screen name="Buddies">
//           {(props) => (
//             <MyBuddies
//               {...props}
//               data={sessionsData?.data}
//               buddies={data}
//               token={userData?.token}
//               refetch={refetch}
//               isLoading={sessionsData.isLoading}
//             />
//           )}
//         </Tab.Screen>
       
//            <Tab.Screen name="Favorite 4">
//           {(props) => (
//             <Favorite4
//               {...props}
//               data={sessionsData?.data}
//               groups={data?.groups}
//               token={userData?.token}
//               refetch={refetch}
//               isLoading={sessionsData.isLoading}
//             />
//           )}
//         </Tab.Screen>
       
        
//       </Tab.Navigator>
//     </View>
//   );
// };

export default BuddiesTabs;

const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1, 1, 1]}
    renderItem={() => (
      <View style={[styles.buddyContainer]}>
        <View style={{ flex: 1 }}>
          <ShimmerPlaceholder style={styles.imgStyle} />
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
const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
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
  fabStyle: {
    bottom: 25,
    right: 20,
    // backgroundColor: DARK_BLUE,
  
    position: "absolute",
  },
  sessionText: {
    margin: 10,
  },
  buddyText: {
    flex: 1,
    fontFamily: FONT_FAMILY.semiBold,
    color: "black",
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  buddyContainer: {
    marginTop: 20,
    backgroundColor: "white",
    marginHorizontal: 10,
    padding: 5,
    borderRadius: 8,
  },
  buddyInfoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 5,
    backgroundColor: "lightgray",
  },
  buttonText: {
    fontFamily: FONT_FAMILY.bold,
    color: "black",
    marginLeft: 5,
  },
  noNotificationImage: {
    height: 100,
    width: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginVertical: 20,
  },
  noNotificationContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  noNotificationText: {
    fontFamily: FONT_FAMILY.bold,
    color: "black",
    marginVertical: 10,
  },
  tabRow: {
  flexDirection: "row",
  backgroundColor: "#dcdcdc",
  margin: 12,
  borderRadius: 10,
  padding: 4,
},

tabBtn: {
  flex: 1,
  paddingVertical: 10,
  alignItems: "center",
  borderRadius: 8,
},

activeTabBtn: {
  backgroundColor: DARK_BLUE,
},

tabText: {
  fontFamily: FONT_FAMILY.bold,
  color: "grey",
},

activeTabText: {
  color: "white",
},

});
