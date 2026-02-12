import { AppButton, Container } from '@/Components';
import { AppUtil } from '@/Utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { BackHandler, Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const AppTransactionComplete = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();

  // Check if we came from a specific flow
  const returnTo = route?.params?.returnTo;
  const returnScreen = route?.params?.returnScreen;

  const transactionType =
    route?.params?.referenceData?.transactionType || 'TRANSFER';

  // Format amount with peso sign
  const formattedAmount = route?.params?.referenceData?.amount
    ? `₱${parseFloat(route?.params?.referenceData.amount).toFixed(2)}`
    : '₱0.00';

  useEffect(() => {
    AppUtil.debugDeep(route?.params);
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  const handleDone = () => {
    if (returnTo && returnScreen) {
      navigation.reset({
        index: 0,
        routes: [{ name: returnScreen }],
      });
    } else {
      // Default behavior - go to home
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }
  };

  const handleViewWallet = () => {
    navigation.reset({
      index: 2,
      routes: [
        { name: 'HomeScreen' },
        { name: 'SettingsScreen' },
        { name: 'WalletScreen' },
      ],
    });
  };

  // Determine button text based on context
  const getDoneButtonText = () => {
    if (returnTo && returnScreen) {
      return 'Continue';
    }
    return 'Go to Dashboard';
  };

  return (
    <Container style={styles.container}>
      <View style={styles.contents}>
        <Image
          source={require('@/Assets/Common/Success_Image.png')}
          style={styles.image}
          resizeMode="contain"
        />
        {/* Display dynamic amount */}
        <Text style={styles.amount}>{formattedAmount}</Text>

        {/* Dynamic title based on payment method */}
        <Text style={styles.title}>
          {transactionType === 'TOPUP'
            ? 'QRPH Payment Successful!'
            : 'Transfer request sent!'}
        </Text>

        <Text style={styles.subtitle}>
          {transactionType === 'TOPUP'
            ? 'Your transaction has been completed successfully.'
            : 'Will notify you if your transaction is successfully transferred.'}
        </Text>

        {/* Optional: Display transaction ID */}
        {route?.params?.referenceData?.transactionId && (
          <Text style={styles.transactionId}>
            Transaction ID: {route?.params?.referenceData.transactionId}
          </Text>
        )}
      </View>

      <View style={{ paddingBottom: 24 }}>
        <AppButton
          title="View Wallet"
          onPress={handleViewWallet}
          isBold
          noSpacing
          featureStyle={{ marginBottom: 10 }}
        />
        <AppButton
          title={getDoneButtonText()}
          onPress={handleDone}
          isBold
          noSpacing
          mode="outlined"
          featureStyle={{ backgroundColor: colors.onPrimary }}
        />
      </View>
    </Container>
  );
};

export default AppTransactionComplete;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    contents: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 122,
      height: 122,
      marginBottom: 24,
    },
    amount: {
      fontFamily: 'Poppins Bold',
      fontSize: 20,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey3,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
    transactionId: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey4,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 16,
    },
  });
