import { AppButton, AppTextInput } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const BankInformationScreen = ({ route }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const { amount, formattedAmount, selectedBank } = route?.params || {};

  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankCode, setBankCode] = useState(selectedBank?.code || '');
  const [bankNumCode, setBankNumCode] = useState(selectedBank?.num_code || '');
  const [accountNameError, setAccountNameError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [bankCodeError, setBankCodeError] = useState('');
  const [bankNumCodeError, setBankNumCodeError] = useState('');

  // Check if bank codes should be editable (only if not provided from selectedBank)
  const isBankCodeEditable = !selectedBank?.code;
  const isBankNumCodeEditable = !selectedBank?.num_code;

  const handleBack = () => {
    navigation.goBack();
  };

  const validateInputs = () => {
    let isValid = true;

    if (!accountName.trim()) {
      setAccountNameError('Please enter account name');
      isValid = false;
    } else {
      setAccountNameError('');
    }

    if (!accountNumber.trim()) {
      setAccountNumberError('Please enter account number');
      isValid = false;
    } else if (!/^\d+$/.test(accountNumber.trim())) {
      // Optional: Check if it's only digits
      setAccountNumberError('Account number must contain only digits');
      isValid = false;
    } else {
      setAccountNumberError('');
    }

    if (!bankCode.trim()) {
      setBankCodeError('Please enter bank code');
      isValid = false;
    } else {
      setBankCodeError('');
    }

    if (!bankNumCode.trim()) {
      setBankNumCodeError('Please enter bank number code');
      isValid = false;
    } else {
      setBankNumCodeError('');
    }

    return isValid;
  };

  const handleNext = () => {
    if (!validateInputs()) {
      return;
    }

    // Navigate to confirmation screen with all data
    navigation.navigate('TransferConfirmationScreen', {
      amount: amount,
      formattedAmount: formattedAmount,
      selectedBank: selectedBank,
      accountName: accountName.trim(),
      accountNumber: accountNumber.trim(),
      bankCode: bankCode,
      bankNumCode: bankNumCode,
    });
  };

  const handleAccountNameChange = value => {
    setAccountName(value);
    if (accountNameError) {
      setAccountNameError('');
    }
  };

  const handleAccountNumberChange = value => {
    setAccountNumber(value);
    if (accountNumberError) {
      setAccountNumberError('');
    }
  };

  const handleBankCodeChange = value => {
    setBankCode(value);
    if (bankCodeError) {
      setBankCodeError('');
    }
  };

  const handleBankNumCodeChange = value => {
    setBankNumCode(value);
    if (bankNumCodeError) {
      setBankNumCodeError('');
    }
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
          <Text style={styles.headerTitle}>Bank Information</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.lowerPart}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoTitle}>Selected Bank</Text>
            <Text style={styles.bankName}>{selectedBank?.name || 'N/A'}</Text>
            <Text style={styles.amountText}>
              Amount: ₱{formattedAmount || '0.00'}
            </Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Account Details</Text>

            <View style={styles.inputWrapper}>
              <AppTextInput
                label="Account Name"
                value={accountName}
                onChangeText={handleAccountNameChange}
                placeholder="Enter account name"
                error={accountNameError}
              />
            </View>

            <View style={styles.inputWrapper}>
              <AppTextInput
                label="Account Number"
                value={accountNumber}
                onChangeText={handleAccountNumberChange}
                placeholder="Enter account number"
                inputMode="numeric"
                error={accountNumberError}
              />
            </View>

            <View style={styles.inputWrapper}>
              <AppTextInput
                label="Bank Code"
                value={bankCode}
                onChangeText={handleBankCodeChange}
                placeholder={
                  isBankCodeEditable ? 'Enter bank code' : 'Auto-filled'
                }
                editable={isBankCodeEditable}
                error={bankCodeError}
              />
              {!isBankCodeEditable && (
                <Text style={styles.disabledNote}>
                  This field is auto-filled based on your selected bank
                </Text>
              )}
            </View>

            <View style={styles.inputWrapper}>
              <AppTextInput
                label="Bank Number Code"
                value={bankNumCode}
                onChangeText={handleBankNumCodeChange}
                placeholder={
                  isBankNumCodeEditable
                    ? 'Enter bank number code'
                    : 'Auto-filled'
                }
                editable={isBankNumCodeEditable}
                error={bankNumCodeError}
              />
              {!isBankNumCodeEditable && (
                <Text style={styles.disabledNote}>
                  This field is auto-filled based on your selected bank
                </Text>
              )}
            </View>
          </View>

          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>
              ⓘ Please ensure all information is correct before proceeding.
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <AppButton title="Next" onPress={handleNext} isBold />
      </View>
    </View>
  );
};

export default BankInformationScreen;

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
    infoContainer: {
      backgroundColor: colors.onQuaternary,
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.grey5,
    },
    infoTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      marginBottom: 4,
    },
    bankName: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: colors.text,
      marginBottom: 8,
    },
    amountText: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.primary,
    },
    formSection: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
      marginBottom: 16,
    },
    disabledNote: {
      fontFamily: 'Poppins Regular',
      fontSize: 11,
      color: colors.grey3,
      marginTop: -15,
      marginBottom: 10,
      fontStyle: 'italic',
    },
    noteContainer: {
      backgroundColor: colors.onQuaternary,
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    noteText: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
      lineHeight: 18,
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      paddingTop: 10,
      backgroundColor: colors.background,
    },
  });
