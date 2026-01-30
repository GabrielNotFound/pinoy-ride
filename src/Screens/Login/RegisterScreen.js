import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AlertBox, AppButton, AppTextInput } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';

const RegisterScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);

  const [mobileNumber, setMobileNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getEKYCUrl = usePostRequest();

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

    if (results?.zkyc_url) {
      console.log('eKYC URL received:', results.zkyc_url);
      setIsLoading(false);
      navigation.navigate('EKYCScreen', {
        ekycData: results,
        mobile_number: mobileNumber,
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
    fetchEKYCUrl(mobileNumber);
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
            title="Error"
            message={alertMessage}
            visible={showAlert}
            setVisible={setShowAlert}
          />
        )}

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

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.pageContainer}>
              <AppTextInput
                label="Mobile"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                onValidationChange={setIsPhoneValid}
                inputMode="phone"
                placeholder="9XX-XXX-XXXX"
                error={errorMessage}
                editable={!isLoading}
              />
            </View>

            <View style={styles.footer}>
              <AppButton
                title="Next"
                onPress={handleNext}
                isBold
                loading={isLoading}
                disabled={isLoading}
              />
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
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
      color: colors.text,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    pageContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
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
