import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import usePostRequest from '@/Services/Api';
import { Constants } from '@/Utils';
import { AlertBox, AppButton, AppTextError, AppTextInput } from '@/Components';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { useSelector } from 'react-redux';

// Validation Schema - Only business rules, formatting is handled by AppTextInput
const cashInValidationSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .test('min-amount', 'Minimum amount is ₱1', value => {
      if (!value) {return false;}
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue >= 1;
    })
    .test('max-amount', 'Maximum amount is ₱50,000', value => {
      if (!value) {return false;}
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue <= 50000;
    }),
});

const CashInScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const requestToPay = usePostRequest();

  const userInfo = useSelector(selectUserInfo);

  const [alertMessage, setAlertMessage] = React.useState('');
  const [showAlert, setShowAlert] = React.useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  // API call method outside Formik
  const handleCashInRequest = amount => {
    // ✅ The amount is already in "1.00" format from the formatter
    // Just remove commas if any
    const numAmount = parseFloat(amount.replace(/,/g, ''));

    console.log('Making API request with amount:', numAmount);

    requestToPay.makePostRequest(
      Constants.ENDPOINT.QRPH_REQUEST_TO_PAY,
      {
        user_id: userInfo.customer_id,
        amount: numAmount,
        order_details: [],
        total_amount: numAmount,
        discount: 0,
        tax: 0,
        trxn_fee: 0,
      },
      {},
      'json',
    );
  };

  // Handle API response
  useEffect(() => {
    if (requestToPay.error) {
      console.warn('Request to pay error:', requestToPay.error);
      // ✅ Use actual error message from API
      setAlertMessage(requestToPay.error);
      setShowAlert(true);
      return;
    }

    if (
      requestToPay.response &&
      Object.keys(requestToPay.response).length > 0
    ) {
      const result = requestToPay.response?.data;
      navigation.navigate('QRPHScreen', {
        paymentData: result,
      });
    }
  }, [requestToPay.response, requestToPay.error]);

  const quickAmounts = [100, 200, 500, 1000];

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
          <Text style={styles.headerTitle}>Cash In</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Alert for API errors only */}
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}

      <Formik
        initialValues={{ amount: '' }}
        validationSchema={cashInValidationSchema}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={values => {
          console.log('Form submitted with values:', values);
          handleCashInRequest(values.amount);
        }}>
        {({
          handleSubmit,
          setFieldValue,
          values,
          errors,
          touched,
          validateForm,
          setTouched,
        }) => {
          const handleProceed = async () => {
            console.log('Proceed button clicked');
            console.log('Current amount value:', values.amount);

            // Format amount to 2 decimals before validation
            if (values.amount) {
              const numValue = parseFloat(values.amount.replace(/,/g, ''));
              if (!isNaN(numValue)) {
                const formattedAmount = numValue.toFixed(2);
                setFieldValue('amount', formattedAmount);
              }
            }

            // Validate form
            const formErrors = await validateForm();
            console.log('Validation errors:', formErrors);

            // Mark field as touched to show errors
            setTouched({ amount: true });

            // If no errors, submit
            if (Object.keys(formErrors).length === 0) {
              console.log('No validation errors, calling handleSubmit');
              handleSubmit();
            } else {
              console.log('Validation failed, not submitting');
            }
          };

          return (
            <View style={styles.contents}>
              <Text style={styles.title}>Enter Amount</Text>
              <Text style={styles.subtitle}>
                Choose or enter the amount you want to add to your PinoyRide
                Wallet.
              </Text>

              {/* Wallet Card */}
              <ImageBackground
                source={require('@/Assets/Common/WalletScreen/WalletCard.png')}
                style={styles.walletCard}
                imageStyle={styles.walletCardImage}>
                <Text style={styles.walletTitle}>PinoyRide Wallet</Text>
                <Text style={styles.walletAmount}>₱0.00</Text>
              </ImageBackground>

              {/* Amount Input */}
              <View style={styles.inputWrapper}>
                <AppTextInput
                  label="Amount"
                  value={values.amount}
                  onChangeText={value => {
                    console.log(
                      'AppTextInput onChangeText called with:',
                      value,
                    );
                    setFieldValue('amount', value);
                    console.log(
                      'After setFieldValue, values.amount:',
                      values.amount,
                    );
                  }}
                  placeholder="0.00"
                  inputMode="amount"
                />
                {touched.amount && errors.amount ? (
                  <AppTextError>{errors.amount}</AppTextError>
                ) : null}
                {/* DEBUG: Show current value */}
                <Text style={{ fontSize: 10, color: 'gray' }}>
                  Debug - Current value: "{values.amount}"
                </Text>
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountContainer}>
                <Text style={styles.quickAmountLabel}>Quick Amount</Text>
                <View style={styles.quickAmountRow}>
                  {quickAmounts.map((quickAmount, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickAmountButton}
                      onPress={() => {
                        console.log('Quick amount selected:', quickAmount);
                        const formattedAmount = quickAmount.toFixed(2);
                        console.log('Setting amount to:', formattedAmount);
                        // ✅ Set with .00 format
                        setFieldValue('amount', formattedAmount);
                        // Clear any validation errors
                        setTouched({ amount: false });
                        console.log(
                          'Amount after setFieldValue:',
                          values.amount,
                        );
                      }}
                      disabled={requestToPay.loading}>
                      <Text style={styles.quickAmountText}>₱{quickAmount}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Proceed Button */}
              <View style={styles.buttonContainer}>
                {requestToPay.loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Processing...</Text>
                  </View>
                ) : (
                  <AppButton
                    title="Proceed to Payment"
                    onPress={handleProceed}
                    disabled={requestToPay.loading}
                    isBold={true}
                    noSpacing={true}
                  />
                )}
              </View>
            </View>
          );
        }}
      </Formik>
    </View>
  );
};

export default CashInScreen;

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
      flex: 1,
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
      marginBottom: 10,
    },
    walletCard: {
      width: '100%',
      height: 150,
      borderRadius: 20,
      padding: 20,
      marginTop: 10,
      marginBottom: 20,
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
      marginTop: 5,
    },
    inputWrapper: {
      marginBottom: 10,
    },
    quickAmountContainer: {
      marginBottom: 30,
    },
    quickAmountLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.shadow,
      marginBottom: 12,
    },
    quickAmountRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
    },
    quickAmountButton: {
      width: '23%',
      backgroundColor: colors.onPrimary,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.primary,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    quickAmountText: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.primary,
    },
    buttonContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
    loadingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    loadingText: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey4,
      marginTop: 10,
    },
  });
