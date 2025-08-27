import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import ApplicationNavigator from '@/Navigators/Application';
import { AuthProvider } from '@/Services/AuthProvider';
import { persistor, store } from '@/Redux/store';

const App = () => {
  const [fontsLoaded] = useFonts({
    'AvenirLTStd-Roman': require('./src/Assets/Fonts/AvenirLTStd-Roman.ttf'),
    'AvenirLTStd-Medium': require('./src/Assets/Fonts/AvenirLTStd-Medium.ttf'),
    'AvenirLTStd-Black': require('./src/Assets/Fonts/AvenirLTStd-Black.ttf'),
    'Poppins Regular': require('./src/Assets/Fonts/Poppins/Poppins-Regular.ttf'),
    'Poppins Medium': require('./src/Assets/Fonts/Poppins/Poppins-Medium.ttf'),
    'Poppins SemiBold': require('./src/Assets/Fonts/Poppins/Poppins-SemiBold.ttf'),
    'Poppins Light': require('./src/Assets/Fonts/Poppins/Poppins-Light.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: 'white' }} />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthProvider>
          <View style={styles.container}>
            <ApplicationNavigator />
          </View>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
