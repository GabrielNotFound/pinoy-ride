import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import IntlPhoneInput from 'react-native-intl-phone-input';
import { useTheme } from 'react-native-paper';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  inputMode = 'text', // 'text' | 'phone' | 'amount' | 'comment'
  error,
  labelColor,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const isPhone = inputMode === 'phone';
  const isAmount = inputMode === 'amount';
  const isComment = inputMode === 'comment';

  const [isFocused, setIsFocused] = useState(false);

  // Format amount with 2 decimals and commas
  const formatAmount = val => {
    if (!val || val === '') {return '';}
    const number = parseFloat(val.replace(/,/g, ''));
    if (isNaN(number)) {return '';}

    const formatted = number.toFixed(2);
    const parts = formatted.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  // Clean input - only allow numbers and one decimal point
  const cleanAmount = val => {
    return val
      .replace(/[^0-9.]/g, '') // Only numbers and decimal
      .replace(/(\..*?)\.+/g, '$1') // Only one decimal point
      .replace(/^0+(?=\d)/, ''); // Remove leading zeros (except "0.")
  };

  const handleAmountChange = val => {
    const cleaned = cleanAmount(val);
    if (onChangeText) {
      onChangeText(cleaned);
    }
  };

  const handleAmountBlur = e => {
    setIsFocused(false);

    // Format the value when user leaves the field
    if (value) {
      const formatted = formatAmount(value);
      if (onChangeText) {
        onChangeText(formatted);
      }
    }

    if (onBlur) {
      onBlur(e);
    }
  };

  const handleAmountFocus = () => {
    setIsFocused(true);

    // Remove formatting when user focuses (remove commas)
    if (value) {
      const unformatted = value.replace(/,/g, '');
      if (onChangeText) {
        onChangeText(unformatted);
      }
    }
  };

  // Display value: show raw while typing, formatted when not focused
  const displayValue = isAmount
    ? isFocused
      ? value
      : value
      ? formatAmount(value)
      : ''
    : value;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, labelColor && { color: labelColor }]}>
          {label}
        </Text>
      )}

      {isPhone ? (
        <IntlPhoneInput
          defaultCountry="PH"
          value={value}
          onChangeText={({ phoneNumber, dialCode, unmaskedPhoneNumber }) => {
            const fullNumber = `${dialCode.replace(
              '+',
              '',
            )}${unmaskedPhoneNumber}`;
            if (onChangeText) {
              onChangeText(fullNumber);
            }
          }}
          placeholder={placeholder || '9XXXXXXXXX'}
          containerStyle={styles.phoneContainer}
          phoneInputStyle={styles.phoneTextInput}
        />
      ) : (
        <TextInput
          value={displayValue}
          onChangeText={isAmount ? handleAmountChange : onChangeText}
          onBlur={isAmount ? handleAmountBlur : onBlur}
          onFocus={isAmount ? handleAmountFocus : undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.darkGrey}
          style={[
            isComment ? styles.commentBox : styles.input,
            error && styles.inputError,
          ]}
          keyboardType={isAmount ? 'decimal-pad' : 'default'}
          multiline={isComment}
          numberOfLines={isComment ? 4 : 1}
          textAlignVertical={isComment ? 'top' : 'center'}
        />
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default AppTextInput;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    label: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: 'black',
      marginBottom: 5,
    },
    input: {
      borderBottomWidth: 1,
      borderColor: colors.surfaceVariant,
      fontSize: 16,
      backgroundColor: 'white',
      paddingVertical: 8,
    },
    inputError: {
      borderColor: 'red',
    },
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 4,
    },
    phoneContainer: {
      width: '100%',
      borderBottomWidth: 1,
      borderColor: colors.surfaceVariant,
      backgroundColor: 'transparent',
    },
    phoneTextInput: {
      fontSize: 16,
      color: 'black',
      paddingVertical: 4,
    },
    commentBox: {
      backgroundColor: '#F9F9F9',
      borderRadius: 15,
      padding: 15,
      fontSize: 16,
      color: '#333',
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      minHeight: 50,
    },
  });
