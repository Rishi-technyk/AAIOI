import React, { useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import {
  Camera,
  useCameraDevices,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import { DOMAIN } from '../../util/constant';

const CameraScreen = ({ navigation }) => {
  const auth = useSelector(state => state.auth);
  const devices = useCameraDevices();
  const device = devices[0];
  const { hasPermission, requestPermission } = useCameraPermission();

  useEffect(() => {
    (async () => {
      if (!hasPermission) {
        const status = await requestPermission();
        console.log('Camera permission:', status);
        if (status !== 'authorized') {
          Alert.alert('Camera permission required');
        }
      }
    })();
  }, [hasPermission]);
  const onCodeScanned = async codes => {
  if (!codes?.length) return;

  const qrValue = codes[0]?.value?.trim();
  if (!qrValue) return;

  let location = null;
  let table = null;

  try {
    // ---------- CASE 1: FULL URL ----------
    if (qrValue.startsWith('http')) {
      const parsedUrl = new URL(qrValue);
      location = parsedUrl.searchParams.get('location');
      table = parsedUrl.searchParams.get('table');
    }

    // ---------- CASE 2: QUERY STRING ----------
    else if (qrValue.includes('location=') && qrValue.includes('table=')) {
      const params = new URLSearchParams(qrValue);
    
      location = params.get('location');
      table = params.get('table');
    }

    // ---------- CASE 3: JSON ----------
    else if (qrValue.startsWith('{')) {
      const parsed = JSON.parse(qrValue);
      location = parsed.location;
      table = parsed.table;
    }

    // ---------- CASE 4: SIMPLE FORMAT ----------
    else if (qrValue.includes('|') || qrValue.includes(',')) {
      const parts = qrValue.split(/[|,]/);
      location = parts[0];
      table = parts[1];
    }

    if (!location || !table) {
      Alert.alert('Invalid QR', 'QR code format is not valid');
      return;
    }

    const url = `${DOMAIN.LOCAL}validate/table-qr?location=${location}&table=${table}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${auth?.token}`,
        'Content-Type': 'application/json',
      },
    });

    const json = await response.json();
    console.log(json, 'QR VALIDATION RESPONSE');

    if (json?.status) {
      navigation.navigate('TableOrder', {
        tableData: json?.table,
        fromQR: true,
        group: json.groups,
      });
    } else {
      Alert.alert('Invalid QR', json?.message || '');
    }
  } catch (e) {
    console.error('QR Scan Error:', e);
    Alert.alert('QR scan failed', 'Unable to process QR code');
  }
};

//   const onCodeScanned = async codes => {
//     if (!codes?.length) return;


//     let qrValue = codes[0]?.value;
    
//     if (!qrValue) return;
//   let url = `${DOMAIN.LOCAL}validate/table-qr?location=4&table=9`;
//    if(qrValue){
//     url = qrValue
//    }
//     try {
//       const response = await fetch(url, {
//         headers: {
//           Authorization: `Bearer ${auth?.token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       const json = await response.json();
// console.log( json, '---------------------- json ---------------------');
//       if (json?.status) {
//         navigation.navigate('TableOrder', {
//           tableData: json?.table,
//           fromQR: true,
//           group: response.groups,
//         });
//       } else {
//         Alert.alert('Invalid QR', json?.message || '');
//       }
//     } catch (e) {
//       Alert.alert('QR scan failed');
//     }
//   };

  // 🔴 IMPORTANT guards
  if (!device) {
    return <Text style={styles.text}>Loading camera…</Text>;
  }

  if (!hasPermission) {
    return <Text style={styles.text}>Waiting for permission…</Text>;
  }



  return (
    <View style={styles.container}>
      <Header toHome={false} title="Scan QR Code" />
      <View style={{ flex: 1 }}>
        <Camera
          style={[StyleSheet.absoluteFill]}
          device={{...device,position:'back'}}
          isActive={true}
          codeScanner={{
            codeTypes: ['qr'],
            onCodeScanned,
          }}
        />
        <View
          style={styles.box}
        />
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', },
  text: {
    flex: 1,
    textAlign: 'center',
    textAlignVertical: 'center',
    color: '#fff',
  },
  box:{
            position: 'absolute',
            borderWidth: 2,
            height: 300,
            width: 300,
           top:200,
           alignSelf:'center',
           borderRadius:10,borderStyle:'dotted'
          }
});

// import React, { useEffect } from "react";
// import { View, StyleSheet, Alert } from "react-native";
// import { Camera, useCameraDevices } from "react-native-vision-camera";
// import { useSelector } from "react-redux";
// import Header from "../../components/Header";
// import { DOMAIN } from "../../util/constant";

// const CameraScreen = ({ navigation }) => {
//   const auth = useSelector(state => state.auth);
//   const devices = useCameraDevices();
//   const device = devices.back;

//   useEffect(() => {
//     (async () => {
//       const permission = await Camera.requestCameraPermission();
//       console.log( permission, '---------------------- permission ---------------------');
//       if (permission !== "granted") {
//         Alert.alert("Camera permission required");
//       }
//     })();
//   }, []);

//   const onCodeScanned = async (codes) => {
//     if (!codes.length) return;

//     const qrValue = codes[0].value;
//     if (!qrValue) return;

//     try {
//       const response = await fetch(qrValue, {
//         headers: {
//           Authorization: `Bearer ${auth?.token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       const json = await response.json();

//       if (json?.status) {
//          navigation.navigate("TableOrder", {tableData: json?.table, fromQR: true,group:response.groups});
//       } else {
//         Alert.alert("Invalid QR", json?.message || "");
//       }
//     } catch {
//       Alert.alert("QR scan failed");
//     }
//   };

//   if (!device) return null;

//   return (
//     <View style={styles.container}>
//       <Header toHome={false} title="Scan QR Code" />
//       <Camera

//         style={styles.camera}
//         device={device}
//         isActive={true}
//         codeScanner={{
//           codeTypes: ["qr"],
//           onCodeScanned,
//         }}
//       />
//     </View>
//   );
// };

// export default CameraScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 ,backgroundColor:'red'},
//   camera: { flex: 1,backgroundColor:'red' },
// });

// import React, { useEffect } from "react";
// import { StyleSheet, View,} from "react-native";
// import QRCodeScanner from "react-native-qrcode-scanner";
// // import { RNCamera } from "react-native-camera";
// import { useSelector } from "react-redux";
// import Header from "../../components/Header";
// import { DOMAIN } from "../../util/constant";

// const Camera = ({navigation}) => {
//   const data = useSelector((state) => state.auth || []);

//   const onSuccess = async(e) => {
//     // e.data = scanned QR text / link
//     let url = `${DOMAIN.LOCAL}validate/table-qr?location=4&table=9`;
//    if(e?.data){
//     url = e.data
//    }

//     const response= await fetch(url, {
//       method: 'GET',
//       headers: {
//         'Authorization': `Bearer ${data?.token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     const json = await response.json();
//    if(json?.status === true){
// navigation.navigate("TableOrder", {tableData: json?.table, fromQR: true,group:response.groups});
//     } else {
//       alert(json?.message || "Invalid QR Code");
//     }

//   };
//   // useEffect(() => {
//   // onSuccess()
//   // }, []);

//   return (
//     <View style={styles.container}>
//       <Header toHome={false} title="Scan a QR Code" />
//       <QRCodeScanner
//         onRead={onSuccess}
//         // flashMode={RNCamera.Constants.FlashMode.auto}
//         flashMode={'auto'}
//         reactivate={true} // keep scanning after success
//         reactivateTimeout={2000}
//         showMarker={true}
//         cameraStyle={{ height: 300 }}
//         markerStyle={{
//           borderColor: "blue",
//           borderRadius: 10,
//           borderStyle: "dotted",
//         }}
//         // topContent={<Header title="Scan a QR Code" />}
//       />
//     </View>
//   );
// };

// export default Camera;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   text: { fontSize: 18, color: "#000", margin: 10, textAlign: "center" },
// });
