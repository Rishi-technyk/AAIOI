import React, { useEffect, useState } from "react";
import {
  Image,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useSelector } from "react-redux";

import NewButton from "./Button";
import UniversalModal from "../components/UniversalModal";
import { FONT_FAMILY, SECONDARY_COLOR } from "../util/colors";
import { ENDPOINT } from "../util/constant";
import { javascriptGet, ApiResponse } from "../util/api";
import { RootState } from "../store/store";

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */

interface OTPModalProps {
  visible: boolean;
  setVisible: (value: boolean) => void;
  data?: any; // If data type exists, you can refine
}

interface OTPResponse {
  otp: string;
}

/* ---------------------------------------------------------
   COMPONENT
--------------------------------------------------------- */

const OTPModal: React.FC<OTPModalProps> = ({ visible, setVisible }) => {
  const [OTP, setOTP] = useState<string | number | undefined>();
  const [loader, setLoader] = useState<boolean>(false);

  const token = useSelector((state: RootState) => state.auth?.token);

  // Debug Log
  console.log(
    "\x1b[34m%s\x1b[0m",
    OTP,
    "---------------------- OTP ---------------------"
  );

  /* ---------------------------------------------------------
     API CALL
  --------------------------------------------------------- */
  async function callAPI() {
    try {
      const apiRequestObject = {
        path: ENDPOINT.otp,
        body: {},
        Token: token,
      };

      setLoader(true);

      const response: ApiResponse<OTPResponse> = await javascriptGet(
        apiRequestObject
      );

      setLoader(false);
      setOTP(response.data?.otp);

      return response;
    } catch (err) {
      setLoader(false);
      return { result: "FAILURE" };
    }
  }

  useEffect(() => {
    callAPI();
  }, []);
  
  return (
    <UniversalModal
      dismissable={true}
      statusBarTranslucent={true}
      visible={visible}
      title="OTP"
      setVisible={setVisible}
    >
      <View style={{ flex: 1 }}>
        {/* OTP VIEW */}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Image
            resizeMode="contain"
            style={{ height: 100, marginBottom: 20 }}
            source={require("../../assets/images/OTPScreen.png")}
          />

          <Text
            style={{
              fontFamily: FONT_FAMILY.bold,
              fontSize: 30,
              letterSpacing: 20,
              color: "black",
            }}
          >
            {OTP}
          </Text>
        </View>

        {/* REFRESH BUTTON */}
        <View style={{ marginHorizontal: 20 }}>
          <NewButton text="Refresh OTP" onPress={callAPI} loading={loader} />
        </View>
      </View>
    </UniversalModal>
  );
};

export default React.memo(OTPModal);

/* ---------------------------------------------------------
   STYLES
--------------------------------------------------------- */

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  innerModalCont: {
    flex: 0.5,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 10,
    borderRadius: 10,
  },
  listRow: { flexDirection: "row", margin: 20 },
  downloadText: {
    color: "black",
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 15,
  },
  submitContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
    backgroundColor: SECONDARY_COLOR,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 20,
  },
  cancelText: {
    color: "red",
    fontFamily: FONT_FAMILY.light,
    textAlign: "right",
  },
  confirmText: {
    color: "white",
    fontFamily: FONT_FAMILY.bold,
    marginHorizontal: 10,
  },
  headerStyle: { fontFamily: FONT_FAMILY.normal, marginLeft: 10 },
});


// import {
//   Image,
//   Text,
//   View,
//   StyleSheet,
// } from "react-native";
// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

// import NewButton from "./Button.js";
// import UniversalModal from "./UniversalModal.js";
// import { FONT_FAMILY, SECONDARY_COLOR } from "../util/colors.js";
// import { ENDPOINT } from "../util/constant.js";
// import { javascriptGet } from "../util/api.js";

// const OTPModal = ({ visible, setVisible, data }) => {
//   const [OTP, setOTP] = useState();
//   const [loader, setLoader] = useState(false);
//   const token = useSelector((state) => state.auth?.token);
// console.log('\x1b[34m%s\x1b[0m', OTP, '---------------------- OTP ---------------------');
//     async function callAPI() {
//     try {
//       const apiRequestObject = {
//         path: ENDPOINT.otp,
//         body: {
         
//         },
//         Token: token
//       };
//         setLoader(true)
//       const response = await javascriptGet(apiRequestObject); 
      
//       setLoader(false);
//         setOTP(response.data.otp);
    
//       return response;
//     } catch (err) {
//        return { result: FAILURE };
//     }
//   }
//   useEffect(() => {
//     callAPI();
//   }, []);
//   return (
//     <UniversalModal

     
//       dismissable={true}
//       statusBarTranslucent={true}
//       visible={visible}
//       title={"OTP"}
//       setVisible={setVisible}>

//         <View style={{flex:1}}>
        
//           <View
//             style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
//             <Image
//               resizeMode={"contain"}
//               style={{ height: 100,  marginBottom: 20 }}
//               source={require("../../assets/images/OTPScreen.png")}
//             />
//             <Text
//               style={{
//                 fontFamily: FONT_FAMILY.bold,
//                 fontSize: 30,
//                 letterSpacing: 20,
//                 color:'black'
//               }}>
//               {OTP}
//             </Text>
//           </View>
//           <View style={{marginHorizontal:20}}>

//           <NewButton text={"Refresh OTP"} onPress={callAPI} loading={loader} />
//           </View>
//         </View>
//     </UniversalModal>
//   );
// };

// export default React.memo(OTPModal);

// const styles = StyleSheet.create({
//   modal: {
//     flex: 1,
//     justifyContent: "flex-end",
//     backgroundColor: "rgba(0,0,0,0.5)",
//   },
//   innerModalCont: {
//     flex: 0.5,
//     backgroundColor: "white",
//     borderTopLeftRadius: 30,
//     borderTopRightRadius: 30,
//     padding: 10,
//     borderRadius: 10,
//   },
//   listRow: { flexDirection: "row", margin: 20 },
//   downloadText: {
//     color: "black",
//     fontFamily: FONT_FAMILY.semiBold,
//     fontSize: 15,
//   },
//   submitContainer: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginVertical: 10,
//     backgroundColor: SECONDARY_COLOR,
//     padding: 10,
//     borderRadius: 5,
//     marginHorizontal: 20,
//   },
//   cancelText: {
//     color: "red",
//     fontFamily: FONT_FAMILY.light,
//     textAlign: "right",
//   },
//   confirmText: {
//     color: "white",
//     fontFamily: FONT_FAMILY.bold,
//     marginHorizontal: 10,
//   },
//   headerStyle: { fontFamily: FONT_FAMILY.normal, marginLeft: 10 },
// });
