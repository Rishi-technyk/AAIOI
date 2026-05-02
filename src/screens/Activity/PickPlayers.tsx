import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Entypo';

import UniversalModal from '../../components/UniversalModal';
import NewButton from '../../components/Button';
import AppAlertModal from '../../components/feedback/AppAlertModal';
import { useAppAlert } from '../../hooks/useAppAlert';
import { useAppTheme } from '../../theme/AppThemeProvider';
import { RootState } from '../../store/store';
import { ENDPOINT } from '../../util/constant';
import { javascriptPost } from '../../util/api';
import { FONT_FAMILY } from '../../util/colors';

const PickPlayers: React.FC<any> = ({
  searchPlayer = false,
  setSearchPlayer,
  selectedGameType,
  guestQuery,
  selectedSlot,
  setSelectedSlot,
  setSlot,
  slots,
  search,
  setSearch,
}) => {
  const userData = useSelector((state: RootState) => state.auth);
  const { colors } = useAppTheme();
  const { alertState, showAlert, hideAlert } = useAppAlert();
  const [selectedPlayers, setSelectedPlayers] = useState<any[]>([]);
  const [isGuestFormVisible, setIsGuestFormVisible] = useState(false);
  const [addNewPlayer, setAddNewPlayer] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [savingGuest, setSavingGuest] = useState(false);

  useEffect(() => {
    setSelectedPlayers(Array.isArray(selectedSlot?.players) ? selectedSlot.players : []);
  }, [selectedSlot]);

  const maxPlayers = Number(selectedGameType?.no_of_players || 0);
  const availablePlayers = guestQuery?.data?.data?.data || [];
  const isSelectionComplete = !!maxPlayers && selectedPlayers.length === maxPlayers;

  const guestSummary = useMemo(
    () =>
      selectedPlayers.reduce((total, item) => total + Number(item?.charge || 0), 0),
    [selectedPlayers],
  );

  const closeModal = () => {
    setSelectedPlayers([]);
    setSelectedSlot(null);
    setSearch('');
    setSearchPlayer(false);
  };

  const handlePlayerSelect = (item: any) => {
    if (!selectedGameType) {
      showAlert({
        title: 'Game type required',
        message: 'Please select a game type before choosing players.',
        tone: 'warning',
      });
      return;
    }

    if (selectedPlayers.length >= maxPlayers) {
      showAlert({
        title: 'Player limit reached',
        message: `You can only select up to ${maxPlayers} player${maxPlayers > 1 ? 's' : ''}.`,
        tone: 'warning',
      });
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlayers(prev => [
      {
        DisplayName: item.DisplayName,
        MemberID: item.MemberID,
        charge: item.charge || 0,
        occupant_id: item.occupant_id || '1',
        mobile: item.mobile,
        email: item.email,
      },
      ...prev,
    ]);
  };

  const handleDeletePlayer = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedPlayers(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const handleAddNewGuest = async () => {
    if (!addNewPlayer.name.trim()) {
      showAlert({
        title: 'Name required',
        message: 'Enter the guest name before saving.',
        tone: 'warning',
      });
      return;
    }

    if (!/^[0-9]{10}$/.test(addNewPlayer.mobile)) {
      showAlert({
        title: 'Invalid mobile number',
        message: 'Please enter a valid 10-digit mobile number.',
        tone: 'warning',
      });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addNewPlayer.email)) {
      showAlert({
        title: 'Invalid email',
        message: 'Please enter a valid email address for the guest.',
        tone: 'warning',
      });
      return;
    }

    const apiobject = {
      path: ENDPOINT.create_activity_guest,
      body: {
        name: addNewPlayer.name,
        email: addNewPlayer.email,
        mobile: addNewPlayer.mobile,
        game_type: selectedGameType?.id,
        occupant_id: 2,
      },
      Token: userData?.token,
    };

    try {
      setSavingGuest(true);
      const response = await javascriptPost(apiobject);
      setSavingGuest(false);

      if (response?.success) {
        setAddNewPlayer({ name: '', email: '', mobile: '' });
        setIsGuestFormVisible(false);
        guestQuery?.refetch?.();
        showAlert({
          title: 'Guest added',
          message: response?.message || 'The guest player was saved successfully.',
          tone: 'success',
        });
        return;
      }

      if (response?.message && typeof response.message === 'object') {
        const firstError = Object.values(response.message)
          .flat()
          .find(Boolean);

        showAlert({
          title: 'Unable to save guest',
          message: String(firstError || 'Please review the guest details and try again.'),
          tone: 'danger',
        });
        return;
      }

      showAlert({
        title: 'Unable to save guest',
        message: response?.message || 'Please review the guest details and try again.',
        tone: 'danger',
      });
    } catch (error) {
      setSavingGuest(false);
      showAlert({
        title: 'Guest creation failed',
        message: 'A network issue interrupted the guest creation request.',
        tone: 'danger',
      });
    }
  };

  const handleProceedPlayers = () => {
    setSlot(
      slots.map((item: any) => {
        if (
          item?.day?.id === selectedSlot?.day?.id &&
          item?.time?.id === selectedSlot?.time?.id
        ) {
          return {
            ...item,
            players: selectedPlayers,
            game_type_id: selectedGameType?.id,
          };
        }

        return item;
      }),
    );

    closeModal();
  };

  const renderMembers = ({ item }: { item: any }) => {
    const alreadySelected = selectedPlayers.some(
      player =>
        player?.DisplayName === item?.DisplayName && player?.MemberID === item?.MemberID,
    );

    if (alreadySelected) {
      return null;
    }

    return (
      <Pressable
        onPress={() => handlePlayerSelect(item)}
        style={[
          styles.memberCard,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.memberName, { color: colors.text }]}>
            {item.DisplayName}
          </Text>
          <Text style={[styles.memberMeta, { color: colors.textMuted }]}>
            {item.occupant_id === 2 ? 'Non-member' : item.MemberID || 'Member'}
          </Text>
        </View>
        <View style={styles.memberPriceWrap}>
          <Text style={[styles.memberPrice, { color: colors.primary }]}>
            Rs. {Number(item?.charge || 0).toFixed(0)}
          </Text>
          <Icon name="plus" size={18} color={colors.primary} />
        </View>
      </Pressable>
    );
  };

  return (
    <UniversalModal
      visible={searchPlayer}
      title="Choose Players"
      isFull
      setVisible={visible => {
        if (!visible) {
          closeModal();
        }
      }}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surfaceAlt,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>
                Player selection
              </Text>
              <Text style={[styles.summarySubtitle, { color: colors.textMuted }]}>
                {selectedPlayers.length}/{maxPlayers || 0} selected
              </Text>
            </View>
            {isSelectionComplete ? (
              <NewButton text="Use players" onPress={handleProceedPlayers} />
            ) : null}
          </View>

          <View style={styles.metricsRow}>
            <View style={[styles.metricChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {selectedPlayers.length}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>players</Text>
            </View>
            <View style={[styles.metricChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                Rs. {guestSummary.toFixed(0)}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>charges</Text>
            </View>
            <View style={[styles.metricChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>
                {selectedGameType?.name || 'Game'}
              </Text>
              <Text style={[styles.metricLabel, { color: colors.textMuted }]}>type</Text>
            </View>
          </View>

          {selectedPlayers.length ? (
            <View style={styles.selectedList}>
              {selectedPlayers.map((item, index) => (
                <View
                  key={`${item?.MemberID || item?.DisplayName}-${index}`}
                  style={[
                    styles.selectedPlayerCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.selectedPlayerName, { color: colors.text }]}>
                      {item.DisplayName}
                    </Text>
                    <Text style={[styles.selectedPlayerMeta, { color: colors.textMuted }]}>
                      {item.occupant_id === 2 ? 'Non-member' : item.MemberID}
                    </Text>
                  </View>
                  <Text style={[styles.selectedPlayerCharge, { color: colors.primary }]}>
                    Rs. {Number(item?.charge || 0).toFixed(0)}
                  </Text>
                  <Pressable onPress={() => handleDeletePlayer(index)} hitSlop={10}>
                    <Icon name="circle-with-minus" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptySelection, { color: colors.textMuted }]}>
              Search members or create a guest player to complete this slot.
            </Text>
          )}
        </View>

        <View style={styles.tabRow}>
          <Pressable
            onPress={() => setIsGuestFormVisible(false)}
            style={[
              styles.tabButton,
              {
                backgroundColor: !isGuestFormVisible ? colors.primary : colors.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: !isGuestFormVisible ? colors.onPrimary : colors.text },
              ]}
            >
              Search member
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIsGuestFormVisible(true)}
            style={[
              styles.tabButton,
              {
                backgroundColor: isGuestFormVisible ? colors.primary : colors.surfaceAlt,
              },
            ]}
          >
            <Text
              style={[
                styles.tabLabel,
                { color: isGuestFormVisible ? colors.onPrimary : colors.text },
              ]}
            >
              Add guest
            </Text>
          </Pressable>
        </View>

        {isGuestFormVisible ? (
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Guest player details
            </Text>
            <TextInput
              value={addNewPlayer.name}
              placeholder="Enter guest name"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              onChangeText={text => setAddNewPlayer(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              value={addNewPlayer.mobile}
              placeholder="Enter guest mobile"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              onChangeText={text => setAddNewPlayer(prev => ({ ...prev, mobile: text }))}
              keyboardType="number-pad"
              maxLength={10}
            />
            <TextInput
              value={addNewPlayer.email}
              placeholder="Enter guest email"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceAlt,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              onChangeText={text => setAddNewPlayer(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <NewButton text="Save guest" loading={savingGuest} onPress={handleAddNewGuest} />
          </View>
        ) : (
          <>
            <TextInput
              value={search}
              placeholder="Search by member name or ID"
              placeholderTextColor={colors.textMuted}
              style={[
                styles.input,
                styles.searchInput,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              onChangeText={text => setSearch(text)}
            />
            <FlatList
              data={availablePlayers}
              renderItem={renderMembers}
              keyExtractor={(item, index) =>
                String(item?.MemberID || item?.DisplayName || index)
              }
              ListEmptyComponent={
                <Text style={[styles.emptyResults, { color: colors.textMuted }]}>
                  {guestQuery?.isLoading
                    ? 'Searching players...'
                    : 'No matching players found.'}
                </Text>
              }
              contentContainerStyle={styles.listContent}
            />
          </>
        )}
      </View>

      <AppAlertModal
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        tone={alertState.tone}
        primaryLabel={alertState.primaryLabel}
        secondaryLabel={alertState.secondaryLabel}
        onDismiss={hideAlert}
        onPrimaryPress={() => {
          hideAlert();
          alertState.onPrimaryPress?.();
        }}
        onSecondaryPress={() => {
          hideAlert();
          alertState.onSecondaryPress?.();
        }}
      />
    </UniversalModal>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.bold,
  },
  summarySubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONT_FAMILY.normal,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  metricChip: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
  },
  metricValue: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.bold,
  },
  metricLabel: {
    marginTop: 4,
    fontSize: 11,
    textTransform: 'uppercase',
    fontFamily: FONT_FAMILY.normal,
  },
  selectedList: {
    marginTop: 14,
    gap: 10,
  },
  selectedPlayerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  selectedPlayerName: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.semiBold,
  },
  selectedPlayerMeta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONT_FAMILY.normal,
  },
  selectedPlayerCharge: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.semiBold,
  },
  emptySelection: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: FONT_FAMILY.normal,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.semiBold,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  formTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.bold,
    marginBottom: 12,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONT_FAMILY.normal,
    marginBottom: 12,
  },
  searchInput: {
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.semiBold,
  },
  memberMeta: {
    marginTop: 4,
    fontSize: 12,
    fontFamily: FONT_FAMILY.normal,
  },
  memberPriceWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  memberPrice: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.bold,
  },
  emptyResults: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: FONT_FAMILY.normal,
    marginTop: 28,
  },
});

export default PickPlayers;
