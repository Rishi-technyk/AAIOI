import React, { FC, useMemo } from "react";
import {
  Text,
  TouchableOpacity,
  ListRenderItem,
} from "react-native";
import moment, { Moment } from "moment";
import { FONT_FAMILY } from "../util/colors";
import { FlatList } from "react-native-gesture-handler";

const today = moment().add(1, "days").startOf("day"); // Start from tomorrow

interface CalendarStripProps {
  dayOpenBooking: number;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const CalendarStrip: FC<CalendarStripProps> = ({
  dayOpenBooking,
  selectedDate,
  onSelectDate,
}) => {
  // Ensure at least 20 days are shown
  const totalDays = Math.max(dayOpenBooking, 20);

  // Generate days dynamically
  const days: Moment[] = useMemo(() => {
    return Array.from({ length: totalDays }, (_, i) =>
      today.clone().add(i, "days")
    );
  }, [totalDays]);

  const renderItem: ListRenderItem<Moment> = ({ item, index }) => {
    const isSelected =
      moment(selectedDate).format("YYYY-MM-DD") ===
      item.format("YYYY-MM-DD");

    const isDisabled = index >= dayOpenBooking;

    return (
      <TouchableOpacity
        disabled={isDisabled}
        onPress={() =>
          !isDisabled && onSelectDate(item.format("YYYY-MM-DD"))
        }
        style={{
          padding: 12,
          margin: 6,
          borderRadius: 10,
          paddingHorizontal: 20,
          alignItems: "center",
          backgroundColor: isDisabled
            ? "#d3d3d3"
            : isSelected
            ? "#012970"
            : "#f0f0f0",
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: isDisabled ? "gray" : isSelected ? "white" : "black",
            fontFamily: FONT_FAMILY.bold,
          }}
        >
          {item.format("DD")}
        </Text>

        <Text
          style={{
            fontSize: 12,
            color: isDisabled ? "gray" : isSelected ? "white" : "black",
            fontFamily: FONT_FAMILY.normal,
          }}
        >
          {item.format("ddd")}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList<Moment>
      data={days}
      horizontal
      nestedScrollEnabled
      scrollEnabled
      keyExtractor={(_, index) => index.toString()}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 10 }}
      renderItem={renderItem}
    />
  );
};

export default CalendarStrip;
