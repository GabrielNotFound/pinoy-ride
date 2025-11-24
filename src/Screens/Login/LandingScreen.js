import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { openSettings } from 'react-native-permissions';

import Container from '@/Components/Container/Container';
import { AlertBox, AppButton } from '@/Components';
import {
  ensureCameraPermission,
  ensureLocationPermission,
  requestCameraPermission,
  requestLocationPermission,
} from '@/Utils/Permissions';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState('location');
  const appState = useRef(AppState.currentState);

  // ✅ Initial permission request (Location + Camera)
  useEffect(() => {
    (async () => {
      const loc = await ensureLocationPermission();
      const cam = await ensureCameraPermission();

      if (!loc) {
        setAlertType('location');
        setShowAlert(true);
      } else if (!cam) {
        setAlertType('camera');
        setShowAlert(true);
      }
    })();
  }, []);

  // ✅ Retry based on alert type
  const handleRetryPermission = async () => {
    if (alertType === 'location') {
      const result = await requestLocationPermission();

      if (result === 'granted') {
        // Now check camera next
        const cam = await ensureCameraPermission();
        if (!cam) {
          setAlertType('camera');
          setShowAlert(true);
        } else {
          setShowAlert(false);
        }
      } else if (result === 'blocked') {
        openSettings();
      } else {
        setShowAlert(true);
      }
    } else {
      const result = await requestCameraPermission();

      if (result === 'granted') {
        setShowAlert(false);
      } else if (result === 'blocked') {
        openSettings();
      } else {
        setShowAlert(true);
      }
    }
  };

  // ✅ Re-check when app returns from background
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const loc = await ensureLocationPermission();
          const cam = await ensureCameraPermission();

          if (!loc) {
            setAlertType('location');
            setShowAlert(true);
          } else if (!cam) {
            setAlertType('camera');
            setShowAlert(true);
          } else {
            setShowAlert(false);
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <Container>
      {/* ✅ Permission Alert for Location + Camera */}
      {showAlert && (
        <AlertBox
          title={
            alertType === 'location' ? 'Location Required' : 'Camera Required'
          }
          message={
            alertType === 'location'
              ? 'We need your location to provide rides. Please enable it.'
              : 'Camera access is required to verify your identity. Please enable it.'
          }
          visible={showAlert}
          setVisible={setShowAlert}
          onConfirm={handleRetryPermission}
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
      paddingBottom: 30,
    },
    applyButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    applyText: {
      fontFamily: 'Poppins SemiBold',
      fontWeight: '600',
      fontSize: 16,
    },
  });
