import React, { useEffect } from 'react';
import {
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { useSelector } from 'react-redux';
import { AppUtil } from '@/Utils';

const SettingsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);

  useEffect(() => {
    AppUtil.debugDeep(userInfo?.ekyc_details?.selfie);
  });

  // Intercept hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.popToTop(); // Go straight to HomeScreen
        return true; // Prevent default behavior
      },
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, [navigation]);

  const getDisplayName = () => {
    if (userInfo?.ekyc_details) {
      const { first_name, last_name } = userInfo.ekyc_details;

      // convert the title case into good formatting
      const toTitleCase = str => {
        return str
          .toLowerCase()
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      return `${toTitleCase(first_name)} ${toTitleCase(last_name)}`;
    }
    return 'User';
  };

  const buttonList = [
    {
      id: 'booking_history',
      label: 'Booking History',
      onPress: () => navigation.navigate('BookingHistoryScreen'),
    },
    {
      id: 'promo_and_referrals',
      label: 'Promo & Referrals',
      onPress: () => navigation.navigate('PromoReferralsScreen'),
    },
    {
      id: 'payment_option',
      label: 'Payment Option',
      onPress: () => navigation.navigate('PaymentOptionScreen'),
    },
    {
      id: 'wallet',
      label: 'Wallet',
      onPress: () => navigation.navigate('WalletScreen'),
    },
  ];

  const handleBack = () => {
    navigation.popToTop();
  };

  return (
    <Container style={styles.container}>
      <View>
        <TouchableOpacity onPress={handleBack}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => console.log('Profile Pressed')}>
          <Image
            source={
              userInfo?.ekyc_details?.selfie
                ? { uri: userInfo.ekyc_details.selfie }
                : require('@/Assets/Common/Sample_Profile.png')
            }
            style={styles.profile}
          />
          <View style={styles.profileTextContainer}>
            <Text style={styles.name}>{getDisplayName()}</Text>
          </View>
          <Text style={styles.profileLabel}>Profile</Text>
        </TouchableOpacity>

        {buttonList.map(button => (
          <TouchableOpacity
            key={button.id}
            style={styles.buttons}
            onPress={button.onPress}>
            <Text style={styles.label}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Container>
  );
};

export default SettingsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
    },
    backIcon: {
      width: 23,
      height: 23,
      marginBottom: 20,
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 10,
      marginBottom: 17,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
      backgroundColor: colors.onPrimary,
    },
    profileTextContainer: {
      flex: 1,
      marginLeft: 10,
    },
    profileLabel: {
      backgroundColor: colors.lightBlue,
      color: colors.shadow,
      paddingHorizontal: 10,
      paddingVertical: 2,
      borderRadius: 10,
      fontSize: 10,
      fontFamily: 'Poppins Regular',
    },
    profile: {
      width: 46,
      height: 46,
      borderRadius: 23,
    },
    name: {
      fontFamily: 'Poppins Medium',
      fontWeight: 500,
      fontSize: 14,
      color: colors.grey3,
    },
    buttons: {
      height: 40,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 33,
      borderRadius: 10,
      marginVertical: 5,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
      backgroundColor: colors.onPrimary,
    },
    label: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 16,
      color: colors.grey3,
    },
  });
