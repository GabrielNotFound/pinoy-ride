import { AppButton, AppTextInput, Container } from '@/Components';
import { AppUtil, Constants } from '@/Utils';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import usePostRequest from '@/Services/Api';

const TransferScreen = ({ route }) => {
  const { colors } = useTheme();
  const walletDetails = route?.params?.walletDetails || {};
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [banks, setBanks] = useState([]);
  const [filteredBanks, setFilteredBanks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const { makePostRequest, loading, error, response } = usePostRequest();

  const availableBalance = walletDetails?.avail_balance || 0.0;
  const minimumAmount = 10.0;

  useEffect(() => {
    if (walletDetails?.avail_balance !== undefined) {
      AppUtil.debugDeep(walletDetails.avail_balance);
    }
  }, [walletDetails]);

  useEffect(() => {
    makePostRequest(Constants.ENDPOINT.GET_BANKS, {});
  }, []);

  const handleGetBanksResponse = () => {
    if (error) {
      console.warn('get banks error:', error);
      return;
    }

    if (!response || Object.keys(response).length === 0) {
      return;
    }

    const banksData = Array.isArray(response?.data)
      ? response.data
      : response?.data?.results || [];

    const filtered = banksData.filter(
      bank => bank?.is_bank === true && bank?.is_maintenance === false,
    );

    AppUtil.debugDeep(filtered);
    setBanks(filtered);
    setFilteredBanks(filtered);
  };

  useEffect(() => {
    handleGetBanksResponse();
  }, [response, error]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter(bank =>
        bank.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredBanks(filtered);
    }
  }, [searchQuery, banks]);

  const handleBack = () => {
    navigation.goBack();
  };

  const formatAmount = val => {
    if (!val || val === '') {
      return '';
    }
    const number = parseFloat(val.replace(/,/g, ''));
    if (isNaN(number)) {
      return '';
    }

    const formatted = number.toFixed(2);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  const validateAmount = () => {
    const numericAmount = parseFloat(amount.replace(/,/g, ''));

    if (!amount || amount === '') {
      setAmountError('Please enter an amount');
      return false;
    }

    if (isNaN(numericAmount) || numericAmount <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }

    if (numericAmount < minimumAmount) {
      setAmountError(`Minimum amount is ₱${minimumAmount.toFixed(2)}`);
      return false;
    }

    if (numericAmount > availableBalance) {
      setAmountError(
        `Amount exceeds available balance of ₱${availableBalance.toFixed(2)}`,
      );
      return false;
    }

    setAmountError('');
    return true;
  };

  const handleNext = () => {
    if (!selectedBank) {
      setAmountError('Please select a bank');
      return;
    }

    if (validateAmount()) {
      const formattedAmount = formatAmount(amount);
      navigation.navigate('BankInformationScreen', {
        amount: parseFloat(amount.replace(/,/g, '')),
        formattedAmount: formattedAmount,
        selectedBank: selectedBank,
      });
    }
  };

  const handleAmountChange = value => {
    setAmount(value);
    if (amountError) {
      setAmountError('');
    }
  };

  const handleBankSelect = bank => {
    setSelectedBank(bank);
    if (amountError === 'Please select a bank') {
      setAmountError('');
    }
  };

  const BanksList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.loadingText}>Loading banks...</Text>
        </View>
      );
    }

    if (filteredBanks.length === 0 && searchQuery.trim() !== '') {
      return (
        <Text style={styles.noBanksText}>
          No banks found matching "{searchQuery}"
        </Text>
      );
    }

    if (filteredBanks.length === 0) {
      return <Text style={styles.noBanksText}>No banks available</Text>;
    }

    return (
      <FlatList
        data={filteredBanks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.bankItem,
              selectedBank?.id === item.id && styles.bankItemSelected,
            ]}
            onPress={() => handleBankSelect(item)}>
            {item.logo_url && (
              <Image
                source={{ uri: item.logo_url }}
                style={styles.bankLogo}
                resizeMode="contain"
              />
            )}
            <Text style={styles.bankName}>{item.name || 'Unknown Bank'}</Text>
            {selectedBank?.id === item.id && (
              <View style={styles.checkIconContainer}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        style={styles.bankListContainer}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      />
    );
  };

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Transfer</Text>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}>
          <View style={styles.lowerPart}>
            <View style={styles.balanceContainer}>
              <Text style={styles.availableText}>Available for Transfer</Text>
              <Text style={styles.balance}>₱{availableBalance.toFixed(2)}</Text>
            </View>

            <View style={styles.transaction}>
              <Text style={styles.amountTitle}>Enter Amount</Text>
              <AppTextInput
                value={amount}
                onChangeText={handleAmountChange}
                placeholder="Amount"
                inputMode="amount"
                error={amountError}
              />
            </View>
            <Text style={styles.minimum}>
              ₱{minimumAmount.toFixed(2)} is the minimum amount you can Transfer
            </Text>
            <Text style={styles.fee}>No Transaction fee</Text>

            <View style={styles.banksSection}>
              <Text style={styles.banksSectionTitle}>Select Bank</Text>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search banks..."
                  placeholderTextColor={colors.grey3}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Text style={styles.clearButton}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <BanksList />
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <AppButton title="Next" onPress={handleNext} isBold />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Container>
  );
};

export default TransferScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
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
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    lowerPart: {
      paddingHorizontal: 16,
      flex: 1,
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
      color: colors.text,
      marginBottom: 3,
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
      marginBottom: 12,
    },
    fee: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      marginBottom: 20,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: colors.background,
    },
    banksSection: {
      marginTop: 10,
      flex: 1,
    },
    banksSectionTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.text,
      marginBottom: 12,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.onQuaternary,
      borderRadius: 8,
      paddingHorizontal: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.grey5,
    },
    searchInput: {
      flex: 1,
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.text,
      paddingVertical: 10,
    },
    clearButton: {
      fontFamily: 'Poppins Medium',
      fontSize: 18,
      color: colors.grey3,
      paddingHorizontal: 8,
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      marginLeft: 10,
    },
    bankListContainer: {
      maxHeight: 300,
      flexGrow: 0,
    },
    bankItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      backgroundColor: colors.onQuaternary,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.grey5,
    },
    bankItemSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
      backgroundColor: colors.primaryLight || colors.onQuaternary,
    },
    bankLogo: {
      width: 40,
      height: 40,
      marginRight: 12,
      borderRadius: 4,
    },
    bankName: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.text,
      flex: 1,
    },
    checkIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkIcon: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    noBanksText: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      textAlign: 'center',
      paddingVertical: 20,
    },
  });
