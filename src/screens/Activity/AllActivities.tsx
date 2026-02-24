import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect,  useState } from "react";
import Header from "../../components/Header";
import * as api from "../../util/api";
import { ENDPOINT,  } from "../../util/constant";
import { Toast } from "react-native-toast-notifications";

import { ScrollView } from "react-native-gesture-handler";
import { useSelector } from "react-redux";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";
import Carousel from "react-native-reanimated-carousel";
import { useQuery, } from "@tanstack/react-query";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import { FONT_FAMILY } from "../../util/colors";
import { RootState } from "../../store/store";
const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

type Props=NativeStackScreenProps<AppStackParamList,'AllActivities'>
const AllActivities:React.FC<Props> = ({ navigation }) => {
  const [options, setOptions] = useState([]);
  const [banners, setBanners] = useState([]);
  const userData = useSelector((state:RootState) => state.auth);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fetchFacilities = async () => {
    try {
      const summeryObject = {
        path: ENDPOINT.get_facility,
        body: {},
        Token: userData?.token,
      };
      const response = await api.javascriptGet(summeryObject);
      if (response.status) {

        setOptions(response.data.filter((item) => item.status == "Active"));
        setBanners(response.data.filter((item) => item.status == "Active"));
      } else {
        Toast.hideAll();
        Toast.show(response.message, {
          type: "danger",
        });
        setOptions(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const SLIDER_WIDTH = Dimensions.get("window").width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH);

  const { data } = useQuery({
    queryKey: ["facilities"],
    queryFn: fetchFacilities,
    staleTime: Infinity,
    refetchOnMount: false,
    retry: 1,
    enabled: !!userData?.token,
  })

  useEffect(() => {
    if (data) {
      setOptions(data.data.filter((item) => item.status == "Active"));
      setBanners(data.data.filter((item) => item.status == "Active"));
    }
  }, [data])
  const emptybanner = () => (
    <FlatList
      data={[...Array(1).keys()]}
      numColumns={1}
      style={styles.listView}
      renderItem={() => (
        <View style={{ flex: 1, margin: 10, marginHorizontal: 20 }}>
          <View style={{ alignItems: "center", minHeight: 150 }}>
            <ShimmerPlaceholder
              shimmerStyle={{ borderRadius: 20, minHeight: 150 }}
              width={Dimensions.get("window").width - 40}

            />
          </View>
        </View>
      )}
    />
  );
  const emptyActivity = () => (
    <FlatList
      data={[...Array(6).keys()]}
      numColumns={3}
      style={styles.listView}
      renderItem={() => (
        <View style={{ flexGrow: 1 / 3, flex: 1 }}>
          <View style={{ margin: 10, alignItems: "center", minHeight: 100 }}>
            <ShimmerPlaceholder
              shimmerStyle={{ borderRadius: 10, minHeight: 80 }}
              width={80}
              style={{ margin: 5 }}
            />
          </View>
        </View>
      )}
    />
  );

  const handleFacility = (item) => {
    if (item.is_available_slots) {
      navigation.navigate("Activity", { facility: item });
    } else {
      Toast.hideAll();
      Toast.show(`No slots avaiable for ${item.name}`, {
        type: "warning",
      });
    }
  };

  const renderFacilities = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => handleFacility(item)}
        activeOpacity={0.8}
        style={[
          {
            flexGrow: 1 / 3,
            flex: 1,
            backgroundColor: "white",
            marginTop: 10,
          },
        ]}
      >
        <Image
          height={50}
          width={50}
          style={{ alignSelf: "center" }}
          source={{
            uri: `https://dynamixclubedepalma.co.in/clubdepalma/${item?.third_image}`,
          }}
        />

        <Text
          style={{
            fontFamily: FONT_FAMILY.normal,
            color: "grey",
            fontSize: 13,
            color: "black",
            textAlign: "center",
            marginTop: 10,
          }}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
    >
      <Header title={"All Activities"}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={{
            borderWidth: 0.8,
            borderColor: "white",
            padding: 5,
            borderRadius: 5,
          }}
          onPress={() => {
            navigation.navigate("Players");
          }}
        >
          <Text style={{ fontFamily: FONT_FAMILY.normal, color: "white" }}>
            My Player
          </Text>
        </TouchableOpacity>
      </Header>

      <ScrollView
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        {banners.length > 0 ? (
          <>
            <Carousel
              width={ITEM_WIDTH}
              height={180}
              data={banners}
              autoPlay={navigation.isFocused() ? true : false}
              onSnapToItem={(index) => setCurrentIndex(index)}
              autoPlayInterval={3000}
              loop
              containerStyle={{ alignSelf: "center" }}
              renderItem={({ item }) => (
                <View style={{}}>
                  <Image
                    source={{
                      uri: `https://dynamixclubedepalma.co.in/clubdepalma${item.first_image}`,
                    }}
                    style={{
                      height: 150,
                      borderRadius: 10,
                      margin: 10,
                      marginHorizontal: 20,
                      width: "auto",
                    }}
                    resizeMode="cover"
                  />
                  <Text
                    style={{
                      color: "white",
                      fontFamily: FONT_FAMILY.normal,
                      position: "absolute",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      padding: 10,
                      borderRadius: 10,
                      fontSize: 12,
                      width: "50%",
                      right: 20,
                      top: 10,
                    }}
                  >
                    {item.short_description}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleFacility(item)}
                    style={{
                      backgroundColor: "tomato",
                      position: "absolute",
                      right: 30,
                      bottom: 20,
                      padding: 10,
                      borderRadius: 10,
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Book Now
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginTop: -10,
              }}
            >
              {banners.map((_, index) => (
                <View
                  key={index}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: currentIndex === index ? "tomato" : "#ccc",
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </>
        ) : (
          emptybanner()
        )}

        <FlatList
          style={styles.listView}
          scrollEnabled={true}
          data={options || []}
          ListHeaderComponent={
            <View>
              <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  fontFamily: FONT_FAMILY.bold,
                  marginLeft: 20,
                }}
              >
                Activities
              </Text>
            </View>
          }
          numColumns={3}
          keyExtractor={(item, index) => index}
          renderItem={renderFacilities}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            options ? (
              emptyActivity()
            ) : (
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 16, color: "grey" }}>
                  No Active Activity.
                </Text>
              </View>
            )
          }
        />
      </ScrollView>
    </View>
  );
};

export default AllActivities;

const styles = StyleSheet.create({
  listView: {
    // backgroundColor:'rgba(105, 125, 240, 0.1)',
    flex: 1,
    // paddingVertical: 10,
  },
  transactionListHeaderText: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: "black",
  },
  mainView: {
    flex: 1,
    margin: 10,
    backgroundColor: "white",
    borderRadius: 20,
  },
  bannerCard: {
    flex: 1,
    width: Dimensions.get("window").width - 50,
    height: 150,
    borderRadius: 10,
    marginRight: 15,
    overflow: "hidden",
    elevation: 2,
  },
});
