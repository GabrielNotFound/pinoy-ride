import React, { memo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const AppButton = ({
  title,
  onPress,
  noSpacing,
  buttonColor,
  textColor,
  leftIcon,
  rightIcon,
  isBold = false,
  disabled = false,
  mode = 'contained', // 'contained' | 'outlined' | 'light'
  labelStyle,
  featureStyle,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const hasIcon = !!leftIcon || !!rightIcon;
  const buttonHeight = hasIcon ? 60 : 50;
  const isOutlined = mode === 'outlined';
  const isLight = mode === 'light';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          backgroundColor: isLight
            ? colors.onPrimary
            : isOutlined
            ? colors.onPrimary
            : buttonColor || colors.primary,
          borderColor: isOutlined
            ? buttonColor || colors.primary
            : 'transparent',
          borderWidth: isOutlined ? 1 : 0,
          height: buttonHeight,
          marginVertical: noSpacing ? 0 : 20,
          opacity: disabled ? 0.6 : 1,
        },
        featureStyle,
      ]}>
      <View style={styles.innerContent}>
        <View style={styles.sideIcon}>
          {leftIcon && (
            <Image
              source={leftIcon}
              style={[styles.icon, { marginLeft: 34, marginRight: 24 }]}
            />
          )}
        </View>

        <View style={styles.textWrapper}>
          <Text
            numberOfLines={1}
            style={[
              {
                fontSize: hasIcon ? 16 : 18,
                lineHeight: 22,
                fontFamily: isBold ? 'Poppins Medium' : 'Poppins Regular',
                color:
                  textColor ??
                  (isLight
                    ? colors.shadow
                    : isOutlined
                    ? buttonColor || colors.primary
                    : colors.onPrimary),
              },
              labelStyle,
            ]}>
            {title}
          </Text>
        </View>

        <View style={styles.sideIcon}>
          {rightIcon && (
            <Image
              source={rightIcon}
              style={[styles.icon, { marginRight: 24, marginLeft: 5 }]}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default memo(AppButton);

const getStyles = ({ colors }) =>
  StyleSheet.create({
    button: {
      borderRadius: 99,
      paddingHorizontal: 16,
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 15,
      elevation: 5,
      backgroundColor: colors.onPrimary,
    },
    innerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sideIcon: {
      width: 34,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrapper: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    icon: {
      width: 25,
      height: 25,
      resizeMode: 'contain',
    },
  });
