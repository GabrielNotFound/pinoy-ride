import React, { memo } from 'react';
import { Text, useTheme } from 'react-native-paper';
import Animated, {
  FadeInLeft,
  FadeOutRight,
  Layout,
} from 'react-native-reanimated';

const AppTextError = props => {
  const { colors } = useTheme();
  return (
    <Animated.View
      entering={FadeInLeft}
      exiting={FadeOutRight}
      layout={Layout.springify()}>
      <Text
        {...props}
        variant="labelSmall"
        style={{ color: colors.error, marginTop: 2, ...props.style }}>
        {props.children}
      </Text>
    </Animated.View>
  );
};

export default memo(AppTextError);
