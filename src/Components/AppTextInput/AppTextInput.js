import React, { memo, useCallback, useEffect, useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import TextInputMask from 'react-native-text-input-mask';
import { createIntl, createIntlCache } from '@formatjs/intl';
import { useAmountFormattedValue } from '@/Hooks';
import moment from 'moment';
import { DatePickerModal } from 'react-native-paper-dates';
import { Controller } from 'react-hook-form';
import AppTextError from '../AppTextError/AppTextError';

const screenWidth = Dimensions.get('window').width;

const cache = createIntlCache();
const intl = createIntl(
  {
    locale: 'en-US',
    messages: {},
  },
  cache,
);

const formatNumber = value => {
  if (!value) {
    return '';
  }
  let numberValue = Number(value);
  if (isFormattedPartially(value)) {
    return value;
  }
  if (isNaN(numberValue)) {
    return '';
  }
  let formattedNumber = intl.formatNumber(numberValue, {
    maximumFractionDigits: 2,
  });
  if (/\.\d$/.test(formattedNumber)) {
    formattedNumber = formattedNumber + '0';
  }
  return formattedNumber;
};

const isFormattedPartially = value => {
  const decimalRegexFormat = /(\.\d{1,2})$/;
  return decimalRegexFormat.test(value) || value.endsWith('.') || value === '-';
};

const getUnformattedValue = value => {
  if (!value) {
    return '';
  }
  const cleanValue = value
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*?)\.+/g, '$1')
    .replace(/^(\d*\.?)|(.*)$/g, '$1');
  return isNaN(parseFloat(cleanValue)) ? '' : cleanValue;
};

const Input = ({
  pointerEvents,
  isCurrencyInput,
  secureTextEntry,
  right,
  ...props
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors, props });
  const [multiline, setMultiline] = useState(false);
  const { formattedValue, onChangeValue } = useAmountFormattedValue({
    onChange: props.onChangeText,
    value: props.value,
    getFormattedValue: formatNumber,
    isFormattedPartially,
    getUnformattedValue,
  });

  const onChangeAmount = useCallback(
    val => {
      const cleanValue = val
        .replace(/[^0-9.]/g, '')
        .replace(/(\..*?)\.+/g, '$1')
        .replace(/^0+(?!\.)/, '0');
      if (props?.onChangeText !== undefined) {
        props.onChangeText(cleanValue);
      }
    },
    [onChangeValue],
  );

  const onChange = val => {
    if (props?.trim) {
      val = val.split(' ').join('');
    }
    if (props?.onChangeText !== undefined) {
      props?.onChangeText(val);
    }
  };

  useEffect(() => {
    if (props.editable) {
      return;
    }
    const characterLength = screenWidth >= 430 ? 32 : 29;
    if (props.value?.length > characterLength) {
      setMultiline(true);
    } else {
      setMultiline(false);
    }
  }, [props.editable, props.value]);

  const rightIcon = () => {
    if (right) {
      return right;
    }
    return null;
  };

  const affix = () => {
    if (props.left) {
      return props.left;
    }
    return null;
  };

  const renderLabel = () => {
    if (!props.topLabel) {
      return;
    }
    const topLabelStyle = isCurrencyInput
      ? styles.currencyTopLabelStyle
      : styles.topLabelStyle;

    return (
      <Text style={{ ...topLabelStyle, ...props.labelStyle }}>
        {props.topLabel}
        {props.required && <Text style={{ color: colors.error }}>*</Text>}
      </Text>
    );
  };

  const baseProps = {
    mode: props.mode || 'outlined',
    ref: props?.inputRef || null,
    style: {
      backgroundColor: '#FFFFFF',
      paddingVertical: 2,
      ...props.style,
    },
    contentStyle: {
      ...styles.textFontStyle,
      ...(isCurrencyInput && styles.currencyInputStyle),
      ...(multiline && {
        minHeight: 48,
      }),
      ...props.inputContentStyle,
    },
    outlineColor: props.outlineColor || colors.onBackground,
    activeOutlineColor: colors.onBackground,
    placeholderTextColor: '#C7C7C7',
    textAlignVertical: 'center',
    dense: true,
    theme: { roundness: 10 },
    secureTextEntry: secureTextEntry, // <-- Pass secureTextEntry here
  };

  return (
    <>
      {renderLabel()}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={
          typeof pointerEvents === 'function' ? pointerEvents : undefined
        }
        disabled={pointerEvents === 'none'}>
        <View pointerEvents={pointerEvents ? 'none' : 'auto'}>
          {isCurrencyInput ? (
            <TextInput
              {...props}
              {...baseProps}
              onChangeText={onChangeAmount}
              value={formattedValue}
              placeholder={
                props.isAmountFocused || props.value !== ''
                  ? undefined
                  : 'Php 00.00'
              }
              onBlur={e => {
                props.trigger && props.trigger(props.name);
                props.setIsAmountFocused && props.setIsAmountFocused(false);
                props.onBlur && props.onBlur(e);
              }}
              onFocus={() =>
                props.setIsAmountFocused && props.setIsAmountFocused(true)
              }
              keyboardType="numeric"
              returnKeyType="done"
              trim
              dense
            />
          ) : (
            <TextInput
              render={maskProps => (
                <TextInputMask {...maskProps} mask={props?.mask} />
              )}
              multiline={multiline}
              right={rightIcon()}
              left={affix()}
              adjustsFontSizeToFit
              onChangeText={onChange}
              {...props}
              {...baseProps}
            />
          )}
        </View>
      </TouchableOpacity>
    </>
  );
};

const AppTextInput = ({ ...props }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors, props });

  return (
    <>
      <View style={styles.mb_24}>
        {props.control ? (
          <Controller
            control={props.control}
            name={props.name}
            render={({
              field: { onChange: handleInputChange, onBlur, value: fieldValue },
            }) => (
              <Input
                onChangeText={handleInputChange}
                onBlur={onBlur}
                value={fieldValue}
                {...props}
              />
            )}
          />
        ) : (
          <Input {...props} />
        )}

        {props.errorMessage && (
          <AppTextError>{props.errorMessage}</AppTextError>
        )}
      </View>
      {props.visible && (
        <DatePickerModal
          locale="en"
          mode="single"
          label="Select Date"
          visible={props.visible}
          inputEnabled={false}
          onDismiss={props.onDismiss}
          date={props.date}
          onConfirm={props.onConfirm}
          onChange={props.onConfirm}
          saveLabel={<Text variant="labelLarge">Save</Text>}
          startYear={1900}
          endYear={moment().year() + 15}
        />
      )}
    </>
  );
};

export default memo(AppTextInput);

const getStyles = ({ colors, props }) =>
  StyleSheet.create({
    textFontStyle: {
      fontSize: 19,
      fontFamily: !props.value
        ? 'Avenir LT Std 65 Medium'
        : 'Avenir LT Std 95 Black',
      minHeight: 48,
    },
    currencyInputStyle: { textAlign: 'center' },
    currencyTopLabelStyle: {
      color: props.error ? colors.error : colors.onSurface,
      fontFamily: 'Avenir LT Std 95 Black',
      textAlign: 'center',
      marginBottom: 12,
      fontSize: 16,
      lineHeight: 22.4,
    },
    topLabelStyle: {
      marginBottom: 12,
      fontSize: 13,
      lineHeight: 18.2,
      fontFamily: 'Avenir LT Std 55 Roman',
    },
    mb_24: { marginBottom: 24 },
  });
