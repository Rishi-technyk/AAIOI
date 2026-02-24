import { useEffect, useState } from 'react';
import { DOMAIN } from '../../util/constant';
import { javascriptPost } from '../../util/api';
import { Toast } from 'react-native-toast-notifications';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { APP_NAME } from '@env';
import RazorpayCheckout from 'react-native-razorpay';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Header from '../../components/Header';
import { DARK_BLUE } from '../../util/colors';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useQueryClient } from '@tanstack/react-query';

const Shimmer = createShimmerPlaceholder(LinearGradient);
type Props = NativeStackScreenProps<AppStackParamList, 'UniversalPayment'>;
const UniversalPaymentScreen: React.FC<Props> = ({ route }) => {
  const { orderData, type } = route.params;
  const userData = useSelector((state: RootState) => state.auth);
 const queryClient = useQueryClient();
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>(
    'processing',
  );
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(40);
  const shake = useSharedValue(0);
  useEffect(() => {
    if (status === 'success') {
      scale.value = withSpring(1, { damping: 8 });
      opacity.value = withTiming(1, { duration: 400 });
      translateY.value = withTiming(0, { duration: 500 });
    }

    if (status === 'failed') {
      shake.value = withSequence(
        withTiming(-10, { duration: 60 }),
        withTiming(10, { duration: 60 }),
        withTiming(-8, { duration: 60 }),
        withTiming(8, { duration: 60 }),
        withTiming(0, { duration: 60 }),
      );

      opacity.value = withTiming(1, { duration: 300 });
    }
  }, [status]);
  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateX: shake.value }],
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
   
      setTimeout(
        ()=> startPayment()
      , 400);
  }, []);

  const startPayment = () => {

    const options = {
      description: `${type} Payment`,
      image: DOMAIN.ICON_URL,
      currency: 'INR',
      key: orderData.razorpayKey,
      amount: orderData.amount * 100,
      order_id: orderData.order_id,
      name: APP_NAME,
      theme: { color: DARK_BLUE },
      prefill: {
        name: userData?.user?.DisplayName,
        email: userData?.user?.Email,
        contact: userData?.user?.Mobile,
      },
      notes: {
        MemberID: userData?.user?.MemberID || '',
        SC_ID: userData?.user?.SC_ID || '',
        BookingType: type,
        MemberName: userData?.user?.DisplayName || '',
      },

      // modal: {
      //   ondismiss: () => handleFailure({ reason: 'User Cancelled' }),
      // },
    };

    RazorpayCheckout.open(options)
      .then((response: any) => {
      
        verifyPayment(response);
      })
      .catch(handleFailure);
  };

  const verifyPayment = async (response: any) => {
    try {
      const apiRes = await javascriptPost({
        path: orderData.end_point,
        body: {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        },
        Token: userData.token,
      });
      console.log( type,'---------------------- updating here ---------------------');
       if (type === 'Recharge') {
  console.log( '---------------------- updating here ---------------------');
      queryClient.invalidateQueries({ queryKey: ['card_balance'] });

          }else if( type === 'Bill'){
            queryClient.invalidateQueries({ queryKey: ['statements'] });
          }
      setPaymentResult(apiRes.data);

      if (apiRes.success) {
        setStatus('success');
      } else {
        setStatus('failed');
      }
    } catch (e) {
      handleFailure(e);
    }finally{
    
           setLoading(false);
    }

   
  };

  const handleFailure = async (error: any) => {
  
    try {
      const response = await javascriptPost({
        path: orderData.end_point,
        body: {
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: error?.payment_id || null,
          razorpay_signature: null,
          status: false,
          failure_reason: error?.description || 'Payment Failed',
        },
        Token: userData.token,
      });
       
      setPaymentResult(response.data);
    } catch (e) {
      console.log('Failure sync error', e);
    }finally{
       setStatus('failed');
        setLoading(false);

    Toast.show('Payment Failed', { type: 'danger' });
    }

   
  };
 console.log( status, '---------------------- status ---------------------');
  return (
    <View style={{ flex: 1, backgroundColor: '#FFFF' }}>
      <Header title="Payment Status" toHome />

      {loading ? (
        <PaymentShimmer />
      ) : (
        <View style={styles.center}>
          <Animated.View
            style={[
              status === 'success'
                ? styles.iconCircleSuccess
                : styles.iconCircleFail,
              iconAnimatedStyle,
            ]}
          >
            <Icon
              name={status === 'success' ? 'check-bold' : 'close-thick'}
              size={44}
              color={status === 'success' ? '#1BAA60' : '#E5484D'}
            />
          </Animated.View>

          {/* Title */}
          <Text style={styles.title}>
            {status === 'success' ? 'Payment Successful' : 'Payment Failed'}
          </Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            {status === 'success'
              ? 'Your transaction was completed successfully.'
              : 'We could not process your payment.'}
          </Text>

          {/* Payment Details Card */}
          {paymentResult && (
            <Animated.View style={[styles.card, cardAnimatedStyle]}>
              <View style={styles.row}>
                <Text style={styles.label}>Transaction Type</Text>
                <Text style={styles.value}>{type}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Member ID</Text>
                <Text style={styles.value}>{userData?.user?.MemberID}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>SC ID</Text>
                <Text style={styles.value}>{userData?.user?.SC_ID}</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text style={styles.label}>Amount Paid</Text>
                <Text style={styles.amount}>
                  ₹ {Number(paymentResult.paid_amount).toFixed(2)}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Transaction ID</Text>
                <Text style={styles.value}>
                  {paymentResult.reference_number || '—'}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text
                  style={[
                    styles.status,
                    paymentResult.Status === 'Success'
                      ? styles.successText
                      : styles.failText,
                  ]}
                >
                  {paymentResult.Status}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      )}
    </View>
  );
};
const PaymentShimmer = () => {
  return (
    <View style={styles.center}>
      {/* Icon shimmer */}
      <Shimmer style={styles.shimmerCircle} />

      {/* Title */}
      <Shimmer style={styles.shimmerTitle} />
      <Shimmer style={styles.shimmerSubtitle} />

      {/* Card */}
      <View style={styles.card}>
        {[1,2,3,4,5].map((_,i)=>(
          <View key={i} style={styles.row}>
            <Shimmer style={styles.shimmerLabel} />
            <Shimmer style={styles.shimmerValue} />
          </View>
        ))}
      </View>
    </View>
  );
};

export default UniversalPaymentScreen;
const styles = StyleSheet.create({
  loader:{
flex:1,
alignItems:'center',
justifyContent:'center'
  },
  center: {
    flex: 1,
    alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: 20,
    marginTop:20
  },

  iconCircleSuccess: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#E9F8F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  iconCircleFail: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  iconText: {
    fontSize: 42,
    color: '#22a55d',
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },

  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 6,
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },

  label: {
    color: '#666',
    fontSize: 13,
  },

  value: {
    color: '#111',
    fontWeight: '600',
  },

  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22a55d',
  },

  status: {
    fontWeight: '700',
  },

  successText: {
    color: '#22a55d',
  },

  failText: {
    color: '#e53935',
  },

  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  shimmerCircle:{
  width:92,
  height:92,
  borderRadius:46,
  marginBottom:22
},

shimmerTitle:{
  width:180,
  height:22,
  borderRadius:6,
  marginBottom:10
},

shimmerSubtitle:{
  width:220,
  height:14,
  borderRadius:6,
  marginBottom:25
},

shimmerLabel:{
  width:90,
  height:12,
  borderRadius:4
},

shimmerValue:{
  width:120,
  height:12,
  borderRadius:4
},

});
