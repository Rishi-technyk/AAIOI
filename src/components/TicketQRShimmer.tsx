import React from "react";
import { View, StyleSheet } from "react-native";

export default function TicketQRShimmer() {
  return (
    <View style={styles.card}>
      <View style={styles.qr} />
      <View style={styles.line} />
      <View style={styles.lineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
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
    marginTop: 16,
  },
  lineSmall: {
    height: 12,
    width: "60%",
    backgroundColor: "#e5e7eb",
    borderRadius: 6,
    marginTop: 8,
  },
});
