import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BookingDetailsScreen,
  BookingHistoryScreen,
  CashInScreen,
  ConfirmDetailsScreen,
  CongratsScreen,
  EKYCScreen,
  GeneralTermsScreen,
  HomeScreen,
  InputLocation,
  LandingScreen,
  LoginScreen,
  MapSelectionScreen,
  OTPScreen,
  OnboardingScreen,
  PaymentOptionScreen,
  PersonalDetailsScreen,
  ProfileScreen,
  PromoReferralsScreen,
  QRPHScreen,
  RatingScreen,
  RegisterScreen,
  SaveLocationScreen,
  SelfieScreen,
  SettingsScreen,
  SplashScreen,
  TAC,
  UpdateRequiredScreen,
  UploadIDScreen,
  WalletScreen,
} from '@/Screens';
import { Text } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import LightTheme from '../Theme/LightTheme';
import { AppTransactionComplete } from '@/Components';
import { navigationRef } from '@/Utils/NavigationService';

const Stack = createNativeStackNavigator();

const ApplicationNavigator = () => {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={LightTheme}>
        <NavigationContainer ref={navigationRef}>
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
              name="OnboardingScreen"
              component={OnboardingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LandingScreen"
              component={LandingScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="RegisterScreen"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="PersonalDetailsScreen"
              component={PersonalDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UploadIDScreen"
              component={UploadIDScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SelfieScreen"
              component={SelfieScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ConfirmDetailsScreen"
              component={ConfirmDetailsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="UpdateRequiredScreen"
              component={UpdateRequiredScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CongratsScreen"
              component={CongratsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="LoginScreen"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="OTPScreen"
              component={OTPScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="EKYCScreen"
              component={EKYCScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="GeneralTermsScreen"
              component={GeneralTermsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TAC"
              component={TAC}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="HomeScreen"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="InputLocation"
              component={InputLocation}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MapSelectionScreen"
              component={MapSelectionScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SaveLocationScreen"
              component={SaveLocationScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
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
            <Stack.Screen
              name="CashInScreen"
              component={CashInScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="QRPHScreen"
              component={QRPHScreen}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="AppTransactionComplete"
              component={AppTransactionComplete}
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="ProfileScreen"
              component={ProfileScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
};

export default ApplicationNavigator;
