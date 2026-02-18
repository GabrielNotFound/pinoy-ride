import { AlertBox, AppButton } from '@/Components';
import { Constants } from '@/Utils';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import usePostRequest from '@/Services/Api';

const TransferConfirmationScreen = ({ route }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const {
    amount,
    formattedAmount,
    selectedBank,
    accountName,
    accountNumber,
    bankCode,
    bankNumCode,
  } = route?.params || {};

  const cashOutRequest = usePostRequest();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleCashOutResponse = () => {
    if (cashOutRequest.error) {
      console.warn('Cash out error:', cashOutRequest.error);
      setAlertMessage(
        cashOutRequest.error || 'Failed to process cash out. Please try again.',
      );
      setAlertVisible(true);
      return;
    }

    if (
      cashOutRequest.response &&
      Object.keys(cashOutRequest.response).length > 0
    ) {
      console.log('Success api call', cashOutRequest.response);
      // Navigate to transaction complete screen
      navigation.navigate('AppTransactionComplete', {
        amount: amount,
        formattedAmount: formattedAmount,
        transactionType: 'cashout',
        bank: selectedBank,
        accountName: accountName,
        accountNumber: accountNumber,
      });
    }
  };

  // Handle cash out response
  useEffect(() => {
    handleCashOutResponse();
  }, [cashOutRequest.response, cashOutRequest.error]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConfirm = () => {
    const payload = {
      destination_acct_name: accountName,
      destination_acct_no: accountNumber,
      destination_bank_code: bankCode,
      destination_bank_num_code: bankNumCode,
      amount: amount.toString(),
    };

    console.log('Cash out payload:', payload);
    cashOutRequest.makePostRequest(Constants.ENDPOINT.CASH_OUT, payload);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Confirmation</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.lowerPart}>
          <View style={styles.balanceContainer}>
            <Text style={styles.confirmationTitle}>Confirmation</Text>
            <Text style={styles.confirmationSubtitle}>
              Check if your transaction is correct before clicking Submit.
            </Text>
          </View>

          <Text style={styles.cashOutLabel}>Cash Out</Text>
          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>From</Text>
            <Text style={styles.value}>Cash Balance</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>To Bank</Text>
            <Text style={styles.value}>{selectedBank?.name || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Account Name</Text>
            <Text style={styles.value}>{accountName || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Account Number</Text>
            <Text style={styles.value}>{accountNumber || 'N/A'}</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.label}>Amount</Text>
            <Text style={[styles.value, { color: colors.primary }]}>
              ₱{formattedAmount}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Submit"
          onPress={handleConfirm}
          isBold
          disabled={cashOutRequest.loading}
          loading={cashOutRequest.loading}
        />
      </View>

      <AlertBox
        title="Error"
        message={alertMessage}
        visible={alertVisible}
        setVisible={setAlertVisible}
        onConfirm={() => {
          // Optional: Do something after user confirms the error
          console.log('Error alert dismissed');
        }}
      />
    </View>
  );
};

export default TransferConfirmationScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      flex: 1,
    },
    header: {
      height: 52,
      justifyContent: 'center',
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    backButton: {
      position: 'absolute',
      left: 0,
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Poppins Medium',
      color: colors.primary,
    },
    lowerPart: {
      paddingHorizontal: 16,
      flex: 1,
    },
    balanceContainer: {
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    confirmationTitle: {
      fontSize: 16,
      fontFamily: 'Poppins SemiBold',
      color: colors.text,
    },
    confirmationSubtitle: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.grey3,
      letterSpacing: -0.45,
      marginTop: 7,
    },
    cashOutLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
      marginBottom: 12,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontFamily: 'Poppins Regular',
      width: 120,
      marginRight: 50,
      fontSize: 14,
      color: colors.grey3,
    },
    value: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: colors.background,
    },
  });
