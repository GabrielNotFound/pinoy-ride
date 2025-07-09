import React, { memo } from 'react';
import { StyleSheet } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

const AppButton = ({
  mode = 'contained',
  noSpacing,
  buttonColor,
  contentStyle,
  labelStyle,
  textColor,
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
      labelStyle={[
        {
          fontSize: mode === 'contained' ? 18 : 16,
          fontFamily: 'Poppins Regular',
          fontWeight: 500,
        },
        labelStyle,
      ]}
      contentStyle={[
        {
          height: 50,
        },
        contentStyle,
      ]}
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
      {props?.title}
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
});
