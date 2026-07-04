import React, { useCallback } from 'react';
import {
  BackHandler,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

const UpdateRequiredScreen = ({ route }) => {
  const { updateLink, currentVersion, minimumVersion } = route.params || {};
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  // Block the hardware back button — nowhere to go back to, the app is outdated.
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => sub.remove();
    }, []),
  );

  const handleUpdatePress = async () => {
    if (updateLink) {
      await Linking.openURL(updateLink);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Required</Text>
      <Text style={styles.message}>
        You're using version {currentVersion || '—'}, but the minimum supported
        version is now {minimumVersion || '—'}. Please update the app to
        continue.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleUpdatePress}>
        <Text style={styles.buttonText}>Update Now</Text>
      </TouchableOpacity>
    </View>
  );
};

export default UpdateRequiredScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      backgroundColor: '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Poppins SemiBold',
      color: colors.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: '#333',
      textAlign: 'center',
      marginBottom: 24,
    },
    button: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    buttonText: {
      fontSize: 14,
      fontFamily: 'Poppins Medium',
      color: '#fff',
    },
  });
