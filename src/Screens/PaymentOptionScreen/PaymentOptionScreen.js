import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const PaymentOptionScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.replace('SettingsScreen');
  };

  const addMethods = [
    {
      label: 'Pinoy Ride Wallet',
      icon: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Option</Text>
          <View style={styles.spacing} />
        </View>
      </View>
      <View style={styles.contents}>
        <View style={styles.row}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <View style={styles.textContainer}>
            <Text style={styles.label}>Cash</Text>
          </View>
          <Text style={styles.status}>Default</Text>
        </View>

        <Text style={styles.title}>Add Methods</Text>

        {addMethods.map((method, index) => (
          <View key={`other-${index}`} style={styles.row}>
            <Image
              source={method.icon}
              style={styles.icon}
              resizeMode="contain"
            />
            <View style={styles.textContainer}>
              <Text style={styles.label}>{method.label}</Text>
            </View>
          </View>
        ))}

        <View style={styles.divider} />

        <Text style={styles.warning}>
          Choose your preferred payment method for a faster, hassle-free ride
          experience.
        </Text>
      </View>
    </View>
  );
};

export default PaymentOptionScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconButton: {
      width: 25,
    },
    spacing: {
      width: 25,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      fontWeight: '400',
      color: colors.onPrimary,
      textAlign: 'center',
      flex: 1,
    },
    contents: {
      paddingVertical: 22,
      paddingHorizontal: 30,
      backgroundColor: colors.onPrimary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    textContainer: {
      flex: 1,
      marginLeft: 10,
    },
    status: {
      backgroundColor: colors.error,
      color: colors.onPrimary,
      fontSize: 10,
      fontFamily: 'Poppins Regular',
      paddingVertical: 2,
      paddingHorizontal: 18,
      borderRadius: 5,
      marginBottom: 10,
    },
    icon: {
      width: 27,
      height: 27,
      marginRight: 12,
    },
    label: {
      fontFamily: 'Poppins Light',
      fontWeight: 500,
      fontSize: 16,
      color: colors.shadow,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontWeight: 500,
      fontSize: 16,
      marginVertical: 15,
      color: colors.shadow,
    },
    warning: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 12,
      color: colors.grey4,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
      marginVertical: 10,
    },
  });
