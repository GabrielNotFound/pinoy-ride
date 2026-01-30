import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox, Container, OTPInput } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo, setUserInfo } from '@/Redux/Slices/userSlice';

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
  const [showAlert, setShowAlert] = useState(false);

  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  // Fetch OTP on mount
  useEffect(() => {
    fetchOtp(mobileNumber);
  }, [mobileNumber]);

  const fetchOtp = mobileNumber => {
    getOtpCode.makePostRequest(Constants.ENDPOINT.GENERATE_OTP, {
      mobile_no: mobileNumber,
    });
  };

  // Handle OTP generation response
  useEffect(() => {
    if (getOtpCode.error) {
      setAlertMessage(getOtpCode.error);
      setShowAlert(true);
      return;
    }
    const results = getOtpCode.response?.data;
    AppUtil.debugDeep(results?.code);
  }, [getOtpCode.response, getOtpCode.error]);

  // Verify OTP when 6 digits entered
  const verifyOtp = code => {
    verifyOtpCode.makePostRequest(Constants.ENDPOINT.VERIFY_OTP, {
      mobile_no: mobileNumber,
      code,
    });
  };

  // Handle OTP verification response
  useEffect(() => {
    if (verifyOtpCode.error) {
      setAlertMessage(verifyOtpCode.error);
      setShowAlert(true);
      return;
    }
    const results = verifyOtpCode.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      login();
    } else if (otpCode.length === 6) {
      setAlertMessage('Invalid OTP, please try again.');
      setShowAlert(true);
    }
  }, [verifyOtpCode.response, verifyOtpCode.error]);

  const login = () => {
    loginUser.makePostRequest(Constants.ENDPOINT.LOGIN, {
      mobile_no: mobileNumber,
    });
  };

  // Handle login response
  useEffect(() => {
    if (loginUser.error) {
      setAlertMessage(loginUser.error);
      setShowAlert(true);
      return;
    }
    const results = loginUser.response;

    if (results?.code === 200 && results.data) {
      const userData = results.data;
      const flattenedUser = {
        ...userData,
        ...(userData.customer_address?.[0] || {}),
      };
      delete flattenedUser.customer_address;

      dispatch(setUserInfo(flattenedUser));
    }
  }, [loginUser.response, loginUser.error]);

  // Redirect after login
  useEffect(() => {
    if (userInfo) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      });
    }
  }, [userInfo]);

  const [resendDisabled, setResendDisabled] = useState(false);

  const handleResendOtp = async () => {
    if (resendDisabled) {
      return;
    }

    setResendDisabled(true);
    setTimeout(() => setResendDisabled(false), 60000); // 60s cooldown

    try {
      await getOtpCode.makePostRequest(Constants.ENDPOINT.GENERATE_OTP, {
        mobile_no: mobileNumber,
      });
      setAlertMessage('OTP has been resent!');
      setShowAlert(true);
    } catch (error) {
      setAlertMessage(error || 'Failed to resend OTP.');
      setShowAlert(true);
    }
  };

  return (
    <Container style={styles.container}>
      {/* Fixed Header */}
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
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}

      {/* Scrollable Content with Keyboard Dismissal */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <Text style={styles.title}>Enter One-Time PIN</Text>
            <Text style={styles.subtitle}>
              A One-Time PIN was sent to +63 ******{mobileNumber.slice(-4)}
            </Text>
            <OTPInput
              length={6}
              onOTPChange={setOtpCode}
              onOTPComplete={verifyOtp}
            />

            <View style={styles.imageContainer}>
              <Image
                source={require('@/Assets/Common/LoginScreen/OTP_Image.png')}
                style={styles.otpImage}
                resizeMode="contain"
              />
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn't receive it?</Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={resendDisabled}>
                <Text
                  style={[
                    styles.resendLink,
                    resendDisabled && { opacity: 0.5 },
                  ]}>
                  Request a new OTP
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Container>
  );
};

export default OTPScreen;

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
      backgroundColor: colors.background || '#FFFFFF',
      zIndex: 10,
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
    backIcon: { width: 23, height: 23 },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      height: 52,
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Poppins Medium',
      color: colors.shadow,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    pageContainer: {
      paddingHorizontal: 20,
      paddingVertical: 20,
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
