import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppTextError from '../AppTextError/AppTextError';

// Format phone number with dashes: 927-339-4743
const formatPhoneDisplay = number => {
  const cleaned = number.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return '';
  }

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  } else {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(
      6,
      10,
    )}`;
  }
};

// Philippine mobile number validation - must start with 9
const validatePhilippineNumber = number => {
  const cleaned = number.replace(/\D/g, '');

  // Empty is okay (no error until they start typing)
  if (cleaned.length === 0) {
    return null;
  }

  // Must start with 9
  if (!cleaned.startsWith('9')) {
    return 'Invalid phone number. Input should start with 9.';
  }

  // Show error for incomplete numbers (less than 10 digits)
  if (cleaned.length < 10) {
    return `+63 ${formatPhoneDisplay(cleaned)} is incomplete.`;
  }

  // Valid when exactly 10 digits starting with 9
  if (cleaned.length === 10) {
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
  inputMode = 'text', // 'text' | 'phone' | 'amount' | 'comment' | 'numeric'
  error,
  labelColor,
  onValidationChange,
  editable = true, // Add editable prop with default value true
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const isPhone = inputMode === 'phone';
  const isAmount = inputMode === 'amount';
  const isComment = inputMode === 'comment';
  const isNumeric = inputMode === 'numeric';

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

  // Clean input - only allow numbers and one decimal point, round to 2 decimal places
  const cleanAmount = val => {
    // Remove everything except numbers and decimal point
    let cleaned = val.replace(/[^0-9.]/g, '');

    // Only allow one decimal point
    cleaned = cleaned.replace(/(\..*?)\.+/g, '$1');

    // Remove leading zeros (except "0." or just "0")
    cleaned = cleaned.replace(/^0+(?=\d)/, '');

    // Handle decimal places with rounding
    const parts = cleaned.split('.');
    if (parts.length > 1) {
      // If user tries to type more than 2 decimal places, round it
      if (parts[1].length > 2) {
        const fullNumber = parseFloat(cleaned);
        if (!isNaN(fullNumber)) {
          // Round to 2 decimal places
          const rounded = Math.round(fullNumber * 100) / 100;
          cleaned = rounded.toString();
        } else {
          // Fallback: just truncate
          parts[1] = parts[1].slice(0, 2);
          cleaned = parts.join('.');
        }
      }
    }

    return cleaned;
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

    // Prevent typing beyond 10 digits
    if (cleaned.length > 10) {
      return;
    }

    // Update display value (this will be auto-formatted)
    setDisplayPhone(cleaned);

    // Convert to storage format: 9XXXXXXXXX -> 639XXXXXXXXX
    let storageValue = '';
    if (cleaned.length > 0) {
      // Add 63 prefix
      storageValue = '63' + cleaned;
    }

    // Real-time validation
    const validationError = validatePhilippineNumber(cleaned);
    setPhoneError(validationError);

    // Notify parent of validation state
    const isValid =
      !validationError && cleaned.length === 10 && cleaned.startsWith('9');
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
        displayPhone.length === 10 &&
        displayPhone.startsWith('9');
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

  // Get keyboard type based on inputMode
  const getKeyboardType = () => {
    if (isAmount) {return 'decimal-pad';}
    if (isNumeric) {return 'numeric';}
    if (isPhone) {return 'phone-pad';}
    return 'default';
  };

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
            !editable && styles.disabledInput,
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
            placeholder={placeholder || '9XX-XXX-XXXX'}
            placeholderTextColor={colors.onSurfaceVariant}
            style={styles.phoneInput}
            keyboardType="phone-pad"
            editable={editable}
          />
        </View>
      ) : (
        <TextInput
          value={displayValue}
          onChangeText={isAmount ? handleAmountChange : onChangeText}
          onBlur={isAmount ? handleAmountBlur : onBlur}
          onFocus={isAmount ? handleAmountFocus : undefined}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceVariant}
          style={[
            isComment ? styles.commentBox : styles.input,
            error && styles.inputError,
            !editable && styles.disabledInput,
          ]}
          keyboardType={getKeyboardType()}
          multiline={isComment}
          numberOfLines={isComment ? 4 : 1}
          textAlignVertical={isComment ? 'top' : 'center'}
          editable={editable}
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
      color: colors.onSurface,
      marginBottom: 5,
    },
    input: {
      borderBottomWidth: 1,
      borderColor: colors.surfaceVariant,
      fontSize: 16,
      backgroundColor: colors.surface,
      color: colors.onSurface,
      paddingVertical: 8,
    },
    inputError: {
      borderColor: colors.error,
    },
    disabledInput: {
      backgroundColor: colors.surfaceDisabled || colors.grey5,
      opacity: 0.6,
      color: colors.grey3,
    },
    phoneContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: colors.surfaceVariant,
      backgroundColor: colors.surface,
      paddingVertical: 8,
    },
    flagEmoji: {
      fontSize: 24,
      marginRight: 8,
    },
    countryCode: {
      fontSize: 16,
      color: colors.onSurface,
      fontFamily: 'Poppins Regular',
      marginRight: 8,
    },
    phoneInput: {
      flex: 1,
      fontSize: 16,
      color: colors.onSurface,
      padding: 0,
      fontFamily: 'Poppins Regular',
    },
    commentBox: {
      backgroundColor: colors.elevation.level2,
      borderRadius: 15,
      padding: 15,
      fontSize: 16,
      color: colors.onSurface,
      borderColor: 'transparent',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
      minHeight: 50,
    },
  });
