import React, { useRef, useState } from "react";
import { Modal, Vibration } from "react-native";
import QRCodeScanner from "react-native-qrcode-scanner";
import { RNCamera } from "react-native-camera";
import { useSelector } from "react-redux";
import { javascriptPost } from "../util/api";
import { ENDPOINT } from "../util/constant";
import ScanStatusPopup from "./ScanStatusPopup";

const QRScanModal = ({ visible, onClose, role,data }) => {
  const userData = useSelector((s) => s.auth.userData);
  const lastScanTime = useRef(0);
  const isProcessing = useRef(false);
  const scannerRef = useRef(null);


  const [popup, setPopup] = useState({
    visible: false,
    type: "loading",
    message: "",
  });

const showPopup = (type, message = "") => {
  setPopup({ visible: true, type, message });

};

const handlePopupClose = () => {
  setPopup({ visible: false });
  scannerRef.current?.reactivate();   // ⭐ restart scanning
  isProcessing.current = false;
};
  const onQRRead = async (e) => {
    const now = Date.now();
    if (now - lastScanTime.current < 800) return;
    lastScanTime.current = now;

    if (isProcessing.current) return;
    isProcessing.current = true;

    const qrValue = e?.data?.trim();
    if (!qrValue) {
      showPopup("fail", "Invalid QR Code");
      isProcessing.current = false;
      return;
    }

    Vibration.vibrate(80);
    showPopup("loading");

    const res = await javascriptPost({
      path: ENDPOINT.admin_validate_ticket,
      Token: userData.data.token,
      body: { qr_code: qrValue, role, type:data },
    });

    if (!res?.status) {
      showPopup("fail", res.message || "Failed!");
      isProcessing.current = false;
      return;
    }

    showPopup("success", res.message || "Success!");

    // allow next scan
    setTimeout(() => (isProcessing.current = false), 900);
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="fade">
      <QRCodeScanner
        ref={scannerRef}
        onRead={onQRRead}
        reactivate={false}
        showMarker={true}
        fadeIn={false}
        cameraStyle={{ height: "100%" }}
        flashMode={RNCamera.Constants.FlashMode.auto}
        markerStyle={{
          borderColor: "#007bff",
          borderWidth: 3,
          borderRadius: 12,
        }}
      />

      {/* Popup for Loading, Success, Fail */}
     <ScanStatusPopup
  visible={popup.visible}
  type={popup.type}
  message={popup.message}
  onClose={handlePopupClose}
/>

    </Modal>
  );
};

export default QRScanModal;
