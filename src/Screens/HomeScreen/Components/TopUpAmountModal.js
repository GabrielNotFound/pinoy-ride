import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { AppButton, AppTextError, AppTextInput } from '@/Components';
import usePostRequest from '@/Services/Api';
import { Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { useNavigation } from '@react-navigation/native';

const topUpValidationSchema = Yup.object().shape({
  amount: Yup.string()
    .required('Amount is required')
    .test('min-amount', 'Minimum amount is ₱10', value => {
      if (!value) {
        return false;
      }
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue >= 10;
    })
    .test('max-amount', 'Maximum amount is ₱50,000', value => {
      if (!value) {
        return false;
      }
      const numValue = parseFloat(value.replace(/,/g, ''));
      return numValue <= 50000;
    }),
});

const TopUpAmountModal = ({ visible, onClose, onError, onSuccess }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const requestToPay = usePostRequest();
  const userInfo = useSelector(selectUserInfo);
  const navigation = useNavigation();

  const handleTopUpRequest = amount => {
    const numAmount = parseFloat(amount.replace(/,/g, ''));

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

  // Handle API response
  useEffect(() => {
    if (requestToPay.error) {
      console.warn('Request to pay error:', requestToPay.error);
      onClose();
      onError?.(requestToPay.error);
      return;
    }

    if (
      requestToPay.response &&
      Object.keys(requestToPay.response).length > 0
    ) {
      const result = requestToPay.response?.data;
      onClose();
      onSuccess?.();
      navigation.navigate('QRPHScreen', {
        paymentData: result,
      });
    }
  }, [requestToPay.response, requestToPay.error]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      {/* Backdrop - closes modal */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.modalContainer}>
        {/* Modal content - dismisses keyboard */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>Top Up Amount</Text>

            <Formik
              initialValues={{ amount: '' }}
              validationSchema={topUpValidationSchema}
              validateOnChange={false}
              validateOnBlur={false}
              onSubmit={values => {
                handleTopUpRequest(values.amount);
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
                const handleConfirm = async () => {
                  if (values.amount) {
                    const numValue = parseFloat(
                      values.amount.replace(/,/g, ''),
                    );
                    if (!isNaN(numValue)) {
                      const formattedAmount = numValue.toFixed(2);
                      setFieldValue('amount', formattedAmount);
                    }
                  }
                  const formErrors = await validateForm();
                  setTouched({ amount: true });

                  if (Object.keys(formErrors).length === 0) {
                    handleSubmit();
                  }
                };

                return (
                  <View>
                    <View style={styles.inputWrapper}>
                      <AppTextInput
                        label="Input Amount"
                        value={values.amount}
                        onChangeText={value => {
                          setFieldValue('amount', value);
                        }}
                        placeholder="0.00"
                        inputMode="amount"
                        editable={!requestToPay.loading}
                      />
                      {touched.amount && errors.amount ? (
                        <AppTextError>{errors.amount}</AppTextError>
                      ) : null}
                    </View>

                    {requestToPay.loading ? (
                      <View style={styles.loadingContainer}>
                        <ActivityIndicator
                          size="large"
                          color={colors.primary}
                        />
                        <Text style={styles.loadingText}>Processing...</Text>
                      </View>
                    ) : (
                      <AppButton
                        title="Confirm"
                        onPress={handleConfirm}
                        isBold
                        noSpacing
                        disabled={requestToPay.loading}
                      />
                    )}
                  </View>
                );
              }}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default TopUpAmountModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    modalContent: {
      backgroundColor: colors.onPrimary,
      borderRadius: 20,
      padding: 30,
      width: '100%',
      maxWidth: 400,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontSize: 20,
      marginBottom: 20,
      color: colors.text,
    },
    inputWrapper: {
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
