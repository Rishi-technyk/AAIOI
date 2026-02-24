import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Header from '../components/Header'
import RenderHTML from 'react-native-render-html'
import { FONT_FAMILY } from '../util/colors';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppDrawer';
const data = [
  {
    data: `<p><strong>Privacy Policy</strong></p>
<p>We respect your right to online privacy. When you register on this site or otherwise provide any personal information to us online, your personal information will only be used in conjunction with providing you with enhanced services related to the site. It will never be sold or shared with any third party. We may, for instance, contact you to offer assistance, provide information or otherwise help with your real estate search or sale. We may also provide you with enhanced services such as e-newsletter or instant alerts when homes that match your search criteria come on the market. You may opt-out of any communications at any time.<br />Anonymous Information</p>
<p>Like most sites on the Internet, we also collect anonymous data on how our visitors use our site for the purpose of calculating aggregate site statistics. This data reflects site usage patterns gathered during thousands of customer visits each month and does not contain any personally identifying information whatsoever. We reserve the right to share this anonymous data, provide log files and other databases of user information to third parties for analysis, and use this information to better understand client traffic and improve online services.<br />Questions</p>
<p>For more information about our privacy policy please don&rsquo;t hesitate to email us at gviclub@gmail.com</p>
<!-- Comments are visible in the HTML source only -->`},
  {
    data: `<p>These Terms and Conditions of Use Agreement (the &ldquo;Agreement&rdquo;) is between you and Gurjinder Vihar Club (GVI Club) as &ldquo;GVI Club&rdquo; and sets forth the terms and conditions under which Gurjinder Vihar Club (GVI Club) provides access to content and services at and through www.gvicc.in (the &ldquo;Site&rdquo;).</p>
<p><br /><strong>ACCEPTANCE OF THE AGREEMENT</strong></p>
<p>Your use of the Site and any services or Content (as defined below) available on or through the Site or through Gurjinder Vihar Club (GVI Club), constitutes your acceptance, without modification, of the terms and conditions of this Agreement. By using the Site or any services provided by Gurjinder Vihar Club (GVI Club), you represent and agree that you are eighteen (18) years of age or older, are of legal age and capacity to form a binding contract or have the permission and/or legal authorization of your parent or legal guardian to enter into this Agreement, and that you are not a person barred from entering into agreements in and receiving services from the Government of Law. If you do not agree with the terms and conditions of this Agreement, you agree not to access the Site or use the services provided by Gurjinder Vihar Club (GVI Club). If you have any questions about this Agreement or the practices of this Site, do not use the site and please contact Gurjinder Vihar Club (GVI Club) at <a href="mailto:gvaiawho@gmail.com">gvaiawho@gmail.com</a></p>
<p><br /><strong>ADDITIONAL TERMS AND CONDITIONS</strong></p>
<p>Certain features and services available on the Site may be subject to additional terms and conditions, including the payment of certain fees. All purchases of services are subject to the Gurjinder Vihar Club (GVI Club) Terms and Conditions of Services Agreement. Gurjinder Vihar Club (GVI Club)&acute;s collection and use of personal information that you may provide to Gurjinder Vihar Club (GVI Club), or which may be collected from you by the Gurjinder Vihar Club (GVI Club), is governed by the Gurjinder Vihar Club (GVI Club) Privacy Policy which is expressly incorporated into this Agreement as if contained herein in its entirety.</p>
<p><br /><strong>AMENDMENT AND MODIFICATIONS TO AGREEMENTS</strong></p>
<p>Gurjinder Vihar Club (GVI Club) may amend or make additions, deletions or modifications to this Agreement, the Gurjinder Vihar Club (GVI Club)Terms and Conditions of Services and Gurjinder Vihar Club (GVI Club) Privacy Policy at any time and without prior notice. Such amendments or modifications shall be effective upon posting the amended terms on the Site and/or e-mailing of such amendments or modifications to registered users of the Site, and you agree to be bound by such amendments or modifications for any future use of the Site or services provided by Gurjinder Vihar Club (GVI Club) after they are posted and/or e-mailed.</p>
<p><br /><strong>ACCOUNT MEMBERSHIP ELIGIBILITY</strong></p>
<p>If you become a member or subscribe to any services offered on or through the Site, you agree to:</p>
<p>&ndash; provide true, accurate, current and complete information about yourself and/or your company as prompted by the registration and order forms, and</p>
<p>&ndash; to maintain and update this information to keep it true, accurate, current and complete. If any information provided by you is untrue, inaccurate, not current or incomplete, Gurjinder Vihar Club (GVI Club) reserves the right to terminate your account and refuse any and all current or future use of the Site and affiliated services. You are solely responsible for choosing and keeping secure your password to access your account on the Site. Gurjinder Vihar Club (GVI Club) bears no responsibility for your account being compromised and used without your authorization. Should you become aware of unauthorized activity on your account, you agree to notify Gurjinder Vihar Club (GVI Club) immediately. You further agree not to share user names or passwords, which is expressly prohibited, unless authorized in writing by Gurjinder Vihar Club (GVI Club). You further agree not to reverse engineer, hack, spam, block, disrupt, or otherwise change or alter, or attempt to change or alter, the Site.</p>
<p><br /><strong>CHILDREN UNDER 18</strong></p>
<p>Gurjinder Vihar Club (GVI Club) does not knowingly collect or solicit personal information from anyone under the age of 18 or knowingly allow such persons to register with Gurjinder Vihar Club (GVI Club). If you are under 18, please do not send any information to us, including your name, address, telephone number, or email address. No one under age 18 is allowed to provide any personal information to Gurjinder Vihar Club (GVI Club) or be a user of Gurjinder Vihar Club (GVI Club) services. In the event that we learn that we have collected personal information from a child under age 18 without verification of parental consent, we will delete that information as quickly as possible. If you believe that we might have any information from or about a child under 18, please contact us at <a href="mailto:dgcsecretary@hotmail.com">dgcsecretary@hotmail.com</a></p>
<p><br /><strong>USER CONDUCT</strong></p>
<p>You understand that the services provided by Gurjinder Vihar Club (GVI Club) are available for your personal, non-commercial use only. You represent, warrant and agree that no materials of any kind submitted through your Gurjinder Vihar Club (GVI Club) account will violate or infringe upon the rights of any third party, including copyright, trademark, privacy, publicity or other personal or proprietary rights; or contain libelous, defamatory or otherwise unlawful material. You further agree that you may not use the services provided by Gurjinder Vihar Club (GVI Club) or the Site in any unlawful manner or in any other manner that could damage, disable, overburden or impair the Site. In addition, you agree not to use the services provided by Gurjinder Vihar Club (GVI Club) or the Site to:</p>
<p>&ndash; Upload, post, email, transmit or otherwise make available any content that Gurjinder Vihar Club (GVI Club), in its sole discretion, deems to be harmful, threatening, abusive, harassing, vulgar, obscene, or hateful, or is racially, ethnically, religiously, or otherwise offensive;</p>
<p>&ndash; Engage in any activities in violation of any applicable local, state, national, regional, or international law, rules, or regulations;</p>
<p>&ndash; Transmit any material that infringes any copyright, patent, trade secret, or other proprietary or privacy right of any third party;</p>
<p>&ndash; Impersonate any person or entity, or falsely state or otherwise misrepresent yourself or your affiliation with any person or entity;</p>
<p>&ndash; Upload, post, email, transmit or otherwise make available any unsolicited or unauthorized advertising, promotional materials, &ldquo;junk mail,&rdquo; &ldquo;spam,&rdquo; &ldquo;chain letters,&rdquo; &ldquo;pyramid schemes,&rdquo; or any other form of commercial solicitation;</p>
<p>&ndash; Upload, post, email, transmit or otherwise make available any material that contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer software or hardware or telecommunications equipment;</p>
<p>&ndash; Intimidate or harass another; or</p>
<p>&ndash; Use or attempt to use another&acute;s account, service or system without authorization from Gurjinder Vihar Club (GVI Club), or create a false identity on the Site.</p>
<p>Gurjinder Vihar Club (GVI Club) may terminate your ability to access the Site or use the services provided by Gurjinder Vihar Club (GVI Club) at any time and for any reason in its sole discretion. Gurjinder Vihar Club (GVI Club) reserves the right at any time from time to time and without notice to modify or discontinue, temporarily or permanently, the Site or the services it provides. You agree that Gurjinder Vihar Club (GVI Club) shall not be liable to you or to any third party for any modification, suspension, or discontinuation of the Site or the services.</p>
<p>If Gurjinder Vihar Club (GVI Club) identifies that you are using the Site for commercial use, Gurjinder Vihar Club (GVI Club) may seek to be reimbursed for any and all costs and expenses related to your usage of the Site, including reasonable attorneys fees arising from your breach of this Agreement.</p>
<p><br /><strong>OWNERSHIP AND COPYRIGHT AND TRADEMARK NOTICE</strong></p>
<p>This Site is owned and operated by Gurjinder Vihar Club (GVI Club) doing business as Gurjinder Vihar Club (GVI Club). All content, information and materials appearing on this Site, including, without limitation, text, site design, logos, graphics, icons, images, and voice, video, and sound clips, as well as, the selection, assembly and arrangement thereof (&ldquo;Content&rdquo;) are the sole property of Gurjinder Vihar Club (GVI Club) or its licensors and are protected by International copyright, patent and trademark laws and treaties. Gurjinder Vihar Club (GVI Club) and its licensors expressly reserve all rights in and to such Content. You may use the Content contained on this Site and the services offered through this Site only for your own personal purposes. No Content from this Site may be copied, reproduced, modified, republished, uploaded, posted, transmitted, or distributed in any form or by any means without Gurjinder Vihar Club (GVI Club)&acute;s or its licensor&acute;s prior written permission except as explicitly permitted in this Agreement.</p>
<p>All content, information, and materials you upload to the Site or provide to Gurjinder Vihar Club (GVI Club) using the services offered by Gurjinder Vihar Club (GVI Club), including, without limitation, text, graphics, icons, images, and voice, video, and sound clips shall become the property of Gurjinder Vihar Club (GVI Club) immediately upon their upload or transmission and you hereby assign and agree to assign all rights in such materials to Gurjinder Vihar Club (GVI Club). Gurjinder Vihar Club (GVI Club) may store, delete, retain, or dispose of such materials in its sole discretion and shall be under no obligation to retain such materials for any particular period of time.</p>
<p>All software used on the Site, to provide services through the Site, and to operate the Site is the sole property of Gurjinder Vihar Club (GVI Club) or its licensors and may not be used elsewhere without prior written permission. Certain patents, trademarks, copyrights and other content or proprietary information used on this Site may be owned by third parties not affiliated with Gurjinder Vihar Club (GVI Club) and are being used under license and with permission by Gurjinder Vihar Club (GVI Club) under various agreements.</p>
<p><br /><strong>UNSOLICITED IDEAS</strong></p>
<p>Gurjinder Vihar Club (GVI Club) welcomes your comments and feedback about the site or about its services; however, Gurjinder Vihar Club (GVI Club), in its sole discretion, reserves the right to use or not use any ideas, content, materials, or suggestions you submit without any express or implied obligation, contract or compensation to you. all ideas, materials, or suggestions (including, without limitation, unsolicited ideas, suggestions, or materials) submitted shall become the property of Gurjinder Vihar Club (GVI Club) and Gurjinder Vihar Club (GVI Club) may use such ideas, materials, or suggestions in whole or in part at Gurjinder Vihar Club (GVI Club)&acute;s sole discretion without compensation or credit to you.</p>
<p><br /><strong>INDEMNIFICATION</strong></p>
<p>You agree to defend, indemnify and hold harmless Gurjinder Vihar Club (GVI Club) and its subsidiaries, affiliates, related companies, employees, officers, directors, agents, telecommunications providers, and content providers from all claims, demands, liabilities, costs, and expenses, including reasonable attorneys&acute; fees, arising from your breach of this Agreement, your violation of the rights of any third parties using the services provided by Gurjinder Vihar Club (GVI Club) or the Site, or your violation of any federal, state, local or other applicable laws, rules, or regulations using the service provided by Gurjinder Vihar Club (GVI Club) or the Site.<br />SECURITY</p>
<p>Gurjinder Vihar Club (GVI Club) takes steps to ensure that all information collected is treated securely and in accordance with this Agreement and the Gurjinder Vihar Club (GVI Club) Privacy Policy. Unfortunately, no data transmission over the Internet or telephone can be guaranteed to be 100% secure. Accordingly, Gurjinder Vihar Club (GVI Club) cannot ensure or warrant the security of any information you transmit to Gurjinder Vihar Club (GVI Club). Therefore, any transmission of information by you to Gurjinder Vihar Club (GVI Club) is done at your own risk. When Gurjinder Vihar Club (GVI Club) receives your transmission, Gurjinder Vihar Club (GVI Club) makes commercially reasonable efforts to ensure the security of your information on our systems.</p>
<p><br /><strong>JURISDICTION, VENUE, AND NOTICES</strong></p>
<p>All legal disputes arising from or relating to the Site, your access and/or use of the Site, this Agreement, the Gurjinder Vihar Club (GVI Club) Privacy Policy, and the Gurjinder Vihar Club (GVI Club) Terms and Conditions of Services Agreement shall be settled under the laws of Indian courts subject to laws of Republic of India. In the event of any dispute of whatever nature, such dispute shall be settled in good faith between the parties. In case, such dispute cannot be resolved by negotiation within 30 days, such dispute shall be referred to a binding arbitration in accordance with the provisions of the Arbitration and Conciliation Act 1996. The place of arbitration shall be Gurjinder Vihar Club (GVI Club), India. In case of the dispute requiring intervention of courts, courts in Gurjinder Vihar Club (GVI Club), India alone shall have exclusive jurisdiction.</p>
<p>You agree that the exclusive jurisdiction and venue for any litigation be an appropriate court located in Gurjinder Vihar Club (GVI Club), India and you irrevocably consent to the exclusive jurisdiction and venue of such courts. If either party files suit or engages in other legal process to enforce the terms and conditions of this Agreement or the Gurjinder Vihar Club (GVI Club) Terms and Conditions of Services Agreement, or to collect monies owed by reason of this Agreement or the Gurjinder Vihar Club (GVI Club) Terms and Conditions of Services Agreement, the prevailing party in any such litigation shall be entitled to recover its reasonable attorneys fees and costs in connection with such enforcement efforts. You agree that Gurjinder Vihar Club (GVI Club) may provide notices relating to this Agreement, the Gurjinder Vihar Club (GVI Club) Privacy Policy, and the Gurjinder Vihar Club (GVI Club) Terms and Conditions of Services Agreement to you, including those regarding changes, by e-mail, regular, mail, and/or postings to the Site.</p>
<p><br /><strong>ENTIRE AGREEMENT</strong></p>
<p>The Agreement and the Gurjinder Vihar Club (GVI Club) Privacy Policy constitutes the entire agreement between you and Gurjinder Vihar Club (GVI Club) and governs your use of the Site and the services provided by Gurjinder Vihar Club (GVI Club), superseding any prior agreements between you and Gurjinder Vihar Club (GVI Club) with respect to the Site and the services provided by Gurjinder Vihar Club (GVI Club). You also may be subject to additional terms and conditions that may apply when you use or purchase certain other Gurjinder Vihar Club (GVI Club) services, affiliate services and third-party content using the Site.</p>
<p><br /><strong>WAIVER AND SEVERABILITY</strong></p>
<p>The failure of Gurjinder Vihar Club (GVI Club) to exercise or enforce any right or provision of this Agreement shall not constitute a waiver of such right or provision. If any provision of this Agreement is found by a court of competent jurisdiction to be invalid, the parties agree that the court should endeavor to give effect to the parties. Intentions as reflected in the provision and the other provisions of this Agreement shall remain in full force and effect.</p>
<!-- Comments are visible in the HTML source only -->`},
  {
    data: `<p>The information contained and transmitted through the Website is proprietary to Gurjinder Vihar Institute Community Club (GVICC) and is intended solely for the members of the club And may contain information that is privileged, confidential or exempt from disclosure under applicable law.</p>
<p>Access to this website and/or attachments by anyone else is unauthorized. If you are not a member of the Club, an agent of a Member or a person responsible for delivering the information to the member of the club, you are notified that any use, distribution, transmission, printing, copying or dissemination of this information in any way or in any manner is strictly prohibited.</p>
<p>There is no guarantee that the integrity of this website has been maintained and nor is this site free of viruses, interceptions or interference.</p>`},
  {
    data:  `<h3>1. 100% advance is to be paid at the time of booking of party.</h3>
<h3>2. Mode of payment:</h3>
<p>(a) Debit Card, Credit Card, Net Banking, UPI.</p>
<p>(b) Cheque payable at par at New Delhi.</p>
<p>(c) Online Payment from https://gvicc.in.</p>
<h3>Cancellation and Refund :</h3>
<h3>4.&nbsp;<strong>Cancelation of Booking will amount to Deduction as under</strong>&nbsp;:</h3>
<p>(a) More than&nbsp; 30 days&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &ndash;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 10% deduction</p>
<p>(b) Between 15 &ndash; 30 days&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&ndash;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 25% deduction</p>
<p>(c) Less than 15 days&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &ndash;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; 50% deduction</p>
<p>&nbsp;(d) On the date of Party / reservation&nbsp; &nbsp;&nbsp;<strong>&nbsp;&ndash;&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;</strong>NO Refund</p>
<h3>5. Refund Policy</h3>
<p>If desired by the member the refund if any, will be made through a cheque payable at all branches of the Drawer Bank. However a Members can lease the amount as a credit to be utilized later,also transfer balance amount to the membership.</p>` },
  {
    data: `<p><img src="https://gvicc.in/wp-content/uploads/elementor/thumbs/1765800782817-scaled-e1765982826456-rgalv9mzcnb3rzee6u4ahzixoq61hmu7awhjlxw668.jpg"  alt="club-img" width="960" height="1280" /></p>
<p>At GVI Club, we believe in creating a space where community and comfort come together. Our club serves as the central point for residents to connect, celebrate, and unwind &mdash; offering a wide range of&nbsp;<strong>modern facilities</strong>,&nbsp;<strong>recreational amenities</strong>, and&nbsp;<strong>event spaces</strong>&nbsp;tailored to all age groups.&nbsp;</p>
<p>Our mission is to build a strong and active community that thrives on friendship, participation, and shared experiences. With world-class infrastructure, lush surroundings, and professional management, GVI Club continues to set new standards for community living in Greater Noida</p>
<p>The Gurjinder Vihar Institute Community Club within the AWHO Gurjinder Vihar township in Greater Noida serves as a well-equipped social &amp; recreational hub for residents &mdash; with a community hall/event venue, clubhouse, canteen facility, and various amenities tied into the residential complex. We offers convenience, integrated living experience, and potential flexibility for hosting events. For any specific service (e.g., room hire rate, membership cost, availability), you would need to contact the management of the township or the club directly.</p>
<!-- Comments are visible in the HTML source only -->`  },
];
const { height, width } = Dimensions.get("window");
type Props=NativeStackScreenProps<AppStackParamList,'Info'>
const Info:React.FC<Props> = ({ route }) => {
   const Data=JSON.parse(route.params)
   console.log( route.params, '---------------------- data ---------------------');
  return (
    <View style={{flex:1}}>
      <Header title={Data.name} />
      <ScrollView style={{}}>
        <RenderHTML
          source={{
            html: Data.data,
          }}
          
           imagesMaxWidth={width - 40}
          enableUserAgentStyles={true}
                  contentWidth={width - 40}
                   baseStyle={{ 
                    fontFamily: FONT_FAMILY.normal ,
                    color:'black',
                  textAlign:'auto',
                    margin:20,
                  flex:1
                  }}
                  tagsStyles={{
    img: {
      width: '100%',
      height: 'auto',
      alignSelf: 'center',
      resizeMode: 'contain',
    },}}
        />
      </ScrollView>
    </View>
  );
}

export default Info

const styles = StyleSheet.create({})