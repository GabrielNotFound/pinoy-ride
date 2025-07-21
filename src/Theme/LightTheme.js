import { DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import {
  MD3LightTheme as PaperDefaultTheme,
  configureFonts,
} from 'react-native-paper';

const fontConfig = {
  fontFamily: 'Avenir LT Std 65 Medium',
};

const custom = {
  fonts: {
    ...configureFonts({ config: fontConfig }),
    titleLarge: {
      ...PaperDefaultTheme.fonts.titleLarge,
      fontFamily: 'Avenir LT Std 65 Medium',
    },
  },
};

const LightTheme = {
  ...NavigationDefaultTheme,
  ...PaperDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...PaperDefaultTheme.colors,
    primary: '#FEC107', //brand color yellow
    primaryLight: '#E4DDF1', // purple light
    primaryDark: '#3E114C',
    primaryLight2: '#F8F4FF', // very light purple
    onPrimary: 'rgb(255, 255, 255)',
    primaryContainer: 'rgb(233, 221, 255)',
    onPrimaryContainer: 'rgb(34, 0, 92)',
    secondary: 'rgb(98, 91, 112)',
    onSecondary: 'rgb(255, 255, 255)',
    secondaryContainer: 'rgb(232, 222, 248)',
    onSecondaryContainer: 'rgb(30, 25, 43)',
    tertiary: 'rgb(126, 82, 96)',
    onTertiary: 'rgb(255, 255, 255)',
    tertiaryContainer: 'rgb(255, 217, 227)',
    onTertiaryContainer: 'rgb(49, 16, 29)',
    error: 'rgb(186, 26, 26)',
    onError: 'rgb(255, 255, 255)',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: '#FFFFFF',
    onBackground: '#323232',

    surface: 'rgb(255, 251, 255)',
    onSurface: 'rgb(28, 27, 30)',
    surfaceVariant: 'rgb(231, 224, 235)',
    onSurfaceVariant: 'rgb(73, 69, 78)',
    outline: 'rgb(122, 117, 127)',
    outlineVariant: 'rgb(202, 196, 207)',
    shadow: 'rgb(0, 0, 0)',
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(49, 48, 51)',
    inverseOnSurface: 'rgb(244, 239, 244)',
    inversePrimary: 'rgb(207, 188, 255)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(247, 242, 251)',
      level2: 'rgb(243, 237, 248)',
      level3: 'rgb(238, 232, 245)',
      level4: 'rgb(237, 230, 245)',
      level5: 'rgb(234, 227, 243)',
    },
    surfaceDisabled: 'rgba(28, 27, 30, 0.12)',
    onSurfaceDisabled: 'rgba(28, 27, 30, 0.38)',
    backdrop: 'rgba(50, 47, 55, 0.4)',

    brand: '#FEC107',
    brandLight: '#FFDF80',
    onBrand: 'rgb(255, 255, 255)',
    brandContainer: 'black',
    onBrandContainer: 'rgb(38, 26, 0)',
    skeleton: '#E1E9EE',
    skeletonHighlight: '#F2F8FC',
    lightGrey: '#EFEFEF',
    lightGrey2: '#EEEEEE',
    onSurfaceGrey: '#8E8E8E',
    grey: '#D9D9D9',
    grey2: '#F9F9F9',
    grey3: '#7C7C7C',
    darkGrey: '#545454',
    blueGrey: '#DEE5F5',
    lightBlue: '#E2EAFF',
    cancel: '#E4423F',
    blue: '#084CF7',
  },
  roundness: 2,
  ...custom,
};

export default LightTheme;
