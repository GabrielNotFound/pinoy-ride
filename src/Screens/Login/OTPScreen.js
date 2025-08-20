import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox, OTPInput } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';

const OTPScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { mobileNumber } = route.params;

  const getOtpCode = usePostRequest();
  const verifyOtpCode = usePostRequest();
  const loginUser = usePostRequest();

  const [otpCode, setOtpCode] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    fetchOtp(mobileNumber);
  }, [mobileNumber]);

  const fetchOtp = mobileNumber => {
    getOtpCode.makePostRequest(Constants.ENDPOINT.GENERATE_OTP, {
      mobile_no: mobileNumber,
    });
  };
  const handleGetOtp = () => {
    if (getOtpCode.error) {
      setAlertMessage(getOtpCode.error);
      return;
    }
    const results = getOtpCode.response?.data;
    AppUtil.debugDeep(results?.code);
  };

  useEffect(() => {
    handleGetOtp();
  }, [getOtpCode.response, getOtpCode.error]);

  useEffect(() => {
    if (otpCode.length === 6) {
      if (otpCode === getOtpCode.response?.data?.code) {
        verifyOtp();
      } else {
        setAlertMessage('Invalid OTP, please try again.');
      }
    }
  }, [otpCode]);

  const verifyOtp = () => {
    verifyOtpCode.makePostRequest(Constants.ENDPOINT.VERIFY_OTP, {
      mobile_no: mobileNumber,
      code: otpCode,
    });
  };

  const handleVerifyOtp = () => {
    if (verifyOtpCode.error) {
      setAlertMessage(verifyOtpCode.error);
      return;
    }
    const results = verifyOtpCode.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      login();
    }
  };

  useEffect(() => {
    handleVerifyOtp();
  }, [verifyOtpCode.response, verifyOtpCode.error]);

  const login = () => {
    loginUser.makePostRequest(Constants.ENDPOINT.VERIFY_OTP, {
      mobile_no: mobileNumber,
      code: otpCode,
    });
  };

  const handleLoginUser = () => {
    if (loginUser.error) {
      setAlertMessage(loginUser.error);
      return;
    }
    const results = loginUser.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      navigation.navigate('HomeScreen');
    }
  };

  useEffect(() => {
    handleLoginUser();
  }, [loginUser.response, loginUser.error]);

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
          <Text style={styles.headerTitle}>Get Started</Text>
        </View>
      </View>

      {/* Alert */}
      {alertMessage ? <AlertBox title="Error" message={alertMessage} /> : null}

      {/* OTP */}
      <View style={styles.pageContainer}>
        <Text style={styles.title}>Enter One-Time PIN</Text>
        <Text style={styles.subtitle}>
          A One-Time PIN was sent to +63 ******{mobileNumber.slice(-4)}
        </Text>
        <OTPInput length={6} onOTPChange={setOtpCode} />

        <View style={styles.imageContainer}>
          <Image
            source={require('@/Assets/Common/LoginScreen/OTP_Image.png')}
            style={styles.otpImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.resendContainer}>
          <Text style={styles.resendLabel}>Didn't receive it?</Text>
          <TouchableOpacity onPress={() => console.log('Resend OTP')}>
            <Text style={styles.resendLink}>Request a new OTP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

export default OTPScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10 },
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
    pageContainer: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
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
    imageContainer: {
      marginVertical: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    otpImage: { width: 288, height: 288 },
    resendContainer: {
      marginTop: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    resendLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: colors.shadow,
      marginBottom: 2,
    },
    resendLink: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: colors.primary,
    },
  });
