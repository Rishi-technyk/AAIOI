import AsyncStorage from '@react-native-async-storage/async-storage';
import { javascriptGet } from '../util/api';
import { dashboardDefault,drawerDefault } from '../config/dashboardDefault';
import { Alert } from 'react-native';

const STORAGE_KEY = 'dashboard_config';
const DRAWER_KEY='drawer_menus'

export const getDashboardConfig = async () => {
  try {
    // 1️⃣ Load cached config first
    const cached = await AsyncStorage.getItem(STORAGE_KEY);
    let localConfig = cached ? JSON.parse(cached) : dashboardDefault;

    // 2️⃣ Fetch latest from backend
    const response = await javascriptGet({ path: 'dashboard/config?type=member' });
console.log(response,"response response response response")
    if (response?.status) {
      const serverConfig = response;

      // 3️⃣ Compare version
      if (!localConfig || serverConfig?.version > localConfig?.version) {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(serverConfig),
        );
        return serverConfig;
      }
    }

    return localConfig;
  } catch (e) {
    console.log('Dashboard config error', e);
    Alert.alert('Dashboard config error')
    return dashboardDefault;
  }
};
export const getDrawerConfig = async () => {
  try {
    const cached = await AsyncStorage.getItem(DRAWER_KEY);
    let localConfig = cached ? JSON.parse(cached) : drawerDefault;

    // 2️⃣ Fetch latest from backend
    const response = await javascriptGet({ path: 'drawer/config' });
console.log(response,"response response response response")

    if (response?.status) {
      const serverConfig = response;
  
      // 3️⃣ Compare version
      if (!localConfig || serverConfig?.version > localConfig?.version) {
        await AsyncStorage.setItem(
          DRAWER_KEY,
          JSON.stringify(serverConfig),
        );
     
        return serverConfig;
      }
    }

    return localConfig;
  } catch (e) {
    console.log('Drawer config error', e);
    Alert.alert('Drawer config error')
    return drawerDefault;
  }
};

