import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
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
        <View style={styles.separatorContainer}>
          <Image
            source={require('@/Assets/Common/LoginScreen/Line.png')}
            style={styles.line}
            resizeMode="contain"
          />
          <Text style={styles.orText}>or</Text>
          <Image
            source={require('@/Assets/Common/LoginScreen/Line.png')}
            style={styles.line}
            resizeMode="contain"
          />
        </View>
        <AppButton
          title="Continue with Mobile Number"
          leftIcon={require('@/Assets/Common/LoginScreen/phone_icon.png')}
          onPress={() => navigation.navigate('GetStartedScreen')}
          featureStyle={{ marginTop: 0 }}
        />
      </View>
      <View />
    </Container>
  );
};

export default LoginScreen;

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
    separatorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 15,
    },
    line: {
      width: 150,
      height: 2,
      marginHorizontal: 8,
    },
    orText: {
      fontSize: 16,
      color: colors.onSurfaceGrey,
      fontFamily: 'Poppins Regular',
    },
  });
