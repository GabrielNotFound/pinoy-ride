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
  ensureLocationPermission,
  requestLocationPermission,
} from '@/Utils/Permissions';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [showAlert, setShowAlert] = useState(false);
  const appState = useRef(AppState.currentState);

  // ✅ Check location permission when screen mounts
  useEffect(() => {
    (async () => {
      const status = await ensureLocationPermission();
      console.log('Permission status on mount:', status);

      if (status !== 'granted') {
        setShowAlert(true);
      }
    })();
  }, []);

  // ✅ Retry / request permission when user confirms
  const handleRetryPermission = async () => {
    const result = await requestLocationPermission();
    console.log('Permission retry result:', result);

    if (result === 'granted') {
      setShowAlert(false);
    } else if (result === 'blocked') {
      openSettings();
    } else {
      setShowAlert(true);
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
          const status = await ensureLocationPermission();
          console.log('Permission status on resume:', status);

          if (status === 'granted') {
            setShowAlert(false);
          } else {
            setShowAlert(true);
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <Container>
      {/* ✅ Alert for location permission */}
      {showAlert && (
        <AlertBox
          title="Location Required"
          message="We need your location to continue. Please enable it."
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
          onPress={() => navigation.navigate('RiderApplicationScreen')}
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
