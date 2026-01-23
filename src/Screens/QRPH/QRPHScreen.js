import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import InAppBrowser from 'react-native-inappbrowser-reborn';

import { AlertBox } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';

const FLOW = {
  INIT: 'INIT',
  CHECKING: 'CHECKING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
};

const QRPHScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();

  const { paymentData } = route.params || {};
  const paymentUrl = paymentData?.paymentUrl || paymentData?.payment_url;
  const referenceId = paymentData?.referenceId || paymentData?.reference_id;

  const [flowState, setFlowState] = useState(FLOW.INIT);
  const [alertMessage, setAlertMessage] = useState('');

  const checkPaymentStatus = usePostRequest();
  const intervalRef = useRef(null);
  const referenceIdRef = useRef(referenceId);

  useEffect(() => {
    referenceIdRef.current = referenceId;
  }, [referenceId]);

  const openPayment = async url => {
    try {
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: false,
          modalEnabled: true,
        });
        setFlowState(FLOW.CANCELLED);
      } else {
        Linking.openURL(url);
        setFlowState(FLOW.CANCELLED);
      }
    } catch {
      Linking.openURL(url);
      setFlowState(FLOW.CANCELLED);
    }
  };

  useEffect(() => {
    if (paymentUrl && referenceId) {
      openPayment(paymentUrl);
      setFlowState(FLOW.CHECKING);
    }
  }, [paymentUrl, referenceId]);

  useEffect(() => {
    if (flowState !== FLOW.CHECKING) {return;}

    intervalRef.current = setInterval(() => {
      if (!referenceIdRef.current) {return;}

      checkPaymentStatus.makePostRequest(
        Constants.ENDPOINT.QRPH_CHECK_STATUS,
        { reference_id: referenceIdRef.current },
        {},
        'json',
      );
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [flowState]);

  useEffect(() => {
    const result = checkPaymentStatus.response?.data;
    AppUtil.debugDeep(result);
    if (!result?.status) {return;}

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (result.status === 'success') {
      setFlowState(FLOW.SUCCESS);

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AppTransactionComplete',
            params: {
              referenceData: {
                amount: paymentData?.amount || '0.00',
                referenceId: result?.referenceId || referenceId,
                status: result.status,
                timestamp: result?.ts || new Date().toISOString(),
                paymentMethod: 'QRPH',
              },
            },
          },
        ],
      });
      return;
    }

    if (result.status === 'failed') {
      setFlowState(FLOW.FAILED);
      setAlertMessage('Payment failed. Please try again.');
      return;
    }

    if (result.status === 'expired') {
      setFlowState(FLOW.EXPIRED);
      setAlertMessage('Payment expired. Please restart the payment.');
    }
  }, [checkPaymentStatus.response]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && flowState === FLOW.CANCELLED) {
        setFlowState(FLOW.CHECKING);
      }
    });

    return () => sub.remove();
  }, [flowState]);

  const handleBack = () => {
    if (intervalRef.current) {clearInterval(intervalRef.current);}
    navigation.goBack();
  };

  const retryPayment = () => {
    setAlertMessage('');
    setFlowState(FLOW.INIT);
    openPayment(paymentUrl);
    setFlowState(FLOW.CHECKING);
  };

  if (!paymentUrl) {
    return (
      <View style={styles.container}>
        <Text>No payment URL provided</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QRPH</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {!!alertMessage && (
        <AlertBox
          title="Payment Status"
          message={alertMessage}
          visible={true}
          setVisible={() => setAlertMessage('')}
        />
      )}

      <View style={styles.center}>
        {flowState === FLOW.CHECKING && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.text}>Complete payment in your browser</Text>
            <Text style={styles.subText}>
              This screen will update automatically
            </Text>
          </>
        )}

        {(flowState === FLOW.FAILED || flowState === FLOW.EXPIRED) && (
          <TouchableOpacity onPress={retryPayment}>
            <Text style={[styles.text, { color: colors.primary }]}>
              Retry Payment
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default QRPHScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconButton: { width: 25 },
    spacing: { width: 25 },
    backIcon: { width: 23, height: 23 },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: colors.onPrimary,
      fontSize: 16,
      fontFamily: 'Poppins Regular',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    text: {
      marginTop: 16,
      fontSize: 16,
      fontFamily: 'Poppins Regular',
      color: colors.text,
      textAlign: 'center',
    },
    subText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.grey4,
      textAlign: 'center',
    },
  });
