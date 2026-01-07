import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { AlertBox, AppButton, AppTextInput } from '@/Components';
import {
  ensureLocationPermission,
  requestLocationPermission,
} from '@/Utils/Permissions';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';

const RegisterScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);

  const [mobileNumber, setMobileNumber] = useState(''); // Stores as 63XXXXXXXXXX
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getEKYCUrl = usePostRequest();

  useEffect(() => {
    (async () => {
      const granted = await ensureLocationPermission();
      if (!granted) {
        setShowAlert(true);
      }
    })();
  }, []);

  const fetchEKYCUrl = user_id => {
    setIsLoading(true);
    getEKYCUrl.makePostRequest(Constants.ENDPOINT.GET_EKYC_URL, {
      user_id,
    });
  };

  const handleGetEKYCUrl = () => {
    if (getEKYCUrl.error) {
      setIsLoading(false);
      setAlertMessage(getEKYCUrl.error);
      setShowAlert(true);
      return;
    }
    const results = getEKYCUrl.response?.data;
    AppUtil.debugDeep(results);

    // Check if we got the zkyc_url from the response
    if (results?.zkyc_url) {
      console.log('eKYC URL received:', results.zkyc_url);
      setIsLoading(false);
      navigation.navigate('EKYCScreen', {
        ekycData: results, // Pass the entire response
        mobile_number: mobileNumber, // Pass in 63XXXXXXXXXX format
      });
    } else if (getEKYCUrl.response) {
      console.log('API response but no URL');
      setIsLoading(false);
      setAlertMessage('Failed to get eKYC URL. Please try again.');
      setShowAlert(true);
    }
  };

  useEffect(() => {
    handleGetEKYCUrl();
  }, [getEKYCUrl.response, getEKYCUrl.error]);

  const handleRetryPermission = async () => {
    const result = await requestLocationPermission();
    if (result !== 'granted') {
      setShowAlert(true);
    }
  };

  const handleBack = () => {
    navigation.navigate('LandingScreen');
  };

  const handleNext = () => {
    if (!mobileNumber) {
      setErrorMessage('Mobile number is required');
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage('Please enter a valid mobile number');
      return;
    }

    setErrorMessage('');
    fetchEKYCUrl(mobileNumber); // Sends 63XXXXXXXXXX format
  };

  return (
    <>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <Container style={styles.container}>
        {showAlert && (
          <AlertBox
            title={alertMessage ? 'Error' : 'Location Required'}
            message={
              alertMessage ||
              'This app cannot continue without location access.'
            }
            visible={showAlert}
            setVisible={setShowAlert}
            onConfirm={alertMessage ? undefined : handleRetryPermission}
          />
        )}

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
            <Text style={styles.headerTitle}>Get Started</Text>
          </View>
        </View>

        {/* Input */}
        <View style={styles.pageContainer}>
          <AppTextInput
            label="Mobile"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            onValidationChange={setIsPhoneValid}
            inputMode="phone"
            placeholder="09XX-XXX-XXXX"
            error={errorMessage}
            editable={!isLoading}
          />
        </View>

        {/* Footer */}
        <View>
          <Text style={styles.footerText}>
            Enter your active number to receive a verification code. This helps
            us keep your account secure.
          </Text>
          <AppButton
            title="Next"
            onPress={handleNext}
            isBold
            loading={isLoading}
            disabled={isLoading}
          />
        </View>
      </Container>
    </>
  );
};

export default RegisterScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    header: {
      height: 52,
      justifyContent: 'center',
      marginBottom: 20,
    },
    backButton: {
      position: 'absolute',
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
    pageContainer: { flex: 1, paddingHorizontal: 20 },
    footerText: {
      textAlign: 'center',
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.darkGrey,
    },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
  });
