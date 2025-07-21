import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  GeneralTermsScreen,
  GetStartedScreen,
  InputLocation,
  LandingScreen,
  LoginScreen,
  MapSelectionModal,
  OnboardingScreen,
  RatingScreen,
  RegisterScreen,
  SplashScreen,
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
              name="OnboardingScreen"
              component={OnboardingScreen}
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
