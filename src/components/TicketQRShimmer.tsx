import React from "react";
import { View, StyleSheet } from "react-native";

export default function TicketQRShimmer() {
  return (
    <View style={styles.card}>
      <View style={[styles.line,{height:50}]} />
      <View style={[styles.line,{height:10}]}/>
      <View style={styles.qr} />
      <View style={[styles.line,{height:20}]} />
      <View style={[styles.line,{height:10,width: 300}]} />
      <View style={[styles.line,{height:10}]} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: "space-evenly",
   flex:1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  qr: {
    width: 200,
    height: 200,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    alignSelf: "center",
  },
  line: {
    height: 14,
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginTop: 20,
  },
  lineSmall: {
    
    height: 12,
    width: "60%",
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginTop: 20,
  },
});
