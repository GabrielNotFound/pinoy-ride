import { AppButton, AppTextInput, Container } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const TopUpScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [amount, setAmount] = useState('');

  const handleBack = () => {
    navigation.goBack();
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
            <Text style={styles.headerTitle}>Top Up</Text>
          </View>
        </View>

        <View style={styles.transferRow}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>From</Text>
            <View style={styles.cardRow}>
              <Image
                source={require('@/Assets/Common/WalletScreen/Money_Symbol_1.png')}
                style={styles.moneySymbol}
              />
              <Text style={styles.cardTitle}>Cash{'\n'}Balance</Text>
            </View>
          </View>

          <Image
            source={require('@/Assets/Common/Right_Arrow.png')}
            style={styles.arrowIcon}
          />

          <View style={[styles.card, styles.cardYellow]}>
            <Text style={[styles.cardLabel, { color: colors.onPrimary }]}>
              To
            </Text>
            <View style={styles.cardRow}>
              <Image
                source={require('@/Assets/Common/WalletScreen/Money_Symbol_2.png')}
                style={styles.moneySymbol}
              />
              <Text style={[styles.cardTitle, { color: colors.onPrimary }]}>
                Pinoy Ride{'\n'}Credit
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.lowerPart}>
          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>₱250.00</Text>
          </View>
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
            50.00 is the minimum amount you can transfer
          </Text>
          <Text style={styles.fee}>No Transaction fee</Text>
        </View>
      </View>
      <AppButton
        title="Confirm"
        onPress={() => {
          navigation.navigate('HomeScreen');
        }}
        isBold
        isOutlined
      />
    </Container>
  );
};

export default TopUpScreen;

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
    transferRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 30,
    },
    card: {
      backgroundColor: colors.onQuaternary,
      borderRadius: 12,
      padding: 12,
      width: 120,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    cardYellow: {
      backgroundColor: colors.topUpCard,
    },
    cardRow: {
      flexDirection: 'row',
    },
    cardLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      color: colors.grey3,
    },
    cardTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 10,
      fontWeight: '600',
      color: colors.text,
    },
    arrowIcon: {
      width: 27,
      height: 30,
      marginHorizontal: 16,
      tintColor: '#000',
    },
    moneySymbol: {
      width: 30,
      height: 30,
      marginRight: 10,
    },
    divider: {
      marginVertical: 25,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
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
    balance: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      color: colors.text,
      marginBottom: 12,
    },
    amountTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
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
  });
