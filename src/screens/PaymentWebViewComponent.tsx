import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ActivityIndicator,
  Dimensions,
  BackHandler,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import {APP_NAME} from '@env'
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ScrollView } from 'react-native-gesture-handler';
import { javascriptPost } from '../util/api';
import { FONT_FAMILY, SECONDARY_COLOR } from '../util/colors';
import Header from '../components/Header';
import { useQueryClient } from '@tanstack/react-query';
import { Toast } from 'react-native-toast-notifications';
import { DOMAIN } from '../util/constant';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppDrawer';

type Props=NativeStackScreenProps<AppStackParamList,'PaymentWebView'>
const PaymentWebViewComponent :React.FC<Props>  = ({navigation}) => {

  const queryClient = useQueryClient();
  const route = useRoute();
  const { data } = route.params;
  const userData = useSelector(state => state.auth);
  const [Data, setData] = useState(null);
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [loading, setLoading] = useState(false);

    useEffect(() => {
    if (!paymentInitiated) {
      setPaymentInitiated(true);
        setTimeout(() => {
      startPayment();
    }, 400);
    }
  }, [paymentInitiated]);

  useEffect(() => {
    const backAction = () => {
      // Navigate to Home screen
      navigation.navigate('Home');
      return true; // Prevent default behavior (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    // Cleanup the event listener on unmount
    return () => backHandler.remove();
  }, [navigation]);


  const startPayment = () => {
    const options = {
      description: 'Payment for order',
      image: DOMAIN.ICON_URL,
      currency: 'INR',
      key: data.razorpayKey,
      amount: data.amount * 100,
      order_id: data.orderId,
      name: APP_NAME,
      prefill: {
        name: userData?.user?.DisplayName,
        email: userData?.user?.Email,
        contact: userData?.user?.Mobile,
      },
      theme: { color: '#222642' },
      notes: {
    MemberID: userData?.user?.MemberID || "",
    SC_ID: userData?.user?.SC_ID || "",
    BookingType: route.params.type || "N/A",
    MemberName: userData?.user?.DisplayName || "",
  },
    };
 RazorpayCheckout.open(options)
      .then(async paymentData => {
        if (paymentData?.razorpay_payment_id) {
          const paydata = await JSON.stringify(paymentData);
          const payload = {
            path: data.end_point,
            body: {
              razorpay_order_id: data.orderId,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_response: paydata,
              status: true,
            },
            Token: userData?.token,
          };
          console.log( payload, '---------------------- payload ---------------------');
          let response = await javascriptPost(payload);
          console.log( response, '---------------------- response ---------------------');
          if (response.data) {
            queryClient.invalidateQueries({
              queryKey: ['card_balance', 'statements'],
            });
          }
          setData(response.data);
          setLoading(false);
        } else {
          const paydata = await JSON.stringify(paymentData);
          const payload = {
            path: data.end_point,
            body: {
              razorpay_order_id: data.orderId,
              razorpay_payment_id: paymentData.razorpay_payment_id || 'N/A',
              razorpay_response: paydata,
              status: false,
            },
            Token: userData?.token,
          };
          console.log( payload.body, '---------------------- body ---------------------',paymentData);
          let response = await javascriptPost(payload);

          setData(response.data);
          if(response.status==true){
             Toast.show(response.message||'',{type:'success'})
          }else{
              Toast.show(response.message||'',{type:'success'})
          }
          setLoading(false);
        }
      })

      .catch(async error => {
        console.log( error, '---------------------- error ---------------------');
        const payload = {
          path: data.end_point,
          body: {
            razorpay_order_id: data.orderId || data.razorpayKey,
            razorpay_payment_id: error.payment_id || 'N/A',
            razorpay_response: JSON.stringify(error),

            status: false,
          },
          Token: userData?.token,
        };console.log( payload, '---------------------- payload ---------------------');

        let response = await javascriptPost(payload);
        console.log( response, '---------------------- response ---------------------');
        setData(response.data);
        setLoading(false);
        Toast.show(response.message||'',{type:'danger'})
      });
  };

  return (
    <View style={styles.container}>
      <Header title={'Payment Detail'} toHome={true} />
    
        <View
          style={{
            backgroundColor: 'white',

            flex: 1,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingBottom: 5,
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingTop: 30,
              }}
            >
              <Text style={styles.headerStyle}>Member Name</Text>
              <Text style={styles.textStyle}>
                {Data?.MemberName ? Data.MemberName : 'Not Available'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 20,
                paddingTop: 30,
                paddingBottom: 5,
              }}
            >
              <View style={{ width: width / 2 }}>
                <Text style={styles.headerStyle}>C ID</Text>
                <Text style={styles.textStyle}>
                  {Data?.MemberSCID ? Data.MemberSCID : 'Not Available'}
                </Text>
              </View>
              <View style={{ width: width / 2 - 100 }}>
                <Text style={styles.headerStyle}>M ID</Text>
                <Text style={styles.textStyle}>
                  {Data?.MemberID ? Data.MemberID : 'Not Available'}
                </Text>
              </View>
            </View>

            <View
              style={{
                paddingBottom: 5,
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingTop: 30,
              }}
            >
              <Text style={styles.headerStyle}>{route.params.type} Amount</Text>
              <Text style={styles.textStyle}>
                {Data?.paid_amount
                  ? Number(Data.paid_amount).toFixed(2)
                  : 'Not Available'}
              </Text>
            </View>

            <View
              style={{
                paddingBottom: 5,
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingTop: 30,
              }}
            >
              <Text style={styles.headerStyle}>Merchant Reference No</Text>
              <Text style={styles.textStyle}>
                {Data?.reference_number
                  ? Data.reference_number
                  : 'Not Available'}
              </Text>
            </View>

            <View
              style={{
                paddingBottom: 5,
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingTop: 30,
              }}
            >
              <Text style={styles.headerStyle}>Payment Status</Text>
              <Text style={styles.textStyle}>
                {Data?.Status ? Data.Status : 'Not Available'}
              </Text>
            </View>

            <View
              style={{
                paddingBottom: 5,
                justifyContent: 'center',
                paddingHorizontal: 20,
                paddingTop: 30,
              }}
            >
              <Text style={styles.headerStyle}>Transaction ID</Text>
              <Text style={styles.textStyle}>
                {data?.orderId ? data.orderId : 'Not Available'}
              </Text>
            </View>
          </ScrollView>
        </View>
      {loading && (
        <View
          style={{
            backgroundColor: 'rgba(0, 0,0, 0.3)',
            flex: 1,
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              backgroundColor: 'transparent',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ActivityIndicator
              size="large"
              color={SECONDARY_COLOR}
              animating={loading}
            />
          </View>
        </View>
      )}
    </View>
  );
};
const { height, width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    width: '95%',
    height: '85%',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.29,
    shadowRadius: 4.65,
    marginTop: 5,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 15,
    textAlign: 'center',
    flex: 1,
  },
  payButton: {
    backgroundColor: '#F37254',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerStyle: {
    fontFamily: FONT_FAMILY.bold,
    color: 'black',
  },
  textStyle: {
    fontFamily: FONT_FAMILY.normal,
    color: 'grey',
  },
  title: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 18,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  button: {
    // flex:1,
    alignSelf: 'flex-end',
    borderRadius: 10,
    backgroundColor: SECONDARY_COLOR,
    padding: 15,
    borderBottomLeftRadius: 10,
  },
  buttonText: {
    color: 'white',
    fontFamily: FONT_FAMILY.semiBold,
    textAlign: 'center',
  },
});

export default PaymentWebViewComponent;
