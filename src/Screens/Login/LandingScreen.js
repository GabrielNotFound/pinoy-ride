import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import Constants from 'expo-constants';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [showCameraAlert, setShowCameraAlert] = useState(false);
  const [showLocationAlert, setShowLocationAlert] = useState(false);

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    // Check camera permission
    const cam = await ensureCameraPermission();
    if (cam !== 'granted') {
      setShowCameraAlert(true);
    }

    // Check location permission
    const loc = await ensureLocationPermission();
    if (loc !== 'granted') {
      setShowLocationAlert(true);
    }
  };

  const handleRetryCameraPermission = async () => {
    const result = await requestCameraPermission();

    if (result === 'granted') {
      setShowCameraAlert(false);
    } else if (result === 'blocked') {
      Alert.alert(
        'Camera Access Blocked',
        'Please enable camera access in Settings to verify your identity.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowCameraAlert(false),
          },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    } else {
      // User denied, keep alert showing
      setShowCameraAlert(true);
    }
  };

  const handleRetryLocationPermission = async () => {
    const result = await requestLocationPermission();

    if (result === 'granted') {
      setShowLocationAlert(false);
    } else if (result === 'blocked') {
      Alert.alert(
        'Location Access Blocked',
        'Please enable location access in Settings to use the app.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setShowLocationAlert(false),
          },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    } else {
      // User denied, keep alert showing
      setShowLocationAlert(true);
    }
  };

  return (
    <Container>
      {/* ✅ Camera Permission Alert */}
      {showCameraAlert && (
        <AlertBox
          title="Camera Required"
          message="Camera access is required to verify your identity. Please enable it."
          visible={showCameraAlert}
          setVisible={setShowCameraAlert}
          confirmText="Enable Camera"
          cancelText="Later"
          onConfirm={handleRetryCameraPermission}
          onCancel={() => setShowCameraAlert(false)}
          dismissable={true}
        />
      )}

      {/* ✅ Location Permission Alert */}
      {showLocationAlert && !showCameraAlert && (
        <AlertBox
          title="Location Required"
          message="Location access is required to accept bookings and track rides. Please enable it."
          visible={showLocationAlert}
          setVisible={setShowLocationAlert}
          confirmText="Enable Location"
          cancelText="Later"
          onConfirm={handleRetryLocationPermission}
          onCancel={() => setShowLocationAlert(false)}
          dismissable={true}
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
          onPress={() => navigation.navigate('PersonalDetailsScreen')}
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
