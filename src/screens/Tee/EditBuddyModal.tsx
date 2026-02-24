import {
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import RNModal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {  useSession } from "../../services/TeeService";
import { Dialog, Portal } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { FONT_FAMILY } from "../../util/colors";

const EditBuddyModal = ({ visible, onDismiss, buddy, token }) => {
  const sessionsData = useSession(token); // API data
  const [visibleDialog, setVisible] = React.useState(false);
  const navigation = useNavigation();

  const players = [
    { id: buddy?.player1_id, ...buddy?.player1 },
    { id: buddy?.player2_id, ...buddy?.player2 },
    { id: buddy?.player3_id, ...buddy?.player3 },
    { id: buddy?.player4_id, ...buddy?.player4 },
  ].filter(Boolean);
 
  return (
    <RNModal
      isVisible={visible}
      collapsable={true}
      swipeDirection={["down"]}
      coverScreen={false}
      onDismiss={onDismiss}
      style={{ margin: 0 }}
      onBackdropPress={onDismiss}
      avoidKeyboard={false}
      backdropColor="rgba(0, 0, 0, 0.5)"
    >
      <Pressable
        onPress={onDismiss}
        style={{
          backgroundColor: "white",
          alignSelf: "center",
          margin: 10,
          padding: 10,
          borderRadius: 20,
        }}
      >
        <Icon name="close" size={24} color="red" />
      </Pressable>

      <View style={styles.modalContent}>
        <Text style={[styles.name, { margin: 10, textAlign: "center" }]}>
          {buddy?.group_name}
        </Text>
        <Text style={[styles.name, { margin: 10, textAlign: "center" }]}>
          Session:{" "}
          {
            sessionsData?.data?.data?.find(
              (session) => session.id == buddy?.tee_session_id
            )?.session_name
          }
        </Text>
        <FlatList
          data={players || []}
          style={{ flexGrow: 0 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.name}>Player {index + 1}:</Text>
              <Text style={styles.name}>{item.DisplayName}</Text>
              <Text style={styles.name}>{item.MemberID}</Text>
            </View>
          )}
          keyExtractor={(item) => item?.id?.toString()}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            marginTop: 20,
          }}
        >
          <Pressable
            onPress={() => {
              setVisible(true);
              
            }}
            style={styles.button}
          >
            <Icon name="pencil" size={24} color="grey" />
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              Alert.alert(
                "Delete",
                "Are you sure you want to delete this buddy ?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "OK",
                    onPress: () => {},
                  },
                ]
              );
            }}
            style={styles.button}
          >
            <Icon name="trash-can" size={24} color="red" />
            <Text style={styles.buttonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <Portal>
        <Dialog visible={visibleDialog} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Select Sessions for Edit Group</Dialog.Title>
          <Dialog.Content>
            {Array.isArray(sessionsData?.data?.data) &&
            sessionsData?.data?.data.length > 0 ? (
              sessionsData?.data?.data.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    navigation.navigate("Addgroups", {
                      type: "Group",
                      data: item,
                      edit: { ...buddy, group: players },
                    });
                    setVisible(false);
                    onDismiss();
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
    </RNModal>
  );
};

export default EditBuddyModal;

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: "white",

    borderRadius: 10,
  },
  name: {
    fontFamily: FONT_FAMILY.bold,
    color: "black",
  },
  sessionText: {
    marginVertical: 10,
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
  input: {
    margin: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "lightgray",
    padding: 10,
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  itemContainerStyle: {
    color: "grey",
  },
  itemTextStyle: {
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  searchContainer: {
    margin: 10,
    marginHorizontal: 25,
  },
  placeholderStyle: { color: "grey" },
  card: {
    margin: 10,
    backgroundColor: "lightgray",
    padding: 10,
    borderRadius: 10,
  },
});
