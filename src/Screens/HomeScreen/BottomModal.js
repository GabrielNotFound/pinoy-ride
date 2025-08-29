import React, { useState } from 'react';
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
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled(prev => !prev);
  const navigation = useNavigation();

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

      {/* ✅ Booking button only (modal handled in HomeScreen) */}
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
    top: {
      alignItems: 'center',
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 8,
      color: colors.primary,
    },
    creditsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 20,
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
      marginBottom: 20,
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
      marginBottom: 15,
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
  });
