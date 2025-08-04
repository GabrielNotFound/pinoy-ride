import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppTextInput, OTPInput } from '@/Components';

const GetStartedScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');

  const handleBack = () => {
    if (currentIndex === 0) {
      navigation.navigate('LoginScreen');
    } else {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex === 0 && !mobileNumber) {
      setError('Mobile number is required');
      return;
    }
    if (currentIndex === 1) {
      navigation.navigate('LandingScreen');
      return;
    }
    setError('');
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <Container style={styles.container}>
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

      <View style={styles.pageContainer}>
        {currentIndex === 0 ? (
          <AppTextInput
            label="Mobile"
            value={mobileNumber}
            onChangeText={setMobileNumber}
            inputMode="phone"
            placeholder="9XXXXXXXXX"
            error={error}
          />
        ) : (
          <>
            <Text style={styles.title}>Enter One-Time PIN</Text>
            <Text style={styles.subtitle}>
              A One-Time PIN was sent to +63 ******4567
            </Text>
            <OTPInput length={6} onOTPChange={setOtpCode} />
            <View style={styles.imageContainer}>
              <Image
                source={require('@/Assets/Common/GetStartedScreen/OTP_Image.png')}
                style={styles.otpImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.resendContainer}>
              <Text style={styles.resendLabel}>Didn't receive it?</Text>
              <TouchableOpacity onPress={() => console.log('Request new OTP')}>
                <Text style={styles.resendLink}>Request a new OTP</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      <View>
        <AppButton title="Next" onPress={handleNext} isBold />
      </View>
    </Container>
  );
};

export default GetStartedScreen;

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
      color: colors.primary,
    },
    pageContainer: {
      flex: 1,
      paddingHorizontal: 20,
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
    otpImage: {
      width: 288,
      height: 288,
    },
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
    nextButton: {
      backgroundColor: colors.primary,
      margin: 30,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
    },
    nextText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });
