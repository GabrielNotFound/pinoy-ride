import React, { useCallback, useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

/**
 * OTPInput component
 * - Calls `onOTPComplete` when the user has entered `length` digits
 * - Handles pasting multiple digits
 * - Prevents crashes for all 6-digit inputs including "000000"
 * - Responsive to screen size
 *
 * NOTE: Sizing is now based on the ACTUAL measured width of the row
 * (via onLayout) instead of Dimensions.get('window').width combined with
 * a manually-passed `parentPaddingHorizontal`. That old approach required
 * every parent to correctly report its own horizontal padding, and broke
 * silently when a screen had multiple nested padded containers (like
 * OTPScreen's `container` + `pageContainer`), causing the boxes to
 * overflow past the visible card. Measuring the real rendered width fixes
 * this regardless of how deeply the component is nested.
 */
const OTPInput = ({ length = 6, onOTPChange, onOTPComplete }) => {
  const { colors } = useTheme();
  const inputs = useRef([]);
  const [digits, setDigits] = useState(Array.from({ length }, () => ''));

  // Width of the row, filled in once the container actually renders.
  const [containerWidth, setContainerWidth] = useState(null);

  const onContainerLayout = useCallback(e => {
    const { width } = e.nativeEvent.layout;
    setContainerWidth(width);
  }, []);

  const styles = getStyles({ colors, length, containerWidth });

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
      <View style={styles.container} onLayout={onContainerLayout}>
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

const getStyles = ({ colors, length, containerWidth }) => {
  const minGap = 2;
  const maxGap = 8;
  let gap = maxGap;

  // Sensible default for the single frame before onLayout fires, so
  // nothing flashes oversized/overflowing before the real width is known.
  let inputWidth = 40;

  if (containerWidth) {
    const totalGapWidth = (length - 1) * maxGap;
    inputWidth = (containerWidth - totalGapWidth) / length;

    // If inputs would be too small, reduce the gap instead
    if (inputWidth < 35) {
      gap = minGap;
      inputWidth = (containerWidth - (length - 1) * gap) / length;
    }

    // Ensure minimum and maximum sizes (also keeps things sane on tablets)
    inputWidth = Math.max(Math.min(inputWidth, 45), 32);
  }

  const inputHeight = Math.max(Math.min(inputWidth * 1.25, 52), 40);

  return StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    container: {
      flexDirection: 'row',
      gap,
      justifyContent: 'center',
      // width: '100%' (instead of maxWidth + alignSelf) so onLayout reports
      // the true available width of this row, regardless of how much
      // padding exists in parent containers above it.
      width: '100%',
      maxWidth: 400,
      alignSelf: 'center',
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
