import React, { useState } from 'react';
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
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

const BottomModal = () => {
  const { colors } = useTheme();
  const { width, height } = useWindowDimensions(); // ✅ responsive hook
  const styles = getStyles({ colors, width, height });

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(prev => !prev);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.title}>Pinoy Rider</Text>
        <Text style={styles.title}>Credit</Text>
        <Text style={styles.creditScore}>100.50</Text>
      </View>
      {/* credits Row */}
      <View style={styles.creditsRow}>
        {credits.map((item, index) => (
          <View key={index} style={styles.creditsCard}>
            <Image source={item.icon} style={styles.creditsIcon} />
            <Text style={styles.creditsValue}>{item.value}</Text>
            <Text style={styles.creditsLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Light Mode Toggle */}
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

      {/* Wallet */}
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

      {/* Bottom Button */}
      <AppButton title="View Booking" onPress={() => {}} />
    </View>
  );
};

export default BottomModal;

const getStyles = ({ colors, width, height }) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: width * 0.06, // ~6% of screen width
      paddingBottom: height * 0.025,
      paddingTop: height * 0.015,
      backgroundColor: colors.background,
    },
    top: {
      alignItems: 'center',
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: width * 0.02, // responsive font
      color: colors.shadow,
    },
    creditsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: height * 0.025,
    },
    creditsCard: {
      flex: 1,
      alignItems: 'center',
      backgroundColor: colors.onPrimary,
      padding: width * 0.025,
      marginHorizontal: width * 0.01,
      borderRadius: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 6,
    },
    creditScore: {
      fontFamily: 'Poppins SemiBold',
      fontSize: width * 0.045,
      color: colors.onPrimary,
      backgroundColor: colors.primary,
      paddingHorizontal: width * 0.035,
      paddingVertical: height * 0.005,
      borderRadius: 10,
      marginTop: height * 0.01,
      marginBottom: height * 0.025,
    },
    creditsIcon: {
      width: width * 0.09,
      height: width * 0.09,
      marginBottom: height * 0.008,
      resizeMode: 'contain',
    },
    creditsValue: {
      fontFamily: 'Poppins SemiBold',
      fontSize: width * 0.05,
      color: colors.shadow,
    },
    creditsLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: width * 0.023,
      color: colors.shadow,
    },
    card: {
      height: height * 0.07, // ~7% of screen height
      borderRadius: 10,
      backgroundColor: colors.onPrimary,
      paddingHorizontal: width * 0.05,
      paddingVertical: height * 0.015,
      marginBottom: height * 0.02,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 10,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: width * 0.03,
    },
    leftIcon: {
      width: width * 0.085,
      height: width * 0.085,
      resizeMode: 'contain',
    },
    titleText: {
      fontFamily: 'Poppins Medium',
      flex: 1,
      fontSize: width * 0.035,
      color: colors.shadow,
    },
  });
