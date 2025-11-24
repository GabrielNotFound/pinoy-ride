import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AlertBox, AppButton, AppTextInput } from '@/Components';
import {
  ensureLocationPermission,
  requestLocationPermission,
} from '@/Utils/Permissions';

const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const [showAlert, setShowAlert] = useState(false);

  const [mobileNumber, setMobileNumber] = useState(''); // Stores as 63XXXXXXXXXX
  const [errorMessage, setErrorMessage] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  useEffect(() => {
    (async () => {
      const granted = await ensureLocationPermission();
      if (!granted) {
        setShowAlert(true);
      }
    })();
  }, []);

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
    // Pass the number in 63XXXXXXXXXX format
    navigation.navigate('OTPScreen', { mobileNumber });
  };

  return (
    <Container style={styles.container}>
      {showAlert && (
        <AlertBox
          title="Location Required"
          message="This app cannot continue without location access."
          onConfirm={handleRetryPermission}
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

      <View style={styles.pageContainer}>
        <AppTextInput
          label="Mobile"
          value={mobileNumber}
          onChangeText={setMobileNumber}
          onValidationChange={setIsPhoneValid}
          inputMode="phone"
          placeholder="09XX-XXX-XXXX"
          error={errorMessage}
        />
      </View>

      <View>
        <Text style={styles.footerText}>
          Enter your active number to receive a verification code. This helps us
          keep your account secure.
        </Text>
        <AppButton title="Next" onPress={handleNext} isBold />
      </View>
    </Container>
  );
};

export default LoginScreen;

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
  });
