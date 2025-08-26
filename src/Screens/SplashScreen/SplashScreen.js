import { Image, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice'; // adjust path to your selector

const SplashScreen = () => {
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo); // persisted value from redux-persist

  useEffect(() => {
    const init = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userInfo) {
        navigation.replace('HomeScreen'); // user already logged in
      } else {
        navigation.replace('OnboardingScreen'); // first time or logged out
      }
    };

    init();
  }, [userInfo, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/Pinoy_Ride.png')}
          style={styles.logo}
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
    width: 243,
    height: 175,
  },
});
