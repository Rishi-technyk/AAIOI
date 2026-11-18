import React, {useCallback, useMemo, useState} from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import {Toast} from 'react-native-toast-notifications';
import {useSelector} from 'react-redux';

import Header from '../../components/Header';
import BookingHeroCard from '../../components/booking/BookingHeroCard';
import DetailSection from '../../components/booking/DetailSection';
import DetailGrid from '../../components/booking/DetailGrid';
import SupportCard from '../../components/booking/SupportCard';
import EmptyStateCard from '../../components/booking/EmptyStateCard';
import StatusTimeline from '../../components/timeline/StatusTimeline';
import PaymentSummaryCard from '../../components/payment/PaymentSummaryCard';

import {javascriptGet, javascriptPost} from '../../util/api';
import {RootState} from '../../store/store';
import {AppStackParamList} from '../../navigation/AppDrawer';
import {useAppTheme} from '../../theme/AppThemeProvider';
import {FONT_FAMILY} from '../../util/colors';

type Props = NativeStackScreenProps<
  AppStackParamList,
  'PackageBookingDetail'
>;

const PackageBookingDetail: React.FC<Props> = ({
  route,
  navigation,
}) => {
  const {bookingId} = route.params;

  const userData = useSelector(
    (state: RootState) => state.auth,
  );

  const {colors} = useAppTheme();

  const [data, setData] = useState<any>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [cancelling, setCancelling] =
    useState(false);

  /**
   * ---------------------------------------------------------
   * LOAD BOOKING
   * ---------------------------------------------------------
   */

  const loadBooking = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const response = await javascriptGet({
          path: `member/club-packages/${bookingId}`,
          Token: userData.token,
        });

        if (!response?.success) {
          throw new Error(
            response?.message ||
              'Unable to load booking details.',
          );
        }

        setData(response.data);
      } catch (error: any) {
        Toast.show(
          error?.message ||
            'Unable to load package details.',
          {
            type: 'danger',
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [bookingId, userData.token],
  );

  React.useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  /**
   * ---------------------------------------------------------
   * PACKAGE
   * ---------------------------------------------------------
   */

  const packageData = data?.package;

  const participants =
    data?.items || [];

  /**
   * ---------------------------------------------------------
   * STATUS
   * ---------------------------------------------------------
   */

  const bookingStatus =
    String(
      data?.booking_status || '',
    ).toUpperCase();

  const paymentStatus =
    String(
      data?.payment_status || '',
    ).toUpperCase();

  const isPaid =
    paymentStatus === 'PAID';

  const isActive =
    bookingStatus === 'ACTIVE';

  const isCancelled =
    bookingStatus === 'CANCELLED';

  const isExpired =
    !!data?.package_end_date &&
    moment().isAfter(
      moment(data.package_end_date)
        .endOf('day'),
    );

  /**
   * ---------------------------------------------------------
   * CANCEL ELIGIBILITY
   *
   * Matches your Laravel backend:
   *
   * payment_status = PAID
   * booking_status = ACTIVE
   * package_end_date not expired
   * ---------------------------------------------------------
   */

  const canCancel =
    isPaid &&
    isActive &&
    !isExpired && data.package_end_date;

  /**
   * ---------------------------------------------------------
   * STATUS TONE
   * ---------------------------------------------------------
   */

  const getStatusTone = (
    status: string,
  ) => {
    switch (
      String(status).toUpperCase()
    ) {
      case 'ACTIVE':
      case 'PAID':
        return {
          bg: '#DCFCE7',
          fg: '#16A34A',
        };

      case 'PENDING':
        return {
          bg: '#FEF3C7',
          fg: '#D97706',
        };

      case 'FAILED':
      case 'CANCELLED':
        return {
          bg: '#FEE2E2',
          fg: '#DC2626',
        };

      case 'REFUNDED':
        return {
          bg: '#E0E7FF',
          fg: '#4F46E5',
        };

      case 'EXPIRED':
        return {
          bg: '#F1F5F9',
          fg: '#64748B',
        };

      default:
        return {
          bg: '#F1F5F9',
          fg: '#64748B',
        };
    }
  };

  /**
   * ---------------------------------------------------------
   * PARTICIPANT COUNTS
   * ---------------------------------------------------------
   */

  const participantSummary =
    useMemo(() => {
      return {
        members: participants.filter(
          (item: any) =>
            item.occupant_type ===
            'MEMBER',
        ).length,

        spouse: participants.filter(
          (item: any) =>
            item.occupant_type ===
            'SPOUSE',
        ).length,

        dependents:
          participants.filter(
            (item: any) =>
              item.occupant_type ===
              'DEPENDENT',
          ).length,

        guests: participants.filter(
          (item: any) =>
            item.occupant_type ===
            'GUEST',
        ).length,

        total: participants.length,
      };
    }, [participants]);

  /**
   * ---------------------------------------------------------
   * TIMELINE
   * ---------------------------------------------------------
   */

  const timeline = useMemo(() => {
    const items: any[] = [];

    items.push({
      title: 'Booking Created',
      description:
        data?.created_at
          ? moment(data.created_at).format(
              'DD MMM YYYY, hh:mm A',
            )
          : 'Package booking created.',
      status: 'completed',
    });

    if (
      paymentStatus === 'PAID'
    ) {
      items.push({
        title: 'Payment Completed',
        description:
          'Payment successfully received.',
        status: 'completed',
      });
    } else if (
      paymentStatus === 'PENDING'
    ) {
      items.push({
        title: 'Payment Pending',
        description:
          'Payment is awaiting confirmation.',
        status: 'pending',
      });
    } else if (
      paymentStatus === 'FAILED'
    ) {
      items.push({
        title: 'Payment Failed',
        description:
          'Payment was not completed.',
        status: 'failed',
      });
    }

    if (
      bookingStatus === 'ACTIVE'
    ) {
      items.push({
        title: 'Package Active',
        description:
          data?.package_start_date
            ? `Valid from ${moment(
                data.package_start_date,
              ).format('DD MMM YYYY')}`
            : 'Package is active.',
        status: 'completed',
      });
    }

    if (
      bookingStatus === 'CANCELLED'
    ) {
      items.push({
        title: 'Package Cancelled',
        description:
          data?.cancelled_at
            ? moment(
                data.cancelled_at,
              ).format(
                'DD MMM YYYY, hh:mm A',
              )
            : 'Package has been cancelled.',
        status: 'completed',
      });
    }

    if (
      bookingStatus === 'EXPIRED'
    ) {
      items.push({
        title: 'Package Expired',
        description:
          data?.package_end_date
            ? `Expired on ${moment(
                data.package_end_date,
              ).format('DD MMM YYYY')}`
            : 'Package has expired.',
        status: 'completed',
      });
    }

    return items;
  }, [
    data,
    paymentStatus,
    bookingStatus,
  ]);

  /**
   * ---------------------------------------------------------
   * CANCEL PACKAGE
   * ---------------------------------------------------------
   */

  const cancelPackage =
    useCallback(() => {
      if (!data) {
        return;
      }

      if (!canCancel) {
        Toast.show(
          'This package cannot be cancelled.',
          {
            type: 'warning',
          },
        );

        return;
      }

      Alert.alert(
        'Cancel Package',
        `Are you sure you want to cancel ${packageData?.package_name || 'this package'}?

Booking No: ${
          data.booking_no || '-'
        }

Paid Amount: ₹${Number(
          data.total_amount || 0,
        ).toFixed(2)}

This action cannot be undone.`,
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                setCancelling(true);

                const response =
                  await javascriptPost({
                    path: `member/club-packages/${bookingId}/cancel`,
                    Token: userData.token,
                    body: {
                      reason:
                        'Cancelled by member',
                    },
                  });

                Toast.show(
                  response?.message ||
                    'Package cancelled successfully.',
                  {
                    type: response?.success
                      ? 'success'
                      : 'danger',
                  },
                );

                if (response?.success) {
                  await loadBooking(
                    true,
                  );
                }
              } catch (error: any) {
                Toast.show(
                  error?.message ||
                    'Unable to cancel package.',
                  {
                    type: 'danger',
                  },
                );
              } finally {
                setCancelling(false);
              }
            },
          },
        ],
      );
    }, [
      data,
      canCancel,
      packageData,
      bookingId,
      userData.token,
      loadBooking,
    ]);

  /**
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Header title="Package Details" />

        <View
          style={styles.loadingContainer}
        >
          <Text
            style={[
              styles.loadingText,
              {
                color: colors.textMuted,
              },
            ]}
          >
            Loading package details...
          </Text>
        </View>
      </View>
    );
  }

  /**
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  if (!data) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor:
              colors.background,
          },
        ]}
      >
        <Header title="Package Details" />

        <EmptyStateCard
          type="error"
          title="Package details unavailable"
          description="We could not load this package booking right now. Please try again."
        />
      </View>
    );
  }

  const bookingTone =
    getStatusTone(bookingStatus);

  const paymentTone =
    getStatusTone(paymentStatus);

  /**
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor:
            colors.background,
        },
      ]}
    >
      <Header title="Package Details" />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() =>
              loadBooking(true)
            }
          />
        }
        contentContainerStyle={
          styles.content
        }
      >
        {/* ------------------------------------------------ */}
        {/* HERO */}
        {/* ------------------------------------------------ */}

        <BookingHeroCard
          eyebrow="Club Package"
          title={
            packageData?.package_name ||
            'Package'
          }
          subtitle={`${formatPeriod(
            packageData?.billing_period,
          )} Membership`}
          status={
            formatStatus(
              data.booking_status,
            )
          }
          statusTone={
            bookingTone.fg ===
            '#16A34A'
              ? 'success'
              : bookingTone.fg ===
                '#DC2626'
              ? 'danger'
              : 'warning'
          }
          meta={[
            {
              label: 'Members',
              value: String(
                participantSummary.members,
              ),
            },
            {
              label: 'Spouse',
              value: String(
                participantSummary.spouse,
              ),
            },
            {
              label: 'Dependents',
              value: String(
                participantSummary.dependents,
              ),
            },
            {
              label: 'Guests',
              value: String(
                participantSummary.guests,
              ),
            },
            {
              label: 'Participants',
              value: String(
                participantSummary.total,
              ),
            },
            {
              label: 'Valid Till',
              value: data.package_end_date
                ? moment(
                    data.package_end_date,
                  ).format(
                    'DD MMM YYYY',
                  )
                : 'Lifetime',
            },
          ]}
        />

        {/* ------------------------------------------------ */}
        {/* BOOKING SNAPSHOT */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Booking Snapshot"
          subtitle="Quick overview of your club package."
          delay={40}
        >
          <DetailGrid
            items={[
              {
                label: 'Booking No',
                value:
                  data.booking_no,
                highlight: true,
              },
              {
                label: 'Package',
                value:
                  packageData?.package_name ||
                  '-',
              },
              {
                label: 'Package Code',
                value:
                  packageData?.package_code ||
                  '-',
              },
              {
                label: 'Billing Period',
                value:
                  formatPeriod(
                    packageData?.billing_period,
                  ),
              },
              {
                label: 'Charge Mode',
                value:
                  formatChargeMode(
                    packageData?.charge_mode,
                  ),
              },
              {
                label: 'Member Type',
                value:
                  data.member_type ||
                  'NORMAL',
              },
                   {
                label: 'Valid To',
                value:
                data.package_end_date
                ? moment(
                  data.package_end_date,
                ).format(
                  'DD MMM YYYY',
                )
                : 'Lifetime',
              },
              {
                label: 'Valid From',
                value:
                data.package_start_date
                ? moment(
                  data.package_start_date,
                ).format(
                  'DD MMM YYYY',
                )
                : '-',
              },
         
              {
                label: 'Booked On',
                value:
                  data.created_at
                    ? moment(
                        data.created_at,
                      ).format(
                        'DD MMM YYYY, hh:mm A',
                      )
                    : '-',
              },
              {
                label: 'Status',
                value:
                  formatStatus(
                    data.booking_status,
                  ),
              },
            ]}
          />
        </DetailSection>

        {/* ------------------------------------------------ */}
        {/* COVERED MEMBERS */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Covered Members"
          subtitle="Members included in this package."
          delay={70}
        >
          {participants.length ===
          0 ? (
            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              No participants found.
            </Text>
          ) : (
            participants.map(
              (
                participant: any,
                index: number,
              ) => {
                const participantTone =
                  getParticipantTone(
                    participant.occupant_type,
                  );

                return (
                  <View
                    key={
                      participant.id ??
                      `${participant.occupant_type}-${index}`
                    }
                    style={[
                      styles.participantCard,
                      {
                        backgroundColor:
                          colors.surface,
                        borderColor:
                          colors.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.participantAvatar,
                        {
                          backgroundColor:
                            `${participantTone}15`,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.participantAvatarText,
                          {
                            color:
                              participantTone,
                          },
                        ]}
                      >
                        {(
                          participant.display_name ||
                          'M'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.participantInfo
                      }
                    >
                      <Text
                        style={[
                          styles.participantName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {
                          participant.display_name
                        }
                      </Text>

                      <Text
                        style={[
                          styles.participantType,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        {formatOccupantType(
                          participant.occupant_type,
                        )}
                      </Text>

                      {participant
                        .occupant_id && (
                        <Text
                          style={[
                            styles.participantId,
                            {
                              color:
                                colors.textMuted,
                            },
                          ]}
                        >
                          {
                            participant.occupant_id
                          }
                        </Text>
                      )}
                    </View>

                    <View
                      style={
                        styles.participantRight
                      }
                    >
                      <View
                        style={[
                          styles.coveredBadge,
                          {
                            backgroundColor:
                              `${colors.success}15`,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.coveredBadgeText,
                            {
                              color:
                                colors.success,
                            },
                          ]}
                        >
                          Covered
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              },
            )
          )}
        </DetailSection>

        {/* ------------------------------------------------ */}
        {/* PAYMENT */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Payment & Invoice"
          subtitle="Package charges and payment information."
          delay={100}
        >
          <PaymentSummaryCard
            status={formatStatus(
              data.payment_status,
            )}
            items={[
              {
                label: 'Package Amount',
                value: `₹ ${Number(
                  data.subtotal || 0,
                ).toFixed(2)}`,
              },
              {
                label: `GST ${
                  data.gst_percentage || 0
                }%`,
                value: `₹ ${Number(
                  data.gst_amount || 0,
                ).toFixed(2)}`,
              },
              {
                label: 'Total Amount',
                value: `₹ ${Number(
                  data.total_amount || 0,
                ).toFixed(2)}`,
                emphasize: true,
              },

              ...(isCancelled &&
              data.payment_status ===
                'REFUNDED'
                ? [
                    {
                      label:
                        'Payment Status',
                      value:
                        'Refunded',
                    },
                  ]
                : []),
            ]}
          />

          <View
            style={[
              styles.paymentStatusCard,
              {
                backgroundColor:
                  paymentTone.bg,
              },
            ]}
          >
            <Icon
              name={
                paymentStatus ===
                'PAID'
                  ? 'check-circle'
                  : paymentStatus ===
                    'FAILED'
                  ? 'close-circle'
                  : 'clock-outline'
              }
              size={20}
              color={paymentTone.fg}
            />

            <View
              style={
                styles.paymentStatusContent
              }
            >
              <Text
                style={[
                  styles.paymentStatusTitle,
                  {
                    color:
                      paymentTone.fg,
                  },
                ]}
              >
                Payment{' '}
                {formatStatus(
                  data.payment_status,
                )}
              </Text>

              <Text
                style={[
                  styles.paymentStatusDescription,
                  {
                    color:
                      paymentTone.fg,
                  },
                ]}
              >
                {getPaymentDescription(
                  paymentStatus,
                )}
              </Text>
            </View>
          </View>
        </DetailSection>

        {/* ------------------------------------------------ */}
        {/* MEMBERSHIP TIMELINE */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Membership Timeline"
          subtitle="Package lifecycle and payment status."
          delay={130}
        >
          <StatusTimeline
            items={timeline}
          />
        </DetailSection>

        {/* ------------------------------------------------ */}
        {/* CANCELLATION */}
        {/* ------------------------------------------------ */}

        {isCancelled && (
          <DetailSection
            title="Cancellation Details"
            subtitle="Information about this cancelled package."
          >
            <View
              style={[
                styles.cancelledCard,
                {
                  backgroundColor:
                    '#FEF2F2',
                  borderColor:
                    '#FECACA',
                },
              ]}
            >
              <Icon
                name="close-circle-outline"
                size={24}
                color="#DC2626"
              />

              <View
                style={
                  styles.cancelledContent
                }
              >
                <Text
                  style={[
                    styles.cancelledTitle,
                    {
                      color:
                        '#991B1B',
                    },
                  ]}
                >
                  Package Cancelled
                </Text>

                {data.cancelled_at && (
                  <Text
                    style={[
                      styles.cancelledText,
                      {
                        color:
                          '#B91C1C',
                      },
                    ]}
                  >
                    Cancelled on{' '}
                    {moment(
                      data.cancelled_at,
                    ).format(
                      'DD MMM YYYY, hh:mm A',
                    )}
                  </Text>
                )}

                {data.cancellation_reason && (
                  <Text
                    style={[
                      styles.cancelledText,
                      {
                        color:
                          '#B91C1C',
                      },
                    ]}
                  >
                    Reason:{' '}
                    {
                      data.cancellation_reason
                    }
                  </Text>
                )}
              </View>
            </View>
          </DetailSection>
        )}

        {/* ------------------------------------------------ */}
        {/* RULES */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Package Information"
          subtitle="Important information about your package."
          delay={180}
        >
          <View
            style={styles.ruleList}
          >
            <RuleRow
              icon="account-check-outline"
              text={`Package covers ${participantSummary.total} selected participant${
                participantSummary.total ===
                1
                  ? ''
                  : 's'
              }.`}
              colors={colors}
            />

            <RuleRow
              icon="calendar-check-outline"
              text={
                data.package_end_date
                  ? `Package is valid from ${moment(
                      data.package_start_date,
                    ).format(
                      'DD MMM YYYY',
                    )} to ${moment(
                      data.package_end_date,
                    ).format(
                      'DD MMM YYYY',
                    )}.`
                  : 'This package has lifetime validity.'
              }
              colors={colors}
            />

            <RuleRow
              icon="cash-check"
              text="Package charges are calculated according to the selected package pricing."
              colors={colors}
            />

            <RuleRow
              icon="shield-check-outline"
              text="Only participants listed under this booking are covered."
              colors={colors}
            />

            {canCancel && (
              <RuleRow
                icon="information-outline"
                text="This package is currently eligible for cancellation."
                colors={colors}
              />
            )}
          </View>
        </DetailSection>

        {/* ------------------------------------------------ */}
        {/* CANCEL BUTTON */}
        {/* ------------------------------------------------ */}

        {canCancel && (
          <View
            style={
              styles.cancelContainer
            }
          >
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={cancelling}
              onPress={cancelPackage}
              style={[
                styles.cancelButton,
                {
                  opacity: cancelling
                    ? 0.6
                    : 1,
                },
              ]}
            >
              <Icon
                name="close-circle-outline"
                size={20}
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.cancelButtonText
                }
              >
                {cancelling
                  ? 'Cancelling...'
                  : 'Cancel Package'}
              </Text>
            </TouchableOpacity>

            <Text
              style={[
                styles.cancelHint,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Cancellation will update the
              package and payment status.
            </Text>
          </View>
        )}

        {/* ------------------------------------------------ */}
        {/* SUPPORT */}
        {/* ------------------------------------------------ */}

        <DetailSection
          title="Rules & Support"
          subtitle="Need help with your package?"
          delay={220}
        >
          <SupportCard
            contactName={
              data.support?.name ||
              'Club Support'
            }
            phone={
              data.support?.phone
            }
            email={
              data.support?.email
            }
            note={
              data.support?.note ||
              'Contact the club support team for assistance with your package.'
            }
          />
        </DetailSection>
      </ScrollView>
    </View>
  );
};

/**
 * ---------------------------------------------------------
 * RULE ROW
 * ---------------------------------------------------------
 */

const RuleRow = ({
  icon,
  text,
  colors,
}: any) => {
  return (
    <View style={styles.ruleRow}>
      <Icon
        name={icon}
        size={18}
        color={colors.secondary}
      />

      <Text
        style={[
          styles.ruleText,
          {
            color: colors.text,
          },
        ]}
      >
        {text}
      </Text>
    </View>
  );
};

/**
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

const formatStatus = (
  status?: string,
) => {
  if (!status) {
    return '-';
  }

  return String(status)
    .toLowerCase()
    .replace(
      /\b\w/g,
      char => char.toUpperCase(),
    );
};

const formatPeriod = (
  period?: string,
) => {
  switch (
    String(period || '').toUpperCase()
  ) {
    case 'LIFETIME':
      return 'Lifetime';

    case 'DAILY':
      return 'Per Day';

    case 'MONTHLY':
      return '30 Days';

    case 'QUARTERLY':
      return '3 Months';

    case 'HALF_YEARLY':
      return '6 Months';

    case 'YEARLY':
      return '1 Year';

    case 'ONE_TIME':
      return 'One Time';

    default:
      return period || '-';
  }
};

const formatChargeMode = (
  mode?: string,
) => {
  switch (
    String(mode || '').toUpperCase()
  ) {
    case 'PER_OCCUPANT':
      return 'Per Occupant';

    case 'COLLECTIVE':
      return 'Collective';

    case 'PER_GUEST':
      return 'Per Guest';

    case 'SINGLE':
      return 'Single Charge';

    default:
      return mode || '-';
  }
};

const formatOccupantType = (
  type?: string,
) => {
  switch (
    String(type || '').toUpperCase()
  ) {
    case 'MEMBER':
      return 'Member';

    case 'SPOUSE':
      return 'Spouse';

    case 'DEPENDENT':
      return 'Dependent';

    case 'GUEST':
      return 'Guest';

    default:
      return type || 'Participant';
  }
};

const getParticipantTone = (
  type?: string,
) => {
  switch (
    String(type || '').toUpperCase()
  ) {
    case 'MEMBER':
      return '#2563EB';

    case 'SPOUSE':
      return '#7C3AED';

    case 'DEPENDENT':
      return '#0891B2';

    case 'GUEST':
      return '#D97706';

    default:
      return '#64748B';
  }
};

const getPaymentDescription = (
  status: string,
) => {
  switch (status) {
    case 'PAID':
      return 'Payment has been successfully received.';

    case 'PENDING':
      return 'Payment is awaiting confirmation.';

    case 'FAILED':
      return 'Payment could not be completed.';

    case 'REFUNDED':
      return 'The payment has been marked as refunded.';
    case 'CANCELLED':
      return 'The payment has been marked as cancelled.';

    default:
      return 'Payment status is currently unavailable.';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.normal,
  },

  participantCard: {
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  participantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  participantAvatarText: {
    fontSize: 17,
    fontFamily: FONT_FAMILY.bold,
  },

  participantInfo: {
    flex: 1,
    marginLeft: 12,
  },

  participantName: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.semiBold,
  },

  participantType: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: FONT_FAMILY.normal,
  },

  participantId: {
    fontSize: 10,
    marginTop: 2,
    fontFamily: FONT_FAMILY.normal,
  },

  participantRight: {
    marginLeft: 8,
  },

  coveredBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  coveredBadgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.semiBold,
  },

  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 15,
    fontFamily: FONT_FAMILY.normal,
  },

  paymentStatusCard: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },

  paymentStatusContent: {
    flex: 1,
    marginLeft: 10,
  },

  paymentStatusTitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
  },

  paymentStatusDescription: {
    fontSize: 11,
    marginTop: 3,
    fontFamily: FONT_FAMILY.normal,
  },

  ruleList: {
    gap: 12,
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
    fontFamily: FONT_FAMILY.normal,
  },

  cancelContainer: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 10,
    alignItems: 'center',
  },

  cancelButton: {
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    marginLeft: 8,
    fontFamily: FONT_FAMILY.bold,
  },

  cancelHint: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 17,
    fontFamily: FONT_FAMILY.normal,
  },

  cancelledCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  cancelledContent: {
    flex: 1,
    marginLeft: 10,
  },

  cancelledTitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
  },

  cancelledText: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
    fontFamily: FONT_FAMILY.normal,
  },
});

export default PackageBookingDetail;