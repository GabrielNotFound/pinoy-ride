import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { AccessToken, LoginManager } from 'react-native-fbsdk-next';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Configure Google Sign-In once
  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '822593340499-5d4deh6t8m7l9gnhmu7mkfh7rbbt8lp3.apps.googleusercontent.com',
      iosClientId:
        '822593340499-gfkpsn81s1kop39lr8i10p28mdo3hsv4.apps.googleusercontent.com',
    });
  }, []);

  const signInWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Sign in cancelled');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Sign in in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Play services not available or outdated');
      } else {
        Alert.alert('Google Sign-In Error', error.message);
      }
      return null;
    }
  };

  const signInWithFacebook = async () => {
    try {
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);
      if (result.isCancelled) {
        Alert.alert('Facebook Login cancelled');
        return null;
      }
      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        Alert.alert('Failed to get Facebook access token');
        return null;
      }
      // You can fetch user info with this token or store token as needed
      setUser({ facebookAccessToken: data.accessToken.toString() });
      return data.accessToken.toString();
    } catch (error) {
      Alert.alert('Facebook Login Error', error.message);
      return null;
    }
  };

  const signOut = async () => {
    // Sign out from both providers if needed
    try {
      await GoogleSignin.signOut();
    } catch {}
    try {
      LoginManager.logOut();
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
