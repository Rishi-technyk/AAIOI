// ViewStatement.js (compact row layout: Option B)
import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
  AppState,
} from "react-native";
import { useSelector } from "react-redux";
import moment from "moment";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Card } from "react-native-paper";
import { Toast } from "react-native-toast-notifications";
import { createShimmerPlaceholder } from "react-native-shimmer-placeholder";
import LinearGradient from "react-native-linear-gradient";

import Header from "../components/Header";
import DatePickerComponent from "../components/DatePicker";
import NewButton from "../components/Button";
import UniversalModal from "../components/UniversalModal";
import { CustomCheckbox } from "../components/CustomCheckBox";
import AIFilter from "../components/AIFilter";

import InvoiceStyles from "../Styles/InvoiceStyle";
import TransactionBoxImage from "../../assets/svg/TransactionHistory";
import { FONT_FAMILY, DARK_BLUE, LIGHT_GREEN, SECONDARY_COLOR } from "../util/colors";
import { javascriptPost } from "../util/api";
import { useQuery } from "@tanstack/react-query";
// import { useTransactions, useStatments } from "../services/ViewStatementService";






 const useTransactions = (filters: TransactionFilters, userData: any) => {
  return useQuery({
    queryKey: ["transactions", filters, userData?.token],
    queryFn: async () => {
      const body: any = {
        start_date: filters.startDate || null,
        end_date: filters.endDate || null,
        locations: filters.locations || null,
        pay_mode: filters.paymode || null,
        txn_type: filters.transactionType || null,
        min_amount: filters.minAmount ?? null,
        max_amount: filters.maxAmount ?? null,
        search: filters.textSearch || null,
        // voucher_no: filters.voucherNo || null,
        category: filters.category || null,
        sort_key: filters.sortBy?.key || "BillDate",
        sort_dir: filters.sortBy?.dir || "desc",
      };


      // Use full URL or relative path depending on your javascriptPost implementation
      return await javascriptPost({
        path: "member/transaction/filter",
        body,
        Token: userData?.token,
      });
    },
    enabled: !!userData?.token,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * useStatements (PDF/summary) - kept as a helper for "View Bill"
 * Update ENDPOINT.statement in your constants if needed.
 */
 const useStatments = (userData: any) => {
  return useQuery({
    queryKey: ["statements", userData?.token],
    queryFn: async () => {
      return await javascriptGet({
        path: ENDPOINT.statement,
        body: {},
        Token: userData?.token,
      });
    },
    enabled: !!userData?.token,
    retry: 1,
    refetchOnWindowFocus: false,
  });
};


const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient);

const DEFAULT_SORT = { key: "BillDate", dir: "desc" };

const Invoice = ({ navigation }) => {
  const appState = useRef(AppState.currentState);
  const userData = useSelector((s) => s.auth);

  // Filters
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedPayModes, setSelectedPayModes] = useState([]);
  const [transactionType, setTransactionType] = useState(null);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [textSearch, setTextSearch] = useState("");
  // const [voucherNo, setVoucherNo] = useState("");
  const [category, setCategory] = useState("");
  const [recency, setRecency] = useState(null);
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [aiQuery, setAiQuery] = useState("");

  // Payment modal (unchanged)
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [rechargeError, setRechargeError] = useState(false);

  // Build filter object to send to backend
  const filterObject = useMemo(() => {
    const locations = (userData?.user?.location || []).filter((_, idx) =>
      selectedLocations.includes(idx)
    );
    const paymode = (userData?.user?.paymode || []).filter((_, idx) =>
      selectedPayModes.includes(idx)
    );

    let computedStartDate = startDate;
    let computedEndDate = endDate;
    if (recency) {
      computedEndDate = moment().endOf("day").toDate();
      computedStartDate = moment().subtract(recency, "days").startOf("day").toDate();
    }

    return {
      startDate: computedStartDate ? moment(computedStartDate).format("YYYY-MM-DD") : null,
      endDate: computedEndDate ? moment(computedEndDate).format("YYYY-MM-DD") : null,
      locations: locations.length ? locations.join(",") : null,
      paymode: paymode.length ? paymode.join(",") : null,
      transactionType,
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
      textSearch: textSearch || (aiQuery ? aiQuery : null),
      // voucherNo: voucherNo || null,
      category: category || null,
      sortBy,
    };
  }, [
    startDate,
    endDate,
    selectedLocations,
    selectedPayModes,
    transactionType,
    minAmount,
    maxAmount,
    textSearch,
    // voucherNo,
    category,
    recency,
    aiQuery,
    sortBy,
    userData,
  ]);

  // Service hooks
  const { data, isLoading, refetch } = useTransactions(filterObject, userData);
  console.log(data,userData)

  const statement = useStatments(userData);

  // Refresh on app active
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (appState.current.match(/inactive|background/) && next === "active") {
        statement.refetch();
        refetch();
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  const toggleLocation = (idx) =>
    setSelectedLocations((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));
  const togglePaymode = (idx) =>
    setSelectedPayModes((prev) => (prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]));

  const clearAllFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setSelectedLocations([]);
    setSelectedPayModes([]);
    setTransactionType(null);
    setMinAmount("");
    setMaxAmount("");
    setTextSearch("");
    setVoucherNo("");
    setCategory("");
    setRecency(null);
    setAiQuery("");
    setSortBy(DEFAULT_SORT);
  };

  const applyFilters = () => {
    const hasAnyFilter = Object.values(filterObject).some((v) => v !== null && v !== "");
    if (!hasAnyFilter) {
      Toast.show("Please select at least one filter", { type: "warning" });
      return;
    }
    setShowFilterModal(false);
    // react-query key changes will trigger fetch automatically
  };

  const payNowAction = async () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      setRechargeError(true);
      return;
    }
    setLoadingPayment(true);
    try {
      const apiRequestObject = {
        path: "member/create_pay_order",
        body: { type: "Subscription", amount: Number(payAmount) },
        Token: userData?.token,
      };
      const resp = await javascriptPost(apiRequestObject);
      if (resp?.data?.url) {
        const supported = await Linking.canOpenURL(resp.data.url);
        supported ? Linking.openURL(resp.data.url) : Alert.alert("No app found to open link");
      } else {
        Alert.alert(resp?.message || "Payment initiation failed");
      }
    } catch (err) {
      Alert.alert("Network error");
    } finally {
      setLoadingPayment(false);
      setOpenPaymentModal(false);
      setPayAmount("");
      setRechargeError(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <Card style={InvoiceStyles.listcontainer}>
      {/* Top row: Bill No (left) and Amount (right) */}
      <View style={[InvoiceStyles.transactionRow, { justifyContent: "space-between" }]}>
        <Text style={InvoiceStyles.voucherText}>Bill No: <Text style={InvoiceStyles.voucherBold}>{item.BillNo}</Text></Text>
        <Text style={{ fontSize: 16, fontFamily: FONT_FAMILY.bold }}>₹{Number(item.Amount).toFixed(2)}</Text>
      </View>

      {/* Middle row: LocationName */}
      <View style={InvoiceStyles.transactionRow}>
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: FONT_FAMILY.semiBold }}>{item.LocationName}</Text>
      </View>

      {/* PayMode and Balance */}
      <View style={[InvoiceStyles.transactionRow, { justifyContent: "space-between", alignItems: "center" }]}>
        <Text style={{ color: "grey" }}>{item.PayMode}</Text>
        <Text style={{ color: SECONDARY_COLOR }}>Balance: {item.Balance}</Text>
      </View>

      {/* Date row */}
      <View style={InvoiceStyles.transactionRow}>
        <Icon name="calendar-month-outline" size={14} color="grey" />
        <Text style={[InvoiceStyles.dateText, { marginLeft: 6 }]}>{moment(item.BillDate).format("DD MMM YYYY")}</Text>
      </View>
    </Card>
  );

  const emptyList = () => (
    <FlatList
      data={[1,1,1,1,1]}
      renderItem={() => (
        <View style={InvoiceStyles.listcontainer}>
          <ShimmerPlaceholder style={{borderRadius:10}} width={80} />
          <ShimmerPlaceholder style={{borderRadius:10}} />
        </View>
      )}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Header title="Subscription" OpenDropDawn={() => setShowFilterModal(true)} isMulti isDawnload />

      <ScrollView
        refreshControl={
          <RefreshControl
            onRefresh={() => { clearAllFilters(); refetch(); statement.refetch(); }}
            refreshing={isLoading}
            tintColor={SECONDARY_COLOR}
            colors={[DARK_BLUE]}
          />
        }
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={InvoiceStyles.container}>
          <View style={{ backgroundColor: LIGHT_GREEN, borderRadius: 16, padding: 12 }}>
            <View style={InvoiceStyles.svg}><TransactionBoxImage /></View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Icon name="card-account-details-star" size={20} color={DARK_BLUE} />
                <Text style={InvoiceStyles.text}>A/C Summary</Text>
              </View>

              <NewButton text="View Bill" onPress={() => {
                if (statement?.data?.pdf) navigation.navigate("PDFView", { url: statement.data.pdf, title: "Statement" });
                else Toast.show("No Bill generated.");
              }} />
            </View>

            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
              <View>
                <Text style={InvoiceStyles.postpaidBalanceText}>Opening Balance</Text>
                <Text style={InvoiceStyles.moneyText}>{data?.opening_balance ?? "0.00"}</Text>
              </View>
              <View>
                <Text style={InvoiceStyles.postpaidBalanceText}>Closing Balance</Text>
                <Text style={InvoiceStyles.moneyText}>{data?.closing_balance ?? "0.00"}</Text>
              </View>
              <View>
                <Text style={InvoiceStyles.postpaidBalanceText}>Available Credit Limit</Text>
                <Text style={InvoiceStyles.moneyText}>₹{Number(statement?.data?.avaiable_limit || 0).toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{backgroundColor:"white", elevation:3, paddingHorizontal:10}}>
          <View style={{flexDirection:"row", justifyContent:"space-between", alignItems:"center", padding:10}}>
            <Text style={InvoiceStyles.transactionListHeaderText}>Transaction History</Text>
            <View style={{flexDirection:"row", alignItems:"center"}}>
              <TouchableOpacity onPress={() => setShowFilterModal(true)} style={{marginRight:10}}>
                <Icon name="filter-variant" size={24} color={DARK_BLUE}/>
              </TouchableOpacity>
              <AIFilter onApply={(q)=> { setAiQuery(q); setShowFilterModal(false); }} />
            </View>
          </View>
        </View>

        {startDate && endDate && (data?.data?.length > 0) && (
          <Text style={InvoiceStyles.noRecord}>
            Records between {moment(startDate).format("DD MMM YYYY")} to {moment(endDate).format("DD MMM YYYY")}
          </Text>
        )}

        <FlatList
          data={data?.data || []}
          renderItem={renderTransaction}
          keyExtractor={(item, idx) => (item.BillNo?.toString?.() || idx.toString()) + idx}
          ListEmptyComponent={isLoading ? emptyList : (<Text style={InvoiceStyles.noRecord}>No records found.</Text>)}
          contentContainerStyle={{ marginHorizontal: 20, marginTop: 20, paddingBottom: 80 }}
        />
      </ScrollView>

      {/* FILTER MODAL (unchanged UI but Apply closes modal) */}
      <UniversalModal isFull visible={showFilterModal} setVisible={setShowFilterModal} title="Filter by:">
        <View style={{flex:1, padding:12}}>
          <View style={{flexDirection:"row"}}>
            <View style={{minWidth:"32%", borderRightWidth:1, borderRightColor:"#eee", paddingRight:8}}>
              {[
                { id:0, label:"Date" },
                { id:1, label:"Location" },
                { id:2, label:"Pay Mode" },
                { id:3, label:"Txn Type" },
                { id:4, label:"Amount Range" },
                { id:5, label:"Search" },
                { id:6, label:"Voucher #" },
                { id:7, label:"Category" },
                { id:8, label:"Recency" },
                { id:9, label:"Sort" },
              ].map((tab)=>(
                <TouchableOpacity key={tab.id} activeOpacity={0.8} style={{paddingVertical:12}}>
                  <Text style={{fontFamily:FONT_FAMILY.semiBold}}>{tab.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <ScrollView style={{flex:1, paddingLeft:12}}>
              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Date range</Text>
              <DatePickerComponent placeholder={startDate ? moment(startDate).format("DD MMM YYYY") : "Start date"} stateDate={setStartDate} />
              <DatePickerComponent placeholder={endDate ? moment(endDate).format("DD MMM YYYY") : "End date"} stateDate={setEndDate}
                minDate={startDate ? moment(startDate).add(1,"day").toDate() : null} />

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Locations</Text>
              {(userData?.user?.location || []).map((loc, idx) => (
                <TouchableOpacity key={loc} onPress={() => toggleLocation(idx)} style={{flexDirection:"row", alignItems:"center", paddingVertical:8}}>
                  <CustomCheckbox checked={selectedLocations.includes(idx)} onToggle={() => toggleLocation(idx)} />
                  <Text style={{marginLeft:10, color: selectedLocations.includes(idx) ? "black" : "grey"}}>{loc}</Text>
                </TouchableOpacity>
              ))}

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Pay modes</Text>
              {(userData?.user?.paymode || []).map((pm, idx) => (
                <TouchableOpacity key={pm} onPress={() => togglePaymode(idx)} style={{flexDirection:"row", alignItems:"center", paddingVertical:8}}>
                  <CustomCheckbox checked={selectedPayModes.includes(idx)} onToggle={() => togglePaymode(idx)} />
                  <Text style={{marginLeft:10, color: selectedPayModes.includes(idx) ? "black" : "grey"}}>{pm}</Text>
                </TouchableOpacity>
              ))}

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Transaction Type</Text>
              <View style={{flexDirection:"row", marginTop:6}}>
                <TouchableOpacity onPress={() => setTransactionType(null)} style={{padding:8, borderRadius:8, backgroundColor: transactionType===null? "#e6f2ff":"#f6f6f6", marginRight:8}}><Text>All</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setTransactionType("credit")} style={{padding:8, borderRadius:8, backgroundColor: transactionType==="credit"? "#e6f2ff":"#f6f6f6", marginRight:8}}><Text>Credit</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setTransactionType("debit")} style={{padding:8, borderRadius:8, backgroundColor: transactionType==="debit"? "#e6f2ff":"#f6f6f6"}}><Text>Debit</Text></TouchableOpacity>
              </View>

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Amount range</Text>
              <View style={{flexDirection:"row", alignItems:"center"}}>
                <TextInput placeholder="Min" keyboardType="numeric" value={minAmount} onChangeText={setMinAmount} style={{flex:1,padding:8,borderWidth:1,borderColor:"#eee",borderRadius:8,marginRight:8}}/>
                <TextInput placeholder="Max" keyboardType="numeric" value={maxAmount} onChangeText={setMaxAmount} style={{flex:1,padding:8,borderWidth:1,borderColor:"#eee",borderRadius:8}}/>
              </View>

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Search (particulars / narration)</Text>
              <TextInput placeholder="Search text" value={textSearch} onChangeText={setTextSearch} style={{padding:8, borderWidth:1, borderColor:"#eee", borderRadius:8}}/>

              {/* <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Voucher No.</Text>
              <TextInput placeholder="Voucher number" value={voucherNo} onChangeText={setVoucherNo} style={{padding:8, borderWidth:1, borderColor:"#eee", borderRadius:8}}/> */}

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Category / Particulars</Text>
              <TextInput placeholder="Category" value={category} onChangeText={setCategory} style={{padding:8, borderWidth:1, borderColor:"#eee", borderRadius:8}}/>

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Quick recency</Text>
              <View style={{flexDirection:"row", marginTop:6}}>
                {[7,30,90].map(r => (
                  <TouchableOpacity key={r} onPress={() => setRecency(recency===r?null:r)} style={{padding:8, marginRight:8, borderRadius:8, backgroundColor: recency===r ? "#e6f2ff" : "#f6f6f6"}}><Text>Last {r} days</Text></TouchableOpacity>
                ))}
              </View>

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>Sort</Text>
              <View style={{flexDirection:"row", marginTop:6}}>
                <TouchableOpacity onPress={()=>setSortBy({key:"BillDate",dir: sortBy.dir==="desc"? "asc":"desc"})} style={{padding:8, marginRight:8, borderRadius:8, backgroundColor:"#f6f6f6"}}>
                  <Text>Date {sortBy.key==="BillDate" ? (sortBy.dir==="desc"? "↓":"↑") : ""}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setSortBy({key:"Amount",dir: sortBy.key==="Amount" && sortBy.dir==="desc"? "asc":"desc"})} style={{padding:8, marginRight:8, borderRadius:8, backgroundColor:"#f6f6f6"}}>
                  <Text>Amount {sortBy.key==="Amount" ? (sortBy.dir==="desc"? "↓":"↑") : ""}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>setSortBy({key:"BillNo",dir:"asc"})} style={{padding:8, borderRadius:8, backgroundColor:"#f6f6f6"}}>
                  <Text>Voucher</Text>
                </TouchableOpacity>
              </View>

              <Text style={{marginTop:8, fontFamily:FONT_FAMILY.bold}}>AI Filter</Text>
              <AIFilter onApply={(q)=> { setAiQuery(q); Toast.show("AI filter set"); }} />

              <View style={{flexDirection:"row", marginTop:20, justifyContent:"space-between"}}>
                <NewButton text="Clear" onPress={clearAllFilters} />
                <NewButton text="Apply" onPress={applyFilters} />
              </View>
            </ScrollView>
          </View>
        </View>
      </UniversalModal>

      {/* Payment Modal (unchanged) */}
      <Modal visible={openPaymentModal} transparent animationType="slide" onRequestClose={() => setOpenPaymentModal(false)}>
        <View style={InvoiceStyles.modal}>
          <View style={[InvoiceStyles.innerModalCont, {flex:1}]}>
            <View style={InvoiceStyles.headingContainer}>
              <Text style={InvoiceStyles.headingText}>Bill Payment</Text>
              <Icon onPress={() => setOpenPaymentModal(false)} name="close" size={25} style={InvoiceStyles.cancelText} />
            </View>
            <View style={{padding:12}}>
              <Text>Billed amount: ₹{statement?.data?.amount_payable ?? "0.00"}</Text>
              <TextInput placeholder="Enter amount" keyboardType="numeric" value={payAmount} onChangeText={(t)=>{ setPayAmount(t); setRechargeError(false); }} style={{padding:8,borderWidth:1,borderColor: rechargeError? "red":"#eee", borderRadius:8, marginTop:8}} />
              {rechargeError && <Text style={{color:"red"}}>Enter valid amount</Text>}
              <NewButton loading={loadingPayment} text="Proceed" onPress={payNowAction} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Invoice;
