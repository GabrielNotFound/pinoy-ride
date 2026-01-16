import React from 'react';
import {
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useAppTheme } from '@/Contexts/ThemeContext';

const ThemeSwitch = () => {
  const { colors } = useTheme();
  const { isDark, toggleTheme } = useAppTheme();
  const styles = getStyles({ colors });

  return (
    <TouchableOpacity style={styles.card} onPress={toggleTheme}>
      <View style={styles.cardContent}>
        <Image
          source={require('@/Assets/Common/HomeScreen/BottomModal/App_Theme.png')}
          style={[styles.leftIcon, isDark && { tintColor: 'white' }]}
        />

        <Text style={styles.titleText}>
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </Text>

        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.grey3, true: colors.primary }}
          thumbColor={colors.onPrimary}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ThemeSwitch;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    card: {
      height: 56,
      borderRadius: 10,
      backgroundColor: colors.onQuaternary,
      paddingHorizontal: 22,
      paddingVertical: 12,
      marginBottom: 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 10,
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    leftIcon: {
      width: 34,
      height: 34,
      resizeMode: 'contain',
    },
    titleText: {
      fontFamily: 'Poppins Medium',
      flex: 1,
      fontSize: 16,
      color: colors.text,
    },
  });
