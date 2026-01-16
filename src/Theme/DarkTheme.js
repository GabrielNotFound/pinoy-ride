import { DarkTheme as NavigationDarkTheme } from '@react-navigation/native';
import {
  MD3DarkTheme as PaperDarkTheme,
  configureFonts,
} from 'react-native-paper';

const fontConfig = {
  fontFamily: 'Avenir LT Std 65 Medium',
};

const custom = {
  fonts: {
    ...configureFonts({ config: fontConfig }),
    titleLarge: {
      ...PaperDarkTheme.fonts.titleLarge,
      fontFamily: 'Avenir LT Std 65 Medium',
    },
  },
};

const DarkTheme = {
  ...NavigationDarkTheme,
  ...PaperDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    ...PaperDarkTheme.colors,
    primary: '#FFCD05', //brand color yellow
    primaryLight: 'rgb(48, 45, 55)', // level 4
    primaryDark: 'rgb(151, 130, 195)', // light purple
    primaryLight2: 'rgb(42, 40, 48)', // level 2
    onPrimary: 'rgb(255, 255, 255)',
    onQuaternary: 'rgb(142, 142, 142)',

    primaryContainer: 'rgb(79, 54, 142)',
    onPrimaryContainer: 'rgb(233, 221, 255)',
    secondary: 'rgba(210, 224, 84, 1)',
    secondaryDark: 'rgb(255, 255, 255)',
    onSecondary: 'rgb(51, 45, 65)',
    secondaryContainer: 'rgb(74, 68, 88)',
    onSecondaryContainer: 'rgb(232, 222, 248)',
    tertiary: 'rgb(239, 184, 200)',
    onTertiary: 'rgb(74, 37, 50)',
    tertiaryContainer: 'rgb(99, 59, 72)',
    onTertiaryContainer: 'rgb(255, 217, 227)',
    error: 'rgb(255, 180, 171)',
    onError: 'rgb(105, 0, 5)',
    errorContainer: 'rgb(147, 0, 10)',
    onErrorContainer: 'rgb(255, 180, 171)',
    background: 'rgb(28, 27, 30)',
    background2: '#434343',
    onBackground: 'rgb(230, 225, 230)',
    surface: 'rgb(28, 27, 30)',
    onSurface: 'rgb(230, 225, 230)',
    surfaceVariant: 'rgb(73, 69, 78)',
    onSurfaceVariant: 'rgb(202, 196, 207)',
    outline: 'rgb(148, 143, 153)',
    outlineVariant: 'rgb(73, 69, 78)',
    shadow: 'rgba(59, 56, 63, 1)', // White shadow for dark mode
    scrim: 'rgb(0, 0, 0)',
    inverseSurface: 'rgb(230, 225, 230)',
    inverseOnSurface: 'rgb(49, 48, 51)',
    inversePrimary: 'rgb(104, 79, 168)',
    elevation: {
      level0: 'transparent',
      level1: 'rgb(37, 35, 41)',
      level2: 'rgb(42, 40, 48)',
      level3: 'rgb(48, 45, 55)',
      level4: 'rgb(50, 46, 57)',
      level5: 'rgb(53, 50, 62)',
    },
    surfaceDisabled: 'rgba(230, 225, 230, 0.12)',
    onSurfaceDisabled: 'rgba(230, 225, 230, 0.38)',
    backdrop: 'rgba(50, 47, 56, 0.4)',

    brand: '#E8BF46',
    brandLight: '#FFDF80',
    onBrand: 'rgb(28, 27, 30)', // Dark text on brand
    brandContainer: 'rgb(92, 67, 0)',
    onBrandContainer: 'rgb(255, 223, 160)',
    skeleton: 'rgb(50, 46, 57)',
    skeletonHighlight: 'rgb(37, 35, 41)',

    topUpCard: '#44431f',

    // Custom colors for dark mode
    lightGrey: 'rgb(73, 69, 78)',
    lightGrey2: 'rgb(60, 57, 65)',
    onSurfaceGrey: 'rgb(180, 180, 180)',
    grey: 'rgb(73, 69, 78)',
    grey2: 'rgb(37, 35, 41)',
    grey3: 'rgb(180, 180, 180)',
    grey4: 'rgb(170, 170, 170)',
    grey5: 'rgba(255, 255, 255, 1)',
    grey6: 'rgba(255, 255, 255, 1)',
    darkGrey: 'rgb(200, 200, 200)',
    blueGrey: 'rgb(60, 70, 90)',
    lightBlue: 'rgb(50, 60, 90)',
    blue: '#5A8EFF',
    completed: '#6EC96E',
    cancelled: '#FF6B6B',
    text: 'rgba(255, 255, 255, 1)', // General text color
  },
  roundness: 2,
  ...custom,
};

export default DarkTheme;
