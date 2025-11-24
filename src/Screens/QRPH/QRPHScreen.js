import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox } from '@/Components';
import { WebView } from 'react-native-webview';
import usePostRequest from '@/Services/Api';
import { Constants } from '@/Utils';

const QRPHScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { paymentData } = route.params || {};

  //  Support both camelCase (new API) and snake_case (old format)
  const payment_url = paymentData?.paymentUrl || paymentData?.payment_url;
  const reference_id = paymentData?.referenceId || paymentData?.reference_id;

  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const [isCheckStatusActive, setIsCheckStatusActive] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const checkPaymentStatus = usePostRequest();
  const checkStatusIntervalRef = useRef();
  const referenceIdRef = useRef(reference_id);

  // Update referenceIdRef when reference_id changes
  useEffect(() => {
    console.log(referenceIdRef);
    referenceIdRef.current = reference_id;
  }, [reference_id]);

  // Start polling when reference_id and payment_url are available
  useEffect(() => {
    if (reference_id && payment_url) {
      setIsCheckStatusActive(true);
    }
  }, [reference_id, payment_url]);

  // Polling mechanism — check status every 5 seconds
  useEffect(() => {
    if (isCheckStatusActive && !isPaymentComplete) {
      checkStatusIntervalRef.current = setInterval(() => {
        if (referenceIdRef.current) {
          checkPaymentStatus.makePostRequest(
            Constants.ENDPOINT.QRPH_CHECK_STATUS,
            {
              reference_id: referenceIdRef.current,
            },
            {},
            'json',
          );
        }
      }, 20000);
    }

    return () => {
      if (checkStatusIntervalRef.current) {
        clearInterval(checkStatusIntervalRef.current);
        checkStatusIntervalRef.current = null;
      }
    };
  }, [isCheckStatusActive, isPaymentComplete]);

  // Handle payment status check response
  useEffect(() => {
    if (checkPaymentStatus.error) {
      console.warn('Payment status check error:', checkPaymentStatus.error);
      return;
    }

    if (
      checkPaymentStatus.response &&
      Object.keys(checkPaymentStatus.response).length > 0
    ) {
      const result = checkPaymentStatus.response?.data?.results;

      setIsCheckStatusActive(false);
      setIsPaymentComplete(true);

      if (checkStatusIntervalRef.current) {
        clearInterval(checkStatusIntervalRef.current);
        checkStatusIntervalRef.current = null;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'AppTransactionComplete',
            params: {
              referenceData: {
                amount: paymentData?.amount || result?.amount || '0.00',
                referenceId: reference_id,
                status: result?.status,
                timestamp: result?.timestamp || new Date().toISOString(),
                paymentMethod: 'QRPH',
              },
            },
          },
        ],
      });
    }
  }, [checkPaymentStatus.response, checkPaymentStatus.error]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (checkStatusIntervalRef.current) {
        clearInterval(checkStatusIntervalRef.current);
      }
    };
  }, []);

  const handleError = syntheticEvent => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setAlertMessage('Failed to load payment page. Please try again.');
    setShowAlert(true);
  };

  if (!payment_url) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.iconButton}>
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
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No payment URL provided</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => {
              setIsCheckStatusActive(false);
              if (checkStatusIntervalRef.current) {
                clearInterval(checkStatusIntervalRef.current);
              }
              navigation.goBack();
            }}
            style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>QRPH</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Alert */}
      {alertMessage ? (
        <AlertBox
          title={alertMessage.includes('success') ? 'Success' : 'Error'}
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}

      {/* WebView Container */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading payment...</Text>
          </View>
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: payment_url }}
          style={styles.webView}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={handleError}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          mixedContentMode="compatibility"
          startInLoadingState={true}
        />
      </View>
    </View>
  );
};

export default QRPHScreen;

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
    webViewContainer: {
      flex: 1,
      backgroundColor: colors.onPrimary,
    },
    webView: {
      flex: 1,
    },
    loadingContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
      zIndex: 10,
    },
    loadingText: {
      marginTop: 10,
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey4,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: colors.onPrimary,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Poppins Regular',
      color: colors.grey4,
      textAlign: 'center',
    },
  });
