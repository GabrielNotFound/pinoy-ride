import React from 'react';
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

const WalletScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCashIn = () => {
    navigation.navigate('CashInScreen');
  };

  const actionButtons = [
    {
      label: 'Cash In',
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      onPress: handleCashIn,
    },
    {
      label: 'Transfer',
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      onPress: () => {}, // Add transfer functionality
    },
    {
      label: 'Send',
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      onPress: () => {}, // Add send functionality
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.contents}>
        <Text style={styles.title}>Payment</Text>
        <Text style={styles.subtitle}>
          Manage your rides and transaction all in one place. Top up, send, or
          transfer funds anytime with your PinoyRide Wallet.
        </Text>

        {/* Wallet Card with Background Image */}
        <ImageBackground
          source={require('@/Assets/Common/WalletScreen/WalletCard.png')}
          style={styles.walletCard}
          imageStyle={styles.walletCardImage}>
          <Text style={styles.walletTitle}>PinoyRide Wallet</Text>
          <Text style={styles.walletAmount}>₱0.00</Text>
        </ImageBackground>

        {/* Activation Promos */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activationRow}>
          {[1, 2, 3].map((_, index) => (
            <View key={index} style={styles.activationCard}>
              <Image
                source={require('@/Assets/Common/WalletScreen/Shield.png')}
                style={styles.activationIcon}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.activationTitle}>
                  Active your PinoyRide Wallet
                </Text>
                <Text style={styles.activationSubtitle}>
                  Go cashless and earn RideRewards
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          {actionButtons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={btn.onPress}>
              <Image
                source={btn.icon}
                style={styles.actionIcon}
                resizeMode="contain"
              />
              <Text style={styles.actionLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default WalletScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconButton: {
      width: 25,
    },
    spacing: {
      width: 25,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      fontWeight: '400',
      color: colors.onPrimary,
      textAlign: 'center',
      flex: 1,
    },
    contents: {
      paddingVertical: 5,
      paddingHorizontal: 30,
      backgroundColor: colors.onPrimary,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontWeight: '500',
      fontSize: 16,
      marginVertical: 16,
      color: colors.shadow,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 12,
      color: colors.grey4,
    },
    walletCard: {
      width: '106.5%',
      height: 171,
      borderRadius: 20,
      padding: 20,
      marginTop: 20,
      marginBottom: 12,
      overflow: 'hidden',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    walletCardImage: {
      borderRadius: 20,
      resizeMode: 'cover',
    },
    walletTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: 'white',
    },
    walletAmount: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: 'white',
    },
    activationRow: {
      flexDirection: 'row',
      gap: 10,
      paddingVertical: 10,
    },
    activationCard: {
      width: 245,
      height: 42,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 10,
      padding: 10,
    },
    activationIcon: {
      width: 21,
      height: 21,
      marginRight: 10,
    },
    activationTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      color: 'white',
    },
    activationSubtitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 8,
      color: 'white',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: colors.onPrimary,
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderRadius: 10,
      alignItems: 'center',
      marginHorizontal: 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionIcon: {
      width: 24,
      height: 24,
      marginRight: 5,
    },
    actionLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.shadow,
    },
  });
