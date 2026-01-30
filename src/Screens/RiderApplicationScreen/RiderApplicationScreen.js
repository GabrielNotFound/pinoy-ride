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
import { AppButton, AppTextInput } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const stepInputs = [
  [
    { key: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
    {
      key: 'middleName',
      label: 'Middle Name',
      placeholder: 'Enter middle name',
    },
    { key: 'lastName', label: 'Last Name', placeholder: 'Enter last name' },
    {
      key: 'phoneNumber',
      label: 'Phone Number',
      placeholder: '9XXXXXXXXX',
      inputMode: 'phone',
    },
    {
      key: 'email',
      label: 'Email Address',
      placeholder: 'Enter email',
      inputMode: 'text',
    },
  ],
  [
    {
      key: 'licenseNumber',
      label: "Driver's License No.",
      placeholder: 'Enter license number',
    },
    {
      key: 'expirationDate',
      label: 'Expiration Date',
      placeholder: 'Ex: Jan 2000',
      inputMode: 'text',
    },
    {
      key: 'motorcycleBrand',
      label: 'Motorcycle Brand',
      placeholder: 'Enter brand',
    },
    {
      key: 'motorcycleModel',
      label: 'Motorcycle Model',
      placeholder: 'Enter model',
    },
    {
      key: 'color',
      label: 'Color',
      placeholder: 'Enter color',
    },
    {
      key: 'plateNumber',
      label: 'Plate Number',
      placeholder: 'Enter plate number',
    },
  ],
];

const RiderApplicationScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    licenseNumber: '',
    expirationDate: '',
    motorcycleBrand: '',
    motorcycleModel: '',
    color: '',
    plateNumber: '',
  });

  const handleBack = () => {
    if (step === 0) {
      navigation.navigate('LandingScreen');
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step < stepInputs.length - 1) {
      setStep(prev => prev + 1);
    } else {
      navigation.navigate('DownloadDocumentScreen', { formData });
    }
  };

  return (
    <Container style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Personal Information</Text>
        </View>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.formContainer}>
            {stepInputs[step].map(input => (
              <View key={input.key} style={styles.inputWrapper}>
                <AppTextInput
                  label={input.label}
                  value={formData[input.key]}
                  onChangeText={value => handleChange(input.key, value)}
                  placeholder={input.placeholder}
                  inputMode={input.inputMode || 'text'}
                />
              </View>
            ))}
          </View>

          <View style={styles.buttonWrapper}>
            <AppButton title="Next" onPress={handleNext} isBold />
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </Container>
  );
};

export default RiderApplicationScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      height: 52,
      justifyContent: 'center',
      marginTop: 10,
      marginBottom: 30,
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      left: 0,
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
      color: colors.primary,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
    },
    formContainer: {
      flex: 1,
    },
    inputWrapper: {
      marginBottom: 5,
    },
    buttonWrapper: {
      paddingTop: 20,
      paddingBottom: 20,
    },
  });
