import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { AppButton, AppTextInput } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const textInputs = [
  { key: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
  { key: 'middleName', label: 'Middle Name', placeholder: 'Enter middle name' },
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
];

const RegisterScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
  });

  const handleBack = () => {
    navigation.navigate('GeneralTermsScreen');
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    navigation.navigate('HomeScreen');
  };

  return (
    <Container style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1 }}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Image
              source={require('@/Assets/Common/Back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            {textInputs.map(input => (
              <View key={input.key} style={{ marginBottom: 5 }}>
                <AppTextInput
                  label={input.label}
                  value={formData[input.key]}
                  onChangeText={value => handleChange(input.key, value)}
                  placeholder={input.placeholder}
                  inputMode={input.inputMode || 'text'}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <AppButton title="Submit" onPress={handleNext} isBold />
      </KeyboardAvoidingView>
    </Container>
  );
};

export default RegisterScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
      backgroundColor: '#fff',
    },
    backButton: {
      marginTop: 10,
      marginBottom: 30,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    scrollContent: {
      paddingBottom: 20,
    },
  });
