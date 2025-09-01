// src/Components/RiderFoundAlertBox.js
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const RiderFoundAlertBox = ({
  visible,
  onClose,
  riderName,
  plateNumber,
  vehicle,
  imageSource,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  if (!visible) {
    return null;
  }

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>Congratulations</Text>
        <Text style={styles.subtitle}>We found you a Rider!</Text>
        <Image source={imageSource} style={styles.profileImage} />
        <Text style={styles.riderName}>{riderName}</Text>
        <Text style={styles.plateNumber}>{plateNumber}</Text>
        <Text style={styles.vehicle}>{vehicle}</Text>
      </View>
    </Pressable>
  );
};

export default RiderFoundAlertBox;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 20,
    },
    container: {
      width: 321,
      paddingVertical: 26,
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 20,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    title: {
      fontSize: 16,
      fontFamily: 'Poppins SemiBold',
      fontWeight: '600',
      color: colors.shadow,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.shadow,
      fontFamily: 'Poppins Regular',
      marginBottom: 15,
    },
    profileImage: {
      width: 124,
      height: 124,
      borderRadius: 32,
      marginBottom: 12,
    },
    riderName: {
      fontSize: 14,
      fontFamily: 'Poppins SemiBold',
      color: colors.shadow,
      marginBottom: 4,
    },
    plateNumber: {
      fontSize: 14,
      fontFamily: 'Poppins SemiBold',
      color: colors.shadow,
    },
    vehicle: {
      fontSize: 16,
      fontFamily: 'Poppins Regular',
      color: colors.shadow,
    },
  });
