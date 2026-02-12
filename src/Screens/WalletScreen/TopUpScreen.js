import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  AlertBox,
  AppButton,
  AppTextError,
  AppTextInput,
  Container,
} from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';

const topUpValidationSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .test('min-amount', 'Minimum amount is ₱50', value => {
      if (!value) {return false;}
      return parseFloat(value.replace(/,/g, '')) >= 50;
    })
    .test('max-amount', 'Maximum amount is ₱50,000', value => {
      if (!value) {return false;}
      return parseFloat(value.replace(/,/g, '')) <= 50000;
    }),
});

const TopUpScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const requestToPay = usePostRequest();
  const userInfo = useSelector(selectUserInfo);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // ✅ NEW: store entered amount safely
  const [enteredAmount, setEnteredAmount] = useState(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  // ✅ Handle API response
  useEffect(() => {
    if (requestToPay.error) {
      setAlertMessage(requestToPay.error);
      setShowAlert(true);
      return;
    }

    if (requestToPay.response?.data && enteredAmount) {
      const result = requestToPay.response.data;
      AppUtil.debugDeep(result);
      navigation.navigate('QRPH', {
        paymentData: {
          amount: enteredAmount, // ✅ pass exact entered amount
          paymentUrl: result.payment_url || result.paymentUrl,
          referenceId: result.reference_id || result.referenceId,
          transactionType: 'TOPUP',
        },
      });
    }
  }, [requestToPay.response, requestToPay.error, enteredAmount]);

  // ✅ Modified function
  const handleTopUpRequest = amount => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));

    if (isNaN(numAmount)) {return;}

    const formattedAmount = numAmount.toFixed(2);

    // ✅ Save entered amount before API call
    setEnteredAmount(formattedAmount);

    requestToPay.makePostRequest(
      Constants.ENDPOINT.QRPH_REQUEST_TO_PAY,
      {
        user_id: userInfo.id,
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

  return (
    <Container style={styles.container}>
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}

      <View style={styles.contents}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
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

        <Formik
          initialValues={{ amount: '' }}
          validationSchema={topUpValidationSchema}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={values => handleTopUpRequest(values.amount)}>
          {({
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
            validateForm,
            setTouched,
          }) => {
            const handleConfirm = async () => {
              if (values.amount) {
                const numValue = parseFloat(values.amount.replace(/,/g, ''));
                if (!isNaN(numValue)) {
                  setFieldValue('amount', numValue.toFixed(2));
                }
              }

              const formErrors = await validateForm();
              setTouched({ amount: true });

              if (Object.keys(formErrors).length === 0) {
                handleSubmit();
              }
            };

            return (
              <TouchableWithoutFeedback
                onPress={Keyboard.dismiss}
                style={{ flex: 1 }}>
                <View style={{ flex: 1 }}>
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
                      <Text
                        style={[styles.cardLabel, { color: colors.onPrimary }]}>
                        To
                      </Text>
                      <View style={styles.cardRow}>
                        <Image
                          source={require('@/Assets/Common/WalletScreen/Money_Symbol_2.png')}
                          style={styles.moneySymbol}
                        />
                        <Text
                          style={[
                            styles.cardTitle,
                            { color: colors.onPrimary },
                          ]}>
                          Pinoy Ride{'\n'}Credit
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.divider} />
                  <View style={styles.lowerPart}>
                    <View style={styles.transaction}>
                      <Text style={styles.amountTitle}>Enter Amount</Text>
                      <AppTextInput
                        value={values.amount}
                        onChangeText={value => setFieldValue('amount', value)}
                        placeholder="Amount"
                        inputMode="amount"
                      />
                      {touched.amount && errors.amount && (
                        <AppTextError>{errors.amount}</AppTextError>
                      )}
                    </View>

                    <Text style={styles.minimum}>
                      ₱50.00 is the minimum amount you can transfer
                    </Text>
                    <Text style={styles.fee}>No Transaction fee</Text>
                  </View>

                  {requestToPay.loading ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={colors.primary} />
                      <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                  ) : (
                    <AppButton
                      title="Confirm"
                      onPress={handleConfirm}
                      isBold
                      isOutlined
                    />
                  )}
                </View>
              </TouchableWithoutFeedback>
            );
          }}
        </Formik>
      </View>
    </Container>
  );
};

export default TopUpScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1 },
    contents: { flex: 1, justifyContent: 'flex-start' },
    header: { height: 52, justifyContent: 'center', marginBottom: 20 },
    backButton: {
      position: 'absolute',
      left: 0,
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    backIcon: { width: 23, height: 23 },
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
    cardYellow: { backgroundColor: colors.topUpCard },
    cardRow: { flexDirection: 'row' },
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
    moneySymbol: { width: 30, height: 30, marginRight: 10 },
    divider: {
      marginVertical: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
    },
    lowerPart: { paddingHorizontal: 16 },
    transaction: { marginTop: 20 },
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
