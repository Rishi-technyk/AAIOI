import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useRoute } from "@react-navigation/native";
import Share from "react-native-share";
import { javascriptGet } from "../../util/api";
import { DOMAIN, ENDPOINT } from "../../util/constant";
import { useSelector } from "react-redux";
import Header from "../../components/Header";
import moment from "moment";
import TicketShimmer from "../../components/TicketShimmer";
import RNHTMLtoPDF, { generatePDF } from 'react-native-html-to-pdf';
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AppStackParamList } from "../../navigation/AppDrawer";
import { FONT_FAMILY ,} from "../../util/colors";

type Props=NativeStackScreenProps<AppStackParamList ,'EventBookingDetails'>

const EventPassDetails:React.FC<Props> = ({ navigation,route }) =>{

  const { bookingId } = route.params;
  const userData = useSelector((s: any) => s.auth);
  const [bookingParticipants, setBookingParticipants] = useState<any[]>([]);
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingShare, setLoadingShare] = useState(false);
  const [booking, setBooking] = useState<any>(null);

  const fetchDetails = async () => {
    setLoading(true);
    const res = await javascriptGet({
      path: `${ENDPOINT.event_booking_detail}/${bookingId}`,
      Token: userData?.token,
    });
    if (res?.status) {
      setBooking(res.booking);
      setBookingParticipants(res.participants);
      // const grouped = Object.values(
      //   res.participants.reduce((acc: any, p: any) => {
            

      //     acc[p.ticket_type] = acc[p.ticket_type] || {
      //       ticket_type: p.ticket_type,
      //        is_complimentary:Number(p.is_complimentary),
      //       count: 0,
      //       ticket_id: p.ticket_id,
      //       title: p.title,
      //     };
      //     acc[p.ticket_type].count++;
      //     return acc;
      //   }, {})
      // );
      // setPasses(grouped);
   const grouped = Object.values(
  res.participants.reduce((acc: any, p: any) => {

    const key = Number(p.ticket_id);

    if (!acc[key]) {
      acc[key] = {
        amount:p.amount,
        ticket_id: Number(p.ticket_id),
        ticket_type: p.ticket_type,
        title: p.title,
        is_complimentary: Number(p.is_complimentary),
        count: 0,
      };
    }


    acc[key].count += 1;
    return acc;
  }, {})
);


setPasses(grouped);

    }

    setLoading(false);
  };
console.log(RNHTMLtoPDF);
  useEffect(() => {
    fetchDetails();
  }, []);

const generatePDF1 = async ():Promise<void> => {
  console.log(bookingParticipants,'bookingParticipants');
  if (!bookingParticipants?.length) return;



try {
  

  const LOGO =
    DOMAIN.ICON_URL;

  let html = `
  <html>
  <head>
    <style>
      @page {
        size: A4;
        margin: 0;
      }

      body {
        margin: 0;
        padding: 0;
        width: 794px;     /* A4 width */
        height: 1123px;   /* A4 height */
        font-family: Helvetica;
      }

      .page {
        width: 794px;
        height: 1123px;
        display: flex;
        flex-wrap: wrap;
        box-sizing: border-box;
      }

      .ticket {
        width: 50%;
        height: 50%;
        padding: 10px;
        box-sizing: border-box;
    
  );
      }

      .ticket-bg {
        width: 100%;
        height: 100%;
        background-size: cover;
         
        background-position: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: white;
        text-align: center;
         
      }
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0.6),
    rgba(0,0,0,0.3),
    rgba(0,0,0,0.6)
  );
}
      .logo {
        width: 60px;
        height: 60px;
        margin-bottom: 10px;
      }

      .club-name {
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 5px;
      }

      .event-title {
        font-size: 18px;
        font-weight: bold;
      }

      .event-date {
        margin-top: 5px;
        font-size: 14px;
      }

      .pass-type {
        margin-top: 10px;
        font-size: 13px;
        letter-spacing: 2px;
        font-weight: bold;
      }

      .qr-box {
        margin-top: 15px;
        padding: 10px;
        background: white;
      }

      .qr {
        width: 150px;
        height: 150px;
      }

      .info {
        margin-top: 8px;
        font-size: 13px;
      }
    </style>
  </head>

  <body>
  `;

  // LOOP PARTICIPANTS IN GROUPS OF 4
  for (let i = 0; i < bookingParticipants.length; i += 4) {
    html += `<div class="page">`;

    const group = bookingParticipants.slice(i, i + 4);

    group.forEach((p) => {
      const bg = DOMAIN.IMG+'passes/'+ p.image_background;

      html += `
        <div class="ticket">
          <div class="ticket-bg" style="background-image:url('${bg}')">

            <img src="${LOGO}" class="logo" />

            <div class="club-name">${booking.formate.heading}</div>
            <div>${booking.formate.subheading}</div>

            <div class="event-title">${booking.event_name}</div>
            <div class="event-date">
              ${moment(booking.event_date).format("ddd MMM DD YYYY • h:mm A")}
            </div>

            <div class="pass-type">${p.ticket_type.toUpperCase()} PASS</div>
<div class="event-date">
    ${p?.ticket_type?.toUpperCase() !== 'VIP' ? p.title : ''}
</div>
            
            <div class="qr-box">
              <img src="data:image/svg+xml;base64,${p.qr_code}" class="qr" />
            </div>

            <div class="info" style="width:60%;">${Number(p.is_complimentary) == 1 && (p.ticket_type.toUpperCase() ==="MEMBER"||p.ticket_type.toUpperCase() ==='SPOUSE' )? booking.formate.complimentary_footer1: booking.formate.footer1 }</div>
            <div class="info">${booking.booking_no}-${p.id}</div>
            <div class="info">Member: ${p.ticket_type.toUpperCase()==='VIP'?'Special Invitee':booking.memberId||''}</div>
            <div class="info">${booking.formate.footer2}</div>
            <div class="info">${booking.formate.footer3}</div>

            ${booking.seats.length && booking.seats.map((s: any) => `<div class="info">Seat: ${s.seat_code}</div>`).join("")}
          </div>
        </div>
      `;
    });

    html += `</div>`;
  }
  html += `</body></html>`;
return await generatePDF({
    html,
    fileName: `event_passes_${bookingId}`,
    base64: false,
  });
  } catch (error) {
 Alert.alert('Unable to create PDF.') 
}
};
const shareAllTickets = async ():Promise<void> => {
  try {
    setLoadingShare(true)
    const file =await  generatePDF1();
   
    setLoadingShare(false)
   
    await Share.open({
      title: "Event Tickets",
      message: "Here are the event tickets",
      url: `file://${file.filePath}`, 
      type: "application/pdf",
    });
  } catch (e) {
    console.log("Share error", e);
  }
};
  const renderItem = ({ item }: any) => {
   
    const amount = item.is_complimentary ? 0:item.amount;
    const subtotal = amount * item.count;
    // filter participants for this pass
    const relatedParticipants = bookingParticipants.filter(
      (p: any) => p.ticket_type.toUpperCase() === item.ticket_type.toUpperCase()
    );

    const entryDone = relatedParticipants.filter((p) => p.entry_status).length;
    const foodDone = relatedParticipants.filter((p) => p.food_status).length;

    return (
      <View
        style={styles.card}
       
      >
        {/* LEFT */}
        <View style={{ flex: 1 }}>
          <Text style={styles.passType}>
            {item.title.toUpperCase()} PASS
          </Text>

          <Text style={styles.subText}>
            {item.count} × ₹{amount}
          </Text>

        
        </View>

        {/* RIGHT */}
        <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.subText}>
            Entry: {entryDone}/{item.count} • Food: {foodDone}/{item.count}
          </Text>
          <Text style={styles.total}>₹{subtotal.toFixed(2)}</Text>
        </View>
      </View>
    );
  };
  return (
    <View style={{ flex: 1 }}>
      <Header title={"Pass Details"} >
         {!loading &&(
          <View style={{flexDirection:'row',alignItems:'center'}}><Pressable onPress={()=>navigation.navigate('EventPasses',{ bookingId: bookingId})} style={{borderWidth:0.4,borderRadius:6,borderColor:'white',padding:5}}>
           <Text style={{color:'white',}}>
           View Passes
          </Text>
         </Pressable>
          {loadingShare ?<ActivityIndicator color={'white'}/>:<Pressable onPress={shareAllTickets} >
           <Icon name="share" size={22} color="#fff" style={{marginLeft:10}} />
         </Pressable>}
         </View>)}
         
      </Header>
      {loading ? (
        <>
          <TicketShimmer />
          <TicketShimmer />
        </>
      ) : (
        <View style={styles.container}>
          <Text style={styles.date}>Booking No: {booking?.booking_no}</Text>
          <Text style={styles.title}>{booking?.event_name}</Text>
          <Text style={styles.date}>
            {" "}
            on{" "}
            {moment(booking?.event_date).format("ddd MMM DD YYYY [at] h.m A")}
          </Text>
          <View>
           <FlatList
            data={passes}
            keyExtractor={(i, idx) => idx.toString()}
            renderItem={renderItem}
          
          />
          </View>
           {booking?.waiter_amount > 0 && (
        <View
        style={styles.card}
       
      >
            <Text style={styles.label}>{booking.waiter_count||0} Waiter</Text>
            <Text style={styles.value}>₹{booking?.waiter_amount}</Text>
          </View>
        )}
          {booking?.seats?.length > 0 && (
        <View
        style={styles.card}
       
      >
            <Text style={[styles.label,{maxWidth:'80%'}]}>Seat Number: </Text>
            <Text style={styles.total}> {booking.seats.map((s: any) => s.seat_code).join(", ")}</Text>
           
          </View>
        )}
        </View>
      )}
    
    {loading?  <TicketShimmer />:  <View style={styles.summaryCard}>
        <View style={styles.row}>
          <Text style={styles.label}>Sub total</Text>
          <Text style={styles.value}>
            ₹{Number(booking?.ticket_subtotal).toFixed(2)}
          </Text>
        </View>
        {booking.seats && <View style={styles.row}>
          <Text style={styles.label}>Seat total</Text>
          <Text style={styles.value}>
           ₹{booking.seats.reduce((acc, s) => acc + Number(s.amount), 0).toFixed(2)}
          </Text>
        </View>}

       

        {booking?.service_charge ? (
          <View style={styles.row}>
            <Text style={styles.label}>Service Charge</Text>
            <Text style={styles.value}>₹{booking?.service_charge}</Text>
          </View>
        ) : null}

        {booking?.gst ? (
          <View style={styles.row}>
            <Text style={styles.label}>GST</Text>
            <Text style={styles.value}>₹{booking?.gst}</Text>
          </View>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>
            ₹{Number(booking?.total_paid).toFixed(2)}
          </Text>
        </View>
      </View>}
    </View>
  );
}

export default EventPassDetails
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f6f8",
    padding: 16,
  },

  title: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 18,
    marginBottom: 4,
    color: "black",
  },

  date: {
    color: "#6b7280",
    marginBottom: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  passType: {
    fontFamily: FONT_FAMILY.bold,
    fontSize: 16,
    color: "#111827",
  },

  subText: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: FONT_FAMILY.normal,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginTop: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    color: "#6b7280",
  },

  value: {
    fontSize: 13,
    color: "#111827",
    fontFamily: FONT_FAMILY.bold,
  },
  total: {
    fontSize: 13,
    color: "#111827",
    fontFamily: FONT_FAMILY.bold,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 10,
  },

  totalLabel: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
    color: "black",
  },

  totalValue: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    color: "#135bec",
  },

});
