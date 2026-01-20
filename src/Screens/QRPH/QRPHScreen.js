import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
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
      }, 5000);
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
      const result = checkPaymentStatus.response?.data;

      if (result?.status === 'success') {
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
                  amount: paymentData?.amount || '0.00',
                  referenceId: result?.referenceId || reference_id,
                  status: result?.status,
                  timestamp: result?.ts || new Date().toISOString(),
                  paymentMethod: 'QRPH',
                },
              },
            },
          ],
        });
      }
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

  // NEW: Handle deep links and custom schemes
  const handleShouldStartLoadWithRequest = request => {
    const { url } = request;

    console.log('=== Navigation Request ===');
    console.log('URL:', url);
    console.log('========================');

    // Allow HTTP and HTTPS URLs to load normally in the WebView
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return true; // Let the WebView load it
    }

    // Handle custom schemes (deep links) - open in external app
    if (
      url.startsWith('gcash://') ||
      url.startsWith('maya://') ||
      url.startsWith('paymaya://') ||
      url.startsWith('toppay://') ||
      url.startsWith('topphapp://') ||
      url.startsWith('topphapp-pre://') || // Pre-production TÓP.ph
      url.startsWith('intent://') // Android intent URLs
    ) {
      console.log('Detected deep link:', url);

      // Try to open the URL in the native app
      Linking.openURL(url).catch(err => {
        console.warn("Can't open url:", url);
        console.error('Error details:', err);

        // Show user-friendly error message
        setAlertMessage(
          'The required payment app is not installed on your device. Please install it to continue with this payment method.',
        );
        setShowAlert(true);
      });

      return false; // Prevent WebView from loading it
    }

    // For any other schemes, block by default for security
    console.warn('Blocked unknown URL scheme:', url);
    return false;
  };

  // Handle navigation state changes (especially for iOS)
  const handleNavigationStateChange = navState => {
    console.log('=== Navigation State Change ===');
    console.log('URL:', navState.url);
    console.log('Can Go Back:', navState.canGoBack);
    console.log('Loading:', navState.loading);
    console.log('==============================');
  };

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
          title={
            alertMessage.includes('Unable') ||
            alertMessage.includes('not installed')
              ? 'Error'
              : alertMessage.includes('success')
              ? 'Success'
              : 'Error'
          }
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
          onLoadStart={() => {
            console.log('WebView load started');
            setLoading(true);
          }}
          onLoadEnd={() => {
            console.log('WebView load ended');
            setLoading(false);
          }}
          onError={handleError}
          onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
          onNavigationStateChange={handleNavigationStateChange}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          mixedContentMode="compatibility"
          startInLoadingState={true}
          allowsLinkPreview={false}
          // Important: Allow inline media playback and user interaction
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          // Ensure touch events work
          scrollEnabled={true}
          bounces={false}
          // Additional iOS specific settings
          {...(Platform.OS === 'ios' && {
            decelerationRate: 'normal',
          })}
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
