import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox } from '@/Components';
import { WebView } from 'react-native-webview';

const EKYCScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { ekycData } = route.params || {};
  const { user_id, zkyc_id, zkyc_url } = ekycData || {};

  const webViewRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const handleNavigationStateChange = navState => {
    // Check for success/completion URLs
    if (navState.url.includes('success') || navState.url.includes('complete')) {
      setAlertMessage('eKYC verification completed successfully!');
      setShowAlert(true);
      // Navigate to next screen after a delay
      setTimeout(() => {
        navigation.navigate('EKYCScreen', {
          mobileNumber: user_id,
          ekycCompleted: true,
        });
      }, 2000);
    }
  };

  const handleError = syntheticEvent => {
    const { nativeEvent } = syntheticEvent;
    console.warn('WebView error: ', nativeEvent);
    setAlertMessage('Failed to load eKYC page. Please try again.');
    setShowAlert(true);
  };

  if (!zkyc_url) {
    return (
      <Container style={styles.container}>
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
            <Text style={styles.headerTitle}>eKYC Verification</Text>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No eKYC URL provided</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container style={styles.container}>
      {/* Header */}
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
          <Text style={styles.headerTitle}>eKYC Verification</Text>
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
      <View style={styles.pageContainer}>
        <View style={styles.webViewContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Loading verification...</Text>
            </View>
          )}
          <WebView
            ref={webViewRef}
            source={{ uri: zkyc_url }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={handleError}
            onNavigationStateChange={handleNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            thirdPartyCookiesEnabled={true}
            mixedContentMode="compatibility"
            startInLoadingState={true}
          />
        </View>
      </View>
    </Container>
  );
};

export default EKYCScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 0, marginHorizontal: -15 },
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
      color: colors.shadow,
    },
    pageContainer: {
      flex: 1,
    },
    title: {
      fontSize: 20,
      fontWeight: '400',
      marginBottom: 15,
      fontFamily: 'Poppins Regular',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 11,
      textAlign: 'center',
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey,
      marginBottom: 20,
    },
    webViewContainer: {
      flex: 1,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colors.surface,
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
      color: colors.onSurfaceGrey,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey,
      textAlign: 'center',
    },
  });
