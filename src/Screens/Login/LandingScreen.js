import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
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
    applyButton: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    applyText: {
      fontFamily: 'Poppins SemiBold',
      fontWeight: 600,
      fontSize: 16,
    },
  });
