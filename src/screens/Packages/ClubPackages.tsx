import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import Header from '../../components/Header';
import DetailSection from '../../components/booking/DetailSection';
import EmptyStateCard from '../../components/booking/EmptyStateCard';
import NewButton from '../../components/Button';
import {useAppTheme} from '../../theme/AppThemeProvider';
import {FONT_FAMILY} from '../../util/colors';
import {javascriptGet, javascriptPost} from '../../util/api';
import {AppStackParamList} from '../../navigation/AppDrawer';
import { DOMAIN, ENDPOINT } from '../../util/constant';
import DatePickerComponent from '../../components/DatePicker';
import moment from 'moment';


type Props = NativeStackScreenProps<AppStackParamList, 'ClubPackages'>;
type PackageItem = {
  id: number;
  package_code: string;
  package_name: string;
  package_category: string;
  billing_period: string;
  charge_mode: string;

  gst_applicable: boolean;
  gst_percentage: number;

  max_member: number;
  max_spouse: number;
  max_dependents: number;
  max_guests: number;

  description?: string;

  prices?: Array<{
    member_type: string;
    base_amount: number;
    gst_percentage: number;
    total_amount: number;
  }>;

  occupant_rules?: Array<{
    occupant_type: string;
    max_allowed: number;
    is_required: boolean;
  }>;
};

type Occupant = {
  occupant_type: 'MEMBER' | 'SPOUSE' | 'DEPENDENT' | 'GUEST';
  occupant_id: string;
  display_name: string;
  email?: string;
  mobile?: string;
};

const ClubPackages: React.FC<Props> = ({navigation}) => {
  const auth = useSelector((state: any) => state.auth);

  const {colors, resolvedMode} = useAppTheme();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [occupants, setOccupants] = useState<any>(null);
   const [startDate, setStartDate] = useState<string>("");
  const [selectedPackage, setSelectedPackage] =
    useState<PackageItem | null>(null);

  const [selectedOccupants, setSelectedOccupants] = useState<Occupant[]>([]);

  const [activeCategory, setActiveCategory] = useState('ALL');

  const [loading, setLoading] = useState(false);
  const [loadingOccupants, setLoadingOccupants] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const [calculation, setCalculation] = useState<any>(null);
console.log( calculation, '---------------------- calculation ---------------------');
  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);


      const result = await javascriptGet({
        path:ENDPOINT.club_packages,
        Token:auth?.token,
        // body:{}

      });
      console.log( result, auth?.token,'---------------------- result ---------------------');
      if (!result?.success) {
        throw new Error(
          result?.message || 'Unable to load packagesss.',
        );
      }

      setPackages(result?.data || []);
    } catch (error: any) {
      Alert.alert(
        'Unable to Load',
        error?.message || 'Something went wrong.',
      );
    } finally {
      setLoading(false);
    }
  };

  
//   const loadOccupants = async () => {
    
//     try {
//       setLoadingOccupants(true);
// if(!selectedPackage?.package_category) return;
//        const result = await javascriptGet({
//         path:`${ENDPOINT.club_package_occupants}?type=${selectedPackage?.package_category}`,
//         Token:auth?.token,
//         body:{}
//       });
// console.log( result, '---------------------- result ---------------------');

//       if (!result?.success) {
//         setOccupants([])
//         throw new Error(
//           result?.message || 'Unable to load occupants.',
//         );
//       }

//       setOccupants(result?.data || {});
//     } catch (error: any) {
//       Alert.alert(
//         'Unable to Load',
//         error?.message || 'Unable to load family members.',
//       );
//     } finally {
//       setLoadingOccupants(false);
//     }
//   };


const loadOccupants = async (packageCategory: string) => {
  if (!packageCategory) {
    setOccupants({});
    return;
  }

  try {
    setLoadingOccupants(true);

    const result = await javascriptGet({
      path: `${ENDPOINT.club_package_occupants}?type=${encodeURIComponent(
        packageCategory,
      )}`,
      Token: auth?.token,
      body: {},
    });
    if (!result?.success) {
      setOccupants({});
      throw new Error(
        result?.message || 'Unable to load occupants.',
      );
    }

    setOccupants(result?.data || {});
  } catch (error: any) {
    Alert.alert(
      'Unable to Load',
      error?.message || 'Unable to load family members.',
    );
  } finally {
    setLoadingOccupants(false);
  }
};
  const handlePackageSelect = async (item: PackageItem) => {
    setSelectedPackage(item);
    setSelectedOccupants([]);
    setCalculation(null);

  await loadOccupants(item.package_category);

    // if (!occupants) {
    // }
  };


  const categories = useMemo(() => {
    const values = packages.map(
      item => item.package_category,
    );
    return ['ALL', ...Array.from(new Set(values))];
  }, [packages]);

  const filteredPackages = useMemo(() => {
    if (activeCategory === 'ALL') {
      return packages;
    }

    return packages.filter(
      item => item.package_category === activeCategory,
    );
  }, [packages, activeCategory]);

  /**
   * -------------------------------------------------------
   * PRICE
   * -------------------------------------------------------
   */

  const selectedPrice = useMemo(() => {
    if (!selectedPackage) {
      return null;
    }

    return selectedPackage.prices?.[0] || null;
  }, [selectedPackage]);

  /**
   * -------------------------------------------------------
   * OCCUPANT HELPERS
   * -------------------------------------------------------
   */

  const isSelected = (
    type: string,
    id: string,
  ) => {
    return selectedOccupants.some(
      item =>
        item.occupant_type === type &&
        item.occupant_id === id,
    );
  };

  const toggleOccupant = (
    occupant: Occupant,
  ) => {
    if (!selectedPackage) {
      return;
    }

    const alreadySelected = isSelected(
      occupant.occupant_type,
      occupant.occupant_id,
    );

    if (alreadySelected) {
      setSelectedOccupants(prev =>
        prev.filter(
          item =>
            !(
              item.occupant_type ===
                occupant.occupant_type &&
              item.occupant_id ===
                occupant.occupant_id
            ),
        ),
      );

      setCalculation(null);

      return;
    }

    const maxAllowed =
      getMaxAllowed(
        selectedPackage,
        occupant.occupant_type,
      );

    const currentCount =
      selectedOccupants.filter(
        item =>
          item.occupant_type ===
          occupant.occupant_type,
      ).length;
console.log( maxAllowed, selectedPackage,
        occupant.occupant_type, '----------------------  ---------------------');
        
    if (currentCount >= maxAllowed) {
      Alert.alert(
        'Limit Reached',
        `You can select maximum ${maxAllowed} ${formatOccupantName(
          occupant.occupant_type,
        )}.`,
      );

      return;
    }

    setSelectedOccupants(prev => [
      ...prev,
      occupant,
    ]);

    setCalculation(null);
  };

  const getMaxAllowed = (
    pkg: PackageItem,
    type: string,
  ) => {
    switch (type) {
      case 'MEMBER':
        return Number(pkg.max_member || 0);

      case 'SPOUSE':
        return Number(pkg.max_spouse || 0);

      case 'DEPENDENT':
        return Number(
          pkg.max_dependents || 0,
        );

      case 'GUEST':
        return Number(pkg.max_guests || 0);

      default:
        return 0;
    }
  };

  const formatOccupantName = (
    type: string,
  ) => {
    switch (type) {
      case 'MEMBER':
        return 'member';

      case 'SPOUSE':
        return 'spouse';

      case 'DEPENDENT':
        return 'dependents';

      case 'GUEST':
        return 'guests';

      default:
        return 'occupants';
    }
  };

  /**
   * -------------------------------------------------------
   * OCCUPANT GROUPS
   * -------------------------------------------------------
   */

  const memberOccupants = useMemo(() => {
    if (!occupants) {
      return [];
    }

    return occupants?.member
      ? [occupants.member]
      : [];
  }, [occupants]);

  const spouseOccupants = useMemo(() => {
    if (!occupants?.spouse) {
      return [];
    }


    return [occupants.spouse];
  }, [occupants]);

  const dependentOccupants = useMemo(() => {
    return occupants?.dependents || [];
  }, [occupants]);

  const guestOccupants = useMemo(() => {
    return occupants?.guests || [];
  }, [occupants]);


  console.log( occupants, '---------------------- memberOccupants ---------------------');
  /**
   * -------------------------------------------------------
   * CALCULATE
   * -------------------------------------------------------
   */

  const calculatePackage = async () => {
    if (!selectedPackage) {
      return;
    }
  if(selectedPackage.billing_period !== 'LIFETIME' && !startDate){
       Alert.alert(
        'Select Start Date',
        'Please select valid from date.',
      );
        return;
    }
    if (!selectedOccupants.length) {
      Alert.alert(
        'Select Members',
        'Please select at least one person.',
      );

      return;
    }


    try {
      setCalculating(true);

      

  

        const result = await javascriptPost({
        path:ENDPOINT.club_package_calculate,
        Token:auth?.token,
        body:{
              package_id: selectedPackage.id,

        occupants: selectedOccupants.map(
          item => ({
            type: item.occupant_type,
            id: item.occupant_id,
          }),
        ),
        }
      });


      if (!result?.success) {
        throw new Error(
          result?.message ||
            'Unable to calculate package.',
        );
      }

      setCalculation(result?.data);
    } catch (error: any) {
      Alert.alert(
        'Calculation Failed',
        error?.message ||
          'Unable to calculate amount.',
      );
    } finally {
      setCalculating(false);
    }
  };

  /**
   * -------------------------------------------------------
   * PAYMENT
   * -------------------------------------------------------
   */

  const initiatePackagePayment = async (
  forceContinue = false,
) => {
  const result = await javascriptPost({
    path: ENDPOINT.club_package_book,
    Token: auth?.token,
    body: {
      package_id: selectedPackage?.id,
      package_date: startDate,
      force_continue: forceContinue,

      occupants: selectedOccupants.map(item => ({
        type: item.occupant_type,
        id: item.occupant_id,
      })),
    },
  });

  return result;
};
const handlePayment = async () => {
  if (!selectedPackage) {
    return;
  }

  if (!selectedOccupants.length) {
    Alert.alert(
      'Select Members',
      'Please select at least one person.',
    );

    return;
  }

  try {
    setLoading(true);

    const result = await initiatePackagePayment(false);
console.log( result, '---------------------- result ---------------------');
    /*
    |--------------------------------------------------------------------------
    | EXISTING ACTIVE BOOKING
    |--------------------------------------------------------------------------
    */

    if (result?.requires_confirmation) {
      setLoading(false);

      Alert.alert(
        'Existing Active Booking',
        result?.message ||
          'You already have an active package booking. Do you want to continue?',
        [
          {
            text: 'No',
            style: 'cancel',
          },
          {
            text: 'Yes, Continue',
            onPress: async () => {
              try {
                setLoading(true);

                const confirmedResult =
                  await initiatePackagePayment(true);

                if (!confirmedResult?.status) {
                  Alert.alert(
                    'Payment Failed',
                    confirmedResult?.message ||
                      'Unable to initiate payment.',
                  );

                  return;
                }

                navigation.navigate(
                  'UniversalPayment' as any,
                  {
                    type: 'ClubPackage',
                    orderData: confirmedResult?.data,
                  },
                );

              } catch (error: any) {
                Alert.alert(
                  'Payment Failed',
                  error?.message ||
                    'Unable to initiate payment.',
                );
              } finally {
                setLoading(false);
              }
            },
          },
        ],
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | NORMAL PAYMENT
    |--------------------------------------------------------------------------
    */

    if (!result?.status) {
      throw new Error(
        result?.message ||
          'Unable to initiate payment.',
      );
    }

    navigation.navigate(
      'UniversalPayment' as any,
      {
        type: 'ClubPackage',
        orderData: result?.data,
      },
    );

  } catch (error: any) {
    Alert.alert(
      'Payment Failed',
      error?.message ||
        'Unable to initiate payment.',
    );
  } finally {
    setLoading(false);
  }
};

  /**
   * -------------------------------------------------------
   * OCCUPANT CARD
   * -------------------------------------------------------
   */

  const renderOccupant = (
    occupant: Occupant,
  ) => {
    const selected = isSelected(
      occupant.occupant_type,
      occupant.occupant_id,
    );
console.log( occupant, '---------------------- occupant ---------------------');
    return (
      <Pressable
        key={`${occupant.occupant_type}-${occupant.occupant_id}`}
        onPress={() =>
          toggleOccupant(occupant)
        }
        style={[
          styles.occupantCard,
          {
            backgroundColor: selected
              ? colors.primary
              : colors.surface,
            borderColor: selected
              ? colors.primary
              : colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: selected
                ? 'rgba(255,255,255,0.18)'
                : colors.background,
            },
          ]}
        >
          <Image
                        source={{
                          uri:
                            occupant?.profile_image?`${DOMAIN.IMG}${occupant?.profile_image}` :
                            'https://randomuser.me/api/portraits/men/1.jpg'
                        }}
                        style={styles.avatar}
                      />
        </View>

        <View style={styles.occupantInfo}>
          <Text
            numberOfLines={1}
            style={[
              styles.occupantName,
              {
                color: selected
                  ? colors.onPrimary
                  : colors.text,
              },
            ]}
          >
            {occupant.display_name}
          </Text>

          <Text
            style={[
              styles.occupantType,
              {
                color: selected
                  ? `${colors.onPrimary}B5`
                  : colors.textMuted,
              },
            ]}
          >
            {formatOccupantName(
              occupant.occupant_type,
            )}
          </Text>
         {Number(occupant.entry_fee) > 0&&  <Text
            style={[
              styles.occupantType,
              {
                color: selected
                  ? `${colors.warning}B5`
                  : colors.warning,
              },
            ]}
          >Entry Fee ₹{occupant.entry_fee}</Text>}
        </View>

        <View
          style={[
            styles.checkCircle,
            {
              borderColor: selected
                ? colors.onPrimary
                : colors.border,
              backgroundColor: selected
                ? colors.onPrimary
                : 'transparent',
            },
          ]}
        >
          {selected && (
            <Text
              style={[
                styles.checkText,
                {
                  color: colors.primary,
                },
              ]}
            >
              ✓
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  /**
   * -------------------------------------------------------
   * UI
   * -------------------------------------------------------
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
      <Header title="Packages">
        
        <Pressable
          style={[
            styles.headerAction,
            { borderColor: `${colors.onPrimary}35` },
          ]}
          onPress={() => navigation.navigate('Players')}
        >
          <Text style={[styles.headerActionLabel, { color: colors.onPrimary }]}>
            My Guests
          </Text>
        </Pressable>
      </Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom:
            selectedPackage ? 150 : 40,
        }}
      >
        {/* HERO */}
{/* <View></View> */}
        {/* <LinearGradient
          colors={
            resolvedMode === 'dark'
              ? [
                  '#020617',
                  '#0F172A',
                  '#1E293B',
                ]
              : [
                  '#1E293B',
                  '#334155',
                  '#475569',
                ]
          }
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>
              MEMBERSHIP
            </Text>
          </View>

          <Text style={styles.heroTitle}>
            Choose Your Package
          </Text>

      \
          {selectedPrice && (
            <View style={styles.heroPriceRow}>
              <Text style={styles.heroPrice}>
                ₹{' '}
                {Number(
                  selectedPrice.base_amount,
                ).toLocaleString('en-IN')}
              </Text>

              <Text style={styles.heroPriceSuffix}>
                starting price
              </Text>
            </View>
          )}
        </LinearGradient> */}

        {/* CATEGORY FILTER */}

        {!loading &&
          packages.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.categoryContainer
              }
            >
              {categories.map(category => {
                const active =
                  activeCategory === category;

                return (
                  <Pressable
                    key={category}
                    onPress={() =>
                      setActiveCategory(
                        category,
                      )
                    }
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: active
                          ? colors.primary
                          : colors.surface,
                        borderColor: active
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        {
                          color: active
                            ? colors.onPrimary
                            : colors.text,
                        },
                      ]}
                    >
                      {category === 'ALL'
                        ? 'All Plans'
                        : category === 'PACKAGE'
                        ? 'Member Plans'
                        : category === 'ADDON'
                        ? 'Guest Plans'
                        : category}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

        {/* PACKAGES */}

        <DetailSection
          title="Available Packages"
          subtitle="Select a package to continue"
        >
          {loading ? (
            <View style={styles.loader}>
              <ActivityIndicator
                color={colors.primary}
              />
            </View>
          ) : filteredPackages.length ===
            0 ? (
            <EmptyStateCard
              title="No packages available"
              description="Please check back later."
            />
          ) : (
            filteredPackages.map(item => {
              const selected =
                selectedPackage?.id === item.id;

              const price =
                item.prices?.[0];

              return (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    handlePackageSelect(
                      item,
                    )
                  }
                  style={[
                    styles.packageCard,
                    {
                      backgroundColor:
                        colors.surface,
                      borderColor: selected
                        ? colors.primary
                        : colors.border,
                    },
                  ]}
                >
                  {/* Top */}

                  <View
                    style={
                      styles.packageTop
                    }
                  >
                    <View
                      style={
                        styles.packageIcon
                      }
                    >
                      <Text
                        style={[
                          styles.packageIconText,
                          {
                            color:
                              colors.primary,
                          },
                        ]}
                      >
                        {item.package_name
                          ?.charAt(0)
                          ?.toUpperCase()}
                      </Text>
                    </View>

                    <View
                      style={
                        styles.packageTitleContainer
                      }
                    >
                      <Text
                        style={[
                          styles.packageName,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {item.package_name}
                      </Text>

                      <Text
                        style={[
                          styles.packagePeriod,
                          {
                            color:
                              colors.placeholder,
                          },
                        ]}
                      >
                        {formatPeriod(
                          item.billing_period,
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor:
                            selected
                              ? colors.border
                              : colors.border,
                        },
                      ]}
                    >
                      {selected && (
                        <View
                          style={[
                            styles.radioInner,
                            {
                              backgroundColor:
                                colors.border,
                            },
                          ]}
                        />
                      )}
                    </View>
                  </View>

                  {/* Description */}

                  <Text
                    style={[
                      styles.packageDescription,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {item.description ||
                      getPackageDescription(
                        item,
                      )}
                  </Text>

                  {/* Bottom */}

                  <View
                    style={
                      styles.packageBottom
                    }
                  >
                    <View>
                      <Text
                        style={[
                          styles.priceCaption,
                          {
                            color:
                              colors.textMuted,
                          },
                        ]}
                      >
                        Starting from
                      </Text>

                      <Text
                        style={[
                          styles.packagePrice,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        ₹{' '}
                        {Number(
                          price?.base_amount ||
                            0,
                        ).toLocaleString(
                          'en-IN',
                        )}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.periodBadge,
                        {
                          backgroundColor:
                            selected
                              ? `${colors.overlay}18`
                              : colors.background,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.periodBadgeText,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        {formatPeriod(
                          item.billing_period,
                        )}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </DetailSection>

        {/* OCCUPANTS */}

        {selectedPackage && (
          <DetailSection
            title="Who's Covered?"
            subtitle={
              selectedPackage.charge_mode ===
              'PER_OCCUPANT'
                ? 'Select each person you want to include'
                : 'Select the people covered by this package'
            }
          >
                {selectedPackage.billing_period!=='LIFETIME'  &&  <DatePickerComponent
                        placeholder='Please select valid from date'
                     minDate={moment()
                .add(packages?.min_booking_days , 'days')
                .toDate()}
              maxDate={moment()
                .add(packages?.max_booking_days ||30 , 'days')
                .toDate()}
                        stateDate={setStartDate}
                        // setResetDate={}
                        />}
            {loadingOccupants ? (
              <View style={styles.loader}>
                <ActivityIndicator
                  color={colors.primary}
                />
              </View>
            ) : (
              <>
                {/* MEMBER */}

                {selectedPackage.max_member >
                  0 &&
                   memberOccupants.length >
                  0 && (
                  <View
                    style={
                      styles.occupantSection
                    }
                  >
                    <Text
                      style={[
                        styles.groupTitle,
                        {
                          color:
                            colors.text,
                        },
                      ]}
                    >
                      Member
                    </Text>

                    {memberOccupants.map(
                      renderOccupant,
                    )}
                  </View>
                )}

                {/* SPOUSE */}

                {selectedPackage.max_spouse >
                  0 &&
                  spouseOccupants.length >
                    0 && (
                    <View
                      style={
                        styles.occupantSection
                      }
                    >
                      <Text
                        style={[
                          styles.groupTitle,
                          {
                            color:
                              colors.text,
                          },
                        ]}
                      >
                        Spouse
                      </Text>

                      {spouseOccupants.map(
                        renderOccupant,
                      )}
                    </View>
                  )}

                {/* DEPENDENTS */}

                {selectedPackage
                  .max_dependents > 0 &&
                  dependentOccupants.length >
                    0 && (
                    <View
                      style={
                        styles.occupantSection
                      }
                    >
                      <View
                        style={
                          styles.groupHeader
                        }
                      >
                        <Text
                          style={[
                            styles.groupTitle,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          Dependents
                        </Text>

                        <Text
                          style={[
                            styles.limitText,
                            {
                              color:
                                colors.textMuted,
                            },
                          ]}
                        >
                          Max{' '}
                          {
                            selectedPackage.max_dependents
                          }
                        </Text>
                      </View>

                      {dependentOccupants.map(
                        renderOccupant,
                      )}
                    </View>
                  )}

                {/* GUEST */}

                {selectedPackage
                  .max_guests > 0 &&
                  guestOccupants.length >
                    0 && (
                    <View
                      style={
                        styles.occupantSection
                      }
                    >
                      <View
                        style={
                          styles.groupHeader
                        }
                      >
                        <Text
                          style={[
                            styles.groupTitle,
                            {
                              color:
                                colors.text,
                            },
                          ]}
                        >
                          Guests
                        </Text>

                        <Text
                          style={[
                            styles.limitText,
                            {
                              color:
                                colors.textMuted,
                            },
                          ]}
                        >
                          Max{' '}
                          {
                            selectedPackage.max_guests
                          }
                        </Text>
                      </View>

                      {guestOccupants.map(
                        renderOccupant,
                      )}
                    </View>
                  )}

                {selectedOccupants.length >
                  0 && (
                  <View
                    style={[
                      styles.selectionInfo,
                      {
                        backgroundColor:
                          `${colors.primary}10`,
                        borderColor:
                          `${colors.primary}30`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.selectionInfoText,
                        {
                          color:
                            colors.primary,
                        },
                      ]}
                    >
                      {selectedOccupants.length}{' '}
                      person
                      {selectedOccupants.length >
                      1
                        ? 's'
                        : ''}{' '}
                      selected
                    </Text>
                  </View>
                )}

                <NewButton
                  text={
                    calculating
                      ? 'Calculating...'
                      : 'Calculate Package'
                  }
                  loading={calculating}
                  onPress={
                    calculatePackage
                  }
                />
              </>
            )}
          </DetailSection>
        )}

        {/* CALCULATION */}

        {calculation && (
          <DetailSection
            title="Payment Summary"
            subtitle="Review your package charges"
          >
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor:
                    colors.surface,
                  borderColor:
                    colors.border,
                },
              ]}
            >
              <View
                style={styles.summaryHeader}
              >
                <View>
                  <Text
                    style={[
                      styles.summaryPackage,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    {
                      calculation.package_name
                    }
                  </Text>

                  <Text
                    style={[
                      styles.summaryMeta,
                      {
                        color:
                          colors.textMuted,
                      },
                    ]}
                  >
                    {
                      calculation.member_type
                    }{' '}
                    pricing
                  </Text>
                </View>

                <View
                  style={[
                    styles.summaryTag,
                    {
                      backgroundColor:
                        `${colors.success}15`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryTagText,
                      {
                        color:
                          colors.success,
                      },
                    ]}
                  >
                    Ready
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <SummaryRow
                label="Selected People"
                value={`${selectedOccupants.length}`}
                colors={colors}
              />

              <SummaryRow
                label="Subtotal"
                value={`₹ ${Number(
                  calculation.subtotal,
                ).toLocaleString(
                  'en-IN',
                )}`}
                colors={colors}
              />
             {calculation.entry_fee && <SummaryRow
                label="Entry Fee"
                value={`₹ ${Number(
                  calculation.entry_fee,
                ).toLocaleString(
                  'en-IN',
                )}`}
                colors={colors}
              />}

              <SummaryRow
                label={`GST ${
                  calculation.gst_percentage
                }%`}
                value={`₹ ${Number(
                  calculation.gst_amount,
                ).toLocaleString(
                  'en-IN',
                )}`}
                colors={colors}
              />

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.border,
                  },
                ]}
              />

              <View
                style={styles.totalRow}
              >
                <Text
                  style={[
                    styles.totalLabel,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  Total Payable
                </Text>

                <Text
                  style={[
                    styles.totalValue,
                    {
                      color:
                        colors.success,
                    },
                  ]}
                >
                  ₹{' '}
                  {Number(
                    calculation.total_amount,
                  ).toLocaleString(
                    'en-IN',
                  )}
                </Text>
              </View>
            </View>
          </DetailSection>
        )}
      </ScrollView>

      {/* BOTTOM ACTION */}

      {calculation && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor:
                colors.surface,
              borderTopColor:
                colors.border,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.bottomCaption,
                {
                  color:
                    colors.textMuted,
                },
              ]}
            >
              Total payable
            </Text>

            <Text
              style={[
                styles.bottomAmount,
                {
                  color: colors.text,
                },
              ]}
            >
              ₹{' '}
              {Number(
                calculation.total_amount,
              ).toLocaleString('en-IN')}
            </Text>
          </View>

          <NewButton
            text="Pay Now"
            loading={loading}
            onPress={handlePayment}
          />
        </View>
      )}
    </View>
  );
};

/**
 * ---------------------------------------------------------
 * SUMMARY ROW
 * ---------------------------------------------------------
 */

const SummaryRow = ({
  label,
  value,
  colors,
}: any) => {
  return (
    <View style={styles.summaryRow}>
      <Text
        style={[
          styles.summaryLabel,
          {
            color: colors.textMuted,
          },
        ]}
      >
        {label}
      </Text>

      <Text
        style={[
          styles.summaryValue,
          {
            color: colors.text,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
};

/**
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

const formatPeriod = (
  period?: string,
) => {
  switch (period) {
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
      return period || '';
  }
};

const getPackageDescription = (
  item: PackageItem,
) => {
  switch (item.charge_mode) {
    case 'PER_OCCUPANT':
      return 'Individual pricing for every selected member.';

    case 'COLLECTIVE':
      return 'One collective package price for eligible members.';

    case 'PER_GUEST':
      return 'Charges are calculated according to the number of guests.';

    case 'SINGLE':
      return 'One-time charge for the selected service.';

    default:
      return 'Club membership package.';
  }
};

/**
 * ---------------------------------------------------------
 * API BASE URL
 * ---------------------------------------------------------
 *
 * Replace this with your existing API base URL.
 */



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
headerAction: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems:'center'
  },
  headerActionLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
  },
  headerButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  headerButtonText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
  },

  hero: {
    marginHorizontal: 18,
    marginTop: 12,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
  },

  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor:
      'rgba(255,255,255,0.12)',
    marginBottom: 14,
  },

  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: FONT_FAMILY.bold,
  },

  heroTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 32,
    fontFamily: FONT_FAMILY.bold,
  },

  heroDescription: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    fontFamily: FONT_FAMILY.normal,
    maxWidth: '90%',
  },

  heroPriceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 20,
  },

  heroPrice: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: FONT_FAMILY.bold,
  },

  heroPriceSuffix: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginLeft: 8,
    marginBottom: 4,
    fontFamily: FONT_FAMILY.normal,
  },

  categoryContainer: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 8,
  },

  categoryChip: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },

  categoryText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.semiBold,
  },

  loader: {
    paddingVertical: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },

  packageCard: {
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 17,
    marginBottom: 14,
  },

  packageTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  packageIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF5FF',
  },

  packageIconText: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.bold,
  },

  packageTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },

  packageName: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  packagePeriod: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONT_FAMILY.normal,
  },

  radio: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioInner: {
    width: 13,
    height: 13,
    borderRadius: 7,
  },

  packageDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 15,
    marginBottom: 15,
    fontFamily: FONT_FAMILY.normal,
  },

  packageBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  priceCaption: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.normal,
  },

  packagePrice: {
    fontSize: 24,
    marginTop: 2,
    fontFamily: FONT_FAMILY.bold,
  },

  periodBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },

  periodBadgeText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.semiBold,
  },

  occupantSection: {
    marginBottom: 18,
  },

  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  groupTitle: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: FONT_FAMILY.semiBold,
  },

  limitText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.normal,
  },

  occupantCard: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  occupantInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  occupantName: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.semiBold,
  },

  occupantType: {
    fontSize: 11,
    marginTop: 3,
    textTransform: 'capitalize',
    fontFamily: FONT_FAMILY.normal,
  },

  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.bold,
  },

  selectionInfo: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
  },

  selectionInfoText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: FONT_FAMILY.semiBold,
  },

  summaryCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryPackage: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
  },

  summaryMeta: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: FONT_FAMILY.normal,
  },

  summaryTag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  summaryTagText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.semiBold,
  },

  divider: {
    height: 1,
    marginVertical: 15,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 7,
  },

  summaryLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.normal,
  },

  summaryValue: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.semiBold,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  totalLabel: {
    fontSize: 17,
    fontFamily: FONT_FAMILY.bold,
  },

  totalValue: {
    fontSize: 23,
    fontFamily: FONT_FAMILY.bold,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bottomCaption: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.normal,
  },

  bottomAmount: {
    fontSize: 22,
    marginTop: 2,
    fontFamily: FONT_FAMILY.bold,
  },
});

export default ClubPackages;