import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const credits = [
  {
    icon: require('@/Assets/Common/HomeScreen/BottomModal/Acceptance.png'),
    value: '100%',
    label: 'Acceptance',
  },
  {
    icon: require('@/Assets/Common/HomeScreen/BottomModal/Ratings.png'),
    value: '5.0',
    label: 'Ratings',
  },
  {
    icon: require('@/Assets/Common/HomeScreen/BottomModal/Cancellation.png'),
    value: '0%',
    label: 'Cancellation',
  },
  {
    icon: require('@/Assets/Common/HomeScreen/BottomModal/Hours_Online.png'),
    value: '5 Hrs',
    label: 'Hours Online',
  },
];

const BottomModal = ({
  bookings = [],
  loading,
  onAcceptBooking,
  onViewBooking,
  activeBooking,
  onUpdateStatus,
  bookingStatus: externalStatus, // Status from parent
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(prev => !prev);

  // Sync with external status
  const [buttonStatus, setButtonStatus] = useState(externalStatus || 1);

  // Update local state when external status changes
  useEffect(() => {
    if (externalStatus) {
      setButtonStatus(externalStatus);
    }
  }, [externalStatus]);

  const getButtonTitle = status => {
    switch (status) {
      case 1:
        return 'Go to Pick Up Location';
      case 2:
        return "Let's go to your location";
      case 3:
        return 'Drop Off';
      default:
        return 'Continue';
    }
  };

  const handleButtonPress = () => {
    if (buttonStatus === 1) {
      // Going to pickup → Arrived at pickup
      setButtonStatus(2);
      onUpdateStatus(activeBooking, 2);
    } else if (buttonStatus === 2) {
      // Arrived at pickup → Going to dropoff
      setButtonStatus(3);
      onUpdateStatus(activeBooking, 3);
    } else if (buttonStatus === 3) {
      // Drop off → Complete
      onUpdateStatus(activeBooking, 4);
      navigation.navigate('SuccessfulBooking', activeBooking);
    }
  };

  // If booking is active → show passenger info modal
  if (activeBooking) {
    return (
      <View style={styles.containerBooking}>
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
            style={styles.icon}
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

        <AppButton
          title={getButtonTitle(buttonStatus)}
          onPress={handleButtonPress}
          buttonColor={colors.primary}
          textColor={colors.onPrimary}
          isBold
        />
      </View>
    );
  }

  // Default modal (credits, wallet, theme toggle, view booking button)
  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Pinoy Rider</Text>
        <Text style={styles.title}>Credit</Text>
        <View style={styles.creditScoreContainer}>
          <Text style={styles.creditScore}>100.50</Text>
        </View>
      </View>

      <View style={styles.creditsRow}>
        {credits.map((item, index) => (
          <View key={index} style={styles.creditsCard}>
            <Image source={item.icon} style={styles.creditsIcon} />
            <Text style={styles.creditsValue}>{item.value}</Text>
            <Text style={styles.creditsLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.card} onPress={toggleSwitch}>
        <View style={styles.cardContent}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/App_Theme.png')}
            style={styles.leftIcon}
          />
          <Text style={styles.titleText}>Light Mode</Text>
          <Switch
            value={isEnabled}
            onValueChange={toggleSwitch}
            trackColor={{ false: colors.grey3, true: colors.primary }}
            thumbColor={colors.onPrimary}
            disabled={true}
          />
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('WalletScreen')}>
        <View style={styles.cardContent}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/Wallet.png')}
            style={styles.leftIcon}
          />
          <Text style={styles.titleText}>View Wallet</Text>
        </View>
      </TouchableOpacity>

      <AppButton title="View Booking" onPress={onViewBooking} />
    </View>
  );
};

export default BottomModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: 24,
      paddingBottom: 20,
      paddingTop: 12,
      backgroundColor: colors.background,
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
      backgroundColor: colors.onPrimary,
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
      color: colors.shadow,
    },
    creditsLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      color: colors.shadow,
    },
    card: {
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.onPrimary,
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
      color: colors.shadow,
    },
    containerBooking: {
      paddingHorizontal: 30,
      paddingVertical: 45,
      backgroundColor: colors.onPrimary,
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 6,
    },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
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
      color: colors.shadow,
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
      color: colors.shadow,
      flexShrink: 1,
      letterSpacing: -0.45,
    },
  });
