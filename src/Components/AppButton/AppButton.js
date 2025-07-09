import React, { memo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

const AppButton = ({
  mode = 'contained',
  noSpacing,
  buttonColor,
  contentStyle,
  labelStyle,
  textColor,
  startIcon,
  endIcon,
  ...props
}) => {
  const { colors } = useTheme();

  return (
    <Button
      {...props}
      mode={mode}
      textColor={textColor}
      buttonColor={
        mode === 'contained' && !buttonColor ? colors.primary : buttonColor
      }
      labelStyle={[styles.label, labelStyle]}
      contentStyle={[styles.content, contentStyle]}
      theme={{
        colors: {
          surfaceDisabled: colors.lightGrey2,
          onSurfaceDisabled: '#8E8E8E',
        },
      }}
      style={[
        styles.shadow,
        {
          marginVertical: noSpacing ? 0 : 20,
          justifyContent: 'center',
          borderRadius: 99,
        },
        props.featureStyle,
      ]}>
      <View style={styles.labelWrapper}>
        {startIcon && (
          <Image source={startIcon} style={styles.icon} resizeMode="contain" />
        )}
        <Text style={[styles.label, labelStyle]}>{props?.title}</Text>
        {endIcon && (
          <Image source={endIcon} style={styles.icon} resizeMode="contain" />
        )}
      </View>
    </Button>
  );
};

export default memo(AppButton);

const styles = StyleSheet.create({
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    height: 50,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Poppins Regular',
    lineHeight: 22,
    color: 'white',
  },
  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 18,
    height: 18,
  },
});
