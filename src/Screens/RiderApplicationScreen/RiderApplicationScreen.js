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
  {
    key: 'licenseNumber',
    label: 'Driver’s License No.',
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
];

const RiderApplicationScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [formData, setFormData] = useState({
    licenseNumber: '',
    expirationDate: '',
    motorcycleBrand: '',
    motorcycleModel: '',
    color: '',
    plateNumber: '',
  });

  const handleBack = () => {
    navigation.navigate('LoginScreen');
  };

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    navigation.navigate('LandingScreen');
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

export default RiderApplicationScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
      backgroundColor: colors.onPrimary,
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
