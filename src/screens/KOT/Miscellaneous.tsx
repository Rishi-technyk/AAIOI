import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  LayoutAnimation,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Dropdown } from 'react-native-element-dropdown';
import Icons from 'react-native-vector-icons/Entypo';
import Header from '../../components/Header';
import TableOptions from '../../components/TableOptions';
import { javascriptGetLocal, javascriptPostLocal } from '../../util/api';
import { StyleSheet } from 'react-native';
import { DARK_BLUE, FONT_FAMILY } from '../../util/colors';
import UniversalModal from '../../components/UniversalModal';
import DatePickerComponent from '../../components/DatePickerFunc';
import moment from 'moment';
import { Toast } from 'react-native-toast-notifications';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../navigation/AppDrawer';

type MiscItem = {
  Code: string;
  HeadName: string;
  MemberRate?: string;
  SpouseRate?: string;
  DependantRate?: string;
  GuestRate?: string;
  ValuePercentage?: string;
  TaxType?: string;
  GSTStatus?: string;
};

type SelectedMisc = {
  Code: string;
  HeadName: string;
  MemberQty: number;
  SpouseQty: number;
  DependantQty: number;
  GuestQty: number;
  MemberRate?: string;
  SpouseRate?: string;
  DependantRate?: string;
  GuestRate?: string;
  ValuePercentage?: string;
  TaxType?: string;
  GSTStatus?: string;
    FlagValidity?: string;
  fromDate?: Date;
  toDate?: Date;
};
type Props=NativeStackScreenProps<AppStackParamList,'Miscellaneous'>
const Miscellaneous:React.FC<Props> = ({ navigation }: any) => {
  const auth = useSelector((state: any) => state.auth);

  const [visible, setVisible] = useState<boolean>(true);
  const [showTotalModal, setShowTotalModal] = useState<boolean>(false);
  const [miscellaneousData, setMiscellaneousData] = useState<MiscItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [limits, setLimits] = useState<{
    Member: number;
    Spouse: number;
    Dependant: number;
    Guest: number;
  }>({ Member: 0, Spouse: 0, Dependant: 0, Guest: 0 });
  const [selectedMiscellaneous, setSelectedMiscellaneous] = useState<
    SelectedMisc[]
  >([
    {
      Code: '',
      HeadName: '',
      MemberQty: 0,
      SpouseQty: 0,
      DependantQty: 0,
      GuestQty: 0,
    },
  ]);

  const [tableData, setTableData] = useState({
    LocationCode: '10',
    TableCode: '10',
  });
console.log( tableData, '---------------------- tableData ---------------------');
  /* ---------------- API ---------------- */
  const getAllMiscellaneous = async () => {
    const response = await javascriptGetLocal({
      path: 'staff/get-all-misc',
      Token: auth.token,
    });

    if (response?.status) {
      setMiscellaneousData(response.data);

      if (response.limits) {
        setLimits(response.limits);
      }
    }
  };

  useEffect(() => {
    getAllMiscellaneous();
  }, []);
console.log( selectedMiscellaneous, '---------------------- selectedMiscellaneous ---------------------');
  const handlePlaceOrder = useCallback(async () => {
setShowTotalModal(false);
    Toast.hideAll();
    if (selectedMiscellaneous.length === 0) {
      Toast.show('Please add at least one miscellaneous item to place an order.',{
        type: 'warning',
      });
      return;
    }
    if (selectedMiscellaneous.some(item => !item.Code)) {
      Toast.show('Please select miscellaneous items for all entries.',{
        type: 'warning',
      });
      return;
    }
    if (selectedMiscellaneous.some(item => {
      const totalQty = item.MemberQty + item.SpouseQty + item.DependantQty + item.GuestQty;
      return totalQty === 0;
    })) {
      Toast.show('Please specify quantity for all selected miscellaneous items.',{
        type: 'warning',
        duration: 5000
      });
      return;
    }
    if (selectedMiscellaneous.some(item => {
      if (item.FlagValidity === 'Yes') {
        if (!item.fromDate || !item.toDate) {
          return true;
        }
        if (moment(item.fromDate).isAfter(moment(item.toDate))) {
          return true;
        }
      }
      return false;
    })) {
      Toast.show('Please ensure valid from and to dates for items with validity.',{
        type: 'warning',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await javascriptPostLocal({
        path: 'staff/misc-place-order',
        Token: auth.token,
        body:{
            LocationCode: '1',
           MemberID:tableData.member.MemberId,
           UserCode: auth.user.UserCode.toString(),
           YearCode: tableData.yearCode,
           Total: grandTotal,
        items: selectedMiscellaneous.map(item => ({
          Code: item.Code ,
          MemberQty: item.MemberQty,
          SpouseQty: item.SpouseQty,
          DependantQty: item.DependantQty,
          GuestQty: item.GuestQty,
          fromDate: item.fromDate ? moment(item.fromDate).format('YYYY-MM-DD') : null,
          toDate: item.toDate ? moment(item.toDate).format('YYYY-MM-DD') : null,
          ValuePercentage:Number( item.ValuePercentage),
          MemberRate: Number(item.MemberRate),
          SpouseRate: Number(item.SpouseRate),
          DependantRate: Number(item.DependantRate),
          GuestRate: Number(item.GuestRate),
        })),


        }
      });
      
      if (response?.status) {
       
      } else {
        alert(response?.message || 'Failed to place order');
      }
    } catch (error) {
      alert('An error occurred while placing the order');
    } finally {
      setLoading(false);
    }
  }, [auth.token, navigation, selectedMiscellaneous, tableData]);
  const taxBreakup = useMemo(() => {
    const taxMap: Record<string, number> = {};

    selectedMiscellaneous.forEach(item => {
      const taxPer = Number(item.ValuePercentage) || 0;
      const taxType = (item.TaxType || '').toUpperCase();

      if (!taxType || taxPer <= 0) return;
      if (taxType === 'GST' && item.GSTStatus === 'No') return;

      const taxableAmount =
        Number(item.MemberRate || 0) * item.MemberQty +
        Number(item.SpouseRate || 0) * item.SpouseQty +
        Number(item.DependantRate || 0) * item.DependantQty +
        Number(item.GuestRate || 0) * item.GuestQty;

      const taxAmount = (taxableAmount * taxPer) / 100;

      const key = `${taxType}_${taxPer}`;
      taxMap[key] = (taxMap[key] || 0) + taxAmount;
    });

    return taxMap;
  }, [selectedMiscellaneous, miscellaneousData]);
  const totalTax = useMemo(() => {
    return Object.values(taxBreakup).reduce((sum, v) => sum + v, 0);
  }, [taxBreakup]);

  const totalAmount = useMemo(() => {
    let total = 0;
    selectedMiscellaneous.forEach(item => {
      const misc = miscellaneousData.find(m => m.Code === item.Code);
      if (misc) {
        total +=
          Number(misc.MemberRate || 0) * item.MemberQty +
          Number(misc.SpouseRate || 0) * item.SpouseQty +
          Number(misc.DependantRate || 0) * item.DependantQty +
          Number(misc.GuestRate || 0) * item.GuestQty;
      }
    });
    return total;
  }, [selectedMiscellaneous, miscellaneousData]);
  const grandTotal = useMemo(() => {
    return totalAmount + totalTax;
  }, [totalAmount, totalTax]);
  /* ---------------- QTY HANDLERS ---------------- */
  const updateQty = (index: number, key: keyof SelectedMisc, delta: number) => {
    setSelectedMiscellaneous(prev =>
      prev.map((item, i) =>
        i === index
          ? { ...item, [key]: Math.max(0, Number(item[key]) + delta) }
          : item,
      ),
    );
  };

  /* ---------------- RENDER ITEM ---------------- */
  const renderItem = ({
    item,
    index,
  }: {
    item: SelectedMisc;
    index: number;
  }) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Dropdown
            dropdownPosition="auto"
            data={miscellaneousData.filter(
              m =>
                !selectedMiscellaneous.some(
                  (sm, i) => sm.Code === m.Code && i !== index,
                ),
            )}
            labelField="HeadName"
            valueField="Code"
            value={item.Code}
            placeholder="Select Miscellaneous"
            style={styles.dropdown}
            containerStyle={{ zIndex: 1000 }}
            onChange={(selected: MiscItem) => {
              setSelectedMiscellaneous(prev =>
                prev.map((m, i) => (i === index ? { ...m, ...selected } : m)),
              );
            }}
          />

          {index > 0 && (
            <Pressable
              onPress={() => {
                   LayoutAnimation.configureNext({
                  duration: 800,
                  delete: {
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                  },
                });
                setSelectedMiscellaneous(prev =>
                  prev.filter((_, i) => i !== index),
                );
             
              }}
            >
              <Icon name="delete" size={20} color="red" />
            </Pressable>
          )}
        </View>

        {item?.MemberRate && Number(item.MemberRate) > 0 && (
          <View style={styles.qtyRow}>
            <Text style={[styles.rateText, { color: 'rgb(35, 141, 3)' }]}>
              Member: {item.MemberRate}
            </Text>
            <View style={styles.qtyControls}>
              <Text
                disabled={item.MemberQty <= 0}
                onPress={() => updateQty(index, 'MemberQty', -1)}
                style={[
                  styles.qtyBtn,
                  item.MemberQty <= 0 && { color: 'gray' },
                ]}
              >
                -
              </Text>
              <Text style={styles.qtyValue}>{item.MemberQty}</Text>
              <Text
                disabled={item.MemberQty >= limits.Member}
                onPress={() => updateQty(index, 'MemberQty', 1)}
                style={[
                  styles.qtyBtn,
                  item.MemberQty >= limits.Member && { color: 'gray' },
                ]}
              >
                +
              </Text>
            </View>
          </View>
        )}

        {item?.SpouseRate && Number(item.SpouseRate) > 0 && (
          <View style={styles.qtyRow}>
            <Text style={[styles.rateText, { color: 'rgb(141, 81, 3)' }]}>
              Spouse: {item.SpouseRate}
            </Text>
            <View style={styles.qtyControls}>
              <Text
                disabled={item.SpouseQty <= 0}
                onPress={() => updateQty(index, 'SpouseQty', -1)}
                style={[
                  styles.qtyBtn,
                  item.SpouseQty <= 0 && { color: 'gray' },
                ]}
              >
                -
              </Text>
              <Text style={styles.qtyValue}>{item.SpouseQty}</Text>
              <Text
                disabled={item.SpouseQty >= limits.Spouse}
                onPress={() => updateQty(index, 'SpouseQty', 1)}
                style={[
                  styles.qtyBtn,
                  item.SpouseQty >= limits.Spouse && { color: 'gray' },
                ]}
              >
                +
              </Text>
            </View>
          </View>
        )}

        {item?.DependantRate && Number(item.DependantRate) > 0 && (
          <View style={styles.qtyRow}>
            <Text style={[styles.rateText, { color: 'rgb(3, 100, 141)' }]}>
              Dependant: {item.DependantRate}
            </Text>
            <View style={styles.qtyControls}>
              <Text
                disabled={item.DependantQty <= 0}
                onPress={() => updateQty(index, 'DependantQty', -1)}
                style={[
                  styles.qtyBtn,
                  item.DependantQty <= 0 && { color: 'gray' },
                ]}
              >
                -
              </Text>
              <Text style={styles.qtyValue}>{item.DependantQty}</Text>
              <Text
                disabled={item.DependantQty >= limits.Dependant}
                onPress={() => updateQty(index, 'DependantQty', 1)}
                style={[
                  styles.qtyBtn,
                  item.DependantQty >= limits.Dependant && { color: 'gray' },
                ]}
              >
                +
              </Text>
            </View>
          </View>
        )}

        {item?.GuestRate && Number(item.GuestRate) > 0 && (
          <View style={styles.qtyRow}>
            <Text style={[styles.rateText, { color: 'rgb(141, 3, 3)' }]}>
              Guest: {item.GuestRate}
            </Text>
            <View style={styles.qtyControls}>
              <Text
                disabled={item.GuestQty <= 0}
                onPress={() => updateQty(index, 'GuestQty', -1)}
                style={[styles.qtyBtn, item.GuestQty <= 0 && { color: 'gray' }]}
              >
                -
              </Text>
              <Text style={styles.qtyValue}>{item.GuestQty}</Text>
              <Text
                disabled={item.GuestQty >= limits.Guest}
                onPress={() => updateQty(index, 'GuestQty', 1)}
                style={[
                  styles.qtyBtn,
                  item.GuestQty >= limits.Guest && { color: 'gray' },
                ]}
              >
                +
              </Text>
            </View>
          </View>
        )}
       
        {item.FlagValidity ==='Yes' &&  <View style={styles.qtyRow}>
           <Text style={[styles.rateText, { color: 'rgb(3, 100, 141)' }]}>
            Validity
            </Text>
        <DatePickerComponent
          stateDate={
            (date)=>{
             
              setSelectedMiscellaneous(prev =>{
                const updated = [...prev];
                updated[index]['fromDate'] = date;
                return updated;
              });
            }}
          placeholder={ item.fromDate ?moment(item.fromDate).format('DD-MMM-YY'):'Select From Date'}
          maxDate={moment()
            .add( 50, 'days')
            .toDate()}
          minDate={moment().toDate()}
        />

        <DatePickerComponent
          stateDate={
            (date)=>{
            setSelectedMiscellaneous(prev =>{
                const updated = [...prev];
                updated[index]['toDate'] = date;
                return updated;
              });
            }
          }
          placeholder={item.toDate ?moment(item.toDate).format('DD-MMM-YY'):'Select To Date'}
          maxDate={moment()
            .add( 50, 'days')
            .toDate()}
          minDate={moment().toDate()}
        />
        </View>}
         {item.GSTStatus === 'Yes' && (
          <View style={styles.qtyRow}>
            <Text style={[styles.rateText, { color: 'rgb(3, 100, 141)' }]}>
              {item.TaxType} Rate: {item.ValuePercentage}%
            </Text>
          </View>
        )}
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Header title="Miscellaneous" toHome={false}>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            LayoutAnimation.configureNext({
              duration: 800,
              delete: {
                type: LayoutAnimation.Types.easeInEaseOut,
                property: LayoutAnimation.Properties.opacity,
              },
            });
            setSelectedMiscellaneous(prev => [
              ...prev,
              {
                Code: '',
                HeadName: '',
                MemberQty: 0,
                SpouseQty: 0,
                DependantQty: 0,
                GuestQty: 0,
              },
            ]);
          }}
        >
          <Text style={{ color: 'white', fontFamily: FONT_FAMILY.normal }}>
            Add +
          </Text>
        </Pressable>
      </Header>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceText}>Card Balance</Text>
        <Text style={styles.balanceText}>
          {tableData?.card_balance || 'N/A'}
        </Text>
      </View>

      <FlatList
        data={selectedMiscellaneous}
        renderItem={renderItem}
         keyboardShouldPersistTaps="handled"
        keyExtractor={(_, i) => i.toString()}
         contentContainerStyle={{ paddingBottom: 160 }}
      />


      {totalAmount && (
        <View style={styles.footer}>
          <Pressable
            style={styles.totalSection}
            onPress={() => setShowTotalModal(true)}
          >
            <View>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>₹{grandTotal.toFixed(2)}</Text>
            </View>
            <Icons name="triangle-up" color="black" size={22} />
          </Pressable>

          <Pressable
            onPress={() => {
              setShowTotalModal(true);
            }}
            style={styles.bottomButton}
          >
            <Text style={styles.placeOrderText}>View Details</Text>
            {/* {loading && <ActivityIndicator color={"white"} size={"small"} />} */}
            <Icons
              name="chevron-small-right"
              color="white"
              size={25}
              style={styles.arrowIcon}
            />
          </Pressable>
        </View>
      )}
      <TableOptions
        visible={visible}
        tableData={tableData}
        token={auth.token}
        is_member={!!auth?.user?.MemberID}
        onClose={() => navigation.goBack()}
        handleGroupData={data => {
          if (data?.card_balance) {
            setTableData(data);
            setVisible(false);
          } else navigation.goBack();
        }}
      />
      <UniversalModal
        isFull={true}
        title="Billing Summary"
        visible={showTotalModal}
        setVisible={() => setShowTotalModal(false)}
      >
        <View style={{ flex: 1, margin: 10 }}>
          <View style={styles.billHeader}>
            <Text
              style={[
                styles.billText,
                { flex: 2, fontFamily: FONT_FAMILY.bold, color: 'black' },
              ]}
            >
              Item
            </Text>
            <Text
              style={[
                styles.billText,
                {
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: FONT_FAMILY.bold,
                  color: 'black',
                },
              ]}
            >
              Qty
            </Text>
            <Text
              style={[
                styles.billText,
                {
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: FONT_FAMILY.bold,
                  color: 'black',
                },
              ]}
            >
              Price
            </Text>
            <Text
              style={[
                styles.billText,
                { flex: 1, textAlign: 'right', fontFamily: FONT_FAMILY.bold },
              ]}
            >
              Total
            </Text>
          </View>
          <FlatList
            data={selectedMiscellaneous.filter(item => item.Code)}
            keyExtractor={(_, i) => i.toString()}
            style={{ flex: 1 }}
            renderItem={({ item }) => {
              const itemTotal =
                Number(item.MemberRate || 0) * item.MemberQty +
                Number(item.SpouseRate || 0) * item.SpouseQty +
                Number(item.DependantRate || 0) * item.DependantQty +
                Number(item.GuestRate || 0) * item.GuestQty;
              return (
                <View
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: '#ccc',
                  }}
                >
                  <Text
                    style={[
                      styles.billText,
                      { fontFamily: FONT_FAMILY.bold, marginTop: 5 },
                    ]}
                  >
                    {item.HeadName}
                  </Text>

                  {item.MemberQty > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billText, { flex: 2 }]}>Member</Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        {item.MemberQty}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        ₹{item.MemberRate}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'right' },
                        ]}
                      >
                        ₹{(item.MemberQty * item.MemberRate).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {item.SpouseQty > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billText, { flex: 2 }]}>Spouse</Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        {item.SpouseQty}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        ₹{item.SpouseRate}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'right' },
                        ]}
                      >
                        ₹{(item.SpouseQty * item.SpouseRate).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {item.DependantQty > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billText, { flex: 2 }]}>
                        Dependant
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        {item.DependantQty}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        ₹{item.DependantRate}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'right' },
                        ]}
                      >
                        ₹{(item.DependantQty * item.DependantRate).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  {item.GuestQty > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billText, { flex: 2 }]}>Guest</Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        {item.GuestQty}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'center' },
                        ]}
                      >
                        ₹{item.GuestRate}
                      </Text>
                      <Text
                        style={[
                          styles.billText,
                          { flex: 1, textAlign: 'right' },
                        ]}
                      >
                        ₹{(item.GuestQty * item.GuestRate).toFixed(2)}
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      alignItems: 'flex-end',
                      marginBottom: 10,
                      marginTop: 5,
                    }}
                  >
                    <Text
                      style={{ fontFamily: FONT_FAMILY.bold, marginTop: 5 }}
                    >
                      Item Total: ₹{itemTotal}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        </View>
        {Object.entries(taxBreakup).map(([key, amount]) => {
          const [type, rateStr] = key.split('_');
          const rate = Number(rateStr);

          if (type === 'GST') {
            const halfRate = rate / 2;
            const halfAmount = amount / 2;

            return (
              <React.Fragment key={key}>
                <View style={styles.billTotalRow}>
                  <Text
                    style={[
                      styles.billText,
                      { fontFamily: FONT_FAMILY.semiBold },
                    ]}
                  >
                    (+) CGST ({halfRate.toFixed(2)}%)
                  </Text>
                  <Text style={[styles.billText, { textAlign: 'right' }]}>
                    ₹{halfAmount.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.billTotalRow}>
                  <Text
                    style={[
                      styles.billText,
                      { fontFamily: FONT_FAMILY.semiBold },
                    ]}
                  >
                    (+) SGST ({halfRate.toFixed(2)}%)
                  </Text>
                  <Text style={[styles.billText, { textAlign: 'right' }]}>
                    ₹{halfAmount.toFixed(2)}
                  </Text>
                </View>
              </React.Fragment>
            );
          }

          return (
            <View key={key} style={styles.billTotalRow}>
              <Text
                style={[styles.billText, { fontFamily: FONT_FAMILY.semiBold }]}
              >
                (+) {type} ({rate.toFixed(2)}%)
              </Text>
              <Text style={[styles.billText, { textAlign: 'right' }]}>
                ₹{amount.toFixed(2)}
              </Text>
            </View>
          );
        })}
        <View style={styles.grandTotalSection}>
          <Text style={{ fontFamily: FONT_FAMILY.bold, fontSize: 18 }}>
            Total: ₹{grandTotal.toFixed(2)}
          </Text>

          <Pressable
            onPress={handlePlaceOrder}
            style={styles.bottomButton}
          >
            <Text style={styles.placeOrderText}>Place Order</Text>
            {loading && <ActivityIndicator color={'white'} size={'small'} />}
            <Icons
              name="chevron-small-right"
              color="white"
              size={25}
              style={styles.arrowIcon}
            />
          </Pressable>
        </View>
      </UniversalModal>
    </View>
  );
};

export default Miscellaneous;

const styles = StyleSheet.create({
  container: { flex: 1 },

  balanceCard: {
    backgroundColor: DARK_BLUE,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceText: {
    color: 'white',
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },

  addBtn: {
    alignSelf: 'flex-end',
  },

  card: {
    backgroundColor: 'white',
    margin: 10,
    padding: 10,
    borderRadius: 8,
    opacity: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  title: {
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 16,
  },

  dropdown: {
    width: '70%',
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: 'gray',
  },

  rateText: {
    fontFamily: FONT_FAMILY.semiBold,
    marginTop: 8,
  },

  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  qtyControls: {
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: 'green',
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  qtyBtn: {
    color: 'green',
    fontSize: 18,
    marginHorizontal: 10,
  },

  qtyValue: {
    fontSize: 16,
    color: 'green',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
  bottomButton: {
    flexDirection: 'row',
    backgroundColor: '#025a0fff',
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    alignItems: 'center',
  },
  placeOrderText: {
    fontFamily: FONT_FAMILY.bold,
    color: 'white',
    fontSize: 15,
    marginLeft: 10,
  },
  arrowIcon: {
    backgroundColor: '#114a16ff',
    borderRadius: 20,
    marginLeft: 10,
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  billText: {
    color: 'black',
    fontFamily: FONT_FAMILY.normal,
    fontSize: 14,
  },
  footer: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalSection: { flexDirection: 'row', alignItems: 'center' },
  totalLabel: { color: 'black', fontFamily: FONT_FAMILY.bold },
  totalValue: { color: 'black', fontFamily: FONT_FAMILY.bold },
  grandTotalSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  billTotalRow: {
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    // borderTopWidth: 1,
    borderColor: '#ccc',
  },
});

//   "data": [
//         {
//             "Code": "15",
//             "HeadName": "Aepta Car Sticker",
//             "HeadAlias": "AEPTA CAR STICKER",
//             "DisplayAs": "Aepta Car Sticker",
//             "TallyLedger": "AEPTA CAR STICKER",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "40.00",
//             "SpouseRate": "40.00",
//             "DependantRate": "40.00",
//             "GuestRate": "40.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "44",
//             "HeadName": "Guest Def(F-S-H)",
//             "HeadAlias": "Guest Def(F-S-H)",
//             "DisplayAs": "Guest Def(F-S-H)",
//             "TallyLedger": "Guest Def(F-S-H)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "200.00",
//             "SpouseRate": "200.00",
//             "DependantRate": "200.00",
//             "GuestRate": "200.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "45",
//             "HeadName": "Guest Def (N)",
//             "HeadAlias": "Guest Def (N)",
//             "DisplayAs": "Guest Def (N)",
//             "TallyLedger": "Guest Def (N)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "75.00",
//             "SpouseRate": "75.00",
//             "DependantRate": "75.00",
//             "GuestRate": "75.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "46",
//             "HeadName": "Guest Def (F-S)",
//             "HeadAlias": "Guest Def (F-S)",
//             "DisplayAs": "Guest Def (F-S)",
//             "TallyLedger": "Guest Def (F-S)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "150.00",
//             "SpouseRate": "150.00",
//             "DependantRate": "150.00",
//             "GuestRate": "150.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "47",
//             "HeadName": "Guest Civ (N)",
//             "HeadAlias": "Guest Civ (N)",
//             "DisplayAs": "Guest Civ (N)",
//             "TallyLedger": "Guest Civ (N)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "200.00",
//             "SpouseRate": "200.00",
//             "DependantRate": "200.00",
//             "GuestRate": "200.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "48",
//             "HeadName": "Guest Civ (F-S.H)",
//             "HeadAlias": "Guest Civ (F-S-H)",
//             "DisplayAs": "Guest Civ (F-S-H)",
//             "TallyLedger": "Guest Civ (F-S-H)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "400.00",
//             "SpouseRate": "400.00",
//             "DependantRate": "400.00",
//             "GuestRate": "400.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "756",
//             "HeadName": "Card Fee (One Day)",
//             "HeadAlias": "",
//             "DisplayAs": "Card Fee (One Day)",
//             "TallyLedger": "Card Fee (One Day)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "100.00",
//             "SpouseRate": ".00",
//             "DependantRate": ".00",
//             "GuestRate": ".00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "757",
//             "HeadName": "Card Week (One Week)",
//             "HeadAlias": "",
//             "DisplayAs": "Card Week (One Week)",
//             "TallyLedger": "Card Week (One Days)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "500.00",
//             "SpouseRate": ".00",
//             "DependantRate": ".00",
//             "GuestRate": ".00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "768",
//             "HeadName": "GC Others All Age (18 Hole)",
//             "HeadAlias": "",
//             "DisplayAs": "GC Others All Age (18 Hole)",
//             "TallyLedger": "GC Others All Age (18 Hole)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "2000.00",
//             "SpouseRate": "2000.00",
//             "DependantRate": "2000.00",
//             "GuestRate": "2000.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "790",
//             "HeadName": "BODY MASSAGE 30 MASSAGE",
//             "HeadAlias": "",
//             "DisplayAs": "BODY MASSAGE 30 MIN",
//             "TallyLedger": "BODY CARE",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "350.00",
//             "SpouseRate": "350.00",
//             "DependantRate": "350.00",
//             "GuestRate": "350.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "791",
//             "HeadName": "FOOT MASSAGE 15 MIN",
//             "HeadAlias": "",
//             "DisplayAs": "FOOT MASSAGE 15 MIN",
//             "TallyLedger": "BODY CARE",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "150.00",
//             "SpouseRate": "150.00",
//             "DependantRate": "150.00",
//             "GuestRate": "150.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "792",
//             "HeadName": "HEAD MASSAGE 15 MIN",
//             "HeadAlias": "",
//             "DisplayAs": "HEAD MASSAGE 15 MIN",
//             "TallyLedger": "BODY CARE",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "150.00",
//             "SpouseRate": "150.00",
//             "DependantRate": "150.00",
//             "GuestRate": "150.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         },
//         {
//             "Code": "793",
//             "HeadName": "GUEST CIV (S-TH )",
//             "HeadAlias": "",
//             "DisplayAs": "GUEST CIV (S-TH )",
//             "TallyLedger": "GUEST CIV (S-TH)",
//             "FlagMiscBilling": "Yes",
//             "GSTStatus": "No",
//             "GSTTaxCode": "1",
//             "ServiceCharge": "No",
//             "Status": "Active",
//             "LocationCode": "1",
//             "MemberRate": "350.00",
//             "SpouseRate": "350.00",
//             "DependantRate": "350.00",
//             "GuestRate": "350.00",
//             "TaxName": "TAX Free",
//             "ValuePercentage": ".00",
//             "TaxType": "GST",
//             "TaxDesc": "TAX Free"
//         }
//     ],
