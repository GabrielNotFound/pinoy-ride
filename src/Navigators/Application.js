import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BankInformationScreen,
  BookingDetailsScreen,
  BookingHistoryScreen,
  CashOutScreen,
  DownloadDocumentScreen,
  EKYCScreen,
  GeneralTermsScreen,
  HomeScreen,
  LandingScreen,
  LoginScreen,
  OTPScreen,
  PaymentOptionScreen,
  PromoReferralsScreen,
  QRPH,
  RatingScreen,
  RegisterScreen,
  RiderApplicationScreen,
  SettingsScreen,
  SplashScreen,
  SuccessfulBooking,
  TAC,
  TopUpScreen,
  TransferConfirmationScreen,
  TransferScreen,
  WalletScreen,
} from '@/Screens';
import { Text } from 'react-native';
import { AppTransactionComplete } from '@/Components';
import { useAppTheme } from '@/Contexts/ThemeContext';

const Stack = createNativeStackNavigator();

const ApplicationNavigator = () => {
  const { theme } = useAppTheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={theme}>
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
            name="RiderApplicationScreen"
            component={RiderApplicationScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="DownloadDocumentScreen"
            component={DownloadDocumentScreen}
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
            name="SuccessfulBooking"
            component={SuccessfulBooking}
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
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="WalletScreen" component={WalletScreen} />
            <Stack.Screen name="TopUpScreen" component={TopUpScreen} />
            <Stack.Screen name="CashOutScreen" component={CashOutScreen} />
            <Stack.Screen name="TransferScreen" component={TransferScreen} />
            <Stack.Screen
              name="BankInformationScreen"
              component={BankInformationScreen}
            />
            <Stack.Screen
              name="QRPH"
              component={QRPH}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="TransferConfirmationScreen"
              component={TransferConfirmationScreen}
            />
          </Stack.Group>

          <Stack.Screen
            name="AppTransactionComplete"
            component={AppTransactionComplete}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default ApplicationNavigator;
