import { AppButton, AppTextInput, Container } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const CashOutScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [amount, setAmount] = useState('');
  const [isFirstSlide, setIsFirstSlide] = useState(true);
  const isSecondSlide = !isFirstSlide;

  const handleBack = () => {
    if (isSecondSlide) {
      setIsFirstSlide(true);
    } else {
      navigation.goBack();
    }
  };

  const handleNext = () => {
    setIsFirstSlide(false);
  };

  const handleSubmit = () => {
    navigation.navigate('AppTransactionComplete');
  };

  return (
    <Container style={styles.container}>
      <View style={styles.contents}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Image
              source={require('@/Assets/Common/Back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Cash Out</Text>
          </View>
        </View>

        <View style={styles.lowerPart}>
          <View
            style={[
              styles.balanceContainer,
              isSecondSlide && { alignItems: 'flex-start' },
            ]}>
            <Text
              style={[
                styles.availableText,
                isSecondSlide && styles.confirmationTitle,
              ]}>
              {isFirstSlide ? 'Available for Cash out' : 'Confirmation'}
            </Text>
            <Text
              style={[
                styles.balance,
                isSecondSlide && styles.confirmationSubtitle,
              ]}>
              {isFirstSlide
                ? '₱250.00'
                : 'Check if your transaction is correct before clicking Cash-out.'}
            </Text>
          </View>

          {isFirstSlide && (
            <>
              <View style={styles.transaction}>
                <Text style={styles.amountTitle}>Enter Amount</Text>
                <AppTextInput
                  value={amount}
                  onChangeText={setAmount}
                  placeholder="Amount"
                  inputMode="amount"
                />
              </View>
              <Text style={styles.minimum}>
                ₱10.00 is the minimum amount you can Cash out
              </Text>
              <Text style={styles.fee}>No Transaction fee</Text>
            </>
          )}

          {isSecondSlide && (
            <>
              <Text style={styles.cashOutLabel}>Cash Out</Text>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={styles.label}>From</Text>
                <Text style={styles.value}>Cash Balance</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={styles.label}>To e-Wallet</Text>
                <Text style={styles.value}>Gcash{'\n'}09999999999</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.rowBetween}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>₱200.00</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <AppButton
        title={isFirstSlide ? 'Confirm' : 'Submit'}
        onPress={isFirstSlide ? handleNext : handleSubmit}
        isBold
      />
    </Container>
  );
};

export default CashOutScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    contents: {
      flex: 1,
      justifyContent: 'flex-start',
    },
    header: {
      height: 52,
      justifyContent: 'center',
      marginBottom: 20,
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
    },
    transaction: {
      marginTop: 20,
    },
    balanceContainer: {
      alignItems: 'center',
    },
    availableText: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      color: colors.shadow,
      marginBottom: 3,
    },
    balance: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      color: colors.shadow,
      marginBottom: 12,
    },
    confirmationTitle: {
      fontSize: 16,
      fontFamily: 'Poppins SemiBold',
    },

    confirmationSubtitle: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.grey3,
      letterSpacing: -0.45,
      marginTop: 7,
      marginBottom: 40,
    },
    amountTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.shadow,
      marginBottom: 12,
    },
    minimum: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      marginBottom: 31,
    },
    fee: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      marginBottom: 12,
    },
    cashOutLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.shadow,
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
      width: 100,
      marginRight: 70,
      fontSize: 14,
      color: colors.grey3,
    },
    value: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.shadow,
    },
  });
