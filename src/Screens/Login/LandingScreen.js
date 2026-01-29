import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { openSettings } from 'react-native-permissions';

import Container from '@/Components/Container/Container';
import { AlertBox, AppButton } from '@/Components';
import {
  ensureCameraPermission,
  requestCameraPermission,
} from '@/Utils/Permissions';
import Constants from 'expo-constants';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [showCameraAlert, setShowCameraAlert] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    (async () => {
      const cam = await ensureCameraPermission();
      if (!cam) {
        setShowCameraAlert(true);
      }
    })();
  }, []);

  const handleRetryCameraPermission = async () => {
    const result = await requestCameraPermission();

    if (result === 'granted') {
      setShowCameraAlert(false);
    } else if (result === 'blocked') {
      openSettings();
    } else {
      setShowCameraAlert(true);
    }
  };

  return (
    <Container>
      {/* ✅ Camera Permission Alert Only */}
      {showCameraAlert && (
        <AlertBox
          title="Camera Required"
          message="Camera access is required to verify your identity. Please enable it."
          visible={showCameraAlert}
          setVisible={setShowCameraAlert}
          onConfirm={handleRetryCameraPermission}
        />
      )}

      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/Pinoy_Ride.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <AppButton
          title="Continue with Mobile Number"
          leftIcon={require('@/Assets/Common/LandingScreen/phone_icon.png')}
          onPress={() => navigation.navigate('LoginScreen')}
          featureStyle={{ marginTop: 0 }}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('RegisterScreen')}
          style={styles.applyButton}>
          <Text style={styles.applyText}>Apply As Rider</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.versionTextContainer}>
        <Text style={styles.versionText}>v{appVersion}</Text>
      </View>
    </Container>
  );
};

export default LandingScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 243,
      height: 175,
    },
    buttonContainer: {
      paddingBottom: 10,
    },
    applyButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    applyText: {
      color: colors.secondaryDark,
      fontFamily: 'Poppins SemiBold',
      fontWeight: '600',
      fontSize: 16,
    },
    versionTextContainer: {
      alignItems: 'center',
      paddingBottom: 20,
    },
    versionText: {
      alignItems: 'center',
      marginTop: 8,
      fontSize: 12,
      color: colors.onSurfaceGrey,
      opacity: 0.7,
      fontFamily: 'Poppins Regular',
    },
  });
