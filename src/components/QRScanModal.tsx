import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Vibration,
  TouchableOpacity,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
} from "react-native-vision-camera";
import { useSelector } from "react-redux";
import { javascriptPost } from "../util/api";
import { ENDPOINT } from "../util/constant";
import ScanStatusPopup from "./ScanStatusPopup";
import { RootState } from "../store/store";

type Props = {
  visible?: boolean;
  onClose: () => void;
  role: string;
  data: string;
};
const QRScanModal: React.FC<Props> = ({ visible, onClose, role, data }) => {
  const device = useCameraDevice("back");
  const userData = useSelector((s:RootState) => s.auth);
  const lastScanTime = useRef(0);
  const isProcessing = useRef(false);

  const [popup, setPopup] = useState({
    visible: false,
    type: "loading",
    message: "",
  });

  // ✅ ask permission once
  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status !== "granted") {
        alert("Camera permission required");
      }
    })();
  }, []);

  const showPopup = (type, message = "") => {
    setPopup({ visible: true, type, message });
  };

  const handlePopupClose = () => {
    setPopup({ visible: false });
    isProcessing.current = false;
  };

  // ✅ QR Scanner logic
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: async (codes) => {

      const now = Date.now();
      if (now - lastScanTime.current < 800) return;
      lastScanTime.current = now;

      if (isProcessing.current) return;
      isProcessing.current = true;

      const qrValue = codes?.[0]?.value?.trim();

      if (!qrValue) {
        showPopup("fail", "Invalid QR Code");
        isProcessing.current = false;
        return;
      }

      Vibration.vibrate(80);
      showPopup("loading");
      try {
        const res = await javascriptPost({
          path: ENDPOINT.admin_validate_ticket,
          Token: userData?.token,
          body: { qr_code: qrValue, role, type: data },
        });

        if (!res?.status) {
          showPopup("fail", res.message || "Failed!");
          isProcessing.current = false;
          return;
        }

        showPopup("success", res.message || "Success!");

        // allow next scan
        setTimeout(() => {
          isProcessing.current = false;
        }, 900);
      } catch (e) {
        console.log( e, '---------------------- e ---------------------');
        showPopup("fail", "Network error");
        isProcessing.current = false;
      }
    },
  });

  if (!device) return null;

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        {/* Camera */}
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={visible && !popup.visible ||false}
          codeScanner={codeScanner}
        />

        {/* Marker Overlay */}
        <View style={styles.overlay}>
          <View style={styles.marker} />
          <Text style={styles.scanText}>Align QR Code inside frame</Text>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={{ color: "#fff", fontSize: 16 }}>Close</Text>
        </TouchableOpacity>

        {/* Popup */}
        <ScanStatusPopup
          visible={popup.visible}
          type={popup.type}
          message={popup.message}
          onClose={handlePopupClose}
        />
      </View>
    </Modal>
  );
};

export default QRScanModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  marker: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: "#007bff",
    borderRadius: 16,
    backgroundColor: "transparent",
  },
  scanText: {
    marginTop: 20,
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "#00000088",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
// import React, { useRef, useState } from "react";
// import { Modal, Vibration } from "react-native";
// import QRCodeScanner from "react-native-qrcode-scanner";
// import { RNCamera } from "react-native-camera";
// import { useSelector } from "react-redux";
// import { javascriptPost } from "../util/api";
// import { ENDPOINT } from "../util/constant";
// import ScanStatusPopup from "./ScanStatusPopup";

// const QRScanModal = ({ visible, onClose, role,data }) => {
//   const userData = useSelector((s) => s.auth.userData);
//   const lastScanTime = useRef(0);
//   const isProcessing = useRef(false);
//   const scannerRef = useRef(null);


//   const [popup, setPopup] = useState({
//     visible: false,
//     type: "loading",
//     message: "",
//   });

// const showPopup = (type, message = "") => {
//   setPopup({ visible: true, type, message });

// };

// const handlePopupClose = () => {
//   setPopup({ visible: false });
//   scannerRef.current?.reactivate();   // ⭐ restart scanning
//   isProcessing.current = false;
// };
//   const onQRRead = async (e) => {
//     const now = Date.now();
//     if (now - lastScanTime.current < 800) return;
//     lastScanTime.current = now;

//     if (isProcessing.current) return;
//     isProcessing.current = true;

//     const qrValue = e?.data?.trim();
//     if (!qrValue) {
//       showPopup("fail", "Invalid QR Code");
//       isProcessing.current = false;
//       return;
//     }

//     Vibration.vibrate(80);
//     showPopup("loading");

//     const res = await javascriptPost({
//       path: ENDPOINT.admin_validate_ticket,
//       Token: userData.data.token,
//       body: { qr_code: qrValue, role, type:data },
//     });

//     if (!res?.status) {
//       showPopup("fail", res.message || "Failed!");
//       isProcessing.current = false;
//       return;
//     }

//     showPopup("success", res.message || "Success!");

//     // allow next scan
//     setTimeout(() => (isProcessing.current = false), 900);
//   };

//   return (
//     <Modal visible={visible} onRequestClose={onClose} animationType="fade">
//       <QRCodeScanner
//         ref={scannerRef}
//         onRead={onQRRead}
//         reactivate={false}
//         showMarker={true}
//         fadeIn={false}
//         cameraStyle={{ height: "100%" }}
//         flashMode={RNCamera.Constants.FlashMode.auto}
//         markerStyle={{
//           borderColor: "#007bff",
//           borderWidth: 3,
//           borderRadius: 12,
//         }}
//       />

//       {/* Popup for Loading, Success, Fail */}
//      <ScanStatusPopup
//   visible={popup.visible}
//   type={popup.type}
//   message={popup.message}
//   onClose={handlePopupClose}
// />

//     </Modal>
//   );
// };

// export default QRScanModal;
