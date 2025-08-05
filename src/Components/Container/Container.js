import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { useHeaderHeight } from '@react-navigation/elements';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
// import AppProgressBar from './AppProgressBar';

const Container = ({
  children,
  scrollable,
  style,
  noBottomInset,
  noTopInset,
  bounces,
  progressBar,
  refresh,
  scrollRef,
  handleScroll,
  viewIsInsideTabBar,
  ...rest
}) => {
  const headerHeight = useHeaderHeight();
  const { colors } = useTheme();
  const styles = getStyles({ colors }, progressBar);

  const edges = ['left', 'right', 'bottom'];

  if (headerHeight === 0) {
    if (!noTopInset) {
      edges.push('top');
    }
  }
  if (noBottomInset) {
    const index = edges.indexOf('bottom');
    if (index > -1) {
      edges.splice(index, 1);
    }
  }

  return (
    <SafeAreaView
      {...{ edges }}
      style={{
        ...styles.container,
        ...style,
        backgroundColor: colors.background,
      }}>
      {scrollable ? (
        <KeyboardAwareScrollView
          innerRef={scrollRef}
          viewIsInsideTabBar={viewIsInsideTabBar}
          onScroll={handleScroll}
          refreshControl={refresh}
          enableOnAndroid={true}
          bounces={bounces}
          contentContainerStyle={[
            styles.spacing,
            { flexGrow: 1, backgroundColor: colors.background },
          ]}
          {...rest}>
          {/* {!!progressBar && <AppProgressBar progressBar={progressBar} />} */}
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View
          style={[
            styles.spacing,
            { flex: 1, backgroundColor: colors.background },
          ]}>
          {/* {!!progressBar && <AppProgressBar progressBar={progressBar} />} */}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
};

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    spacing: {
      paddingHorizontal: 20,
    },
  });

export default Container;
