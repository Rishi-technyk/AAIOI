import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";

import  { generatePDF } from "react-native-html-to-pdf";
import Pdf from "react-native-pdf";
import RNFS from "react-native-fs";
import { useRoute, useNavigation } from "@react-navigation/native";
import { SECONDARY_COLOR } from "../../util/colors";
// import Loader from "../components/Loader";

const SummeryPDFViewer = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { html, date } = route.params;
  const [tempPdfPath, setTempPdfPath] = useState<string | null>(null);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    generateTempPDF();
  }, []);

  // ------------------------------
  // 1️⃣ Generate TEMP PDF (Preview Only)
  // ------------------------------
  const generateTempPDF = async () => {
    try {
      setLoader(true);

      const fileName = `event_summary_preview_${Date.now()}`;

      const file = await generatePDF({
        html,
        fileName,
        directory: "Documents", // temp only
      });

      if (!file.filePath) throw new Error("PDF path missing!");

      setTempPdfPath(file.filePath);
      setLoader(false);
    } catch (err: any) {
      setLoader(false);
      Alert.alert("Error", err.message || "Failed to generate preview PDF");
      console.log("TEMP PDF ERROR => ", err);
    }
  };

  // ------------------------------
  // 2️⃣ Download PDF on user click
  // ------------------------------
  const downloadPDF = async () => {
    if (!tempPdfPath) {
      Alert.alert("Error", "Preview PDF not ready");
      return;
    }

    try {
      setLoader(true);

      const fileName = `event_summary_${date}_${Date.now()}.pdf`;

      const basePath =
        Platform.OS === "ios"
          ? RNFS.LibraryDirectoryPath
          : RNFS.DocumentDirectoryPath;

      const destPath = `${basePath}/${fileName}`;

      await RNFS.copyFile(tempPdfPath, destPath);

      setLoader(false);

      Alert.alert(
        "Downloaded",
        `PDF saved to:\n${destPath}`,
        [
          { text: "OK" },
          {
            text: "Open File",
            onPress: () =>
              navigation.navigate("PDFView", {
                url: destPath,
                title: "Event Summary",
              }),
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      setLoader(false);
      Alert.alert("Failed", error.message || "Could not save PDF");
      console.log("DOWNLOAD ERROR => ", error);
    }
  };

  return (
    <View style={styles.container}>
      {/* PDF Viewer */}
      {tempPdfPath ? (
        <Pdf
          source={{ uri: `file://${tempPdfPath}` }}
          style={styles.pdf}
          trustAllCerts={false}
          onError={(error) => console.log("PDF VIEW ERROR =>", error)}
        />
      ) : (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}

      {/* Download Button */}
      <TouchableOpacity style={styles.downloadBtn} onPress={downloadPDF}>
        <Text style={styles.downloadText}>Download PDF</Text>
      </TouchableOpacity>

      {/* {loader && <Loader />} */}
    </View>
  );
};

export default SummeryPDFViewer;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  pdf: {
    flex: 1,
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 60,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  downloadBtn: {
    width: "100%",
    paddingVertical: 15,
    backgroundColor: SECONDARY_COLOR,
    justifyContent: "center",
    alignItems: "center",
  },

  downloadText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

// import React, { useEffect, useState } from "react";
// import { View, StyleSheet, ActivityIndicator, Alert, Dimensions } from "react-native";
// import RNHTMLtoPDF from "react-native-html-to-pdf";
// import Pdf from "react-native-pdf";
// import { useRoute } from "@react-navigation/native";

// const SummeryPDFViewer = () => {
//   const route = useRoute<any>();
//   const { html, date } = route.params;
//   const [pdfPath, setPdfPath] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     generatePDF();
//   }, []);

//   const generatePDF = async () => {
//     try {
//       const options = {
//         html,
//         fileName: `event_summary_${date}`,
//         directory: "Documents",
//         base64: false,
//       };

//       const file = await RNHTMLtoPDF.convert(options);
//       setPdfPath(file.filePath || null);
//     } catch (err) {
//       Alert.alert("Error", "Failed to generate PDF");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   if (!pdfPath) {
//     return null;
//   }

//   return (
    // <View style={styles.container}>
    //   <Pdf
    //     source={{ uri: `file://${pdfPath}` }}
    //     style={styles.pdf}
    //     trustAllCerts={false}
    //     onError={(error) => console.log(error)}
    //   />
    // </View>
  // );
// };

// export default SummeryPDFViewer;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#fff" },
//   pdf: {
//     flex: 1,
//     width: Dimensions.get("window").width,
//     height: Dimensions.get("window").height,
//   },
//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
// });
