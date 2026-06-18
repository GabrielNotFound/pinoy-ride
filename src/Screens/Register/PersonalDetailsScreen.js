import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppButton, AppTextInput } from '@/Components';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 1;

const PersonalDetailsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');

  const [errors, setErrors] = useState({});
  const [isEmailValid, setIsEmailValid] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!firstName.trim()) {newErrors.firstName = 'First name is required';}
    if (!lastName.trim()) {newErrors.lastName = 'Last name is required';}
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    }
    if (!dateOfBirth.trim())
      {newErrors.dateOfBirth = 'Date of birth is required';}
    if (!address.trim()) {newErrors.address = 'Address is required';}
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    navigation.navigate('UploadIDScreen', {
      personalDetails: {
        firstName,
        middleName,
        lastName,
        email,
        dateOfBirth,
        address,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Personal Details</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              index < CURRENT_STEP
                ? styles.stepDotActive
                : styles.stepDotInactive,
            ]}
          />
        ))}
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.pageContainer}>
            <Text style={styles.sectionLabel}>Step 1 of 5</Text>
            <Text style={styles.sectionTitle}>Tell us about yourself</Text>
            <Text style={styles.sectionSubtitle}>
              Please fill in your details exactly as they appear on your valid
              ID.
            </Text>

            <View style={styles.fieldGroup}>
              <AppTextInput
                label="First Name"
                value={firstName}
                onChangeText={text => {
                  setFirstName(text);
                  setErrors(prev => ({ ...prev, firstName: '' }));
                }}
                placeholder="e.g. Juan"
                error={errors.firstName}
              />

              <AppTextInput
                label="Middle Name"
                value={middleName}
                onChangeText={setMiddleName}
                placeholder="e.g. Santos (optional)"
              />

              <AppTextInput
                label="Last Name"
                value={lastName}
                onChangeText={text => {
                  setLastName(text);
                  setErrors(prev => ({ ...prev, lastName: '' }));
                }}
                placeholder="e.g. dela Cruz"
                error={errors.lastName}
              />

              <AppTextInput
                label="Email Address"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                onValidationChange={setIsEmailValid}
                inputMode="email"
                placeholder="e.g. juan@email.com"
                error={errors.email}
              />

              <AppTextInput
                label="Date of Birth"
                value={dateOfBirth}
                onChangeText={text => {
                  setDateOfBirth(text);
                  setErrors(prev => ({ ...prev, dateOfBirth: '' }));
                }}
                placeholder="MM/DD/YYYY"
                error={errors.dateOfBirth}
              />

              <AppTextInput
                label="Home Address"
                value={address}
                onChangeText={text => {
                  setAddress(text);
                  setErrors(prev => ({ ...prev, address: '' }));
                }}
                placeholder="e.g. 123 Rizal St, Manila"
                error={errors.address}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <AppButton title="Next" onPress={handleNext} isBold />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Container>
  );
};

export default PersonalDetailsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    header: {
      height: 52,
      justifyContent: 'center',
      marginBottom: 12,
    },
    backButton: {
      position: 'absolute',
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Poppins Medium',
      color: colors.text,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginBottom: 24,
    },
    stepDot: {
      height: 6,
      borderRadius: 3,
    },
    stepDotActive: {
      width: 24,
      backgroundColor: colors.primary,
    },
    stepDotInactive: {
      width: 8,
      backgroundColor: colors.surfaceVariant || '#E0E0E0',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    pageContainer: {
      paddingHorizontal: 20,
    },
    sectionLabel: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.primary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      marginBottom: 6,
    },
    sectionSubtitle: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      marginBottom: 24,
      lineHeight: 20,
    },
    fieldGroup: {
      gap: 4,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 16,
    },
  });
