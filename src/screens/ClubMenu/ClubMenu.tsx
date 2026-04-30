import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Header from '../../components/Header';
import { javascriptGet } from '../../util/api';
import { ENDPOINT } from '../../util/constant';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { RootState } from '../../store/store';
import { FONT_FAMILY } from '../../util/colors';
import { useAppTheme } from '../../theme/AppThemeProvider';

type Props = NativeStackScreenProps<AppStackParamList, 'ClubMenu'>;
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const ClubMenu: React.FC<Props> = ({ navigation }) => {
  const userData = useSelector((state: RootState) => state.auth);
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMenus = useCallback(async () => {
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
  }, [userData.token]);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

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
      <View style={styles.iconWrap}>
        <Image
          width={36}
          height={36}
          source={{
            uri: `https://club26.org/mobileAPI/icons/${item.icon}`,
          }}
        />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{item.name}</Text>
        {item.subTitle ? <Text style={styles.subtitle}>{item.subTitle}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  const renderSkeleton = () => (
    <FlatList
      data={[1, 1, 1, 1, 1, 1]}
      keyExtractor={(_, index) => `skeleton-${index}`}
      renderItem={() => (
        <View style={styles.card}>
          <ShimmerPlaceholder style={styles.iconWrap} />
          <View style={styles.textWrap}>
            <ShimmerPlaceholder style={styles.shimmerLine} />
            <ShimmerPlaceholder style={styles.shimmerLineShort} />
            <ShimmerPlaceholder style={styles.shimmerLineWide} />
          </View>
        </View>
      )}
    />
  );

  return (
    <View style={styles.container}>
      <Header title="Club Menues" />

      {loading ? (
        <View style={styles.listContent}>{renderSkeleton()}</View>
      ) : (
        <FlatList
          data={menus}
          keyExtractor={(item, index) => `${item?.name || 'menu'}-${index}`}
          renderItem={renderMenuCard}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No menus available</Text>}
        />
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      padding: 16,
      paddingBottom: 40,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 22,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
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
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontFamily: FONT_FAMILY.bold,
      color: colors.text,
    },
    subtitle: {
      fontSize: 13,
      color: colors.textMuted,
      fontFamily: FONT_FAMILY.normal,
      marginTop: 4,
      width: '90%',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 40,
      fontFamily: FONT_FAMILY.semiBold,
      fontSize: 16,
      color: colors.textMuted,
    },
    shimmerLine: {
      width: '65%',
      marginBottom: 10,
      borderRadius: 8,
    },
    shimmerLineShort: {
      width: '35%',
      marginBottom: 10,
      borderRadius: 8,
    },
    shimmerLineWide: {
      width: '80%',
      borderRadius: 8,
    },
  });

export default ClubMenu;
