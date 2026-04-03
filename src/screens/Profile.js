import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Header from '../components/Header';
import {Avatar, Card, Icon} from 'react-native-paper';
import {DOMAIN} from '../util/constant';
import {launchImageLibrary} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Toast } from 'react-native-toast-notifications';
import { FONT_FAMILY } from '../util/colors';
import { loginSuccess } from '../store/slices/authSlice';

const Profile = () => {
  const data = useSelector(state => state?.auth?.user);
   const token = useSelector(state => state?.auth?.token);
 
 const [profileImage, setProfileImage] = useState(
    'https://randomuser.me/api/portraits/men/1.jpg'
  );

  const dispatch = useDispatch();

const openImagePicker = () => {
  const options = {
    mediaType: 'photo',
    quality: 1,
  };
const updateProfilePicture = async (imageUri) => {
  const apiUrl = DOMAIN.BASE + 'member/upload-profile'; // 🔁 Change to your API URL

  const formData = new FormData();
  formData.append('profile_image', {
    uri: imageUri,
    type: 'image/jpeg', // or 'image/png' based on your image
    name: 'profile.jpg', // or any name with extension
  });

  try {
   const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    const result = await response.json();
    console.log('Profile picture uploaded:', result);
    if(result.status) {
    
      setProfileImage(imageUri);
     const data=await AsyncStorage.getItem('user');
    
       Toast.show(result.message || 'Profile picture updated successfully!', {
        type: 'success',
      });
    } else {
      console.error('Failed to upload profile picture:', result.message);
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
  }
};

  try {

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.error('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        // Handle the selected image
        const source = {uri: response.assets[0].uri};
        setProfileImage(source.uri);
        updateProfilePicture(source.uri);
      }
    });
  } catch (error) {
    console.error('Error opening image picker:', error);
  }
};
  var arr = [
    {
      id: 1,
      name: 'Member ID:',
      detail: data?.MemberID || '0001A',
    },
    {
      id: 2,
      name: 'Status:',
      detail: data?.Status || 'In-Active',
    },
    {
      id: 3,
      name: 'C ID:',
      detail: data?.SC_ID || 'A-0001B',
    },
    {
      id: 3,
      name: 'DOB:',
      detail: data?.DOB || '00-00-00',
    },
    {
      id: 4,
      name: 'Mobile:',
      detail: data?.Mobile || 'N/A',
      // url: url?.cancellation_policy,
    },
    {
      id: 5,
      name: 'Category:',
      detail: data?.Category || 'N/A',
    },
    {
      id: 6,
      name: 'Email:',
      detail: data?.Email || 'N/A',
      // url: url?.contact_us,
    },
    {
      id: 7,
      name: 'Gender:',
      detail: data?.Gender || 'N/A',
      // url: url?.contact_us,
    },
  ];
  console.log( `${DOMAIN.API_IMAGE_URL}${data.profile_image}`, '---------------------- data.profile_image ---------------------');
return (
    <View style={styles.container}>
      <Header title={'Profile'} />

      <ScrollView>
        <TouchableOpacity  onPress={openImagePicker}style={styles.body}>
          <Avatar.Image
            size={100}
            source={{uri: data.profile_image ? `${DOMAIN.API_IMAGE_URL}${data.profile_image}` : profileImage}}
            style={{backgroundColor: 'white', margin: 20}}
          />
          <Text
            style={{
              fontFamily: FONT_FAMILY.semiBold,
              fontSize: 20,
              color: 'black',
            }}>
            {data.DisplayName || 'User'}
          </Text>
        </TouchableOpacity>
        <FlatList data={arr} numColumns={2} renderItem={renderUserDate} />
      </ScrollView>
    </View>
  );
};
const renderUserDate = ({item}) => {
  return (
    <Card style={styles.card}>
      <Card.Title title={item.name} titleStyle={styles.titleText} />
      <Card.Title title={item.detail} titleStyle={styles.headerText} titleNumberOfLines={3} />
    </Card>
  );
};
const {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerlogo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerText: {
    flex:1,
    // textAlign:'center',
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color:'black'
    ,
  },

  body: {
    margin: 20,
    alignItems: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    margin: 20,
 
  },
  titleText: {
    fontFamily: FONT_FAMILY.normal,
    color:'black'
  },
});
export default Profile;
