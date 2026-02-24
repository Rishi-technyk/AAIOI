import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Image,
  Linking,
  Alert,
  AppState,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '../components/Header';
import {
  RefreshControl,
  ScrollView,
} from 'react-native-gesture-handler';
import {
  DARK_BLUE,
  LIGHT_GREEN,
  SECONDARY_COLOR,
  FONT_FAMILY,
} from '../util/colors';
import InvoiceStyles from '../Styles/InvoiceStyle';
import TransactionBoxImage from '../../assets/svg/TransactionHistory';
import { useSelector } from 'react-redux';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import {
  getStatement,
  useStatments,
  useTransactions,
} from '../services/ViewStatementService';
import DatePickerComponent from '../components/DatePicker';
import NewButton from '../components/Button';
import { Card } from 'react-native-paper';
import { Toast } from 'react-native-toast-notifications';
import UniversalModal from '../components/UniversalModal';
import { CustomCheckbox } from '../components/CustomCheckBox';
import { javascriptPost } from '../util/api';
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const ViewStatement = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const [startDate, setStartDate] = useState(null);
  const userData = useSelector(state => state.auth);
  const [endDate, setEndDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const [amountheading, setAmountheading] = useState('');
  const [Inputerror, setInputError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedPaymode, setSelectedPaymode] = useState([]);
  const [location, setLocation] = useState([]);
  const [paymode, setaPaymode] = useState([]);
  const [click, setClick] = useState(0);
  const [loading, setLoading] = useState(false);
console.log( amountheading, '---------------------- amountheading ---------------------');
  const { data, isLoading, error, refetch } = useTransactions(
    startDate,
    endDate,
    userData,
    paymode,
    location,
  );
  const statmentData = useStatments(userData);
  const onSelect = (ind, type) => {
    if (selectedLocation?.includes(ind) && !type) {
      setSelectedLocation(selectedLocation.filter(item => item !== ind));
    } else if (selectedPaymode?.includes(ind) && type == 'pay') {
      setSelectedPaymode(selectedPaymode.filter(item => item !== ind));
    } else if (type == 'pay') {
      setSelectedPaymode([...selectedPaymode, ind]);
    } else {
      setSelectedLocation([...selectedLocation, ind]);
    }
  };

  const CreditAmt = parseFloat(
    data?.data
      ?.reduce((acc, record) => {
        return acc + parseFloat(record.credit_amt);
      }, 0)
      .toFixed(2),
  );
  const DebitAmt = parseFloat(
    data?.data
      ?.reduce((acc, record) => {
        return acc + parseFloat(record.debit_amt);
      }, 0)
      .toFixed(2),
  );
  const handleValidateDates = () => {
    Toast.hideAll();
    let temp = userData?.user?.location;
    let pay = userData?.user?.paymode;
    if (tempEndDate && tempStartDate && !selectedLocation.length) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      setShowModal(false);
      setLocation(selectedLocation.map(index => temp[index]));
    } else if (selectedLocation.length) {
      setLocation(selectedLocation.map(index => temp[index]));
      setaPaymode(selectedPaymode.map(index => pay[index]));

      setStartDate(null);
      setEndDate(null);
      setShowModal(false);
    } else if (selectedPaymode.length) {
      setLocation(selectedLocation.map(index => temp[index]));
      setaPaymode(selectedPaymode.map(index => pay[index]));

      setStartDate(null);
      setEndDate(null);
      setShowModal(false);
    } else {
      Toast.show('Please apply atleast one filter.', {
        type: 'warning',
      });
    }
  };

  const showDatepickerModal = () => {
    setTempEndDate(null);
    setTempStartDate(null);
    setShowModal(true);
  };
  const openUPILink = async url => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url); // 🚀 Opens in UPI app or browser
      } else {
        Alert.alert(
          'Not Supported',
          'No app found to handle this payment link.',
        );
      }
    } catch (err) {
      console.error('Error opening UPI link:', err);
      Alert.alert(
        'Error',
        'Something went wrong while opening the payment link.',
      );
    }
  };
  const payNowAction = async () => {
    if (!amountheading || !/^\d+$/.test(amountheading)) {
      setInputError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const apiRequestObject = {
        path: 'member/create_invoice_pay_order',
        body: {
          type: 'Subscription',
          amount: amountheading,
        },
        Token: userData?.token,
      };

      const response = await javascriptPost(apiRequestObject);
console.log( response, '---------------------- response ----Subscription----------------',amountheading);
      setLoading(false);
      if (response && response.data && response.data.razorpayKey) {
        if (response && response.data.razorpayKey) {
         navigation.navigate('UniversalPayment', {
             type:'Bill',
           
            orderData:response?.data,
          });
        }
      } else if (!response.status) {
        setLoading(false);

        Alert.alert(response.message);
        //   setError(response.message || 'Error in API response');
      }
      setLoading(false);
      setAmountheading('');
    } catch (error) {
      Alert.alert('Network error');
      setLoading(false);
    } finally {
      setAmountheading('');
      setLoading(false);
    }
  };

  const onApply = ind => {
    setClick(ind);
    ind
      ? (setTempEndDate(null), setTempStartDate(null))
      : (setSelectedPaymode([]), setSelectedLocation([]));
  };
useEffect(()=>{  
  if(statmentData?.data?.bill_amount>0){
      setAmountheading(statmentData?.data?.bill_amount.toString())
    }},[statmentData?.data?.bill_amount])
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // 🔄 Call API to check txn status here
        statmentData.refetch();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <Header
        title={'Subscription'}
        OpenDropDawn={showDatepickerModal}
        isMulti={true}
        isDawnload={true}
      />
      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              refetch(), setStartDate(null), setEndDate(null);
              statmentData.refetch();
            }}
            tintColor={SECONDARY_COLOR}
            refreshing={isLoading}
            colors={[DARK_BLUE]}
          />
        }
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: DARK_BLUE }}
        contentContainerStyle={{ flexGrow: 1, backgroundColor: 'white' }}
        stickyHeaderIndices={[1]}
      >
        <View style={InvoiceStyles.container}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  fontFamily: FONT_FAMILY.bold,
                  color: "white",
                }}
              >
                Current Outstanding:
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: FONT_FAMILY.normal,
                  color: "grey",
                }}
              >
                (As per last bill)
              </Text>
            </View>
            <Text
              style={[
                InvoiceStyles.moneyText,
                {
                  fontSize: 20,
                  color:
                    statmentData?.data?.bill_amount > 0
                      ? "red"
                      : SECONDARY_COLOR,
                },
              ]}
            >
              {statmentData?.data?.bill_amount < 0 ? "- " : ""}₹
              {Math.abs(statmentData?.data?.bill_amount ?? 0).toFixed(2)}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: LIGHT_GREEN,
              borderRadius: 20,
              padding: 10,
              paddingHorizontal: 15,
            }}
          >
            <View style={InvoiceStyles.svg}>
              <TransactionBoxImage style={{ scale: 1 }} />
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 5,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <Icon
                  name="card-account-details-star"
                  size={20}
                  color={DARK_BLUE}
                />
                <Text style={InvoiceStyles.text}>A/C Summary</Text>
              </View>

              <View>
                {statmentData?.data?.pdf && (
                  <NewButton
                    text={'View Bill'}
                    onPress={() =>
                      statmentData?.data?.pdf
                        ? navigation.navigate('PDFView', {
                            url: statmentData?.data?.pdf,
                            title: 'Statement',
                          })
                        : Toast.show('No Bill genrated.')
                    }
                  />
                )}
              </View>
            </View>

            <View
              style={{
                flex: 1,
                // flexDirection: "row",
                // alignItems: "center",
                marginVertical: 10,
              }}
            >
              <View style={{ flex: 0.3 }}>
                <Text style={InvoiceStyles.postpaidBalanceText}>
                  {startDate ? 'Opening Balance' : 'Allocated Credit Limit:'}
                </Text>
                <Text style={InvoiceStyles.moneyText}>
                  ₹
                  {startDate
                    ? data?.opening_balance
                    : statmentData?.data?.credit_limit || '0.00'}
                </Text>
              </View>
              <View style={{ flex: 0.3 }}>
                <Text style={InvoiceStyles.postpaidBalanceText}>
                  {startDate ? 'Closing Balance' : 'Current Outstanding:'}
                </Text>
                <Text style={InvoiceStyles.moneyText}>
                  ₹
                  {startDate
                    ? data?.closing_balance
                    : (statmentData?.data?.outstanding_amt || 0).toFixed(2) ||
                      '0.00'}
                </Text>
              </View>
              <View style={{ flex: 0.3 }}>
                <Text style={InvoiceStyles.postpaidBalanceText}>
                  Available Credit Limit:
                </Text>
                <Text style={InvoiceStyles.moneyText}>
                  ₹{statmentData?.data?.avaiable_limit?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
           
            <View
              style={{
                // flex: 1,
                marginTop: 10,
                flexDirection: 'row',
                // justifyContent: "space-between",
                // backgroundColor:"red",
                alignItems: 'center',
              }}
            >
             
            </View>
        
          </View>
        </View>
        <View
          style={{
            backgroundColor: 'white',
            elevation: 3,
            paddingHorizontal: 10,
          }}
        >
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' ,paddingTop:10}}>
            <TextInput
              value={amountheading}
              onChangeText={txt => {
                setAmountheading(txt);
                if (Inputerror) {
                  setInputError('');
                }
              }}
              returnKeyType='done'
              onSubmitEditing={payNowAction}
              placeholder="Enter Payable amount"
              keyboardType="decimal-pad"
              maxLength={7}
              placeholderTextColor={'grey'}
              style={[InvoiceStyles.Input,{ borderColor: Inputerror ? 'red' : 'grey',}]}
            />
            <View style={{}}>
              <NewButton
                loading={loading}
                text={'Pay Now'}
                onPress={payNowAction}
              />
            </View>
          </View>
          {Inputerror && (
            <Text style={InvoiceStyles.errortxt}>
              Please enter a valid amount
            </Text>
          )}

          <View
            style={InvoiceStyles.transactiontext}
          >
            <Text style={InvoiceStyles.transactionListHeaderText}>
              Transaction History
            </Text>
        
          </View>

          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{ flexDirection: 'row' }}
          >
            {location.map(index => (
              <Text
                onPress={() => {
                  setLocation(location.filter(ind => ind !== index));
                  setStartDate(null);
                  setEndDate(null);
                }}
                style={{
                  margin: 10,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: 'rgb(237, 243, 249)',
                  color: 'black',
                }}
              >
                {index.toLocaleString()}
                {'  '}
                <Text style={{ color: 'red' }}>X</Text>
              </Text>
            ))}
            {paymode.map(index => (
              <Text
                onPress={() => {
                  setaPaymode(paymode.filter(ind => ind !== index));
                  setStartDate(null);
                  setEndDate(null);
                }}
                style={{
                  margin: 10,
                  padding: 10,
                  borderRadius: 10,
                  backgroundColor: 'rgb(237, 243, 249)',
                  color: 'black',
                }}
              >
                {index.toLocaleString()}
                {'  '}
                <Text style={{ color: 'red' }}>X</Text>
              </Text>
            ))}
          </ScrollView>
        </View>
        {startDate && endDate && data?.data?.length > 0 && (
          <Text style={InvoiceStyles.noRecord}>
            Records between {moment(startDate).format('DD MMM YYYY')} to{' '}
            {moment(endDate).format('DD MMM YYYY')}
          </Text>
        )}

        <FlatList
          scrollEnabled={false}
          ListEmptyComponent={
            isLoading ? (
              emptyList
            ) : startDate && endDate ? (
              <View
                style={InvoiceStyles.imptylist}
              >
                <Image
                  style={InvoiceStyles.alertImage}
                  source={require('../../assets/images/norecord.png')}
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
          contentContainerStyle={InvoiceStyles.flatlistcontainer}
          renderItem={renderTransactions}
        />
      </ScrollView>

      <UniversalModal
        isFull={true}
        visible={showModal}
        setVisible={setShowModal}
        title={'Filter by:'}
      >
        <View
          style={InvoiceStyles.filterheading}
        >
          <View style={[InvoiceStyles.innerModalCont, { padding: 0 }]}>
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <View style={{ flexDirection: 'column', minWidth: '30%' }}>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    // flex: 1,
                    backgroundColor:
                      click === 0 ? 'rgb(237, 243, 249)' : 'white',
                    justifyContent: 'space-between',
                    // width: "50%",
                    padding: 10,
                    flexDirection: 'row',
                  }}
                  onPress={() => onApply(0)}
                >
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY.semiBold,
                      fontSize: 14,
                      color: click === 0 ? 'black' : 'grey',
                    }}
                  >
                    Date
                  </Text>
                  <Text style={{ textAlign: 'right' }}>
                    {tempEndDate && tempStartDate ? 1 : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    backgroundColor:
                      click === 1 ? 'rgb(237, 243, 249)' : 'white',

                    padding: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => onApply(1)}
                >
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY.semiBold,
                      fontSize: 14,
                      color: click === 1 ? 'black' : 'grey',
                    }}
                  >
                    Location
                  </Text>
                  <Text style={{ textAlign: 'right', color: 'black' }}>
                    {selectedLocation.length ? selectedLocation.length : ''}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={{
                    backgroundColor:
                      click === 2 ? 'rgb(237, 243, 249)' : 'white',

                    padding: 10,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                  onPress={() => onApply(2)}
                >
                  <Text
                    style={{
                      fontFamily: FONT_FAMILY.semiBold,
                      fontSize: 14,
                      color: click === 2 ? 'black' : 'grey',
                    }}
                  >
                    Pay Mode
                  </Text>
                  <Text style={{ textAlign: 'right', color: 'black' }}>
                    {selectedPaymode.length ? selectedPaymode.length : ''}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, backgroundColor: 'white' }}>
                {click === 0 ? (
                  <View
                    style={{
                      flex: 1,
                    }}
                  >
                    <View style={{ margin: 10 }}>
                      <DatePickerComponent
                        placeholder={
                          tempStartDate ? tempStartDate : 'Start date'
                        }
                        stateDate={setTempStartDate}
                      />
                    </View>
                    <View style={{ margin: 10 }}>
                      <DatePickerComponent
                        placeholder={tempEndDate ? tempEndDate : 'End date'}
                        stateDate={setTempEndDate}
                        minDate={
                          tempStartDate
                            ? moment(tempStartDate).add(1, 'day').toDate()
                            : moment().toDate()
                        }
                      />
                    </View>
                  </View>
                ) : (
                  (click === 1 && (
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
                              flexDirection: 'row',
                              margin: 10,
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                              }}
                            >
                              <CustomCheckbox
                                onToggle={() => onSelect(index)}
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
                                      ? 'black'
                                      : 'grey',
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
                  )) ||
                  (click === 2 && (
                    <View
                      style={{
                        flex: 1,
                        marginHorizontal: 20,
                      }}
                    >
                      {userData?.user?.paymode.map((item, index) => (
                        <View>
                          <TouchableOpacity
                            onPress={() => onSelect(index, 'pay')}
                            activeOpacity={0.7}
                            style={{
                              flexDirection: 'row',
                              margin: 10,
                              alignItems: 'center',
                            }}
                          >
                            <View
                              style={{
                                justifyContent: 'center',
                              }}
                            >
                              <CustomCheckbox
                                onToggle={() => onSelect(index, 'pay')}
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
                                      ? 'black'
                                      : 'grey',
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
                  ))
                )}
              </View>
            </View>
          </View>
        </View>
        <NewButton onPress={handleValidateDates} text={'Apply'} />
      </UniversalModal>
   
    </View>
  );
};
const renderTransactions = ({ item }) => {
  return (
    <Card style={InvoiceStyles.listcontainer}>
      <View style={InvoiceStyles.transactionRow}>
        <View style={InvoiceStyles.rowContainer}>
          <Icon name="calendar-month-outline" size={15} color="grey" />
          <Text style={[InvoiceStyles.dateText]}>
            {moment(item?.voucher_date).format('DD MMM YYYY')}
          </Text>
        </View>
        <Text style={[InvoiceStyles.voucherText, {}]}>
          Voucher No:{' '}
          <Text style={InvoiceStyles.voucherBold}>{item.voucher_no}</Text>
        </Text>
      </View>

      <View style={InvoiceStyles.transactionRow}>
        <Text
          numberOfLines={2}
          style={{ flex: 1, color: 'black', fontFamily: FONT_FAMILY.semiBold }}
          ellipsizeMode="tail"
        >
          {item.particulars}
        </Text>
        {/* <View style={InvoiceStyles.creditContainer}>
          <Icon name="arrow-bottom-left" size={15} color={SECONDARY_COLOR} />
        <Text style={InvoiceStyles.creditText}>
              ₹{isNaN(item.credit_amt) ? "0.00" : item.credit_amt} Cr.
            </Text>
        </View> */}
      </View>
      <View style={InvoiceStyles.transactionRow}>
        <Text numberOfLines={3} style={InvoiceStyles.narrationText}>
          {item.narrations
            .toLowerCase()
            .replace(/(^\s*\w|[\.\?\!]\s*\w)/g, char => char.toUpperCase())}
        </Text>
        <View style={InvoiceStyles.debitContainer}>
          <Icon
            name={item.credit_amt > 0 ? 'arrow-bottom-left' : 'arrow-top-right'}
            size={15}
            color={item.credit_amt > 0 ? SECONDARY_COLOR : 'red'}
          />
          {item.credit_amt > 0 ? (
            <Text style={InvoiceStyles.creditText}>
              ₹{isNaN(item.credit_amt) ? '0.00' : item.credit_amt} Cr.
            </Text>
          ) : (
            <Text style={InvoiceStyles.debitText}>
              ₹{isNaN(item.debit_amt) ? '0.00' : item.debit_amt} Dr.
            </Text>
          )}
        </View>
      </View>
    </Card>
  );
};
export default ViewStatement;

const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1, 1, 1]}
    renderItem={() => (
      <View style={InvoiceStyles.listcontainer}>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
          <ShimmerPlaceholder style={{ borderRadius: 10 }} width={80} />
        </View>
        <View
          style={{
            justifyContent: 'space-between',
            flexDirection: 'row',
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
