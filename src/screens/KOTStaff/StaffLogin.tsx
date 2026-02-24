import { Alert, StyleSheet,  TextInput, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParamList } from '../../navigation/AuthStack'
import AuthScreenLayout from '../../components/AuthScreenLayout';
import Button2 from '../../components/Button2';
import { Dropdown } from 'react-native-element-dropdown';
import { Toast } from 'react-native-toast-notifications';
import { javascriptGet,  javascriptGetLocal,  javascriptPostLocal } from '../../util/api';
import { Loginstyles } from '../../Styles/LoginStyles';
import { DARK_BLUE, FONT_FAMILY } from '../../util/colors';
import { ENDPOINT } from '../../util/constant';

type Props=NativeStackScreenProps<AuthStackParamList,'StaffLogin'>;


const StaffLogin:React.FC<Props> = ({navigation}) => {
  const [usernameTextValue, setUsernameTextValue] = useState<string>("");
  const [loadingData, setLoadingData] = useState(false);

  const [location,setLocation]=useState([]);
    const [selectedValue, setSelectedValue] = useState(null);

  const userRef = useRef(null);

  const getLocation=async()=>{
    

    try {
      let apiObj={
        path:'locations',
        body:{}

      }
      console.log( '-------------------------------------------');
      const response =await javascriptGetLocal(apiObj)
     console.log( response, '---------------------- response ---------------------');
      if(response.status){
        setLocation(response.data);
      }
    } catch (error) {
      
    }
  }
useEffect(()=>{
  getLocation();
},[]);
  const authenticateUsers = async () => {
   
    Toast.hideAll();
    if (usernameTextValue === "") {
      Toast.show("Please enter User name", { type: "danger" });

      return;
    }
    if (selectedValue === null) {
      Toast.show("Please select location", { type: "danger" });
      return;
    }
   setLoadingData(true);
     const apiRequestObject = {
      body: {username: usernameTextValue,
        location:selectedValue,},
    };
      setLoadingData(true);
       const response = await javascriptPostLocal({
              path: ENDPOINT.waiter_login,
              body: apiRequestObject.body,
            });
        
       setLoadingData(false);
     if (response.status) {
        if(response.message){
          Alert.alert('OTP',response.message);
        }
        navigation.navigate("VerifyOTP", {
          memberID: usernameTextValue,
          type:'waiter'
        });
      
    console.log('\x1b[36m%s\x1b[0m', '-----------------here---- ---------------------');
      } else {
        Toast.show(
          response.message ? response.message : "incorrect username or location",
          {
            type: "danger",
          }
        );
      }
   
  };
  return (
    <AuthScreenLayout title='Login as staff' >

           
            <TextInput
              ref={userRef}
              maxLength={15}
              keyboardType="email-address"
              placeholder="Enter User Name"
              secureTextEntry={false}
              value={usernameTextValue}
              onChangeText={(value) => setUsernameTextValue(value)}
              style={[Loginstyles.textInput, { paddingVertical: 20 }]}
              placeholderTextColor="#363b5d"
              returnKeyType="next"
            />
            <View>
                <Dropdown
                    data={location||[]}
                    style={styles.dropdown}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    containerStyle={styles.containerStyle}
                    itemTextStyle={styles.itemTextStyle}
                    labelField="LocationName"
                    valueField="code"
                    placeholder="Select an Location"
                    value={selectedValue}
                    
                    onChange={item => {
                        setSelectedValue(item.code);
                    }}
                />
            </View>

            <Button2
              text={"Sign In As Staff"}
              onPress={authenticateUsers}
              loading={loadingData}
            />
    </AuthScreenLayout>
  )
}

export default StaffLogin

const styles=StyleSheet.create({

    dropdown: {
        height: 50,
        borderBottomWidth: 1,
        paddingHorizontal: 8,
        marginVertical:10,
        marginHorizontal:5,
        borderBottomColor:DARK_BLUE
    },
    icon: {
        marginRight: 5,
    },
    containerStyle: {
        borderRadius: 8,
        borderColor: 'gray',
        borderWidth: 0.5,
        maxHeight: 200,
        marginTop: 8,
        
    },
    placeholderStyle: {
        color: 'gray',
        fontFamily:FONT_FAMILY.normal,
        fontSize: 16,
    },
    selectedTextStyle: {
        fontFamily:FONT_FAMILY.normal,
        color: 'black',
        fontSize: 16,
    },
    itemTextStyle: {
        fontFamily:FONT_FAMILY.normal,
        color: 'black',
        // fontSize: 16,
    },
})
