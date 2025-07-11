import React, { useRef } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const OTPInput = ({ length = 6, onOTPChange }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    if (!/^\d*$/.test(text)) {return;}

    const otp = inputs.current.map(input => input?.value || '');
    otp[index] = text;
    onOTPChange(otp.join(''));

    if (text && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (
      e.nativeEvent.key === 'Backspace' &&
      !inputs.current[index].value &&
      index > 0
    ) {
      inputs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {[...Array(length)].map((_, i) => (
          <TextInput
            key={i}
            ref={ref => (inputs.current[i] = ref)}
            style={styles.input}
            keyboardType="number-pad"
            maxLength={1}
            onChangeText={text => handleChange(text, i)}
            onKeyPress={e => handleKeyPress(e, i)}
            returnKeyType="next"
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
      gap: 12,
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
