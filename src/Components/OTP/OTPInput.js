import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * OTPInput component
 * - Calls `onOTPComplete` when the user has entered `length` digits
 * - Handles pasting multiple digits
 * - Prevents crashes for all 6-digit inputs including "000000"
 * - Responsive to screen size
 */
const OTPInput = ({ length = 6, onOTPChange, onOTPComplete }) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const styles = getStyles({ colors, screenWidth, length });
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

const getStyles = ({ colors, screenWidth, length }) => {
  // Calculate responsive dimensions
  const horizontalPadding = 20;
  const availableWidth = screenWidth - horizontalPadding * 2;

  // Calculate input size based on available width
  // Account for gaps between inputs
  const minGap = 2;
  const maxGap = 8;
  const totalGapWidth = (length - 1) * maxGap;

  let inputWidth = (availableWidth - totalGapWidth) / length;
  let gap = maxGap;

  // If inputs would be too small, reduce gap
  if (inputWidth < 35) {
    gap = minGap;
    inputWidth = (availableWidth - (length - 1) * gap) / length;
  }

  // Ensure minimum and maximum sizes
  inputWidth = Math.max(Math.min(inputWidth, 45), 32);
  const inputHeight = Math.max(Math.min(inputWidth * 1.25, 52), 40);

  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: horizontalPadding,
    },
    container: {
      flexDirection: 'row',
      gap: gap,
      justifyContent: 'center',
      width: '100%',
      maxWidth: 400, // Prevents it from getting too wide on tablets
    },
    input: {
      width: inputWidth,
      height: inputHeight,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: colors.grey,
      textAlign: 'center',
      fontSize: Math.min(inputWidth * 0.5, 20),
      fontFamily: 'Poppins Medium',
    },
  });
};
