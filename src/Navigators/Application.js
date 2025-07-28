import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BookingDetailsScreen,
  BookingHistoryScreen,
  GeneralTermsScreen,
  GetStartedScreen,
  InputLocation,
  LandingScreen,
  LoginScreen,
  MapSelectionModal,
  PaymentOptionScreen,
  PromoReferralsScreen,
  RatingScreen,
  RegisterScreen,
  SettingsScreen,
  SplashScreen,
  WalletScreen,
} from '@/Screens';
import { Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import LightTheme from '../Theme/LightTheme';

const Stack = createNativeStackNavigator();

const ApplicationNavigator = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={LightTheme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: true,
              headerTitle: props => (
                <Text variant="titleLarge">{props.children}</Text>
              ),

              headerBackTitleVisible: false,
            }}>
            <Stack.Screen
              name="Splash"
              component={SplashScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GetStartedScreen"
              component={GetStartedScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GeneralTermsScreen"
              component={GeneralTermsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LandingScreen"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InputLocation"
              component={InputLocation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RatingScreen"
              component={RatingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SettingsScreen"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookingHistoryScreen"
              component={BookingHistoryScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="BookingDetailsScreen"
              component={BookingDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PromoReferralsScreen"
              component={PromoReferralsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PaymentOptionScreen"
              component={PaymentOptionScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="WalletScreen"
              component={WalletScreen}
              options={{ headerShown: false }}
            />

            <Stack.Group
              screenOptions={{ presentation: 'modal', headerShown: false }}>
              <Stack.Screen
                name="MapSelectionModal"
                component={MapSelectionModal}
              />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default ApplicationNavigator;
