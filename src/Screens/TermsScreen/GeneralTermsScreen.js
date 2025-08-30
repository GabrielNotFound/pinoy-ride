import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import Container from '@/Components/Container/Container';
import { AppButton } from '@/Components';
import { Ionicons } from '@expo/vector-icons'; // make sure this is installed

const GeneralTermsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [checked, setChecked] = useState(false);
  const navigation = useNavigation();

  const handleNext = () => {
    navigation.replace('RegisterScreen');
  };

  const handleBack = () => {
    navigation.replace('LandingScreen');
  };

  return (
    <Container style={styles.container}>
      {/* Back button */}
      <View style={styles.backWrapper}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require('@/Assets/Common/GeneralTerms/Accept_Terms.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Text & Checkbox */}
      <View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Accept Our Terms</Text>
          <Text style={styles.subtitle}>
            To start booking, please review and accept our Terms and Conditions.
            Your safety and privacy matters to us.
          </Text>
        </View>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[
              styles.customCheckbox,
              checked && styles.checkedCheckbox,
              { borderColor: colors.primary },
            ]}
            onPress={() => setChecked(!checked)}>
            {checked && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              /* later open modal */
            }}>
            <Text style={styles.label}>
              I Accept the{' '}
              <Text style={{ textDecorationLine: 'underline' }}>
                Terms and Conditions
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        <AppButton
          title="Submit"
          onPress={handleNext}
          isBold
          disabled={!checked}
        />
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
    backButton: {
      marginTop: 10,
    },
    backIcon: {
      width: 23,
      height: 23,
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
      marginBottom: 50,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 25,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 16,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    customCheckbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderRadius: 4,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
      backgroundColor: 'transparent',
    },
    checkedCheckbox: {
      backgroundColor: colors.primary,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: colors.primary,
      lineHeight: 20,
      maxWidth: 250,
    },
  });
