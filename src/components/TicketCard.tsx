import React from "react";
import { View, Text, StyleSheet } from "react-native";
import QuantityCounter from "./QuantityCounter";
import { FONT_FAMILY } from "../util/colors";

export default function TicketCard({ data, quantity, onChange,onlyVip }: any) {


  return (
    <View style={[styles.card, data.sold_out && styles.disabled]}>
      <View style={styles.row}>
        <View>
          <View style={styles.rowstart}>
            <Text style={styles.title}>{data.title}</Text>
            {/* <Icon name="date-range" size={20} color={"#135bec"} style={{marginRight:8}}/> */}
          </View>
          <View style={styles.rowstart}>
            {/* <Icon name="location-pin" size={20} color={"#135bec"} style={{marginRight:8}} /> */}
            <Text style={styles.desc}>{data.description}</Text>
          </View>
          {data.max && <Text style={styles.max}>Max {data.max} per order</Text>}
        </View>
     

        {data.sold_out ? (
          <Text
            style={{
              backgroundColor: "lightblue",
              fontFamily: FONT_FAMILY.bold,
              color: "blue",
              textAlign: "center",
              padding: 6,
              borderRadius: 7,
            }}
          >
            Sold Out
          </Text>
        ) : (
          <Text style={styles.price}>₹{Number(data.price).toFixed(2)}</Text>
        )}
      </View>
   {data.complimentary && (
  <Text style={{ color: "green", fontSize: 12 }}>
    Complimentary
  </Text>
)}
      <View style={styles.divider} />

      <QuantityCounter
        value={quantity}
        max={data.max}
        disabled={data.sold_out}
        onChange={onChange}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  /* 🔹 Card Container */
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  rowstart: {
    flexDirection: "row",
    alignItems: "center",
  },
  /* 🔹 Disabled / Sold Out */
  disabled: {
    opacity: 0.5,
  },

  /* 🔹 Top Row */
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  /* 🔹 Title */
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    fontFamily: FONT_FAMILY.normal,
  },

  /* 🔹 Description */
  desc: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    maxWidth: 220,
    fontFamily: FONT_FAMILY.normal,
  },

  /* 🔹 Max Text */
  max: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#f97316", // orange highlight
    fontFamily: FONT_FAMILY.semiBold,
  },

  /* 🔹 Price */
  price: {
    fontSize: 18,
    fontWeight: "700",
    color: "#135bec",
    fontFamily: FONT_FAMILY.semiBold,
  },

  /* 🔹 Divider */
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 14,
  },
});