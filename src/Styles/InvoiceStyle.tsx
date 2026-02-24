import { StyleSheet } from "react-native";
import { DARK_BLUE, FONT_FAMILY, SECONDARY_COLOR } from "../util/colors";


const InvoiceStyles = StyleSheet.create({
  emptyListText: { fontFamily: FONT_FAMILY.normal, textAlign: "center" },
  container: {
    backgroundColor: DARK_BLUE,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  text: {
    fontSize: 16,
    color: DARK_BLUE,
    fontFamily: FONT_FAMILY.bold,
    marginLeft: 5,
  },
  svg: { position: "absolute",right: 5,top:130 },
 
  transactionListHeaderText: {
    flex: 1,
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
    color: "black",
  },
  listcontainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  innerListCont: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  dateText: {
    fontFamily: FONT_FAMILY.semiBold,
    color: "black",
    marginLeft: 5,
  },
  voucherText: {
    color: "black",
    fontFamily: FONT_FAMILY.light,
  },
  voucherBold: {
    color: "black",
    fontFamily: FONT_FAMILY.bold,
  },
  transactionRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  debitContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  debitText: {
    color: "red",
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },
  creditContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  creditText: {
    color: SECONDARY_COLOR,
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
  },
  narrationText: {
    color: "rgba(60, 67, 65, 0.9)",
    fontFamily: FONT_FAMILY.semiBold,
    fontSize: 12,
    flex: 1,
  },
  modal: {
    flex: 1,
backgroundColor:'white',
borderTopRightRadius:20,
borderTopLeftRadius:20,
marginTop:30
  },
  innerModalCont: {
    flex: 0.4,
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 10,
  },
  submitContainer: {
    flexDirection: "row",
    justifyContent: "center",

    backgroundColor: SECONDARY_COLOR,
    paddingVertical: 10,
    borderRadius: 5,
    marginHorizontal: 30,
    marginBottom: 30,
  },
  cancelText: {
    color: "red",
    textAlign: "right",
  },
  confirmText: {
    color: "white",
    fontFamily: FONT_FAMILY.bold,
    marginHorizontal: 10,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 10,
    marginVertical: 10,
    padding: 10,
    color: "black",
    fontFamily: FONT_FAMILY.normal,
  },
  postpaidBalanceText: {
    fontSize: 14,
    marginTop: 5,
    fontFamily: FONT_FAMILY.normal,
    color:'black'
  },
  moneyText: {
    fontSize: 15,
    color: "#79ca14",
    marginTop: 3,
    fontFamily: FONT_FAMILY.bold,
  },
  noRecord: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.semiBold,
    color: "black",
    marginTop: 5,
    textAlign: "center",
  },
  alertImage: {
    height: 50,
    width: 50,
    resizeMode: "cover",
    marginBottom: 20,
  },
  headingText: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 20,
    color: "black",
  },
  headingContainer: {
    borderBottomWidth: 0.5,
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterheading:{
            flex: 1,
            backgroundColor: 'white',
            borderTopRightRadius: 20,
            borderTopLeftRadius: 20,
          },
          flatlistcontainer:{
            marginHorizontal: 20,
            marginTop: 20,
            flex: 1,
          },
          imptylist:{
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                },transactiontext:{
              flex: 1,
              flexDirection: 'row',
              padding: 10,
              alignItems: 'center',
              justifyContent: 'space-between',
            },errortxt:{ color: 'red', fontFamily: FONT_FAMILY.light },Input:{
                flex: 1,
                borderWidth: 1,
                borderRadius: 8,
                padding: 10,
                marginRight: 10,
                fontFamily: FONT_FAMILY.normal,
                color: 'black',
                fontSize: 18,
               
              }
});
export default InvoiceStyles;