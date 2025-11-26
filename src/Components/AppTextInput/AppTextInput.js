import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppTextError from '../AppTextError/AppTextError';

// Format phone number with dashes: 0927-339-4743
const formatPhoneDisplay = number => {
  const cleaned = number.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return '';
  }

  if (cleaned.length <= 4) {
    return cleaned;
  } else if (cleaned.length <= 7) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  } else {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(
      7,
      11,
    )}`;
  }
};

// Philippine mobile number validation - must start with 09
const validatePhilippineNumber = number => {
  const cleaned = number.replace(/\D/g, '');

  // Empty is okay (no error until they start typing)
  if (cleaned.length === 0) {
    return null;
  }

  // Must start with 09
  if (!cleaned.startsWith('09')) {
    if (cleaned.length === 1 && cleaned === '0') {
      return null; // Allow typing "0" first
    }
    return 'Invalid phone number. Input should start with 09.';
  }

  // Show error for incomplete numbers (less than 11 digits)
  if (cleaned.length < 11) {
    return `${formatPhoneDisplay(cleaned)} is incomplete.`;
  }

  // Valid when exactly 11 digits starting with 09
  if (cleaned.length === 11) {
    return null;
  }

  return null;
};

const AppTextInput = ({
  label,
  value,
  onChangeText,
  onBlur,
  placeholder,
  inputMode = 'text', // 'text' | 'phone' | 'amount' | 'comment'
  error,
  labelColor,
  onValidationChange,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const isPhone = inputMode === 'phone';
  const isAmount = inputMode === 'amount';
  const isComment = inputMode === 'comment';

  const [isFocused, setIsFocused] = useState(false);
  const [phoneError, setPhoneError] = useState(null);
  const [displayPhone, setDisplayPhone] = useState('');

  // Format amount with 2 decimals and commas
  const formatAmount = val => {
    if (!val || val === '') {
      return '';
    }
    const number = parseFloat(val.replace(/,/g, ''));
    if (isNaN(number)) {
      return '';
    }

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

  const handlePhoneChange = text => {
    // Clean input - only allow digits
    const cleaned = text.replace(/\D/g, '');

    // Prevent typing beyond 11 digits
    if (cleaned.length > 11) {
      return;
    }

    // Update display value (this will be auto-formatted)
    setDisplayPhone(cleaned);

    // Convert to storage format: 0XXXXXXXXXX -> 63XXXXXXXXXX
    let storageValue = '';
    if (cleaned.length > 0) {
      if (cleaned.startsWith('0')) {
        // Replace leading 0 with 63
        storageValue = '63' + cleaned.slice(1);
      } else {
        storageValue = cleaned;
      }
    }

    // Real-time validation
    const validationError = validatePhilippineNumber(cleaned);
    setPhoneError(validationError);

    // Notify parent of validation state
    const isValid =
      !validationError && cleaned.length === 11 && cleaned.startsWith('09');
    if (onValidationChange) {
      onValidationChange(isValid);
    }

    // Pass storage format to parent (639XXXXXXXXX)
    if (onChangeText) {
      onChangeText(storageValue);
    }
  };

  const handlePhoneBlur = () => {
    if (displayPhone) {
      const validationError = validatePhilippineNumber(displayPhone);
      setPhoneError(validationError);

      const isValid =
        !validationError &&
        displayPhone.length === 11 &&
        displayPhone.startsWith('09');
      if (onValidationChange) {
        onValidationChange(isValid);
      }
    }

    if (onBlur) {
      onBlur();
    }
  };

  const handlePhoneFocus = () => {
    setPhoneError(null);
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
        <View
          style={[
            styles.phoneContainer,
            (error || phoneError) && styles.inputError,
          ]}>
          {/* PH Flag Emoji */}
          <Text style={styles.flagEmoji}>🇵🇭</Text>

          {/* Country Code */}
          <Text style={styles.countryCode}>+63</Text>

          {/* Phone Input - Auto-formatted display */}
          <TextInput
            value={formatPhoneDisplay(displayPhone)}
            onChangeText={handlePhoneChange}
            onBlur={handlePhoneBlur}
            onFocus={handlePhoneFocus}
            placeholder={placeholder || '09XX-XXX-XXXX'}
            placeholderTextColor={colors.darkGrey}
            style={styles.phoneInput}
            keyboardType="phone-pad"
          />
        </View>
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

      {(error || phoneError) && (
        <AppTextError>{error || phoneError}</AppTextError>
      )}
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
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.surfaceVariant,
      backgroundColor: 'white',
      paddingVertical: 8,
    },
    flagEmoji: {
      fontSize: 24,
      marginRight: 8,
    },
    countryCode: {
      fontSize: 16,
      color: 'black',
      fontFamily: 'Poppins Regular',
      marginRight: 8,
    },
    phoneInput: {
      flex: 1,
      fontSize: 16,
      color: 'black',
      padding: 0,
      fontFamily: 'Poppins Regular',
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
