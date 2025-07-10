import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  return (
    <Container>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/Splash_Screen_Logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.buttonContainer}>
        <AppButton
          title="Continue with Facebook"
          leftIcon={require('@/Assets/Common/Socials/facebook.png')}
          onPress={() => console.log('Button Pressed')}
          mode="light"
          featureStyle={{ marginBottom: 10 }}
        />
        <AppButton
          title="Continue with Google"
          leftIcon={require('@/Assets/Common/Socials/google.png')}
          onPress={() => console.log('Button Pressed')}
          mode="light"
          featureStyle={{ marginTop: 0 }}
        />
        <AppButton
          title="Continue with Mobile Number"
          leftIcon={require('@/Assets/Common/LandingScreen/phone_icon.png')}
          onPress={() => console.log('Button Pressed')}
          featureStyle={{ marginTop: 0 }}
        />
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
      paddingBottom: 30,
    },
  });
