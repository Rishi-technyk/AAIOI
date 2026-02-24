import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Header from '../../components/Header';
import { Toast } from 'react-native-toast-notifications';
import { javascriptGet } from '../../util/api';
import { DOMAIN,  } from '../../util/constant';
import { RootState } from '../../store/store';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';


type Props=NativeStackScreenProps<AppStackParamList,'InvoiceHallDetails'>
const InvoiceHallDetails:React.FC<Props> = ({ route }) => {

  const userData = useSelector((state:RootState) => state.auth);

  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchInvoice();
  }, [route.params.id]);

  
  console.log( invoice, '---------------------- invoice ---------------------');

  const cancelVenue = (id:number|string) => {
    const myHeaders = new Headers();
    myHeaders.append('Authorization', `Bearer ${userData?.token}`);
    const formdata = new FormData();
    formdata.append('ban_charge_id', id);

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: formdata,
      redirect: 'follow',
    };

    fetch(`${DOMAIN.BASE}member/banquet/cancel`, requestOptions)
      .then(response => response.json())
      .then(async json => {
        if (json?.status == true) {
          fetchInvoice();
          Toast.show(json.message || 'Venue Cancelled Successfully.', {
            type: 'success',
          });
        } else {
          // setisLoading(false)
          Toast.show(json.msg || 'Unable to cancel Venue', { type: 'danger' });
          console.log('API Failed');
        }
      })
      .catch(error => console.error(error));
  };

  const canCancelBooking = (() => {
    if (!invoice) return false;

    const today = moment().startOf('day');
    const functionDate = moment(invoice.funDate, 'YYYY-MM-DD');

    return (
      functionDate.isAfter(today) && // future date only
      invoice.status === 'Active' &&
      invoice.payment_status === 'Paid'
    );
  })();

  const fetchInvoice = async () => {
    const json = await javascriptGet({
      path: `member/banquet/transaction/${route.params.id}`,
      Token: userData.token,
    });
    if (json?.status) {
      setInvoice(json.data);
      setItems(json.data.bookings);
    }
  };

  if (!invoice) return null;

  const totalAmount = items.reduce((sum, i) => sum + Number(i.total), 0);
  const canCancelItem = (item:any) => {
    console.log( item, '---------------------- item ---------------------');
    const today = moment().startOf('day');
    const functionDate = moment(item.funDate, 'YYYY-MM-DD');
console.log( today,functionDate, '---------------------- today,functionDate ---------------------');
    return (
      functionDate.isAfter(today) &&
      item.status === 'Active' &&
      item.payment_status === 'Paid'
    );
  };

  const InfoRow = ({ label, value, bold, danger, success }) => (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text
        style={[
          styles.value,
          bold && { fontWeight: '700' },
          danger && { color: '#DC3545' },
          success && { color: '#28A745' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
console.log( invoice, '---------------------- invoice ---------------------');
  return (
    <View style={styles.container}>
      <Header title="Invoice Details" />

      <ScrollView>
        {/* Booking Info */}
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.cardTitle}>Booking #{invoice.booking_ID}</Text>

            <View style={styles.badge(invoice.status)}>
              <Text style={styles.badgeText}>{invoice.status || 'Pending'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment</Text>
            <Text
              style={[
                styles.value,
                {
                  color:
                    invoice.payment_status === 'Paid' ? '#28A745' : '#DC3545',
                },
              ]}
            >
              {invoice.payment_status}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Function Date</Text>
            <Text style={styles.value}>
              {moment(invoice.funDate).format('DD MMM YYYY')}
            </Text>
          </View>
        </View>
        <FlatList
          data={items}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => {
            const refundAmount =
              Number(item.total) - Number(item.cancellation_deducation || 0);
console.log( canCancelItem(item), '---------------------- canCancelItem(item) ---------------------');
            return (
              <View style={styles.itemCard}>
                {/* HEADER */}
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>{item.venue.name}</Text>

                  <View style={styles.badge(item.status)}>
                    <Text style={styles.badgeText}>{item.status ||'Pending'}</Text>
                  </View>
                </View>

                {/* DETAILS */}
                <InfoRow label="Session" value={item.session.name} />
                <InfoRow label="Charges" value={`₹ ${item.charges}`} />
                <InfoRow label="GST" value={`₹ ${item.gst_amount}`} />
                <InfoRow
                  label="Security"
                  value={`₹ ${item.security_deposit}`}
                />

                <View style={styles.divider} />

                <InfoRow label="Item Total" value={`₹ ${item.total}`} bold />

                {/* ✅ CANCEL BUTTON (ONLY IF ALLOWED) */}
                {canCancelItem(item) && (
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() =>
                      Alert.alert(
                        'Cancel Venue',
                        'Are you sure you want to cancel this venue?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes',
                            style: 'destructive',
                            onPress: () => cancelVenue(item.id),
                          },
                        ],
                      )
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color="#FFF" />
                    <Text style={styles.cancelText}>Cancel Venue</Text>
                  </TouchableOpacity>
                )}

                {/* 🔴 CANCELLATION SUMMARY */}
                {item.status === 'Cancelled' && (
                  <View style={styles.cancelSummary}>
                    <Text style={styles.cancelTitle}>Cancellation Summary</Text>

                    <InfoRow
                      label={`Cancellation (${item.cancellation_per}%)`}
                      value={`₹ ${item.cancellation_amt}`}
                    />
                    <InfoRow
                      label="GST on Cancellation"
                      value={`₹ ${item.cancellation_GST_amt}`}
                    />
                    <InfoRow
                      label="Total Deduction"
                      value={`₹ ${item.cancellation_deducation}`}
                      danger
                    />

                    <View style={styles.divider} />

                    <InfoRow
                      label="Refund Amount"
                      value={`₹ ${refundAmount.toFixed(2)}`}
                      success
                    />

                    <Text style={styles.cancelDate}>
                      Cancelled on{' '}
                      {moment(item.cancellation_date).format(
                        'DD MMM YYYY, hh:mm A',
                      )}
                    </Text>
                  </View>
                )}
              </View>
            );
          }}
        />

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Grand Total</Text>
          <Text style={styles.totalValue}>₹ {totalAmount.toFixed(2)}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default InvoiceHallDetails;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  /* ---------- Cards ---------- */

  card: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  itemCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },

  totalCard: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 18,
    borderRadius: 14,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* ---------- Headers ---------- */

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4184ff',
  },

  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d4184ff',
    // width: '80%',
  },

  /* ---------- Rows ---------- */

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },

  label: {
    fontSize: 13,
    color: '#777',
  },

  value: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEE',
    marginVertical: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },

  totalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1d4184ff',
  },

  /* ---------- Badges ---------- */

  badge: status => ({
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor:
      status === 'Completed'
        ? '#28A745'
        : status === 'Pending'
        ? '#FFC107'
        : status === 'Active'
        ? '#28A745'
        : '#DC3545',
  }),

  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
  bottomBar: {
    backgroundColor: '#FFF',
  },

  cancelButton: {
    backgroundColor: '#DC3545',
    borderRadius: 10,
    padding: 10,
    // flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelBtn: {
    marginTop: 12,
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 8,
  },

  cancelSummary: {
    marginTop: 14,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#F5C2C7',
  },

  cancelTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#DC3545',
  },

  cancelDate: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Image ,FlatList,Alert} from 'react-native';
// import { useWindowDimensions } from 'react-native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import { useSelector ,useDispatch} from 'react-redux';
// import { useRoute } from '@react-navigation/native';
// import moment from 'moment';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// // import Share from 'react-native-share';
// import { join } from 'redux-saga/effects';
// import Header from '../../components/Header';

// const InvoiceHallDetails = ({ navigation }) => {
//     const { width } = useWindowDimensions();
//     const route = useRoute();
//     const userData = useSelector(state => state.auth);
//     const [room_details, setroom_details] = useState([])
//     const [memberID, setmemberID] = useState('')
//     const [chartID, setchartID] = useState('')
//     const [checkin, setcheckin] = useState('')
//     const [checkout, setcheckinout] = useState('')
//     const[booking_number,setbooking_number] = useState('')
//     const[booking_status,setbooking_status] = useState('')
//     const[payment_status,setpayment_status] = useState('')
//     const[name,setname] = useState('')
//     const[email,setemail] = useState('')
//     const[mobile,setmobile] = useState('')
//     const[address,setaddress] = useState('')
//     const[total,settotal] = useState('')
//     const[occupant,setoccupant] = useState('')
//     const[Function,setFunction] = useState('')
//     const[noofPerson,setnoofPerson] = useState('')
//       const[tog,settog] = useState(false)
//     const [id, setid] = useState('')

//     const handleBackPress = () => {
//         {
//             // navigation.navigate('Dashboard')
//             navigation.navigate('Roomlist',{toggle: 'hall'})
//         }
//     };

//     useEffect(() => {
//         invoice_details();

//       }, []);

//     const invoice_details =() =>{
//         const myHeaders = new Headers();
//         myHeaders.append("Authorization", `Bearer ${userData?.token}`);

//         const requestOptions = {
//           method: "GET",
//           headers: myHeaders,
//           redirect: "follow"
//         };

//         fetch("https://gvicc.in/gvicc/api/member/banquet/transaction/"+route.params.id, requestOptions)
//         .then((response) => response.json())
//         .then(async (json) => {
//           console.log("JSon---------------------------------", json)
//           if (json?.status == true) {
//  setroom_details(json.data.bookings)
//     setmemberID(json.data.memberID)
//     setchartID(json.data.cardID)
//     setcheckin(json.data.funDate)
//     setcheckinout(json.data.checkout)
//     setpayment_status(json.data.payment_status)
//     setbooking_status(json.data.status)
//     setbooking_number(json.data.booking_ID)
//     setname(json.data.memberName)
//     setemail(json.data.memberEmail)
//     setmobile(json.data.memberMobile)
//     setaddress(json.data.address)
//     settotal(json.data.bookings[0].total)
//     setoccupant(json.data.occupant.name)
//     setFunction(json.data.function.name)

//     setnoofPerson(json.data.noofPerson)
//             console.log(json.status)
//                const today = moment().startOf('day'); // current date without time
//                                   const checkIn = moment(json.data.funDate, 'YYYY-MM-DD');

//                         const isAfterCheckOut = today.isAfter(checkIn, 'day');
//                                   if(isAfterCheckOut){
//                                     settog(true)
//                                   }
//           }
//           else {
//             // setisLoading(false)

//             console.log('API Failed')
//           }
//         })
//           .catch((error) => console.error(error));
//       }

//       const totalRoomCharge = room_details.reduce((total, room) => {
//         return total + parseFloat(room.total);
//       }, 0);

//     const shareFun1 = async () => {

//         // const k = String(uri)
//         // console.log("kakajsjn",k)

//         let options = await {

//           html: `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//               <meta charset="UTF-8">
//               <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               <title>Document</title>
//           </head>
//           <style type="text/css">

//               .m-0{
//                   margin: 0px;
//               }
//               .p-0{
//                   padding: 0px;
//               }
//               .pt-5{
//                   padding-top:5px;
//               }
//               .mt-10{
//                   margin-top:10px;
//               }
//               .text-center{
//                   text-align:center !important;
//               }
//               .w-100{
//                   width: 100%;
//               }
//               .w-50{
//                   width:50%;
//               }

//               .w-85{
//                   width:85%;
//               }
//               .w-15{
//                   width:15%;
//               }
//               .logo img{
//                   width:45px;
//                   height:45px;
//                   padding-top:30px;
//               }
//               .logo span{
//                   margin-left:8px;
//                   top:19px;
//                   position: absolute;
//                   font-weight: bold;
//                   font-size:25px;
//               }
//               .gray-color{
//                   color:#5D5D5D;
//               }
//               .text-bold{
//                   font-weight: bold;
//               }
//               .border{
//                   border:1px solid black;
//               }
//               table tr,th,td{
//                   border: 1px solid #d2d2d2;
//                   border-collapse:collapse;
//                   padding:7px 8px;
//               }
//               table tr th{
//                   background: #F4F4F4;
//                   font-size:15px;
//                   width : 100 %;
//               }
//               table tr td{
//                   font-size:13px;
//               }
//               table{
//                   border-collapse:collapse;
//               }
//               .box-text p{
//                   line-height:10px;
//               }
//               .float-left{
//                   float:left;
//               }
//               .total-part{
//                   font-size:16px;
//                   line-height:12px;
//               }
//               .total-right p{
//                   padding-right:20px;
//               }

//               .section{
//               border: 4px solid #ccc;
//               padding: 50px;
//               margin-top: 20px;
//               margin-bottom: 20px;
//               }
//               .row{
//                   text-align: float;
//                   margin-top: 20px;
//                   margin-bottom: 20px;
//               }

//               .right{
//                   text-align: end;
//               }

//               .left{
//                   text-align: start;
//               }

//           </style>
//           <body>

//           <div class="section">
//               <h2 class="text-center m-0 p-0">Invoice</h2>

//           <div class="row">
//               <div class="col-6 left">
//                   <p><Strong>Member ID : ${memberID}</Strong></p>
//                   <p><Strong>Card ID : ${chartID}</Strong></p>

//               </div>
//               <div class="col-6 right">
//                   <p><Strong>Booking ID</Strong>- <Strong>${booking_number}</Strong></p>
//                   <p><Strong>Function Date</Strong>-<Strong>${moment(checkin).format("DD-MM-YYYY")}</Strong></p>
//               </div>
//           </div>
//           <div class="row">

//           <div class="row">
//               <div class="col-6 left">
//                   <p><strong>Member Info:</strong></p>
//                   <p>Name : ${name}</p>
//                   <p>Email : ${email}</p>
//                   <p>Contact : ${mobile}</p>

//               </div>
//               <div class="row">
//               <div class="col-6 left">
//                   <p><strong>Booking Info:</strong></p>
//                   <p>Booked For : ${occupant}</p>
//                   <p>Function Type : ${Function}</p>
//               </div>
//           </div>
//           </div>

//           <div class="table-section bill-tbl w-100 mt-15">
//           <table class="table w-100 mt-15">
//               <tr align="center">
//                   <th>Session Name</th>
//                   <th>Venue Name</th>
//                   <th>Charge</th>
//                   <th>GST (18%)</th>
//                   <th>Security Deposit</th>
//                   <th>Total</th>
//               </tr>

//               ${room_details.map((item) => {
//                 return `
//                 <tr align="center">
//                     <td>${item.session.name}</td>
//                     <td>${item.venue.name}</td>
//                     <td>₹ ${item.charges}.00</td>
//                     <td>₹ ${item.gst_amount}.00</td>
//                     <td>₹ ${item.security_deposit}.00</td>
//                     <td>₹ ${item.total}.00</td>
//                 </tr>`;
//             }).join('')}

//               <tr align="right">
//                   <td colspan="7">
//                       <div class="row">
//                           <div class="col-6"></div>
//                           <div class="col-6 text-right">
//                               <p><strong>Grand Total :</strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
//                               ₹ ${totalRoomCharge}.00
//                               </p>
//                           </div>
//                       </div>
//                   </td>
//               </tr>
//           </table>
//       </div>

//           </div>
//           </body>
//           </html>`,
//           fileName: booking_number,
//           // fileName: name+"_"+moment(daTe).format("DD-MM-YYYY")+"_report",
//           //File directory
//           directory: 'Documents',

//           base64: true,
//        //   url:file.filepath
//         };
//       console.log(";;",options.fileName)
//         let file = await RNHTMLtoPDF.convert(options)
//         console.log(file)
//         const s = {
//           fileName:"My-test.pdf",
//           document:file.base64
//         }
//         const l = "data:application/pdf;base64,"+file.base64
//         console.log("kkkkkkkkkkkkkkkkk",l)
//        // open(file.filePath)
//        //onUploadFileChange(file)
//        // fileToBase64(options.fileName,file.filePath)
//        const shareOptions = {
//         social: Share.Social.WHATSAPP,
//         title: 'Invoice PDF',
//         url: `file://${file.filePath}`,
//         type: 'application/pdf',

//     };
//       //   Share.open({
//       //     title: "This is my report ",
//       //    // message: "Message:",
//       //     url: l,
//       //   //  subject: "Report",
//       // })
//       Share.open(shareOptions)
//         // Share.open(file)
//         //     .then((res) => {
//         //         console.log(res);
//         //     })
//         //     .catch((err) => {
//         //         err && console.log(err);
//         //     });
//       }

//     const roomdelete =(id)=>{
//       const myHeaders = new Headers();
//     myHeaders.append("Authorization",`Bearer ${userData?.token}` );
//     const formdata = new FormData();
//     formdata.append("ban_charge_id", id);

//     const requestOptions = {
//       method: "POST",
// headers: myHeaders,
// body: formdata,
//       redirect: "follow"
//     };

//     fetch("https://gvicc.in/gvicc/api/member/banquet/cancel", requestOptions)
//     .then((response) => response.json())
//     .then(async (json) => {
//       console.log("JSon---------------------------------", json)
//       if (json?.status == true) {
//           invoice_details()

//     console.log(json.status)
//       }
//       else {
//         // setisLoading(false)

//         console.log('API Failed')
//       }

//     })
//       .catch((error) => console.error(error));
//     }

//     return (
//         <View style={styles.container} >

//       <Header  title={'Invoice Details'}/>
//             <ScrollView showsVerticalScrollIndicator={false}>

//                 <View style={styles.bookingDetailsContainer}>
//                     <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
//                         <Text style={styles.title}>Booking Details</Text>
//                         <View style={{ borderColor: '#F3F3F3', borderWidth: 1, padding: 5, paddingHorizontal: '5%', borderRadius: 5, backgroundColor: '#F6FFEA' }}><Text style={{ fontSize: 11, color: '#5B5F6B' }}>{payment_status}</Text></View>
//                     </View>

//                     <View style={[styles.OrderCard]}>
//                           <View style={styles.itemRow}>
//                                                     <Text style={styles.itemText1}>Booking ID :</Text>
//                                                     <Text style={styles.itemTextright1}>{booking_number}</Text>
//                                                 </View>
//                                                 <View style={styles.itemRow}>
//                                                     <Text style={styles.itemText1}>Status :</Text>
//                                                     <Text style={styles.itemTextright1}>{booking_status}</Text>
//                                                 </View>
//                                                 <View style={styles.itemRow}>
//                                                     <Text style={styles.itemText1}>Date :</Text>
//                                                     <Text style={styles.itemTextright1}>{moment(checkin).format("DD-MM-YYYY")}</Text>
//                                                 </View>
//                                                  <View style={styles.itemRow}>
//                                                     <Text style={styles.itemText1}>Member ID :</Text>
//                                                     <Text style={styles.itemTextright1}>{memberID}</Text>
//                                                 </View>

//                     </View>
//                     <View style={[styles.OrderCard]}>

//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Name :</Text>
//                             <Text style={styles.itemTextright1}>{name}</Text>
//                         </View>
//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Email id :</Text>
//                             <Text style={styles.itemTextright1}>{email}</Text>
//                         </View>
//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Mobile No :</Text>
//                             <Text style={styles.itemTextright1}>{mobile}</Text>
//                         </View>
//                         {/* <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Address :</Text>
//                             <Text style={styles.itemTextright1}>{address}</Text>
//                         </View> */}
//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Function Date :</Text>
//                             <Text style={styles.itemTextright1}>{moment(checkin).format("DD-MM-YYYY")}</Text>
//                         </View>
//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Booked For:</Text>
//                             <Text style={styles.itemTextright1}>{occupant}</Text>
//                         </View>
//                         <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Function Type :</Text>
//                             <Text style={styles.itemTextright1}>{Function}</Text>
//                         </View>
//                         {/* <View style={styles.itemRow}>
//                             <Text style={styles.itemText1}>Check Out :</Text>
//                             <Text style={styles.itemTextright1}>{moment(checkout).format("DD-MM-YYYY")}</Text>
//                         </View> */}
//                     </View>
//                     <Text style={styles.title}>Items</Text>

//                 </View>
//                 <FlatList
//           data={room_details}
//           renderItem={({ item, index, }) => (
//       <View style={[styles.OrderCard, { marginHorizontal: '4%', paddingVertical: '4%', }]}>
//        <View style={{flexDirection:"row",alignSelf:"flex-start",alignItems:"center",justifyContent:"space-between",width:"95%"}}>
//         <Text style={[styles.title, { marginHorizontal: "3%", marginBottom: '2%',fontSize: 15, fontWeight: 400 ,width:"80%"}]}>{item.venue.name}</Text>
//         {payment_status == "Paid" ? tog == true ? null : <TouchableOpacity onPress={() => Alert.alert(
//                             "Alert",
//                             "Do you want to Delete it ?",
//                             [
//                                 {
//                                     text: "No",
//                                     onPress: () => console.log("No Pressed"),
//                                     style: "cancel"
//                                 },
//                                 { text: "Yes", onPress: () => roomdelete(item.id)  }
//                             ]
//                         )}  style={{alignSelf:"flex-end"}}>
//         <Ionicons name="trash-bin-sharp" size={30} color={'red'} />
//         </TouchableOpacity>  : null}
//         </View>
//         <View style={styles.itemRow}>
//           <Text style={styles.itemText}>Session : {item.session.name}</Text>
//           {/* <Text style={[styles.itemTextright, {  }]}>Venue : {item.venue.name}</Text> */}
//         </View>
//         <View style={styles.itemRow}>
//           <Text style={styles.itemText}>No. of Person : {noofPerson}</Text>
//           <Text style={[styles.itemTextright]}>Charges : {"₹ "+Number(item.charges).toFixed(2)}</Text>
//         </View>
//         <View style={styles.itemRow}>
//           <Text style={styles.itemText}>GST (%) : {item.gst_per}</Text>
//           <Text style={styles.itemTextright}>GST Amount : {"₹ "+Number(item.gst_amount).toFixed(2)}</Text>
//         </View>
//         <View style={styles.itemRow}>
//           <Text style={styles.itemText}>{"Security Deposit"} : {"₹ "+Number(item.security_deposit).toFixed(2)}</Text>
//           <Text style={styles.itemTextright}>Total Amount : {"₹ "+Number(item.total).toFixed(2)}</Text>
//         </View>
//           {item.status == "Cancelled" ? <View style={{alignSelf:"flex-start",marginHorizontal:"2%"}}>
//                      <View style={styles.itemRow}>
//                                     <Text style={styles.itemText4}>Cancellation Amt :</Text>
//                                     <Text style={styles.itemTextright1}>₹ {Number(item.cancellation_amt).toFixed(2)}</Text>
//                                 </View>
//                                 <View style={styles.itemRow}>
//                                     <Text style={styles.itemText4}>GST On Cancellation :</Text>
//                                     <Text style={styles.itemTextright1}>₹ {Number(item.cancellation_GST_amt).toFixed(2)}</Text>
//                                 </View>
//                                 <View style={styles.itemRow}>
//                                     <Text style={styles.itemText4}>Total Deduction :</Text>
//                                     <Text style={styles.itemTextright1}>₹ {Number(item.cancellation_deducation).toFixed(2)}</Text>
//                                 </View>
//                                 <View style={styles.itemRow}>
//                                     <Text style={styles.itemText4}>Cancellation Date :</Text>
//                                     <Text style={styles.itemTextright1}>{moment(item.cancellation_date).format("DD-MM-YYYY")}</Text>
//                                 </View>

//                 </View> : null}
//       </View>)}/>

//                 <View style={styles.totalContainer}>
//                     <Text style={styles.totalText}>Total :</Text>
//                     <Text style={styles.totalAmount}>{ "₹ "+Number(totalRoomCharge).toFixed(2)}</Text>
//                 </View>

//                {/* <TouchableOpacity onPress={() => shareFun1()} style={styles.payButton}>
//                     <Text style={styles.payButtonText}>Download</Text>
//                 </TouchableOpacity>  */}

//             </ScrollView>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { flex: 1, },
//     header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#000' },
//     bookingDetailsContainer: { marginBottom: 10, paddingHorizontal: '4%', paddingVertical: '5%', backgroundColor: 'white' },
//     title: { fontSize: 18, color: '#000000', fontWeight: '600', marginBottom: 10 },
//     detailsCard: { padding: 16, borderWidth: 1, borderRadius: 8, borderColor: '#ccc', marginBottom: 20 },
//     itemsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
//     itemCard: { padding: 16, borderWidth: 1, borderRadius: 8, borderColor: '#ccc', marginBottom: 20 },
//     itemTitle: { fontWeight: 'bold', marginBottom: 10 },
//     totalContainer: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginHorizontal: '5%',
//         marginVertical: '3%',
//         marginBottom: '5%',
//         padding: '4%',
//         borderWidth: 1,
//         backgroundColor: 'white',
//         width: '90%', alignSelf: 'flex-end',
//         borderColor: '#B3B3B3',
//         borderRadius: 10,
//         shadowColor: "#000",
//         shadowOffset: {
//             width: 0,
//             height: 2
//         },
//         shadowOpacity: 0.25,
//         shadowRadius: 4,
//         elevation: 5,

//     },
//     totalText: { fontWeight: '600', color: '#000', fontSize: 18 },
//     totalAmount: { fontSize: 18, color: '#000' },
//     payButton: { backgroundColor: '#7AC915', paddingVertical: '3%', paddingHorizontal: 10, marginBottom: '10%', width: '92%', alignSelf: 'center', borderRadius: 10, alignItems: 'center' },
//     payButtonText: { color: '#000', fontWeight: '500', fontSize: 18 },

//     OrderCard: {
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         borderWidth: 0.8,
//         borderColor: '#A8A8A8',
//         backgroundColor: '#fff',
//         borderRadius: 5,
//         paddingHorizontal: '2%',
//         paddingVertical: '2%',
//         marginVertical: '2%',
//     },
//     itemRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginVertical: 2.5, width: '95%'
//     },
//     itemText: {
//         fontSize: 13,
//         borderWidth: 0, marginRight: '2%',
//         textAlign: "left",
//         color: '#484C52',
//         width: '50%',
//         fontFamily: 'Poppins-Regular',
//     },
//     itemTextright: {
//         fontSize: 13,
//         borderWidth: 0,
//         textAlign: 'left',
//         color: '#363636',
//         //marginLeft:'4%',
//         width: '50%',
//         fontFamily: 'Poppins-Regular',
//     },

//     itemText1: {
//         fontSize: 14,
//         marginRight: '2%',
//         textAlign: "left",
//         color: '#484C52',
//         width: '35%',
//         fontWeight: '500',
//         // fontFamily: 'Poppins-Regular',
//     },
//     itemTextright1: {
//         fontSize: 14,
//         fontFamily: 'Poppins-Regular',
//         textAlign: 'left',
//         color: '#5B5B5B',

//         width: '65%'
//     },
//     itemTextG: {
//         fontSize: 14,
//         marginRight: '2%',
//         textAlign: "left",
//         color: '#484C52',
//         // width: '40%',
//         fontFamily: 'Poppins-Regular',
//     },
//      itemText4: {
//         fontSize: 14,
//         marginRight: '2%',
//         textAlign: "left",
//         color: '#484C52',
//         width: "50%",
//         // fontWeight: '500',
//         // fontFamily: 'Poppins-Regular',
//     },
// });

// export default InvoiceHallDetails;
