import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {useSelector} from 'react-redux';
import Header from '../components/Header';
import {Avatar, Card} from 'react-native-paper';
import {DOMAIN} from '../util/constant';
import {launchImageLibrary} from 'react-native-image-picker';
import { Toast } from 'react-native-toast-notifications';
import { FONT_FAMILY } from '../util/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppDrawer';
import { RootState } from '../store/store';
import { useAppTheme } from '../theme/AppThemeProvider';


type Props = NativeStackScreenProps<AppStackParamList, 'Profile'>;
const Profile :React.FC<Props>= () => {
  const data = useSelector((state:RootState) => state?.auth?.user);
   const token = useSelector((state:RootState) => state?.auth?.token);
 
 const [profileImage, setProfileImage] = useState(
    'https://randomuser.me/api/portraits/men/1.jpg'
  );
  const {colors} = useAppTheme();
  const styles = createStyles(colors);

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
const renderUserDate = ({item}) => {
  return (
    <Card style={styles.infoCard}>
      <Card.Title title={item.name} titleStyle={styles.titleText} />
      <Card.Title title={item.detail} titleStyle={styles.headerText} titleNumberOfLines={3} />
    </Card>
  );
};
  console.log( `${DOMAIN.API_IMAGE_URL}${data.profile_image}`, '---------------------- data.profile_image ---------------------');
return (
    <View style={styles.container}>
      <Header title={'Profile'} />

      <ScrollView>
        <TouchableOpacity  onPress={openImagePicker}style={styles.profileHero}>
          <Avatar.Image
            size={104}
            source={{uri: data.profile_image ? `${DOMAIN.API_IMAGE_URL}${data.profile_image}` : profileImage}}
            style={styles.avatar}
          />
          <Text style={styles.displayName}>{data.DisplayName || 'User'}</Text>
          <Text style={styles.memberCode}>{data?.SC_ID || 'Member profile'}</Text>
        </TouchableOpacity>
        <FlatList
          data={arr}
          numColumns={2}
          renderItem={renderUserDate}
          scrollEnabled={false}
          contentContainerStyle={styles.infoGrid}
          columnWrapperStyle={styles.columnWrapper}
          keyExtractor={(item, index) => `${item.name}-${index}`}
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: colors.text,
  },

  profileHero: {
    margin: 16,
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  avatar: {
    backgroundColor: colors.surfaceAlt,
    marginBottom: 14,
  },
  displayName: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 22,
    color: colors.text,
  },
  memberCode: {
    marginTop: 6,
    color: colors.textMuted,
    fontFamily: FONT_FAMILY.normal,
    fontSize: 13,
  },
  infoGrid: {
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '48.5%',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    justifyContent: 'space-between',
    marginBottom: 12,
    borderRadius: 18,
  },
  titleText: {
    fontFamily: FONT_FAMILY.normal,
    color: colors.textMuted,
  },
});
export default Profile;
