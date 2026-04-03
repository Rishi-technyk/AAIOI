import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { APP_NAME } from '@env';
import {
  DrawerActions,
  useNavigation,
  NavigationProp,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { FONT_FAMILY,  DARK_BLUE } from '../util/colors';
import OTPModal from '../components/OTPModal';
import Icon from 'react-native-vector-icons/AntDesign';
import Icons from 'react-native-vector-icons/Entypo';
import TransactionBoxImage from '../../assets/svg/TransactionBoxImage'; 
import useDashboardData from '../services/HomeApis';
import { RootState } from '../store/store';
import { useToast } from 'react-native-toast-notifications';
import InAppUpdate from '../components/InAppUpdate';
import { getDashboardConfig } from '../config/dashboardConfig';
import EventModal from '../services/Events/EventModal';
import { javascriptGet } from '../util/api';
import MemberOrderTypeModal from '../components/MemberOrderTypeModal';

type MenuItem = {
  name: string;
  subTitle?: string;
  icon?: string;
  navigate?: string;
  data?: any;
  module_key:string;
};

type AccountSummary = {
  credit_limit?: number | string;
  outstanding_amt?: number | string;
  avaiable_limit?: number | string;
  total_debit?: number | string;
  [key: string]: any;
};

type DashboardConfig = {
  top_modules: MenuItem[];
  modules: MenuItem[];
};

type BannerResponse = {
  data: {
    visible: boolean;
    image: string;
    navigation: string;
    data: any;
  };
  [key: string]: any;
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();

  const toast = useToast();
  const [orderType,setOrderType]=useState< boolean>(false); 
  const [screens2, setScreens2] = useState<MenuItem[]>([]);
  const [screens, setScreens] = useState<MenuItem[]>([]);
  const [otpModal, setOTPModal] = useState<boolean>(false);
  const [eventModal, setEventModal] = useState<BannerResponse['data']>({
    visible: false,
    image: '',
    navigation: '',
    data: null,
  });
  const auth = useSelector((state: RootState) => state.auth);

  const token = auth?.token;

  const [balance, setBalance] = useState<number>(0);
  const [account_summary, setAccount_summary] = useState<AccountSummary | null>(
    null,
  );

  const [balanceRes, summaryRes] = useDashboardData({
    token: token ?? '',
    body: {},
  });

  useEffect(() => {
    try {
      const bal =
        balanceRes?.data?.data?.balance?.balance ??
        balanceRes?.data?.data?.balance ??
        null;
      if (bal !== null && bal !== undefined) {
        const num = Number(bal);
        if (!Number.isNaN(num)) setBalance(num);
      }

      if (summaryRes?.data?.data) {
        setAccount_summary(summaryRes.data.data);
      }
    } catch (e) {
    }
  }, [balanceRes?.data, summaryRes?.data]);

  const loadBanner = async () => {
    try {
      const res = await javascriptGet({
        path: 'member/banner',
        Token: token ?? '',
      });
     if(res?.data?.data) {
      const { image, navigation, data } = res.data;
      if (image && navigation) {
        setEventModal({
          visible: true,
          image,
          navigation,
          data,
        });
      }

     }
   
    }catch{

    }
  }
  // Fetch menu items
  useEffect(() => {
    loadDashboard()
    loadBanner();
  }, []);
  const loadDashboard = async () => {
  const config = await getDashboardConfig<DashboardConfig>();
  setScreens2(config.modules);
  setScreens(config.top_modules)
};
  const chunkArray = (arr: any[], size: number) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  const sections = chunkArray(screens2, 3);
  const renderSection = (group: MenuItem[], index: number) => {
    if (group.length === 0) return null;
if (group.length === 1 ) {
  return (
    <View key={index} style={styles.sectionContainer}>
      {renderBigCard(group[0])}
    </View>
  );
}
if (group.length === 2 ) {
  return (
    <View key={index} style={styles.sectionContainer}>
      {renderBigCard(group[0])}
      {renderBigCard(group[1])}
    </View>
  );
}
    const isReverse = index % 2 !== 0;

    return (
      <View key={index} style={styles.sectionContainer}>
        {/* PATTERN A */}
        {!isReverse ? (
          <View style={styles.row}>
            {renderBigCard(group[0])}

            <View style={styles.smallColumn}>
              {renderSmallCard(group[1])}
              {renderSmallCard(group[2])}
            </View>
          </View>
        ) : (
          /* PATTERN B */
          <View style={styles.row}>
            <View style={styles.smallColumn}>
              {renderSmallCard(group[0])}
              {renderSmallCard(group[1])}
            </View>

            {renderBigCard(group[2])}
          </View>
        )}
      </View>
    );
  };
  const renderBigCard = (item: MenuItem) => (
    <Pressable
      style={styles.bigCard}
      onPress={() =>

      {
         if (item.navigate ==='FoodOrder') {
          setOrderType(true);
          return;
        }else{
 navigation.navigate(item.navigate ?? 'Home', {
          url: item.data,
            data: item.data,
          name: item.name ?? '',
        })
        } }
      }
    >
      <Text style={styles.bigTitle}>{item.name}</Text>
      <Text style={styles.smallsubTitle}>{item.subTitle}</Text>

      <Image
        source={{ uri: `https://club26.org/mobileAPI/icons/${item.icon}` }}
        style={styles.bigIcon}
      />
    </Pressable>
  );
  const renderSmallCard = (item: MenuItem) => (
    <Pressable
      style={styles.smallCard}
      onPress={() =>
         {
         if (item.navigate ==='FoodOrder') {
          setOrderType(true);
          return;
        }else{
        navigation.navigate(item.navigate ?? 'Home', {
          url: item.data,
          name: item.name ?? '',
        })}}
      }
    >
      <Text style={styles.smallTitle}>{item.name}</Text>
      {/* <Text style={styles.smallsubTitle}>{item.subTitle}</Text> */}

      <Image
        source={{ uri: `https://club26.org/mobileAPI/icons/${item.icon}` }}
        style={styles.smallIcon}
      />
    </Pressable>
  );

  const renderItem = ({ item }: { item: MenuItem }) => {
    return(
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
         if (item.name === 'Card') {
          navigation.navigate(item.navigate,  balance);
          return;
        }
        if (item.navigate) {
          navigation.navigate(item.navigate, item.data ?? {});
          return;
        }

        if (item.name ==='OTP') {
          setOTPModal(true);
          return;
        }

        toast.show('Feature coming soon...', { type: 'warning' });
      }}
      style={styles.quickTile}
    >
      <View style={styles.quickIconWrap}>
        <Image
          resizeMode="contain"
          style={styles.quickIcon}
          source={{
            uri: `https://club26.org/mobileAPI/icons/${item?.icon}`,
          }}
        />
      </View>

      <Text style={styles.quickTitle}>{item.name}</Text>
    </TouchableOpacity>
  )};
  const StatBlock = ({ label, value }: any) => (
    <View style={styles.statBlock}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>
        ₹ {value ? Number(value).toFixed(2) : '0.00'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <EventModal eventModal={eventModal} setEventModal={setEventModal} />
      <ScrollView
        showsVerticalScrollIndicator={false}
       
        stickyHeaderIndices={[1,1]}
        bounces={false}
        style={{ backgroundColor: 'white' }}
        contentContainerStyle={{ backgroundColor: 'white' }}
      >
        <View style={styles.header}>
          <View style={styles.headerTopRow}>
            <Icon
              name="menu-fold"
              size={22}
              color="#fff"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />

            <View style={styles.brandWrap}>
              <Image
                source={require('../../assets/images/Logo.png')}
                style={styles.logo}
              />
              <Text style={styles.brandText}>{APP_NAME}</Text>
            </View>

            {/* spacer for symmetry */}
            <View style={{ width: 22 }} />
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Card Balance</Text>
            <Text style={styles.balanceAmount}>
              ₹ {balance ? balance.toFixed(2) : '0.00'}
            </Text>
          </View>
        </View>

        {/* Account summary card */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            {/* Floating SVG decoration */}
            <View style={styles.svgWrap}>
              <TransactionBoxImage />
            </View>

            <View style={styles.summaryHeader}>
              <Icons name="wallet" size={18} color="#1d4184" />
              <Text style={styles.summaryTitle}>Subscription / Dues</Text>
            </View>

            <View style={styles.statsRow}>
              <StatBlock
                label="Allocated Credit"
                value={account_summary?.credit_limit}
              />
              <StatBlock
                label="Outstanding"
                value={account_summary?.outstanding_amt}
              />
            </View>

            <View style={styles.statsRow}>
              <StatBlock
                label="Available Limit"
                value={account_summary?.avaiable_limit}
              />
              <StatBlock
                label="Unbilled Debit"
                value={account_summary?.total_debit}
              />
            </View>
          </View>
        </View>

        {/* Body */}
        <View style={styles.quickSection}>
          <Text style={styles.headingText}>Transactions & A/C</Text>

          <FlatList
            scrollEnabled={false}
            data={screens}
            horizontal
            // numColumns={3}
            contentContainerStyle={{flexGrow:1, justifyContent: 'space-around' }}
            keyExtractor={it => String(it.id)}
            renderItem={renderItem}
          />
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ marginHorizontal: 40 }}>
            <Text style={styles.headingText}>Club Facelities</Text>
          </View>
          <View style={{ paddingHorizontal: 10, paddingBottom: 30 }}>
            {sections.map((group, index) => renderSection(group, index))}
          </View>
        </View>
      </ScrollView>

      {/* OTP Modal */}
      <OTPModal visible={otpModal} setVisible={setOTPModal} />
      <InAppUpdate />
       <MemberOrderTypeModal showTypes={orderType} setShowType={setOrderType} />
    </View>
  );
};

const styles = StyleSheet.create({
  /* ========== GLOBAL ========== */

  container: {
    flex: 1,
    backgroundColor: '#F6F8FC',
  },

  /* ========== HEADER ========== */

  header: {
    paddingTop: 10,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: DARK_BLUE,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logo: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },

  brandText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
  },

  balanceContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginBottom: 20,
  },

  balanceLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontFamily: FONT_FAMILY.normal,
  },

  balanceAmount: {
    color: '#fff',
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
    marginTop: 4,
  },

  /* ========== SUMMARY CARD ========== */

  summaryContainer: {
    marginTop: -30,
    paddingHorizontal: 16,
  },

  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },

  svgWrap: {
    position: 'absolute',
    right: 10,
    top: -10,
    // opacity: 0.15,
  },

  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  summaryTitle: {
    marginLeft: 6,
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: '#1d4184',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },

  statBlock: {
    width: '48%',
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 12,
  },

  statLabel: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.normal,
    color: '#64748b',
  },

  statValue: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: '#16a34a',
    marginTop: 4,
  },

  /* ========== QUICK ACCESS TILES ========== */

  quickSection: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },

  headingText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: '#0f172a',
    marginBottom: 12,
  },

  quickTile: {
    // aspectRatio: 1,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickIconWrap: {
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 16,
    marginBottom: 6,
  },

  quickIcon: {
    width: 35,
    height: 35,
  },

  quickTitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
    color: '#1d4184',
    textAlign: 'center',
  },

  /* ========== MENU GRID SECTIONS ========== */

  sectionContainer: {
    marginBottom: 14,
  },

  row: {
    flexDirection: 'row',
  },

  smallColumn: {
    flex: 2,
    justifyContent: 'space-between',
  },

  /* BIG CARD */

  bigCard: {
    flex: 1,
    // height: 170,
    margin: 6,
    borderRadius: 24,
    padding: 18,
    backgroundColor: '#ffffff',
borderWidth:3,
borderColor:'#ded7d75e',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  bigTitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
    color: DARK_BLUE,
  },

  smallsubTitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.light,
    color: '#64748b',
    marginTop: 4,
    width: '70%',
  },

  bigIcon: {
    width: 58,
    height: 58,
    position: 'absolute',
    right: 12,
    bottom: 12,
    opacity: 0.95,
  },

  /* SMALL CARD */

  smallCard: {
    // height: 80,
    margin: 6,
    borderRadius: 18,
    padding: 14,
    borderWidth:3,
borderColor:'#ded7d75e',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },

  smallTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: DARK_BLUE,
    width: '70%',
  },

  smallIcon: {
    width: 42,
    height: 42,

  },
});

export default HomeScreen;
