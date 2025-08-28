import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const OTPInput = ({ length = 6, onOTPChange }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const inputs = useRef([]);
  const [digits, setDigits] = useState(Array.from({ length }, () => ''));

  const update = nextDigits => {
    setDigits(nextDigits);
    onOTPChange?.(nextDigits.join(''));
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
      const nextIndex = Math.min(index + clean.length, length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    // Single char or empty
    if (clean === '') {
      const next = [...digits];
      next[index] = '';
      update(next);
      return;
    }

    const next = [...digits];
    next[index] = clean[0];
    update(next);

    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (digits[index] === '' && index > 0) {
        inputs.current[index - 1]?.focus();
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
      textAlign: 'center',
      fontSize: 20,
      fontFamily: 'Poppins Medium',
    },
  });
