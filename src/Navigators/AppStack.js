
import { useDispatch, useSelector } from "react-redux";
import DrawerNavigator from "./CustomDrawerContent.tsx";
import SplashScreen from "../Screens/SplashScreen.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { hasAlreadyLoggedIn } from "../Store/dataSlice.ts";
import AuthStack from "./AuthStack.js";
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";


const AppDrawerNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null means checking state
  const [isLoading, setIsLoading] = useState(true); // for splash
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { token } = useSelector((state) => state.data);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        let userData = await AsyncStorage.getItem("user");
        let storedToken = await AsyncStorage.getItem("token");

        userData = userData ? JSON.parse(userData) : null;
        setIsAuthenticated(!!storedToken);
        dispatch(hasAlreadyLoggedIn({ userData, token: storedToken }));
      } catch (error) {
        console.error("Error checking login status:", error);
      } finally {
        // Show splash for 2s before showing next screen
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    checkLoginStatus();
  }, [dispatch, navigation]);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return isAuthenticated ? <DrawerNavigator /> : <AuthStack />;
};

export default AppDrawerNavigator;
