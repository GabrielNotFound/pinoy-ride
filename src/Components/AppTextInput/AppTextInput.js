// src/Components/CustomTextInput.js
import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import useAmountFormattedValue from '@/Hooks/useAmountFormattedValue';
import numeral from 'numeral';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  onChangeFormattedText,
  placeholder,
  inputMode = 'text', // 'text' | 'phone' | 'amount'
  error,
}) => {
  const isPhone = inputMode === 'phone';
  const isAmount = inputMode === 'amount';

  const {
    formattedValue: amountFormattedValue,
    onChangeValue: handleAmountChange,
  } = useAmountFormattedValue({
    value,
    onChange: onChangeText,
    getFormattedValue: val => (val ? numeral(val).format('0,0[.]00') : ''),
    getUnformattedValue: val => val.replace(/,/g, ''),
    isFormattedPartially: val => /[^0-9.,]/.test(val),
  });

  const phoneInputRef = useRef();

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      {isPhone ? (
        <PhoneInput
          ref={phoneInputRef}
          defaultValue={value}
          defaultCode="PH"
          layout="first"
          onChangeText={onChangeText}
          onChangeFormattedText={onChangeFormattedText}
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.phoneTextContainer}
          textInputProps={{
            placeholder,
            keyboardType: 'phone-pad',
          }}
        />
      ) : (
        <TextInput
          value={isAmount ? amountFormattedValue : value}
          onChangeText={isAmount ? handleAmountChange : onChangeText}
          placeholder={placeholder}
          style={[styles.input, error && styles.inputError]}
          keyboardType={isAmount ? 'numeric' : 'default'}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppTextInput;

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: {
    fontFamily: 'Poppins Regular',
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', fontSize: 12, marginTop: 4 },
  phoneContainer: {
    width: '100%',
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    overflow: 'hidden',
  },
  phoneTextContainer: {
    paddingVertical: 10,
    backgroundColor: 'white',
  },
});
