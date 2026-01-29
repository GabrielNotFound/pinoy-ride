import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * OTPInput component
 * - Calls `onOTPComplete` when the user has entered `length` digits
 * - Handles pasting multiple digits
 * - Prevents crashes for all 6-digit inputs including "000000"
 */
const OTPInput = ({ length = 6, onOTPChange, onOTPComplete }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const inputs = useRef([]);
  const [digits, setDigits] = useState(Array.from({ length }, () => ''));

  const update = nextDigits => {
    setDigits(nextDigits);
    const code = nextDigits.join('');
    onOTPChange?.(code);

    // If all inputs are filled, call onOTPComplete
    if (code.length === length && !nextDigits.includes('')) {
      try {
        onOTPComplete?.(code);
      } catch (err) {
        console.error('Error in onOTPComplete:', err);
      }
    }
  };

  const handleChange = (text, index) => {
    const clean = text.replace(/\D/g, '');

    // Handle paste of multiple digits
    if (clean.length > 1) {
      const next = [...digits];
      for (let i = 0; i < clean.length && index + i < length; i++) {
        next[index + i] = clean[i];
      }
      update(next);

      // Focus next valid input safely
      const nextIndex = Math.min(index + clean.length, length - 1);
      if (inputs.current[nextIndex]) {
        setTimeout(() => inputs.current[nextIndex].focus(), 50);
      }
      return;
    }

    // Single char or empty
    const next = [...digits];
    next[index] = clean ? clean[0] : '';
    update(next);

    if (clean && index < length - 1 && inputs.current[index + 1]) {
      setTimeout(() => inputs.current[index + 1].focus(), 50);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index] === '' && index > 0 && inputs.current[index - 1]) {
        setTimeout(() => inputs.current[index - 1].focus(), 50);
        const next = [...digits];
        next[index - 1] = '';
        update(next);
      }
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {digits.map((value, i) => (
          <TextInput
            key={i}
            ref={ref => (inputs.current[i] = ref)}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            value={value}
            onChangeText={t => handleChange(t, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            returnKeyType="next"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
          />
        ))}
      </View>
    </View>
  );
};

export default OTPInput;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
    },
    container: {
      flexDirection: 'row',
      gap: 12, // RN >= 0.71; if older, replace with marginRight on inputs
    },
    input: {
      width: 42,
      height: 52,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: colors.grey,
      color: colors.text,
      textAlign: 'center',
      fontSize: 20,
      fontFamily: 'Poppins Medium',
    },
  });
