import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';

const IS_ELOAD_ENABLED = false;

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  return (
    <Container>
      <Image
        source={require('@/Assets/Common/ulogo.png')}
        style={{ width: 176, height: 145, alignSelf: 'center' }}
        resizeMode="contain"
      />
      <Image
        source={require('@/Assets/Common/gear.png')}
        style={styles.settingIcon}
        resizeMode="contain"
      />
      <Text style={styles.titleText}>What would you like to do today?</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={{ ...styles.button, ...styles.shadow }}>
          <Image
            source={require('@/Assets/Landing/paybills.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceText}>Pay Bills</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!IS_ELOAD_ENABLED}
          activeOpacity={0.7}
          style={{
            ...styles.button,
            ...styles.shadow,
            backgroundColor: !IS_ELOAD_ENABLED && colors.lightGrey2,
          }}>
          <Image
            source={require('@/Assets/Landing/load-disabled.png')}
            style={styles.serviceIcon}
            resizeMode="contain"
          />
          <Text style={styles.serviceText}>Load Prepaid</Text>
        </TouchableOpacity>
      </View>
    </Container>
  );
};

export default LandingScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    shadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 8,
    },
    titleText: {
      textAlign: 'center',
      fontFamily: 'Avenir LT Std 95 Black',
      fontSize: 33,
      marginTop: 50,
    },
    buttonsContainer: {
      flexDirection: 'row',
      alignSelf: 'center',
      alignItems: 'center',
      gap: 70,
    },
    button: {
      width: 200,
      height: 200,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 50,
      gap: 7,
    },
    serviceText: {
      fontSize: 20,
      fontWeight: 700,
      fontFamily: 'Avenir LT Std 65 Medium',
    },
    serviceIcon: {
      width: 69,
      height: 69,
    },
    settingIcon: {
      width: 50,
      height: 50,
      position: 'absolute',
      top: 20,
      right: 20,
    },
  });
