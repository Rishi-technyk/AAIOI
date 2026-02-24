import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import {
  DARK_BLUE,
  FONT_FAMILY,
  LIGHT_GREEN,
  LIGHT_RED,
  SECONDARY_COLOR,
} from '../../util/colors';
import { Card } from 'react-native-paper';
import { ENDPOINT } from '../../util/constant';
import moment from 'moment';
import { FlatList, Pressable, ScrollView } from 'react-native-gesture-handler';
import UniversalModal from '../../components/UniversalModal';
import NewButton from '../../components/Button';
import _ from 'lodash';
// import PickPlayers from "./PickPlayers";
import * as api from '../../util/api';
import { Toast } from 'react-native-toast-notifications';
import { CustomCheckbox } from '../../components/CustomCheckBox';
import { Dropdown } from 'react-native-element-dropdown';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { usePlayers } from '../../services/Activity/FacilityService';
import { RootState } from '../../store/store';
import PickPlayers from './PickPlayers';

type Props = NativeStackScreenProps<AppStackParamList, 'ChoosePlayer'>;
const ChoosePlayer: React.FC<Props> = ({ route, navigation }) => {
  const userData = useSelector((state: RootState) => state.auth);
  const params = route.params;
  const [search, setSearch] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [searchPlayer, setSearchPlayer] = useState(null);
  const [slots, setSlots] = useState(params.slots);
  const [selectedGameType, setGameType] = useState(null);
  const facility = params.facility;
  const [agree, setAgree] = useState(false);
  const [showPolicies, setShowPolicies] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const { guestQuery, gameQuery } = usePlayers(
    1,
    debouncedSearch,
    facility?.id,
    userData,
  );
  const subTotal = useMemo(() => {
    // Base amount: facility charge * number of slots
    const baseAmount = Number(facility.charge || 0) * slots.length;

    // Sum of all player charges
    const extraCharges = slots?.reduce((total, item) => {
      const playerTotal =
        item.players?.reduce((acc, player) => {
          return acc + Number(player?.charge || 0);
        }, 0) || 0;

      return total + playerTotal;
    }, 0);

    const totalAmount = baseAmount + extraCharges;
    return Number(totalAmount).toFixed(2);
  }, [facility.charge, slots]);
  const handleBookFacility = async () => {
    Toast.hideAll();
    if (!agree) {
      Toast.show('Please accept the terms and conditions.', {
        type: 'warning',
      });
      return;
    }
    if (slots.length === 0) {
      Toast.show('Please select at least one slot.', {
        type: 'warning',
      });
      return;
    }
    if (slots.some(slot => !slot.players)) {
      Toast.show('Please select at least one player for each slot', {
        type: 'warning',
      });

      return;
    }

    const guestTotal = slots?.reduce((total, item) => {
      const playerTotal =
        item.players?.reduce((acc, player) => {
          return acc + Number(player?.charge || 0);
        }, 0) || 0;

      return total + playerTotal;
    }, 0);
    const subtotal = Number(facility.charge) + guestTotal;
    const gstAmount = Number(facility?.GSTper)
      ? (subtotal * Number(facility.GSTper)) / 100
      : 0;
    const totalWithGst = subtotal + gstAmount;
    const apiobject = {
      path: ENDPOINT.book_facilities,
      body: {
        memberId: userData?.user?.MemberID,
        slots,
        session_id: params?.session?.id,
        facility_id: facility.id,
        charge: facility.charge,
        guest_total_amount: guestTotal,
        facility_gst_per: facility?.GSTper,
        facility_gst_amt: Number((subTotal / 100) * facility.GSTper),
        game_type_id: selectedGameType?.id || null,
        payble_amount: Number(
          (subTotal / 100) * facility.GSTper + Number(subTotal),
        ),
      },
      Token: userData?.token,
    };
    try {
      setLoading(true);
      const response = await api.javascriptPost(apiobject);
      console.log(
        response,
        '---------------------- response ---------------------',
      );

      setLoading(false);
      if (response?.status && response.data && response.data.order_id) {
        Toast.show(response?.message, {
          type: 'success',
        });

        // navigation.navigate("Home");
        navigation.navigate('UniversalPayment', {
          orderData: response.data,
          type: 'Activity',
        });
        // setAmount(0);
        setSlots([]);
        setSearch('');
        setAgree(false);
        setSelectedFacility(null);
        setSelectedSlot(null);
        setShowPolicies(false);
        setSearchPlayer(false);
        setDebouncedSearch('');
      } else {
        Toast.show(response?.message, {
          type: 'danger',
        });
      }
    } catch (error) {
      console.log(
        '\x1b[36m%s\x1b[0m',
        error,
        '---------------------- error ---------------------',
      );
      Toast.show('Error occurred while booking facility', {
        type: 'danger',
      });
    }
  };
  const toastRef = useRef(null);

  useEffect(() => {
    const handler = _.debounce(() => {
      setDebouncedSearch(search);
    }, 500);

    handler();

    return () => handler.cancel();
  }, [search]);

  return (
    <View style={{ flex: 1, backgroundColor: '#EEEEEE' }}>
      <Header title={'Booking Details'} />
      <ScrollView contentContainerStyle={{ margin: 10, paddingBottom: 20 }}>
        <Text
          style={[
            styles.price,
            { fontSize: 18, fontFamily: FONT_FAMILY.semiBold },
          ]}
        >
          {slots.length + ` ${slots.length > 1 ? 'Slots' : 'Slot'} Selected`}
        </Text>
        <Dropdown
          style={[styles.dropdown]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          containerStyle={{
            backgroundColor: 'white',
            borderRadius: 10,
            marginTop: 10,
          }}
          itemTextStyle={styles.itemContainerStyle}
          iconStyle={styles.iconStyle}
          data={gameQuery?.data?.data?.gameTypes || []}
          maxHeight={300}
          labelField="name"
          valueField="id"
          placeholder={'Select Game Type'}
          value={selectedGameType?.id}
          onChange={item => {
            setGameType(item);
            setSlots(prev => prev.map(item => ({ ...item, players: null })));
          }}
          renderItem={item => (
            <View style={{ padding: 20 }}>
              <Text style={{ color: 'black', fontFamily: FONT_FAMILY.normal }}>
                {item.name} ({item.no_of_players}{' '}
                {item.no_of_players > 1 ? 'Players' : 'Player'})
              </Text>
            </View>
          )}
        />

        <FlatList
          contentContainerStyle={{
            flex: 1,
            borderRadius: 10,
            marginVertical: 12,
          }}
          key={({ item }) => item.id}
          scrollEnabled={false}
          data={slots}
          renderItem={({ item, index }) => (
            <View
              style={{
                paddingBottom: 10,
                backgroundColor: 'white',
                padding: 10,
                borderRadius: 5,
                marginBottom: 10,
              }}
            >
              <View
                key={index}
                style={[
                  styles.rowCenter,
                  {
                    justifyContent: 'space-between',
                  },
                ]}
              >
                <View>
                  <Text
                    style={[styles.price, { fontFamily: FONT_FAMILY.semiBold }]}
                  >
                    {facility?.name} ({' '}
                    {moment(item?.day?.session_date).format('DD-MMMM-YYYY')})
                  </Text>
                  <Text
                    style={[styles.price, { fontFamily: FONT_FAMILY.light }]}
                  >
                    {`${moment(item?.time?.name, 'HHmm').format(
                      'hh:mm A',
                    )} to ${moment(item?.time?.name.slice(5, 8), 'HHmm').format(
                      'hh:mm A',
                    )}`}{' '}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text
                    style={[styles.price, { fontFamily: FONT_FAMILY.bold }]}
                  >
                    1 Slot
                  </Text>
                  <Text
                    style={[styles.price, { fontFamily: FONT_FAMILY.normal }]}
                  >
                    ₹{facility.charge}
                  </Text>
                </View>
              </View>
              {Array.isArray(item.players) &&
                item.players.map((player, index) => (
                  <View
                    style={[
                      styles.rowCenter,
                      {
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        paddingTop: 5,
                      },
                    ]}
                    key={index}
                  >
                    {/* <Text style={styles.price}>Player {index+1}</Text> */}

                    <Text
                      style={[
                        styles.price2,
                        {
                          textAlign: 'left',
                          fontFamily: FONT_FAMILY.semiBold,
                          color: 'black',
                        },
                      ]}
                    >
                      <Text>
                        {index + 1}. {player.DisplayName}
                      </Text>{' '}
                      (
                      {player.occupant_id == 2
                        ? 'Non Memeber'
                        : player.MemberID}
                      )
                    </Text>
                    <Text
                      style={[styles.price, { fontFamily: FONT_FAMILY.normal }]}
                    >
                      ₹{player.charge}
                    </Text>
                  </View>
                ))}
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  marginTop: 10,
                  flex: 1,
                }}
              >
                <Pressable
                  style={{
                    backgroundColor: LIGHT_RED,
                    padding: 8,
                    borderRadius: 5,
                    alignSelf: 'flex-start',
                  }}
                  onPress={() => {
                    LayoutAnimation.configureNext({
                      duration: 300,
                      create: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.opacity,
                      },
                      delete: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.opacity,
                      },
                      update: {
                        type: LayoutAnimation.Types.linear,
                        property: LayoutAnimation.Properties.opacity,
                      },
                    });

                    slots.length !== 1
                      ? setSlots(slots.filter((_, i) => i !== index))
                      : navigation.goBack();
                  }}
                >
                  <Text style={{ color: 'red', fontFamily: FONT_FAMILY.bold }}>
                    Remove Slot
                  </Text>
                </Pressable>

                {item.players?.length > 0 ? (
                  <Pressable
                    style={{
                      backgroundColor: LIGHT_RED,
                      padding: 8,
                      borderRadius: 5,
                      alignSelf: 'flex-start',
                    }}
                    onPress={() => {
                      LayoutAnimation.configureNext({
                        duration: 300,
                        create: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.opacity,
                        },
                        delete: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.opacity,
                        },
                        update: {
                          type: LayoutAnimation.Types.linear,
                          property: LayoutAnimation.Properties.opacity,
                        },
                      });

                      setSlots(prev => {
                        const updatedSlots = [...prev];
                        updatedSlots[index] = {
                          ...updatedSlots[index],
                          players: null,
                        };
                        return updatedSlots;
                      });
                    }}
                  >
                    <Text
                      style={{ color: 'red', fontFamily: FONT_FAMILY.bold }}
                    >
                      Clear All Players
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    style={{
                      backgroundColor: LIGHT_GREEN,
                      padding: 8,
                      borderRadius: 5,
                    }}
                    onPress={() => {
                      if (!selectedGameType) {
                        Toast.hideAll();
                        Toast.show('Please select game type first.', {
                          type: 'warning',
                        });
                        return;
                      }
                      setSearchPlayer(true);
                      setSelectedFacility(facility);
                      setSelectedSlot(item);
                    }}
                  >
                    <Text
                      style={{
                        color: SECONDARY_COLOR,
                        fontFamily: FONT_FAMILY.bold,
                      }}
                    >
                      Select Player(s)
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          )}
        />

        <Card style={{ backgroundColor: 'white', padding: 10 }}>
          <Text
            style={[
              styles.price,
              { fontSize: 18, fontFamily: FONT_FAMILY.bold },
            ]}
          >
            Payment Summary
          </Text>
          <View style={[styles.rowCenter, { justifyContent: 'space-between' }]}>
            <Text style={styles.price2}>Sub Total:</Text>
            <Text style={styles.price2}>₹{subTotal || 0.0}</Text>
          </View>
          <View
            style={[
              styles.rowCenter,
              {
                justifyContent: 'space-between',
                borderBottomWidth: 0.5,
                paddingBottom: 5,
                borderBottomColor: 'grey',
              },
            ]}
          >
            <Text style={styles.price2}>GST ({facility.GSTper || 0}%) :</Text>
            <Text style={styles.price2}>
              ₹{Number((subTotal / 100) * facility.GSTper).toFixed(2) || 0.0}
            </Text>
          </View>
          <View
            style={[
              styles.rowCenter,
              { justifyContent: 'space-between', marginTop: 10 },
            ]}
          >
            <Text style={styles.price}>Grand Total:</Text>
            <Text
              style={[
                styles.price,
                { fontFamily: FONT_FAMILY.bold, fontSize: 17 },
              ]}
            >
              ₹
              {Number(
                (subTotal / 100) * facility.GSTper + Number(subTotal),
              ).toFixed(2)}
            </Text>
          </View>
        </Card>
        <TouchableOpacity
          onPress={() => setShowPolicies(true)}
          activeOpacity={0.9}
          style={[styles.rowCenter, { marginTop: 10 }]}
        >
          <CustomCheckbox
            onToggle={() => setShowPolicies(true)}
            checked={agree}
            color={SECONDARY_COLOR}
          />
          <Text style={styles.price2}>
            I agree
            <Text style={[styles.price, { textDecorationLine: 'underline' }]}>
              {' '}
              Terms & Conditions
            </Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: 20,
          paddingTop: 10,
          backgroundColor: '#fff', // Required for shadow to appear
          elevation: 3, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: {
            width: 0,
            height: -3, // Negative height to show shadow from the top
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          // onPress={() => setShowPolicies(true)}
        >
          <Text
            style={[
              styles.price,
              { fontFamily: FONT_FAMILY.bold, fontSize: 16 },
            ]}
          >
            ₹
            {Number(
              (subTotal / 100) * facility.GSTper + Number(subTotal),
            ).toFixed(2)}{' '}
          </Text>
          <View style={styles.rowCenter}>
            <Text
              style={[
                styles.price,
                { textDecorationLine: 'underline', color: 'grey' },
              ]}
            >
              of {slots.length + ` ${slots.length > 1 ? 'Slots' : 'Slot'}`}
            </Text>
          </View>
        </TouchableOpacity>
        <NewButton
          text={'Check out'}
          loading={loading}
          onPress={handleBookFacility}
        />
      </View>
      <UniversalModal
        visible={showPolicies}
        setVisible={setShowPolicies}
        title={'Terms & Conditions'}
      >
        <View style={{ flex: 1, padding: 10 }}>
          <Text
            style={[
              styles.price,
              { fontSize: 16, fontFamily: FONT_FAMILY.semiBold, color: 'red' },
            ]}
          >
            Cancellation policy
          </Text>
          <Text style={styles.price}>
            <Text style={[styles.price, { fontFamily: FONT_FAMILY.semiBold }]}>
              {` \n\n We understand that plans can change. However, to ensure fairness to all participants and to maintain operational efficiency.`}
            </Text>{' '}
            {` \n\n Cancellations charged as per cancellation policy.`}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-end',
            justifyContent: 'flex-end',
            padding: 10,
          }}
        >
          <NewButton
            text={'Accept'}
            onPress={() => {
              setAgree(true), setShowPolicies(false), setLoading(false);
            }}
          />
        </View>
      </UniversalModal>

      {searchPlayer && (
        <PickPlayers
          facility={selectedFacility}
          searchPlayer={searchPlayer}
          setSearchPlayer={setSearchPlayer}
          guestQuery={guestQuery}
          setSlot={setSlots}
          slots={slots}
          search={search}
          setSearch={setSearch}
          selectedSlot={selectedSlot}
          setSelectedSlot={setSelectedSlot}
          selectedGameType={selectedGameType}
          refetch={guestQuery}
          toastRef={toastRef}
        />
      )}
    </View>
  );
};

export default ChoosePlayer;

const styles = StyleSheet.create({
  dropdown: {
    height: 50,
    borderColor: 'rgb(11, 96, 161)',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    color: 'black',
    fontFamily: FONT_FAMILY.normal,
  },
  price: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.normal,
    color: DARK_BLUE,
  },
  price2: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.normal,
    color: 'grey',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#999',
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center' },
  selectedTextStyle: {
    fontSize: 16,
    color: '#333',
    fontFamily: FONT_FAMILY.normal,
  },
  itemContainerStyle: {
    fontSize: 16,
    color: '#000',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
});
