import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Checkbox, useTheme } from 'react-native-paper';
import Container from '@/Components/Container/Container';
import { AppButton } from '@/Components';

const GeneralTermsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [checked, setChecked] = useState(false);
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.replace('LoginScreen');
  };

  return (
    <Container style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/GeneralTerms/Accept_Terms.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Accept Our Terms</Text>
        <Text style={styles.subtitle}>
          To start booking, please review and accept our Terms and Conditions.
          Your safety and privacy matters to us.
        </Text>
      </View>
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={checked ? 'checked' : 'unchecked'}
          onPress={() => setChecked(!checked)}
          color={colors.primary}
          uncheckedColor={colors.primary}
        />
        <Text style={styles.label}>I Accept the Terms and Conditions</Text>
      </View>
      <View>
        <AppButton title="Next" onPress={handleNext} isBold />
      </View>
    </Container>
  );
};

export default GeneralTermsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
    },
    logoContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      width: 450,
      height: 450,
    },
    textContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 40,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 25,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 16,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: colors.primary,
      lineHeight: 20,
    },
    continueButtonContainer: {
      paddingHorizontal: 30,
      marginBottom: 40,
    },
  });
