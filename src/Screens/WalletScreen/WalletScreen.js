import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { Container } from '@/Components';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { useSelector } from 'react-redux';
import { AppUtil, Constants } from '@/Utils';
import usePostRequest from '@/Services/Api';

const WalletScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const userInfo = useSelector(selectUserInfo);

  const [walletDetails, setWalletDetails] = useState({});
  const [prWalletDetails, setPrWalletDetails] = useState({});
  const [walletHistory, setWalletHistory] = useState([]);

  const getWalletDetails = usePostRequest();
  const {
    makePostRequest: getWalletHistory,
    loading: historyLoading,
    error: historyError,
    response: historyResponse,
  } = usePostRequest();

  /* =====================
     FETCH DATA
  ===================== */
  useEffect(() => {
    if (!userInfo?.id) {
      return;
    }

    getWalletDetails.makePostRequest(Constants.ENDPOINT.GET_RIDER_DETAILS, {
      rider_id: userInfo.id,
    });

    getWalletHistory(Constants.ENDPOINT.GET_WALLET_HISTORY, {
      page: 1,
      perpage: 10,
      query: '',
      sort_by: '-id',
    });
  }, [userInfo?.id]);

  /* =====================
     WALLET DETAILS
  ===================== */
  useEffect(() => {
    if (getWalletDetails.error) {
      console.warn('wallet status check error:', getWalletDetails.error);
      return;
    }

    const result = getWalletDetails.response?.data?.wallet_details;
    if (result) {
      setWalletDetails(result);
    }

    // ✅ Pinoy Ride Credit comes back as a sibling of wallet_details in the
    // same GET_RIDER_DETAILS response.
    const prResult = getWalletDetails.response?.data?.pr_wallet_details;
    if (prResult) {
      setPrWalletDetails(prResult);
    }
  }, [getWalletDetails.response, getWalletDetails.error]);

  /* =====================
     WALLET HISTORY
  ===================== */
  useEffect(() => {
    if (historyError) {
      console.warn('wallet history error:', historyError);
      return;
    }

    const history = historyResponse?.data?.wallet_history ?? [];

    setWalletHistory(history);
  }, [historyResponse, historyError]);

  // Only handle back button when this screen is focused
  useEffect(() => {
    if (!isFocused) {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.popToTop(); // Go straight to HomeScreen
        return true; // Prevent default behavior
      },
    );

    return () => backHandler.remove(); // Cleanup on unmount
  }, [navigation, isFocused]);

  const handleBack = () => navigation.popToTop();

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Wallet</Text>
        </View>
      </View>

      {/* Fixed Wallet Info */}
      <View style={styles.fixedContent}>
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Cash Balance</Text>
          <Text style={styles.cardAmount}>
            {walletDetails?.avail_balance !== undefined
              ? `₱${AppUtil.fn(walletDetails.avail_balance)}`
              : '₱0.00'}
          </Text>
          <Text style={styles.cardSubtitle}>
            Earnings from cashless, Promo Fare & Incentives
          </Text>

          <View style={styles.balanceButtons}>
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() =>
                navigation.navigate('TransferScreen', {
                  walletDetails,
                })
              }>
              <Image
                source={require('@/Assets/Common/WalletScreen/Transfer.png')}
                style={styles.cardButtonIcon}
              />
              <Text style={styles.cardButtonText}>Transfer</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Pinoy Ride Credit</Text>
          <Text style={styles.cardAmount}>
            {prWalletDetails?.avail_balance !== undefined
              ? AppUtil.fn(prWalletDetails.avail_balance)
              : '0.00'}
          </Text>
          <Text style={styles.cardSubtitle}>
            Earnings from cashless, Promo Fare & Incentives
          </Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={() =>
              navigation.navigate('TopUpScreen', {
                prWalletDetails,
              })
            }>
            <Image
              source={require('@/Assets/Common/WalletScreen/Top_Up.png')}
              style={styles.cardButtonIcon}
            />
            <Text style={styles.cardButtonText}>Top-Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Cash History */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {historyLoading ? (
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : walletHistory.length === 0 ? (
          <Text style={{ textAlign: 'center', color: colors.grey3 }}>
            No transaction history available
          </Text>
        ) : (
          walletHistory.map(item => {
            const isCredit = item.type === 'credit';
            const amount = Number(item.amount);

            return (
              <View key={item.id} style={styles.cashlessPaymentItem}>
                <View>
                  <Text style={styles.cashlessPaymentTitle}>
                    {item.description}
                  </Text>

                  <View style={styles.statusContainer}>
                    <Text style={styles.statusText}>
                      {isCredit ? 'Credit' : 'Debit'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.cashlessPaymentAmount,
                    { color: isCredit ? colors.primary : colors.error },
                  ]}>
                  {isCredit ? '+' : '-'}₱{amount.toFixed(2)}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </Container>
  );
};

export default WalletScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
    fixedContent: {
      alignItems: 'center',
    },
    scrollContent: {
      paddingBottom: 20,
      paddingTop: 10,
    },
    cardContainer: {
      backgroundColor: colors.onQuaternary,
      width: '100%',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    cardTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
      marginBottom: 5,
    },
    cardAmount: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 25,
      color: colors.text,
      marginBottom: 5,
    },
    cardSubtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey6,
      marginBottom: 15,
    },
    cardButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      width: 104,
      backgroundColor: colors.primary,
      marginRight: 15,
    },
    cardButtonIcon: {
      width: 20,
      height: 20,
      marginRight: 10,
    },
    cardButtonText: {
      fontFamily: 'Poppins Medium',
      fontSize: 12,
      color: colors.onPrimary,
    },
    balanceButtons: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      gap: 8, // or remove if marginRight used
    },
    cashlessPaymentItem: {
      backgroundColor: colors.onQuaternary,
      borderRadius: 10,
      padding: 15,
      marginHorizontal: 5,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 2, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 1,
    },
    cashlessPaymentTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 12,
      color: colors.text,
    },
    cashlessPaymentDate: {
      fontFamily: 'Poppins Medium',
      fontSize: 8,
      color: colors.grey5,
      marginTop: 2,
    },
    statusContainer: {
      backgroundColor: colors.secondary,
      borderRadius: 5,
      paddingVertical: 2,
      paddingHorizontal: 6,
      marginTop: 5,
      alignSelf: 'flex-start',
    },
    statusText: {
      fontFamily: 'Poppins Medium',
      fontSize: 8,
      color: colors.onPrimary,
    },
    cashlessPaymentAmount: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: colors.primary,
      letterSpacing: -0.45,
    },
  });
