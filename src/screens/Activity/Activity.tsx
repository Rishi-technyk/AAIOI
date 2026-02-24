import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import Header from "../../components/Header";
import { Card } from "react-native-paper";
import {
  DARK_BLUE,
  FONT_FAMILY,
  LIGHT_BLUE,
  LIGHT_RED,
  SECONDARY_COLOR,
} from "../../util/colors";
import { Dropdown } from "react-native-element-dropdown";
import { useSelector } from "react-redux";
import NewButton from "../../components/Button";
import Icon from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import UniversalModal from "../../components/UniversalModal";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import DatePickerComponent from "../../components/DatePicker";
import { useSlots } from "../../services/Activity/FacilityService";
type Props=NativeStackScreenProps<AppStackParamList,'Activity'>

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);


const Activity:React.FC<Props> = ({ route, navigation }) => {
  const { facility } = route.params;
 const { token } = useSelector((state) => state.auth);
  const [tempStartDate, setTempStartDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [session, setSession] = useState({ id: 0 });
  const [visible, setVisible] = useState(false);

  const selectSlot = (day, time) => {
    setSelectedSlots((prev) => {
      const exists = prev.find(
        (slot) => slot.time.id === time.id && slot.day.id === day.id
      );

      if (exists) {
        // Remove if it already exists
        return prev.filter(
          (slot) => !(slot.day.id === day.id && slot.time.id === time.id)
        );
      } else {
        // Add if not exists
        return [...prev, { day, time }];
      }
    });
  };

  const { slotsQuery, sessionsQuery } = useSlots(
    facility.id,
    session.id,
    tempStartDate,
    token
  );

  const renderCell = (day, time, r) => {
   const slotBookingsOnDay = time.booking_data.filter(
  (booking) => booking.slot_date === day?.session_date
);


      const isFullyBooked = slotBookingsOnDay.length >= facility.inventory;
    if (isFullyBooked)
      return <View style={[styles.cell, { backgroundColor: "#fff0f0" }]} />;
    // Combine day.session_date and time.label into one moment
    const fullDateTime = moment(
      `${day.session_date} ${time.label}`,
      "YYYY-MM-DD hh:mm A"
    );

    // Check if the full datetime is before the current time
    const isPast = fullDateTime.isBefore(moment());

    if (isPast) {
      return (
        <View
          style={[styles.cell, { backgroundColor: "rgb(216, 216, 218)" }]}
        />
      );
    }
    return (
      <TouchableOpacity
        onPress={() => selectSlot(day, time)}
        style={[
          styles.cell,
          //  && styles.availableCell,
          {
            backgroundColor: selectedSlots.some(
              (i) => i.time.id === time.id && i.day.id === day.id
            )
              ? SECONDARY_COLOR
              : LIGHT_BLUE,
          },
        ]}
      >
        <Text
          style={[
            styles.price,
            {
              color: selectedSlots.some(
                (i) => i.time.id === time.id && i.day.id === day.id
              )
                ? "white"
                : DARK_BLUE,
            },
          ]}
        >
          ₹{facility.charge}
        </Text>
        <Text
          style={[
            styles.left,
            {
              color: selectedSlots.some(
                (i) => i.time.id === time.id && i.day.id === day.id
              )
                ? "white"
                : DARK_BLUE,
            },
          ]}
        >
         {/* {facility?.inventory -  (  time.booking_data.length > 0 && time.booking_data[r]?.slot_date == day?.session_date ? time.booking_data.length:0) }{" "}Left */}
        {facility?.inventory - slotBookingsOnDay.length} Left </Text>
      </TouchableOpacity>
    );
  };

  const emptyList = [1, 1, 1, 1, 1, 1];
  const indicators = [
    { id: "1", name: "Blocked", color: "rgb(216, 216, 218)" },
    { id: "2", name: "Available", color: LIGHT_BLUE },
    { id: "3", name: "Selected", color: SECONDARY_COLOR },
    { id: "4", name: "Booked", color: LIGHT_RED },
  ];
  return (
    <View style={{ flex: 1,}}>
      <Header title={"Activity"}>
        <TouchableOpacity
           activeOpacity={0.9}
          style={{
            borderWidth: 0.8,
            borderColor: "white",
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() =>
            navigation.navigate("Bookings", { type: facility.id })
          }
        >
          <Text style={{ fontFamily: FONT_FAMILY.normal, color: "white" }}>
            My Bookings
          </Text>
        </TouchableOpacity>
      </Header>
        <Text style={[styles.price,{textAlign:'center'}]}>You can book slots from {facility?.min_days} to {facility?.max_days} days.</Text>

      <ScrollView
        contentContainerStyle={{ backgroundColor: "white" }}
        style={{ backgroundColor: 'white' }}
      >
        {/* <Image
          source={{
            uri: `https://booking.panchshilaclub.org${facility?.second_image}`,
          }}
          style={{ width: "auto", height: 250, resizeMode: "cover" }}
        /> */}

        <Card style={styles.container}>
         
            <View style={styles.rowCenter}>
                 <Image
                       height={50}
                       width={50}
                       style={{ alignSelf: "center" }}
                       source={{
                         uri: `https://dynamixclubedepalma.co.in/clubdepalma${facility?.third_image}`,
                       }}
                     />
              <Text style={styles.text}>{facility?.name}</Text>
            </View>
           
          <View
            style={{
              backgroundColor: "white",
              padding: 5,
              borderRadius: 10,
            }}
          >
            <View style={styles.rowCenter}>
              <View style={{ flex: 1 }}>
                <DatePickerComponent
                
                  placeholder={
                    tempStartDate
                      ? moment(tempStartDate).format("DD-MMMM-YYYY")
                      : "Select Start date"
                  }
                  // minDate={new Date()}
                  // minDate={facility?.min_days}
                    minDate={moment().add(parseInt(facility?.min_days || 0), 'days').toDate()}
                    maxDate={moment().add(parseInt(facility?.max_days-4 || 0), 'days').toDate()}
                  stateDate={(date) => {
                    setTempStartDate(date);
                  }}
                  // maxDate={facility?.max_days}
                />
              </View>

              <Dropdown
                style={[styles.dropdown]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                containerStyle={{
                  backgroundColor: LIGHT_BLUE,
                  borderRadius: 10,
                  marginTop: 10,
                }}
                itemTextStyle={styles.itemContainerStyle}
                iconStyle={styles.iconStyle}
                data={[
                  { id: 0, name: "All Sessions" }, // default item at the top
                  ...(sessionsQuery?.data?.data || []),
                ]}
                maxHeight={300}
                labelField="name"
                
                valueField="id"
                placeholder={"Select session"}
                value={session?.id ?? 0}
                onChange={(item) => {
                  setSession(item);
                }}
              />
            </View>
          </View>
        </Card>
        <View style={[styles.rowCenter, { justifyContent: "space-between" }]}>
          <Text style={styles.text}>Select Slot</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            {indicators.map((item, index) => (
              <View
                key={index}
                style={{ alignItems: "center", marginLeft: 10 }}
              >
                <View
                  style={{
                    width: 20,
                    height: 20,
                    backgroundColor: item.color,
                    borderRadius: 5,
                  }}
                />
                <Text style={styles.price}>{item.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              borderRightWidth: 1,
              backgroundColor: LIGHT_BLUE,
              borderRightColor: "grey",
            }}
          >
            <View
              style={[
                styles.cell,
                styles.headerCell,
                { backgroundColor: LIGHT_BLUE },
              ]}
            />

            {/* Time labels */}
            {slotsQuery.isLoading
              ? emptyList.map((item) => (
                  <View style={[styles.cell, styles.headerCell]}>
                    <ShimmerPlaceholder style={styles.cell} />
                  </View>
                ))
              : slotsQuery?.data?.data?.map((time, index) => (
                  <View
                    key={index}
                    style={[
                      styles.cell,
                      { borderRadius: 0, borderTopWidth: 0.3 },
                    ]}
                  >
                    <Icon
                      name={
                        time.session_id == 1
                          ? "wb-sunny"
                          : time.session_id == 2
                          ? "sunny"
                          : "nights-stay"
                      }
                      color={
                        time.session_id == 1
                          ? "orange"
                          : time.session_id == 2
                          ? "red"
                          : "purple"
                      }
                      size={17}
                    />
                    <Text style={[styles.timeText]}>{time.label}</Text>
                  </View>
                ))}
          </View>
          <ScrollView horizontal>
            <View>
              {/* Date Header Row */}
              <View
                style={{ flexDirection: "row", backgroundColor: LIGHT_BLUE }}
              >
                {slotsQuery.isLoading
                  ? emptyList.map((item) => (
                      <View style={[styles.cell, styles.headerCell]}>
                        <ShimmerPlaceholder style={styles.cell} />
                      </View>
                    ))
                  : slotsQuery?.data?.dateOptions?.map((day, index) => (
                      <View
                        key={index}
                        style={[styles.cell, { backgroundColor: LIGHT_BLUE }]}
                      >
                        <Text style={[styles.dayText, { color: "black" }]}>
                          {day.date}
                        </Text>
                        <Text style={[styles.dayText, { color: "grey" }]}>
                          {day.day}
                        </Text>
                      </View>
                    ))}
              </View>

              {/* Time Slots Grid */}
              {slotsQuery.isLoading
                ? emptyList.map((i) => (
                    <View style={{ flexDirection: "row" }}>
                      {emptyList.map((item) => (
                        <View style={[styles.cell, styles.headerCell]}>
                          <ShimmerPlaceholder style={styles.cell} />
                        </View>
                      ))}
                    </View>
                  ))
                : slotsQuery?.data?.data?.map((time, rowIndex) => (
                    <View key={rowIndex} style={{ flexDirection: "row" }}>
                      {slotsQuery?.data?.dateOptions?.map((day, colIndex) => (
                        <View key={colIndex} style={styles.cell}>
                          {renderCell(day, time, rowIndex)}
                        </View>
                      ))}
                    </View>
                  ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>
      {selectedSlots.length > 0 && (
        <View
          style={{
            flexDirection: "row",
            // alignItems: "center",
            justifyContent: "space-between",
            margin: 10,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setVisible(true)}
          >
            <Text style={styles.price}>
              {selectedSlots.length +
                ` ${selectedSlots.length > 1 ? "Slots" : "Slot"} Selected`}
            </Text>
            <View style={styles.rowCenter}>
              <Text
                style={[
                  styles.price,
                  { textDecorationLine: "underline", color: "grey" },
                ]}
              >
                tap to view details
              </Text>
              <Icon name={"arrow-drop-up"} size={20} color={"black"} />
            </View>
          </TouchableOpacity>
          <NewButton
            text={"Proceed"}
            onPress={() =>
              navigation.navigate("ChoosePlayer", {
                slots: selectedSlots,
                facility,
                session
              })
            }
          />
        </View>
      )}
      <UniversalModal
        visible={visible}
        title={
          selectedSlots.length +
          ` ${selectedSlots.length > 1 ? "Slots" : "Slot"} Selected`
        }
        setVisible={setVisible}
      >
       
        {selectedSlots.map((slots, index) => (
          <View
            key={index}
            style={[
              styles.rowCenter,
              {
                justifyContent: "space-between",
                padding: 10,
              },
            ]}
          >
            <View>
              <Text
                style={[styles.price, { fontFamily: FONT_FAMILY.semiBold }]}
              >
                {facility?.name}
              </Text>
              <Text style={[styles.price]}>
                {`${moment(slots.time.name, "HHmm").format(
                  "hh:mm A"
                )} to ${moment(slots.time.name.slice(5, 8), "HHmm").format(
                  "hh:mm A"
                )}`}{" "}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text
                style={[
                  styles.price,
                  {
                    backgroundColor: SECONDARY_COLOR,
                    color: "white",
                    padding: 6,
                    borderRadius: 5,
                    fontFamily: FONT_FAMILY.bold,
                  },
                ]}
              >
                1 Slot
              </Text>
              <Text
                style={[styles.price, { fontFamily: FONT_FAMILY.semiBold }]}
              >
                {moment(slots.day.session_date).format("DD-MMMM-YYYY")}
              </Text>
            </View>
          </View>
        ))}
      </UniversalModal>
    </View>
  );
};

export default Activity;

const styles = StyleSheet.create({
  headerCell: {
    backgroundColor: "#eee",
  },
  timeText: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
    color: "grey",
  },
  dayText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    color: "grey",
  },

  text: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    margin: 10,
  },
  rowCenter: { flexDirection: "row", alignItems: "center", },
  placeholderStyle: {
    color: "grey",
    fontFamily: FONT_FAMILY.normal,
  },
  description: {
    color: "grey",
    fontFamily: FONT_FAMILY.normal,
    fontSize: 14,
  },
  scrollcontainer: { paddingHorizontal: 16 },
  dateTitle: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 17,
    color: "grey",
  },
  datebox: {
    backgroundColor: LIGHT_BLUE,
    margin: 10,
    padding: 10,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedTextStyle: { color: "black", fontFamily: FONT_FAMILY.normal },
  dropdown: {
    backgroundColor: LIGHT_BLUE,
    margin: 10,
    padding: 10,
    borderRadius: 6,
    borderWidth: 0.3,
    flex: 1,
  },
  itemContainerStyle: { color: "grey", fontFamily: FONT_FAMILY.normal },
  container: {
    margin: 10,
    backgroundColor: "white",
    padding: 10,
    // marginTop: -40,
    flex: 1,
  },

  header: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  subHeader: {
    textAlign: "center",
    marginBottom: 10,
    color: "#666",
  },
  headerRow: {
    flexDirection: "row",
  },
  dayHeader: {
    width: 80,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
    borderWidth: 0.5,
    borderColor: "#ccc",
  },
  dayText: {
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
  },
  timeColumnHeader: {
    width: 80,
  },
  timeColumn: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#ccc",
    backgroundColor: "#f5f5f5",
  },

  cell: {
    width: 70,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    borderRadius: 5,
  },
  availableCell: {
    backgroundColor: "#fff0f0",
  },
  price: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.normal,
    color: DARK_BLUE,
  },
  left: {
    fontSize: 10,
    color: "#888",
  },
  footer: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
  },
  turfButton: {
    flex: 1,
    marginRight: 10,
  },
  proceedButton: {
    flex: 1,
  },
});
