import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';

const IS_ELOAD_ENABLED = false;

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
      width: 273,
      height: 239,
    },
  });
