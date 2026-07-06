import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { openSettings } from 'react-native-permissions';
import { AppButton, ThemeSwitch } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import { ensureLocationPermission } from '@/Utils/Permissions';
import { AppUtil } from '@/Utils';
// ✅ ADDED: Safe area inset hook to handle gesture and 3-button nav bar spacing
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BottomModal = ({
  bookings = [],
  loading,
  onAcceptBooking,
  onViewBooking,
  activeBooking,
  onUpdateStatus,
  bookingStatus: externalStatus,
  permissionStatus,
  serviceDetails,
  // ✅ ADDED: optional overrides so a real distance/geofence check can drive
  // "near customer" instead of relying purely on booking status.
  isNearCustomer,
  onCallCustomer,
  onMessageCustomer,
  creditBalance,
}) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();

  // ✅ ADDED: Get bottom inset for safe area padding (handles gesture vs 3-button nav)
  const { bottom } = useSafeAreaInsets();

  const styles = getStyles({ colors, bottom });

  const [buttonStatus, setButtonStatus] = useState(externalStatus || 1);

  // ✅ Only sync from Redux on initial mount (app restore), NOT on every change.
  const hasInitialized = useRef(false);

  // ✅ Pinoy Rider Credit balance now comes from the `creditBalance` prop
  // (passed down from HomeScreen, sourced from pr_wallet_details), instead
  // of being hardcoded. Falls back to '0.00' while the value hasn't loaded
  // yet or if it's ever missing.
  const displayCreditBalance =
    creditBalance !== undefined && creditBalance !== null
      ? AppUtil.fn(creditBalance)
      : '0.00';

  const credits = [
    {
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Acceptance.png'),
      value: serviceDetails ? `${serviceDetails.acceptance_rate ?? 0}%` : '—',
      label: 'Acceptance',
    },
    {
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Ratings.png'),
      value: serviceDetails ? `${serviceDetails.average_rating ?? 0}` : '—',
      label: 'Ratings',
    },
    {
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Cancellation.png'),
      value: serviceDetails ? `${serviceDetails.cancellation_rate ?? 0}%` : '—',
      label: 'Cancellation',
    },
    {
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Hours_Online.png'),
      value: serviceDetails?.hours_online
        ? `${serviceDetails.hours_online} Hrs`
        : '5 Hrs',
      label: 'Hours Online',
    },
  ];

  useEffect(() => {
    console.log(activeBooking?.customer?.ekyc_details);
    if (externalStatus && !hasInitialized.current) {
      setButtonStatus(externalStatus);
      hasInitialized.current = true;
    }
  }, [externalStatus]);

  // ✅ Reset the init flag when the booking changes (new booking accepted)
  useEffect(() => {
    if (!activeBooking) {
      hasInitialized.current = false;
      setButtonStatus(1);
    }
  }, [activeBooking]);

  const getButtonTitle = status => {
    switch (status) {
      case 1:
        return 'Go to Pick Up Location';
      case 2:
        return "Let's go to your location";
      case 3:
        return 'Drop Off';
      case 4:
        return 'Complete Trip';
      default:
        return 'Continue';
    }
  };

  // ✅ ADDED: Rider is considered "near" the customer once they've marked
  // arrival at pickup (status 2) through drop-off (status 4). If a real
  // geofence/distance check is wired in via the `isNearCustomer` prop, that
  // takes precedence over this status-based fallback.
  const isRiderNearCustomer =
    typeof isNearCustomer === 'boolean'
      ? isNearCustomer
      : buttonStatus >= 2 && buttonStatus <= 4;

  // check location permission before updating status
  const handleButtonPress = async () => {
    // always check permission before any status update
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      if (permission === 'blocked') {
        Alert.alert(
          'Location Required',
          'Location access is blocked. Please enable it in Settings to continue with the booking.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
      } else {
        Alert.alert(
          'Location Required',
          'Location access is required to update booking status. Please enable location services.',
          [{ text: 'OK' }],
        );
      }
      return;
    }

    if (buttonStatus === 1) {
      // "Go to Pick Up Location" — rider is heading to customer. No backend call yet.
      setButtonStatus(2);
    } else if (buttonStatus === 2) {
      // "Let's go to your location" — rider has arrived at pickup, trip starts.
      // Send status 2 (trip started) to backend so customer sees "In transit".
      setButtonStatus(3);
      onUpdateStatus(activeBooking, 2);
    } else if (buttonStatus === 3) {
      // "Drop Off" — rider is at dropoff. No backend call yet.
      setButtonStatus(4);
    } else if (buttonStatus === 4) {
      // "Complete Trip" — trip is done. Send status 3 to backend.
      // ✅ FIX: Capture booking reference before any state changes,
      // so navigation still has the data even if Redux clears activeBooking.
      const completedBooking = activeBooking;
      onUpdateStatus(completedBooking, 3);
      setTimeout(() => {
        navigation.navigate('SuccessfulBooking', { booking: completedBooking });
      }, 500);
    }
  };

  // ✅ iOS FIX: Small delay before calling onViewBooking to ensure any prior
  // touch/animation events have settled before a new Modal is presented.
  const handleViewBooking = async () => {
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      if (permission === 'blocked') {
        Alert.alert(
          'Location Required',
          'Location access is blocked. Please enable it in Settings to view bookings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
      } else {
        Alert.alert(
          'Location Required',
          'Location access is required to view and accept bookings.',
          [{ text: 'OK' }],
        );
      }
      return;
    }

    // Small delay for iOS touch handling stability before opening modal
    setTimeout(() => {
      onViewBooking();
    }, 100);
  };

  // ✅ ADDED: Quick call handler — uses onCallCustomer override if provided,
  // otherwise falls back to dialing the customer's phone number directly.
  const handleCallCustomer = () => {
    if (onCallCustomer) {
      onCallCustomer(activeBooking);
      return;
    }
    const phone =
      activeBooking?.customer?.ekyc_details?.pretty_mobile_no ||
      activeBooking?.customer?.mobile ||
      activeBooking?.customer?.ekyc_details?.mobile_no;
    if (!phone) {
      Alert.alert(
        'No Phone Number',
        'This customer has no phone number on file.',
      );
      return;
    }
    Linking.openURL(`tel:+${phone}`);
  };

  // ✅ UPDATED: No ChatScreen exists in the navigator yet, so message the
  // customer via SMS instead, using the same number as handleCallCustomer.
  const handleMessageCustomer = () => {
    if (onMessageCustomer) {
      onMessageCustomer(activeBooking);
      return;
    }
    const phone =
      activeBooking?.customer?.ekyc_details?.pretty_mobile_no ||
      activeBooking?.customer?.mobile ||
      activeBooking?.customer?.ekyc_details?.mobile_no;
    if (!phone) {
      Alert.alert(
        'No Phone Number',
        'This customer has no phone number on file.',
      );
      return;
    }
    Linking.openURL(`sms:+${phone}`);
  };

  const isLocationGranted = permissionStatus === 'granted';

  if (activeBooking) {
    return (
      <View style={styles.containerBooking}>
        {!isLocationGranted && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚠️ Location is required to update booking status
            </Text>
          </View>
        )}

        <View style={styles.rowBetween}>
          <View style={styles.row}>
            <Image
              source={{
                uri:
                  activeBooking?.customer?.ekyc_details?.selfie ||
                  'https://ui-avatars.com/api/?name=' +
                    activeBooking.customer?.ekyc_details?.first_name,
              }}
              style={styles.avatar}
            />
            <Text style={styles.name}>
              {`${activeBooking?.customer?.ekyc_details?.first_name || ''} ${
                activeBooking?.customer?.ekyc_details?.last_name || ''
              }`}
            </Text>
          </View>
          <View style={styles.rowEnd}>
            <Text style={styles.amount}>
              +₱{activeBooking?.payment_details?.total_amount}
            </Text>
            <Text style={styles.paymentType}>
              {activeBooking?.payment_type}
            </Text>
          </View>
        </View>

        <View style={styles.rowAddress}>
          <Image
            source={require('@/Assets/Common/Location.png')}
            style={[styles.icon, dark && { tintColor: 'white' }]}
          />
          <Text style={styles.address}>{activeBooking?.pickup_location}</Text>
        </View>

        <View style={styles.rowAddress}>
          <Image
            source={require('@/Assets/Common/Pin.png')}
            style={[styles.icon, { tintColor: 'red' }]}
          />
          <Text style={styles.address}>{activeBooking?.dropoff_location}</Text>
        </View>

        {/* ✅ ADDED: Quick call / message actions — only shown once the
                rider is near the customer's location. */}
        {isRiderNearCustomer && (
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleMessageCustomer}
              accessibilityLabel="Message customer">
              <Text style={styles.quickActionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.quickActionButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={handleCallCustomer}
              accessibilityLabel="Call customer">
              <Text style={styles.quickActionIcon}>📞</Text>
            </TouchableOpacity>
          </View>
        )}

        <AppButton
          title={getButtonTitle(buttonStatus)}
          onPress={handleButtonPress}
          buttonColor={isLocationGranted ? colors.primary : colors.outline}
          textColor={
            isLocationGranted ? colors.onPrimary : colors.onSurfaceVariant
          }
          disabled={!isLocationGranted}
          isBold
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Pinoy Rider</Text>
        <Text style={styles.title}>Credit</Text>
        <View style={styles.creditScoreContainer}>
          <Text style={styles.creditScore}>{displayCreditBalance}</Text>
        </View>
      </View>

      <View style={styles.creditsRow}>
        {credits.map((item, index) => (
          <View key={index} style={styles.creditsCard}>
            <Image
              source={item.icon}
              style={[styles.creditsIcon, dark && { tintColor: 'white' }]}
            />
            <Text
              style={styles.creditsValue}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}>
              {item.value}
            </Text>
            <Text
              style={styles.creditsLabel}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.6}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
      <ThemeSwitch />
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WalletScreen')}>
        <View style={styles.cardContent}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/Wallet.png')}
            style={[styles.leftIcon, dark && { tintColor: 'white' }]}
          />
          <Text style={styles.titleText}>View Wallet</Text>
        </View>
      </TouchableOpacity>

      <AppButton title="View Booking" onPress={handleViewBooking} />
    </View>
  );
};

export default BottomModal;

const getStyles = ({ colors, bottom }) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 24,
      // ✅ ADDED: Math.max(bottom, 16) ensures minimum 16px on devices that
      // report bottom: 0 (some 3-button nav setups). +8 adds visual breathing
      // room above the nav bar. Adjust the +8 to taste.
      paddingBottom: Math.max(bottom, 16) + 8,
      paddingTop: 12,
      backgroundColor: colors.background2,
    },
    top: { alignItems: 'center' },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 6,
      color: colors.primary,
    },
    creditsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    creditsCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.onQuaternary,
      padding: 10,
      marginHorizontal: 4,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    creditScoreContainer: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 2,
      marginTop: 5,
      marginBottom: 10,
    },
    creditScore: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      color: colors.onPrimary,
    },
    creditsIcon: {
      width: 35,
      height: 35,
      marginBottom: 6,
      resizeMode: 'contain',
    },
    creditsValue: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 20,
      color: colors.text,
    },
    creditsLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      color: colors.text,
    },
    card: {
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.onQuaternary,
      paddingHorizontal: 22,
      paddingVertical: 12,
      marginBottom: 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 10,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    leftIcon: {
      width: 34,
      height: 34,
      resizeMode: 'contain',
    },
    titleText: {
      fontFamily: 'Poppins Medium',
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
    containerBooking: {
      paddingHorizontal: 30,
      paddingTop: 45,
      // ✅ ADDED: Same safe area treatment for the active booking view so the
      // action button (Go to Pick Up / Complete Trip etc.) also clears the nav bar.
      paddingBottom: Math.max(bottom, 16) + 8,
      backgroundColor: colors.background,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 6,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      flex: 1,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    rowEnd: { alignItems: 'flex-end' },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    name: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
      flexShrink: 1,
    },
    // ✅ ADDED: Wrapper + button styles for the quick call/message icons.
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginLeft: 10,
      gap: 8,
    },
    quickActionButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickActionIcon: {
      fontSize: 14,
    },
    amount: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: colors.primary,
    },
    paymentType: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
    },
    rowAddress: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    icon: { width: 17, height: 17, marginRight: 15, resizeMode: 'contain' },
    address: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: colors.text,
      flexShrink: 1,
      letterSpacing: -0.45,
    },
    warningBanner: {
      backgroundColor: '#FF9800',
      padding: 12,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    warningText: {
      color: 'white',
      fontFamily: 'Poppins Medium',
      fontSize: 12,
      textAlign: 'center',
    },
  });
