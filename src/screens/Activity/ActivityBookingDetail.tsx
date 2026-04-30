import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { Toast } from 'react-native-toast-notifications';
import { useSelector } from 'react-redux';

import Header from '../../components/Header';
import BookingHeroCard from '../../components/booking/BookingHeroCard';
import ActionBar from '../../components/booking/ActionBar';
import DetailSection from '../../components/booking/DetailSection';
import DetailGrid from '../../components/booking/DetailGrid';
import SupportCard from '../../components/booking/SupportCard';
import EmptyStateCard from '../../components/booking/EmptyStateCard';
import StatusTimeline from '../../components/timeline/StatusTimeline';
import PaymentSummaryCard from '../../components/payment/PaymentSummaryCard';
import BookingDetailSkeleton from '../../components/loaders/BookingDetailSkeleton';
import { useBookingDetails } from '../../hooks/useBookingDetails';
import { usePaymentStatus } from '../../hooks/usePaymentStatus';
import { createBookingSummaryPdf, shareBookingSummary } from '../../util/bookingDocuments';
import { javascriptGet, javascriptPost } from '../../util/api';
import { RootState } from '../../store/store';
import { AppStackParamList } from '../../navigation/AppDrawer';
import { useAppTheme } from '../../theme/AppThemeProvider';

type Props = NativeStackScreenProps<AppStackParamList, 'ActivityBookingDetail'>;

const ActivityBookingDetail: React.FC<Props> = ({ route }) => {
  const { bookingId } = route.params;
  const userData = useSelector((state: RootState) => state.auth);
  const { colors } = useAppTheme();
  const { resolveTone, buildPaymentTimeline } = usePaymentStatus();

  const { data, isLoading, isError, refreshing, refresh } = useBookingDetails({
    queryKey: 'activity-booking-detail',
    path: `member/booking-details/${bookingId}`,
    token: userData.token,
    transform: response => (response?.success ? response.data : null),
  });

  const handleDownload = useCallback(async () => {
    if (!data) {
      return;
    }

    const file = await createBookingSummaryPdf(
      data.summary?.booking_number || data.booking_number || 'activity-booking',
      data.facility_name || 'Activity Booking',
      [
        { label: 'Booking number', value: data.summary?.booking_number || data.booking_number },
        { label: 'Facility', value: data.facility_name },
        { label: 'Status', value: data.summary?.status || data.status },
        { label: 'Payment', value: data.payment?.status || data.payment_status },
        { label: 'Total amount', value: `Rs. ${data.summary?.total_amount || data.facility_total}` },
      ],
    );

    Toast.show(file?.filePath ? `Summary saved at ${file.filePath}` : 'Unable to save summary.', {
      type: file?.filePath ? 'success' : 'danger',
    });
  }, [data]);

  const handleShare = useCallback(async () => {
    if (!data) {
      return;
    }

    await shareBookingSummary(
      data.summary?.booking_number || data.booking_number || 'activity-booking',
      data.facility_name || 'Activity Booking',
      [
        { label: 'Booking number', value: data.summary?.booking_number || data.booking_number },
        { label: 'Facility', value: data.facility_name },
        { label: 'Status', value: data.summary?.status || data.status },
        { label: 'Payment', value: data.payment?.status || data.payment_status },
        { label: 'Booked on', value: data.summary?.booked_on },
      ],
    );
  }, [data]);

  const cancelSlot = useCallback(
    async (slotId: number) => {
      try {
        const eligibility = await javascriptGet({
          path: `member/get-cancellation-amount/${slotId}`,
          Token: userData.token,
        });

        if (!eligibility?.status || !eligibility?.cancelationAmount) {
          Toast.show(eligibility?.message || 'Cancellation policy is not available.', {
            type: 'warning',
          });
          return;
        }

        const policy = eligibility.cancelationAmount;
        Alert.alert(
          'Cancel slot',
          `Deduction will be Rs. ${policy.cancellation_deducation}. Do you want to continue?`,
          [
            { text: 'No', style: 'cancel' },
            {
              text: 'Yes',
              style: 'destructive',
              onPress: async () => {
                const response = await javascriptPost({
                  path: 'member/cancel-booking',
                  body: {
                    booking_id: slotId,
                    cancellation_per: policy.cancellation_per,
                    cancellation_amt: policy.cancellation_amt,
                    cancellation_GST: policy.cancellation_GST,
                    cancellation_GST_amt: policy.cancellation_GST_amt,
                    cancellation_deducation: policy.cancellation_deducation,
                  },
                  Token: userData.token,
                });

                Toast.show(response?.message || 'Slot updated.', {
                  type: response?.status ? 'success' : 'danger',
                });
                await refresh();
              },
            },
          ],
        );
      } catch (_error) {
        Toast.show('Unable to process cancellation right now.', { type: 'danger' });
      }
    },
    [refresh, userData.token],
  );

  const actionItems = useMemo(
    () => [
      { label: 'Download', icon: 'file-download-outline', onPress: handleDownload },
      { label: 'Share', icon: 'share-variant-outline', onPress: handleShare },
    ],
    [handleDownload, handleShare],
  );

  const tone = resolveTone(data?.summary?.status || data?.status);
  const paymentTimeline = buildPaymentTimeline(data?.payment);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Activity Details" />
        <BookingDetailSkeleton />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <Header title="Activity Details" />
        <EmptyStateCard
          type="error"
          title="Booking details unavailable"
          description="We could not load this activity booking right now. Pull to refresh or try again in a moment."
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Activity Details" />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
      >
        <BookingHeroCard
          eyebrow="Activity Booking"
          title={data.facility_name}
          subtitle={`${data.summary?.booking_number || data.booking_number} • ${data.summary?.booked_on || ''}`}
          status={data.summary?.status || data.status}
          statusTone={tone.color === colors.success ? 'success' : tone.color === colors.danger ? 'danger' : 'warning'}
          meta={[
            {
              label: 'Payment',
              value: data.payment?.status || data.payment_status,
              tone:
                tone.color === colors.success
                  ? 'success'
                  : tone.color === colors.danger
                  ? 'danger'
                  : 'warning',
            },
            {
              label: 'Slots',
              value: String(data.summary?.slot_count || data.slots?.length || 0),
              tone: 'neutral',
            },
            {
              label: 'Guests',
              value: String(data.summary?.guest_count || 0),
              tone: 'neutral',
            },
          ]}
        />

        <ActionBar actions={actionItems} />

        <DetailSection title="Booking Snapshot" subtitle="Quick overview of the facility reservation." delay={40}>
          <DetailGrid
            items={[
              { label: 'Booking number', value: data.summary?.booking_number || data.booking_number, highlight: true },
              { label: 'Facility', value: data.facility_name },
              { label: 'Session', value: data.session_id || 'Scheduled' },
              { label: 'Booked on', value: data.summary?.booked_on },
              { label: 'Total amount', value: `Rs. ${Number(data.summary?.total_amount || data.facility_total).toFixed(2)}` },
              { label: 'Payment', value: data.payment?.status || data.payment_status },
            ]}
          />
        </DetailSection>

        <DetailSection title="Slots and Players" subtitle="Per-slot players, activity state, and cancellation actions." delay={70}>
          {data.slots?.map((slot: any) => {
            const slotTone = resolveTone(slot.status);
            const canCancel =
              String(slot.status).toLowerCase() === 'active' &&
              moment(slot.slot_date).isSameOrAfter(moment(), 'day');

            return (
              <View
                key={slot.id}
                style={[
                  styles.slotCard,
                  {
                    backgroundColor: colors.surfaceAlt,
                    borderColor: slotTone.border,
                  },
                ]}
              >
                <View style={styles.slotHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.slotTitle, { color: colors.text }]}>
                      {moment(slot.slot_date).format('ddd, DD MMM')} • {slot.label}
                    </Text>
                    <Text style={[styles.slotSub, { color: colors.textMuted }]}>
                      {slot.guests?.length || 0} players
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: slotTone.background }]}>
                    <Text style={[styles.statusText, { color: slotTone.color }]}>{slot.status}</Text>
                  </View>
                </View>

                {slot.guests?.map((guest: any, index: number) => (
                  <View key={`${guest.player_name}-${index}`} style={styles.guestRow}>
                    <Icon name="account-circle-outline" size={18} color={colors.primary} />
                    <Text style={[styles.guestText, { color: colors.text }]}>
                      {guest.player_name}
                    </Text>
                    <Text style={[styles.guestAmount, { color: colors.textMuted }]}>
                      Rs. {Number(guest.occupant_charge || 0).toFixed(2)}
                    </Text>
                  </View>
                ))}

                {String(slot.status).toLowerCase() === 'cancelled' ? (
                  <Text style={[styles.cancelInfo, { color: colors.danger }]}>
                    Deduction: Rs. {Number(slot.cancellation_deducation || 0).toFixed(2)}
                  </Text>
                ) : null}

                {canCancel ? (
                  <TouchableOpacity
                    style={[styles.cancelButton, { backgroundColor: colors.danger }]}
                    onPress={() => cancelSlot(slot.id)}
                  >
                    <Icon name="close-circle-outline" size={16} color={colors.onPrimary} />
                    <Text style={[styles.cancelButtonText, { color: colors.onPrimary }]}>
                      Cancel slot
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          })}
        </DetailSection>

        <DetailSection title="Payment and Invoice" subtitle="Charges, taxes, and transaction metadata." delay={100}>
          <PaymentSummaryCard
            status={data.payment?.status}
            items={[
              { label: 'Base facility amount', value: `Rs. ${Number(data.invoice?.facility_amount || 0).toFixed(2)}` },
              { label: 'Guest charges', value: `Rs. ${Number(data.invoice?.guest_total_amount || 0).toFixed(2)}` },
              { label: 'GST', value: `Rs. ${Number(data.invoice?.gst_total || 0).toFixed(2)}` },
              { label: 'Grand total', value: `Rs. ${Number(data.invoice?.total || 0).toFixed(2)}`, emphasize: true },
              { label: 'Reference', value: data.payment?.reference_number || data.payment?.gateway_order_id || 'Pending' },
            ]}
          />
        </DetailSection>

        <DetailSection title="Booking Timeline" subtitle="Operational updates for this reservation." delay={130}>
          <StatusTimeline items={data.timeline || []} />
        </DetailSection>

        {paymentTimeline.length ? (
          <DetailSection title="Payment Timeline" subtitle="Financial checkpoints for this booking." delay={160}>
            <StatusTimeline items={paymentTimeline} />
          </DetailSection>
        ) : null}

        {data.activity_logs?.length ? (
          <DetailSection title="Activity Log" subtitle="Detailed slot-level activity summary." delay={190}>
            <StatusTimeline items={data.activity_logs} />
          </DetailSection>
        ) : null}

        <DetailSection title="Rules and Support" subtitle="Helpful reminders and member assistance." delay={220}>
          <View style={styles.ruleList}>
            {data.rules?.map((rule: string, index: number) => (
              <View key={`${rule}-${index}`} style={styles.ruleRow}>
                <Icon name="shield-check-outline" size={18} color={colors.secondary} />
                <Text style={[styles.ruleText, { color: colors.text }]}>{rule}</Text>
              </View>
            ))}
          </View>
          <View style={{ marginTop: 14 }}>
            <SupportCard
              contactName={data.support?.name}
              phone={data.support?.phone}
              email={data.support?.email}
              note={data.support?.note}
            />
          </View>
        </DetailSection>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  slotCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  slotSub: {
    marginTop: 3,
    fontSize: 12,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
  },
  guestText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  guestAmount: {
    fontSize: 12,
  },
  cancelInfo: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 12,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cancelButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '700',
  },
  ruleList: {
    gap: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ruleText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    lineHeight: 19,
  },
});

export default ActivityBookingDetail;
