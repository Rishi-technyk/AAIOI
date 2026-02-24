import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Keyboard,
  FlatList,
  Alert,
} from "react-native";
import React, { useEffect } from "react";
import RNModal from "react-native-modal";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { FONT_FAMILY } from "../../util/colors";

const PlayerDetalModal = ({ visible, onDismiss, buddy, sessionName }) => {




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
          Session:{' '}
        {sessionName}
        </Text>
        <FlatList
          data={buddy || []}
          style={{ flexGrow: 0 }}
          renderItem={({ item, index }) => (
            <View style={styles.card}>
              <Text style={styles.name}>Player {index + 1}:</Text>
              <Text style={{color:'grey',fontFamily:FONT_FAMILY.normal}}>Player Name: <Text style={styles.name}>{item.DisplayName}</Text></Text>

              <Text style={{color:'grey',fontFamily:FONT_FAMILY.normal}}>Member Id: <Text style={styles.name}>{item.MemberID}</Text></Text>
            </View>
          )}
          keyExtractor={(item) => item?.id?.toString()}
        />

      </View>
    
    </RNModal>
  );
};

export default PlayerDetalModal;

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
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 10,
  },
});
