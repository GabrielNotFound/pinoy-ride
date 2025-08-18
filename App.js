import React from 'react';
import { StyleSheet, View } from 'react-native';
import * as Font from 'expo-font';
import ApplicationNavigator from '@/Navigators/Application';
import { AuthProvider } from '@/Services/AuthProvider';

const App = () => {
  Font.loadAsync({
    'Avenir LT Std 55 Roman': require('./src/Assets/Fonts/AvenirLTStd-Roman.ttf'),
    'Avenir LT Std 65 Medium': require('./src/Assets/Fonts/AvenirLTStd-Medium.ttf'),
    'Avenir LT Std 95 Black': require('./src/Assets/Fonts/AvenirLTStd-Black.ttf'),
    'Poppins Regular': require('./src/Assets/Fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins Medium': require('./src/Assets/Fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins SemiBold': require('./src/Assets/Fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins Light': require('./src/Assets/Fonts/Poppins/Poppins-Light.ttf'),
  });

  return (
    <AuthProvider>
      <View style={styles.container}>
        <ApplicationNavigator />
      </View>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
