import { Image, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

const SplashScreen = () => {
  const navigation = useNavigation();
  const init = async () => {
    await new Promise(resolve =>
      setTimeout(() => {
        resolve(true);
      }, 1000),
    );
    navigation.navigate('LandingScreen');
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/ulogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.footerContainer}>
        <Image
          source={require('@/Assets/Common/umsi-logo.png')}
          style={styles.umsiLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 273,
    height: 239,
  },
  footerContainer: {
    justifyContent: 'flex-end',
    marginBottom: 29,
  },
  umsiLogo: {
    width: 172.38,
    height: 51,
  },
});
