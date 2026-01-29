import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <Container>
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
        />
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('GeneralTermsScreen')}>
              Register
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.versionTextContainer}>
        <Text style={styles.versionText}>v{appVersion}</Text>
      </View>
      <View />
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
    registerContainer: {
      alignItems: 'center',
    },
    registerText: {
      fontSize: 14,
      color: colors.onSurfaceGrey,
      fontFamily: 'Poppins Regular',
    },
    registerLink: {
      color: colors.primary,
      fontFamily: 'Poppins SemiBold',
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
