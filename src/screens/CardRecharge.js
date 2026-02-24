import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  Image,
} from "react-native";
import React, {  useState } from "react";
import Header from "../components/Header";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { DARK_BLUE, LIGHT_GREEN, SECONDARY_COLOR,FONT_FAMILY } from "../util/colors";
import { ENDPOINT,  } from "../util/constant";
import InvoiceStyles from "../Styles/InvoiceStyle";
import { useSelector } from "react-redux";
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import DatePickerComponent from "../components/DatePicker";
import NewButton from "../components/Button";
import Recharge1 from "../../assets/svg/Recharge1";
import { useRecharges } from "../services/ViewStatementService";
import { Toast } from "react-native-toast-notifications";
import UniversalModal from "../components/UniversalModal";
import { CustomCheckbox } from "../components/CustomCheckBox";
import { javascriptPost } from "../util/api";

const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const CardRecharge = ({ navigation, route }) => {
  const balance = route?.params;
const [startDate, setStartDate] = useState(null);
  const userData = useSelector((state) => state.auth);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [amount, setAmount] = useState("");
  const [click, setClick] = useState(0);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState([]);
  const [paymode,setaPaymode]=useState([])
  const [selectedPaymode,setSelectedPaymode]=useState([])
  const [selectedLocation, setSelectedLocation] = useState([]);
  const { data, isLoading, error, refetch } = useRecharges(
    startDate,
    endDate,
    location,
    userData,
    paymode
  );
const onApply = (ind) => {
    setClick(ind);
    ind
      ? (setTempEndDate(null), setTempStartDate(null))
      : (setSelectedPaymode([]),setSelectedLocation([]));
  };
  const onSelect = (ind,type) => {

    if (selectedLocation?.includes(ind) && !type) {
      setSelectedLocation(selectedLocation.filter((item) => item !== ind));
    }else  if (selectedPaymode?.includes(ind) && type=='pay') {
      setSelectedPaymode(selectedPaymode.filter((item) => item !== ind));
    }  else if(type=='pay') {
      setSelectedPaymode([...selectedPaymode,ind])
    }else{
      setSelectedLocation([...selectedLocation, ind]);
    }
  };

  let temp = userData?.user?.location;
  let pay = userData?.user?.paymode;


  const handleValidateDates = () => {
    Toast.hideAll();
    if (tempEndDate && tempStartDate && !selectedLocation.length) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setShowModal(false);
      setLocation(selectedLocation.map((index) => temp[index]));
    } else if (selectedLocation.length) {
      setLocation(selectedLocation.map((index) => temp[index]));
       setaPaymode(selectedPaymode.map((index) => pay[index]))
     
      setStartDate(null);
      setEndDate(null);
      setShowModal(false);
    } else if (selectedPaymode.length) {
      setLocation(selectedLocation.map((index) => temp[index]));
       setaPaymode(selectedPaymode.map((index) => pay[index]))
   
      setStartDate(null);
      setEndDate(null);
      setShowModal(false);
    } else {
      Toast.show("Please apply atleast one filter.", {
        type: "warning",
      });
    }
  };
  const showDatepickerModal = () => {
    setTempEndDate(null);
    setTempStartDate(null);
    setShowModal(true);
  };
   const payNowAction = async () => { 

        Toast.hideAll();
    if (!amount.length || !/^\d+$/.test(amount)) {
      Toast.show("Please enter a valid amount.", {
        type: "warning",
      });
      return;
    }
      try {
       
        setLoading(true);
  
        const payload = {
       
            path: ENDPOINT.create_recharge_pay_order,
        body:{  amount: amount,
          type:'Card Recharge'
        },
          Token:userData?.token
        };
        let response = await javascriptPost(payload,);
       
  
        if (response && response?.data?.razorpayKey) {
       
          navigation.navigate('UniversalPayment', {
             type:'Recharge',
            orderData:response?.data,
          });
  setAmount("");
  
          setLoading(false);
        } else if(!response.status){
          setLoading(false);
          Alert.alert(response.message)
        }
      } catch (error) {
        Alert.alert("Feature Coming Soon...")
        setLoading(false);
        console.log(error, "---------------error---------------");
      }
    };
  // const payNowAction = async () => {
  //   Toast.hideAll();
  //   if (!amount.length || !/^\d+$/.test(amount)) {
  //     Toast.show("Please enter a valid amount.", {
  //       type: "warning",
  //     });
  //     return;
  //   }
  //   Toast.show("Feature coming soon...", {
  //     type: "warning",
  //   });
  //   // return;
  //   try {
  //     const payload = {
  //       member_id: userData?.data?.data[0]?.MemberID,
  //       ws_type: "create_pay_order",
  //       amount: amount,
  //     };
  //     setLoading(true);
  //     let response = await getRechargeNewData(payload);
  //     setLoading(false);
  //     if (response && response.data && response.data.url) {
  //       setAmount(0);
  //       const { url } = response.data;

  //       navigation.navigate("PaymentWebView", {
  //         url,
  //         title: "Pay Now",
  //         member_id: payload.member_id,
  //         amount: payload.amount,
  //         txn_id: "",
  //         userInfo: null,
  //         invoice: false,
  //       });
  //     } else {
  //       Alert.alert(response.message);
  //     }
  //   } catch (error) {
  //     Alert.alert(error.message, "heree");
  //   }
  // };
  const balances = [500, 1000, 2000];
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header
        title={"Card"}
        OpenDropDawn={showDatepickerModal}
        isMulti={true}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              refetch(), setStartDate(null), setEndDate(null), setLocation([]),setaPaymode([]);
            }}
            tintColor={SECONDARY_COLOR}
            refreshing={isLoading}
            colors={[DARK_BLUE]}
          />
        }
        style={{ backgroundColor: DARK_BLUE }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: "white" }}
        stickyHeaderIndices={[1]}
      >
        <View style={InvoiceStyles.container}>
          <View
            style={{
              backgroundColor: LIGHT_GREEN,
              borderRadius: 20,
              padding: 10,
            }}
          >
            <View style={[{ position: "absolute", right: 10, top: 10 }]}>
              <Recharge1 style={{ scale: 0.6 }} />
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 5,
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                {/* <Icon
                  name="card-account-details-star"
                  size={20}
                  color={DARK_BLUE}
                /> */}
                <Text
                  style={[
                    InvoiceStyles.text,
                    {
                      color: balance >= 500 ? DARK_BLUE : "red",
                      fontFamily: FONT_FAMILY.normal,
                    },
                  ]}
                >
                  {balance >= 500 ? `Card balance` : `Low balance`}
                </Text>
                <Text
                  style={[
                    InvoiceStyles.text,
                    {
                      color: balance >= 500 ? SECONDARY_COLOR : "red",
                      fontSize: 20,
                    },
                  ]}
                >
                  ₹{Number(balance || 0).toFixed(2)}
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 5,
                borderWidth: 1,
                borderColor: "grey",
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  fontFamily: FONT_FAMILY.bold,
                  color: amount.length > 0 ? "black" : "grey",
                }}
              >
                ₹
              </Text>
              <TextInput
                style={{
                  flex: 1,
                  fontFamily: FONT_FAMILY.bold,
                  fontSize: 20,
                  paddingVertical:10,
                  color: "black",
                }}
                aria-selected={false}
                cursorColor={SECONDARY_COLOR}
                keyboardType="decimal-pad"
                maxLength={6}
                placeholder={amount.length ? "" : "0.00"}
                placeholderTextColor={"grey"}
                value={amount}
                onChangeText={(text) => setAmount(text)}
                onSubmitEditing={payNowAction}
              />
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginVertical: 15,
              }}
            >
              {balances.map((item) => (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setAmount(item.toString())}
                  style={{
                    borderWidth: 2,
                    // marginRight: 10,
                    padding: 8,
                    // paddingHorizontal: 10,
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderColor:
                      item.toString() == amount ? SECONDARY_COLOR : DARK_BLUE,
                    backgroundColor:
                      item.toString() == amount
                        ? SECONDARY_COLOR
                        : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY.bold,
                      fontSize: 14,
                      color: item.toString() == amount ? "white" : DARK_BLUE,
                    }}
                  >
                    ₹{item.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <NewButton
              text={"Top-Up Now"}
              loading={loading}
              onPress={payNowAction}
            />
          </View>
        </View>

        {/* Transaction list */}
        <View
          style={{
            backgroundColor: "white",
            elevation: 3,
            paddingHorizontal: 10,
          }}
        >
          <View
            style={{
              flexDirection: "row",

              padding: 10,
              paddingVertical: 15,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={InvoiceStyles.transactionListHeaderText}>
              Transaction History
            </Text>
          </View>
           <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}style={{ flexDirection: "row",}}>
          {location.map((index) => (
            <Text
              onPress={() => {
                setLocation(location.filter((ind) => ind !== index));
                setStartDate(null);
                setEndDate(null);
              }}
              style={{
                margin: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "rgb(237, 243, 249)",
                color: "black",
              }}
            >
              {index.toLocaleString()}
              {"  "}
              <Text style={{ color: "red" }}>X</Text>
            </Text>
          ))}
          {paymode.map((index) => (
            <Text
              onPress={() => {
                setaPaymode(paymode.filter((ind) => ind !== index));
                setStartDate(null);
                setEndDate(null);
              }}
              style={{
                margin: 10,
                padding: 10,
                borderRadius: 10,
                backgroundColor: "rgb(237, 243, 249)",
                color: "black",
              }}
            >
              {index.toLocaleString()}
              {"  "}
              <Text style={{ color: "red" }}>X</Text>
            </Text>
          ))}
        </ScrollView>
        {startDate && endDate && data?.data?.length > 0 && (
          <Text style={InvoiceStyles.noRecord}>
            Records between {moment(startDate).format("DD MMM YYYY")} to{" "}
            {moment(endDate).format("DD MMM YYYY")}
          </Text>
        )}
        </View>
       
        

        <FlatList
          scrollEnabled={false}
          ListEmptyComponent={
            isLoading ? (
              emptyList
            ) : startDate && endDate ? (
              <View
                style={{
                  height: "100%",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  style={InvoiceStyles.alertImage}
                  source={require("../../assets/images/norecord.png")}
                />
                <Text style={InvoiceStyles.noRecord}>
                  No records found matching the applied filters.
                </Text>
              </View>
            ) : (
              <Text style={InvoiceStyles.noRecord}>No records found.</Text>
            )
          }
          initialNumToRender={10}
          data={data?.data}
          contentContainerStyle={{
            // marginHorizontal: 20,
            paddingHorizontal: 20,
            backgroundColor: "white",
            paddingTop: 20,
            flex: 1,
          }}
          renderItem={renderTransactions}
        />
      </ScrollView>
      <UniversalModal
        transparent={true}
        isFull={true}
        title={"Filter by:"}
        visible={showModal}
        setVisible={setShowModal}
      >
        <View style={{ flex: 1, flexDirection: "row" }}>
          <View style={{ flexDirection: "column",minWidth:'30%'}}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                // flex: 1,
                backgroundColor: click === 0 ?   "rgb(237, 243, 249)":"white",
                justifyContent: "space-between",
                // width: "50%",
                padding: 10,
                flexDirection: "row",
              }}
              onPress={() => onApply(0)}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY.semiBold,
                  fontSize: 14,
                  color: click === 0 ? "black":"grey" ,
                }}
              >
                Date
              </Text>
              <Text style={{ textAlign: "right" }}>
                {tempEndDate && tempStartDate ? 1 : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                backgroundColor: click === 1 ?  "rgb(237, 243, 249)":"white" ,

                padding: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              onPress={() => onApply(1)}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY.semiBold,
                  fontSize: 14,
                  color: click === 1 ?   "black":"grey",
                }}
              >
                Location
              </Text>
              <Text style={{ textAlign: "right" }}>
                {selectedLocation.length ? selectedLocation.length : ""}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.9}
              style={{
                backgroundColor: click === 2 ?   "rgb(237, 243, 249)":"white",

                padding: 10,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
              onPress={() => onApply(2)}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY.semiBold,
                  fontSize: 14,
                  color: click === 2 ?  "black":"grey",
                }}
              >
                Pay Mode
              </Text>
              <Text style={{ textAlign: "right" }}>
                {selectedPaymode.length ? selectedPaymode.length : ""}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, backgroundColor: "white" }}>
            {click === 0 ? (
              <View
                style={{
                  flex: 1,
                }}
              >
                <View style={{ margin: 10 }}>
                  <DatePickerComponent
                    placeholder={tempStartDate ? tempStartDate : "Start date"}
                    stateDate={setTempStartDate}
                  />
                </View>
                <View style={{ margin: 10 }}>
                  <DatePickerComponent
                    placeholder={tempEndDate ? tempEndDate : "End date"}
                    stateDate={setTempEndDate}
                    minDate={
                      tempStartDate
                        ? moment(tempStartDate).add(1, "day").toDate()
                        : moment().toDate()
                    }
                  />
                </View>
              </View>
            ) : (
              click === 1 && (
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 20,
                  }}
                >
                  {userData?.user?.location.map((item, index) => (
                    <View>
                      <TouchableOpacity
                        onPress={() => onSelect(index)}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: "row",
                          margin: 10,
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                          }}
                        >
                          <CustomCheckbox
                          onToggle={ () => onSelect(index)}
                           checked={selectedLocation.includes(index)}
                          />
                        </View>
                        <View
                          style={{
                            marginLeft: 10,
                          }}
                        >
                          <Text
                            style={[
                              {
                                fontFamily: FONT_FAMILY.semiBold,
                                fontSize: 16,
                                color: selectedLocation.includes(index)
                                  ? "black"
                                  : "grey",
                              },
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )
               ||click === 2 && (
                <View
                  style={{
                    flex: 1,
                    marginHorizontal: 20,
                  }}
                >
                  {userData?.user?.paymode.map((item, index) => (
                    <View>
                      <TouchableOpacity
                        onPress={() => onSelect(index,'pay')}
                        activeOpacity={0.7}
                        style={{
                          flexDirection: "row",
                          margin: 10,
                          alignItems: "center",
                        }}
                      >
                        <View
                          style={{
                            justifyContent: "center",
                          }}
                        >
                          <CustomCheckbox
                          onToggle={ () => onSelect(index,'pay')}
                           checked={selectedPaymode.includes(index)}
                          />
                        </View>
                        <View
                          style={{
                            marginLeft: 10,
                          }}
                        >
                          <Text
                            style={[
                              {
                                fontFamily: FONT_FAMILY.semiBold,
                                fontSize: 16,
                                color: selectedPaymode.includes(index)
                                  ? "black"
                                  : "grey",
                              },
                            ]}
                          >
                            {item}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )
            )}
          </View>
        </View>
        <View style={{ backgroundColor: "white", padding: 10 }}>
        <NewButton text={'Apply'}   onPress={handleValidateDates} />
        
        </View>
      </UniversalModal>
    </View>
  );
};
const renderTransactions = ({ item }) => {
  return (
    <View style={{ borderBottomWidth: 0.5, marginVertical: 10 }}>
      <View style={InvoiceStyles.transactionRow}></View>
      <View style={{ justifyContent: "space-between", flexDirection: "row" }}>
        <View style={{ flexDirection: "row" }}>
          <Icon name="calendar-month-outline" size={15} color="grey" />
          <Text style={[InvoiceStyles.dateText]}>
            {moment(item?.BillDate).format("DD MMM YYYY")}
          </Text>
        </View>
        <Text style={[InvoiceStyles.voucherText, {}]}>
          Bill No: <Text style={InvoiceStyles.voucherBold}>{item.BillNo}</Text>
        </Text>
      </View>

      <View style={InvoiceStyles.transactionRow}>
        <Text
          style={[
            { color: "black", fontSize: 17, fontFamily: FONT_FAMILY.semiBold },
          ]}
        >
          {item.LocationName.toLowerCase().replace(
            /(^\s*\w|[\.\?\!]\s*\w)/g,
            (char) => char.toUpperCase()
          )}
        </Text>
        <View style={InvoiceStyles.creditContainer}>
          <Icon
            name={item.Amount >= 0 ? "arrow-bottom-left" : "arrow-top-right"}
            size={15}
            color={item.Amount >= 0 ? SECONDARY_COLOR : "red"}
          />
          <Text
            style={[
              InvoiceStyles.creditText,
              { color: item.Amount >= 0 ? SECONDARY_COLOR : "red" },
            ]}
          >
            ₹{isNaN(item.Amount) ? "0.00" : Math.abs(item.Amount)}{" "}
            {item.Amount >= 0 ? "Cr." : "Dr."}
          </Text>
        </View>
      </View>
      <View style={InvoiceStyles.transactionRow}>
        <Text numberOfLines={3} style={InvoiceStyles.narrationText}>
          {item.PayMode}
        </Text>
        <View style={InvoiceStyles.debitContainer}>
          <Text style={InvoiceStyles.voucherText}>
            Balance:{" "}
            <Text style={[InvoiceStyles.debitText, { color: "black" }]}>
              ₹{item.Balance}
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};
export default CardRecharge;

const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1, 1, 1]}
    renderItem={() => (
      <View style={InvoiceStyles.listcontainer}>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
          }}
        >
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
        </View>
        <View
          style={{
            justifyContent: "space-between",
            flexDirection: "row",
            marginVertical: 10,
          }}
        >
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
        </View>
        <ShimmerPlaceholder style={{ borderRadius: 10 }} />
      </View>
    )}
  />
);

// import React, {useState, useRef, useEffect} from 'react';
// import {
//   ActivityIndicator,
//   Text,
//   View,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   Image,
//   StatusBar,
//   StyleSheet,
//   Dimensions,
//   Alert,
//   Modal,
//   Platform,
//   Linking,
// } from 'react-native';
// import {getStatusBarHeight} from 'react-native-status-bar-height';
// import {PINK_COLOR, SECONDARY_COLOR} from '../../util/colors';
// import {moderateScale} from '../../util/scale';
// import {ENDPOINT, FONT_FAMILY} from '../../util/constant';
// import Button from '../../components/Button';
// import CrossIcon from '../../assets/svg/CrossIcon';
// import Recharge1 from '../../assets/svg/Recharge1';
// import {useSelector} from 'react-redux';
// import {getRechargeDataNew, getRechargeNewData} from './CardRechargeService';
// import {useIsFocused} from '@react-navigation/native';
// import * as api from '../../util/api';

// const CardRecharge = ({navigation}) => {
//   const [amountText, setAmountText] = useState('');
//   const [additionalAmountText, setAdditionalAmountText] = useState('');
//   const [rechargeBoxError, setRechargeBoxError] = useState('');
//   const [data, setData] = useState({pay_status: 'success'});
//   const [loading, setLoading] = useState(true);
//   const userData = useSelector(state => state?.auth?.userData);
//   const [date, setDate] = useState(null);
//   const [balance, setBalance] = useState();
//   const [closeModal, setClosemodal] = useState(false);
//   const focused = useIsFocused();

//   const getStatement = async () => {
//     try {
//       let response = await getRechargeDataNew(
//         userData?.data?.data[0]?.MemberID,
//         userData?.data?.token,
//       );

//       if (response && response.data) {
//         if (response.data.balance !== '') {
//           setBalance(`${response.data.balance.balance}`);
//           setDate(response.data.closing_date);
//         } else {
//           setData(response.data);
//           setBalance('0');
//           setDate(response.data.closing_date);
//         }
//       } else {
//         setBalance('0');
//       }
//     } catch (error) {
//       Alert.alert('coming soon');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getStatement();
//   }, [focused]);

//   const onChangeText = (text, type) => {
//     if (type === 'amountText') {
//       setAmountText(text);
//     } else if (type === 'additionalAmountText') {
//       setAdditionalAmountText(text);
//     }
//   };
//   const payNowAction = async () => {
//     try {
//       setLoading(true);

//       const payload = {
//         path: ENDPOINT.create_pay_order,
//         body: {
//           amount: amountText,
//         },
//         Token: userData?.data?.token,
//       };
//       console.log('-----------------------------');
//       let response = await api.javascriptPost(payload);
//       console.log(response, '---------------response---------------');

//       if (response?.data?.url) {
//         navigation.navigate('PaymentWebView', {
//           member_id: payload.member_id,
//           amount: payload.amount,
//           data: response.data,
//         });

//         setLoading(false);
//       } else if (!response.status) {
//         setLoading(false);

//         Alert.alert(response.message);
//       }
//     } catch (error) {
//       Alert.alert('Feature Coming Soon...');
//       setLoading(false);
//     }
//   };

//   const onSubmitButtonPress = () => {
//     if (Number(amountText) > 0) {
//       payNowAction();
//       setClosemodal(false);
//     } else {
//       setRechargeBoxError('Please enter additional amount');
//     }
//   };

//   const renderContent = () => (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: 'white',
//         paddingHorizontal: 20,
//         paddingVertical: 20,
//         borderTopEndRadius: 30,
//         borderTopLeftRadius: 30,
//       }}>
//       <View
//         style={{
//           flexDirection: 'row',
//           justifyContent: 'space-between',
//           paddingVertical: 10,
//         }}>
//         <View>
//           <Text
//             style={{
//               color: 'black',
//               fontSize: moderateScale(18),
//               fontWeight: 'bold',
//             }}>
//             Recharge
//           </Text>
//         </View>
//         <TouchableOpacity
//           onPress={() => {
//             setClosemodal(false);
//           }}
//           activeOpacity={0.5}
//           style={{
//             height: 30,
//             width: 30,
//             borderRadius: 15,
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}>
//           <CrossIcon />
//         </TouchableOpacity>
//       </View>

//       <Text style={{marginVertical: 10, fontSize: 18}}>
//         Card Recharge Amount
//       </Text>
//       <View
//         style={{
//           borderWidth: 1,
//           borderRadius: 10,
//           height: 50,
//           justifyContent: 'center',
//           paddingHorizontal: 10,
//           borderColor: '#dedede',
//         }}>
//         <TextInput
//           ref={input => (this.additionalAmount = input)}
//           name="Additional Amount"
//           placeholder="Enter Recharge Amount"
//           keyboardType="number-pad"
//           style={{color: 'black'}}
//           value={amountText}
//           onChangeText={value => onChangeText(value, 'amountText')}
//           placeholderTextColor={'#dedede'}
//         />
//       </View>
//       {rechargeBoxError && (
//         <Text style={{marginVertical: 10, color: 'red', fontSize: 14}}>
//           {rechargeBoxError}
//         </Text>
//       )}
//       <Button
//         text={'Submit'}
//         onPress={onSubmitButtonPress}
//         disabled={Number(amountText) <= 0}
//         height={50}
//       />
//     </View>
//   );

//   return (
//     <>
//       <StatusBar
//         backgroundColor={'transparent'}
//         translucent={true}
//         barStyle="dark-content"
//       />
//       <View style={styles.container}>
//         <View
//           style={{
//             flexDirection: 'row',
//             justifyContent: 'center',
//             alignItems: 'center',
//             width: '100%',
//           }}>
//           <Image
//             source={require('../../assets/images/AeptaLogo.png')}
//             style={{height: 30, width: 30, borderRadius: 15}}
//           />
//           <Text
//             style={{
//               color: 'black',
//               fontSize: 20,
//               marginBottom: 5,
//               marginLeft: 5,
//             }}>
//             MB Club
//           </Text>
//         </View>

//         <Text style={styles.header}>Card Recharge</Text>

//         <View style={styles.card}>
//           <View style={{width: '55%', justifyContent: 'flex-start'}}>
//             <View>
//               <Text
//                 style={{
//                   fontSize: moderateScale(20),
//                   fontFamily: FONT_FAMILY.Cinzel,
//                   color: 'black',
//                 }}
//                 numberOfLines={2}>
//                 Get your card recharge
//               </Text>
//             </View>
//             <View>
//               <Button
//                 text={'Recharge Now'}
//                 onPress={() => {
//                   setClosemodal(true);
//                   setAmountText('');
//                   setRechargeBoxError('');
//                 }}
//                 height={40}
//                 width={width / 2.5}
//               />
//             </View>
//           </View>
//           <View style={{width: '40%', transform: [{scale: 0.8}]}}>
//             <Recharge1 />
//           </View>
//         </View>

//         <View style={styles.transactionListHeaderStyle}>
//           <View>
//             <Text style={styles.transactionListHeaderText}>Member Details</Text>
//           </View>
//         </View>

//         <View
//           style={{
//             backgroundColor: 'white',
//             elevation: 5,
//             width: width - 40,
//             borderRadius: 10,
//             flex: 1,
//             marginBottom: 20,
//           }}>
//           <ScrollView showsVerticalScrollIndicator={false}>
//             <View
//               style={{
//                 paddingBottom: 15,
//                 justifyContent: 'center',
//                 paddingHorizontal: 20,
//                 paddingTop: 10,
//               }}>
//               <Text style={styles.headerStyle}>Name</Text>
//               <Text style={styles.textStyle}>
//                 {userData?.data?.data[0]?.DisplayName
//                   ? userData?.data?.data[0]?.DisplayName
//                   : 'N/A'}
//               </Text>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingBottom: 15,
//                 paddingHorizontal: 20,
//               }}>
//               <View style={{width: width / 2}}>
//                 <Text style={styles.headerStyle}>Member ID</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.MemberID
//                     ? userData?.data?.data[0]?.MemberID
//                     : 'N/A'}
//                 </Text>
//               </View>
//               <View style={{width: width / 2 - 30}}>
//                 <Text style={styles.headerStyle}>Status</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.Status
//                     ? userData?.data?.data[0]?.Status
//                     : 'N/A'}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingBottom: 15,
//                 paddingHorizontal: 20,
//               }}>
//               <View style={{width: width / 2}}>
//                 <Text style={styles.headerStyle}>Category</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.Catg_Name
//                     ? userData?.data?.data[0]?.Catg_Name
//                     : 'N/A'}
//                 </Text>
//               </View>

//               <View style={{width: width / 2 - 30}}>
//                 <Text style={styles.headerStyle}>C ID</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.SC_ID
//                     ? userData?.data?.data[0]?.SC_ID
//                     : 'N/A'}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingBottom: 15,
//                 paddingHorizontal: 20,
//               }}>
//               <View style={{width: width / 2}}>
//                 <Text style={styles.headerStyle}>Date of Birth</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.DOB
//                     ? userData?.data?.data[0]?.DOB
//                     : 'N/A'}
//                 </Text>
//               </View>
//               <View style={{width: width / 2 - 30}}>
//                 <Text style={styles.headerStyle}>Mobile</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.Phone
//                     ? userData?.data?.data[0]?.Phone
//                     : 'N/A'}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingBottom: 15,
//                 paddingHorizontal: 20,
//               }}>
//               <View style={{width: width / 2}}>
//                 <Text style={styles.headerStyle}>Email</Text>
//                 <Text style={styles.textStyle}>
//                   {userData?.data?.data[0]?.Email
//                     ? userData?.data?.data[0]?.Email
//                     : 'N/A'}
//                 </Text>
//               </View>
//             </View>

//             <View
//               style={{
//                 flexDirection: 'row',
//                 justifyContent: 'space-between',
//                 paddingBottom: 15,
//                 paddingHorizontal: 20,
//               }}>
//               <View style={{width: width / 1.2}}>
//                 <Text style={styles.headerStyle}>
//                   Balance as on {date ? date : 'N/A'}
//                 </Text>
//                 <Text style={styles.textStyle}>
//                   ₹{balance ? balance : '0.00'}
//                 </Text>
//               </View>
//             </View>
//           </ScrollView>
//         </View>
//       </View>

//       <Modal
//         animationType="slide"
//         visible={closeModal}
//         transparent={true}
//         // presentationStyle='pageSheet'
//         onRequestClose={() => {
//           setClosemodal(false);
//           setRechargeBoxError('');
//         }}>
//         <View
//           style={{
//             backgroundColor: 'transparent',
//             flex: 1,
//             paddingTop: Platform.OS === 'ios' ? 100 : 20,
//           }}>
//           {renderContent()}
//         </View>
//       </Modal>
//       {loading && (
//         <View
//           style={{
//             backgroundColor: 'rgba(0, 0,0, 0.3)',
//             flex: 1,
//             position: 'absolute',
//             top: 0,
//             bottom: 0,
//             left: 0,
//             right: 0,
//           }}>
//           <View
//             style={{
//               backgroundColor: 'transparent',
//               flex: 1,
//               alignItems: 'center',
//               justifyContent: 'center',
//             }}>
//             <ActivityIndicator
//               size="large"
//               color={SECONDARY_COLOR}
//               animating={loading}
//             />
//           </View>
//         </View>
//       )}
//     </>
//   );
// };

// const {height, width} = Dimensions.get('window');
// var styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     alignItems: 'center',
//     marginTop: Platform.OS === 'ios' ? 60 : getStatusBarHeight() + 30,
//   },
//   rowStyle: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingVertical: 8,
//   },
//   elevatedView: {
//     paddingHorizontal: 10,
//     backgroundColor: 'white',
//     flexDirection: 'column',
//     paddingVertical: 10,
//     marginHorizontal: 20,
//     marginBottom: 10,
//     marginTop: 6,
//     borderRadius: 10,
//     height: 220,
//     width: Dimensions.get('window').width - 20,
//     paddingHorizontal: 20,
//   },
//   titleText: {
//     color: PINK_COLOR,
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   titleValue: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   dataNotFoundText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   header: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: 'black',
//     marginTop: 15,
//   },
//   card: {
//     backgroundColor: '#F5FFE9',
//     height: height / 4,
//     width: width - 40,
//     marginTop: 30,
//     borderRadius: 20,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     paddingHorizontal: 20,
//     alignItems: 'center',
//   },
//   transactionListHeaderStyle: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     width: width - 40,
//     paddingVertical: 20,
//   },
//   transactionListHeaderText: {
//     color: 'black',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   cardView: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingHorizontal: 10,
//   },
//   indexView: {
//     height: 50,
//     width: 50,
//     borderRadius: 10,
//     backgroundColor: '#79CA14',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   indexText: {
//     color: 'white',
//     fontSize: moderateScale(18),
//     fontWeight: 'bold',
//   },
//   locationName: {
//     fontSize: moderateScale(16),
//     fontWeight: 'bold',
//     paddingHorizontal: 10,
//   },
//   amountText: {
//     paddingHorizontal: 10,
//   },
//   headerStyle: {
//     color: '#5D5D5D',
//     fontSize: moderateScale(12),
//     paddingBottom: 5,
//   },
//   textStyle: {
//     color: 'black',
//     fontWeight: 'bold',
//     fontSize: moderateScale(14),
//     fontFamily: FONT_FAMILY.bold,
//   },
// });

// export default CardRecharge;
