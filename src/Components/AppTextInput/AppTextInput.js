import React, { useRef } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useTheme } from 'react-native-paper';
import useAmountFormattedValue from '@/Hooks/useAmountFormattedValue';
import numeral from 'numeral';

const AppTextInput = ({
  label,
  value,
  onChangeText,
  onChangeFormattedText,
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
      {label && (
        <Text style={[styles.label, labelColor && { color: labelColor }]}>
          {label}
        </Text>
      )}

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
            placeholderTextColor: colors.onSurfaceGrey,
            keyboardType: 'phone-pad',
          }}
        />
      ) : (
        <TextInput
          value={isAmount ? amountFormattedValue : value}
          onChangeText={isAmount ? handleAmountChange : onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceGrey}
          style={[
            isComment ? styles.commentBox : styles.input,
            error && styles.inputError,
          ]}
          keyboardType={isAmount ? 'numeric' : 'default'}
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
      borderRadius: 0,
      backgroundColor: 'transparent',
      elevation: 0,
      shadowOpacity: 0,
    },
    phoneTextContainer: {
      backgroundColor: 'transparent',
      paddingVertical: 0,
      borderRadius: 0,
      borderWidth: 0,
      paddingBottom: 2,
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
