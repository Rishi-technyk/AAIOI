import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import Header from '../../components/Header';
import { ENDPOINT } from '../../util/constant';
import { useSelector } from 'react-redux';
import { javascriptGet } from '../../util/api';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { RootState } from '../../store/store';
import { FONT_FAMILY, DARK_BLUE } from '../../util/colors';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';

type Props = NativeStackScreenProps<AppStackParamList, 'ClubMenu'>;
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);
const ClubMenu: React.FC<Props> = ({ navigation }) => {
  const userData = useSelector((state: RootState) => state.auth);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await javascriptGet({
        path: ENDPOINT.club_menu,
        Token: userData.token,
        body: {},
      });

      if (response.status) {
        setMenus(response.data);
      }
    } catch (error) {
      console.log('Menu fetch error', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMenuCard = ({ item }: any) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate(item.navigate, {
          url: item.data,
          name: item.name,
        })
      }
      style={styles.card}
    >
      {/* Floating Icon */}
      <View style={styles.iconWrap}>
        <Image
          width={36}
          height={36}
          source={{
            uri: `https://club26.org/mobileAPI/icons/${item.icon}`,
          }}
        />
      </View>

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.name}</Text>

        {item.subTitle ? (
          <Text style={styles.subtitle}>{item.subTitle}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="Club Menues" />

    {loading ? (
  <View style={{ padding: 16 }}>
   {emptyList()}
  </View>
) : (
        <FlatList
          data={menus}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderMenuCard}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            ListEmptyComponent={() => (
        <Text style={styles.emptyText}>No menus available</Text>
      )}
        />
      )}
    </View>
  );
};
const emptyList = () => (
  <FlatList
    data={[1, 1, 1, 1, 1, 1]}
    renderItem={() => (
      <View
        style={[styles.card]}
      >
        <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}>
          <ShimmerPlaceholder style={styles.iconWrap} />
          <View style={{ flex: 1, alignItems: 'flex-start', marginLeft: 10 }}>
            <ShimmerPlaceholder style={{ margin: 5 }} />
            <ShimmerPlaceholder style={{ margin: 5 }} />
            <ShimmerPlaceholder style={{ margin: 5 }} />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}
            >
              <ShimmerPlaceholder width={70} style={{ margin: 5 }} />
              <ShimmerPlaceholder width={70} style={{ margin: 5 }} />
            </View>
          </View>
        </View>
      </View>
    )}
  />
);
export default ClubMenu;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },

  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  title: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: DARK_BLUE,
  },

  subtitle: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: FONT_FAMILY.normal,
    marginTop: 4,
    width: '90%',
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
    color: '#64748b',
  },
});