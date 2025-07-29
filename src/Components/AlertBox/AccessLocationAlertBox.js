import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';

const AccessLocationAlertBox = ({ visible, onRequestClose, onAllow }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Access Exact Location and all The Time Settings
          </Text>
          <Text style={styles.subtitle}>
            We need your exact location and time settings to match you with the
            nearest riders and ensure accurate fare estimates.{' '}
          </Text>
          <AppButton
            title="Turn On location Service"
            onPress={onAllow}
            isBold
            featureStyle={styles.button}
            labelStyle={styles.buttonLabel}
          />
        </View>
      </View>
    </Modal>
  );
};

export default AccessLocationAlertBox;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: 362,
      height: 300,
      backgroundColor: colors.grey,
      padding: 24,
      borderRadius: 10,
      justifyContent: 'center',
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 25,
      fontWeight: 600,
      letterSpacing: -0.45,
      color: colors.text,
      textAlign: 'center',
      marginVertical: 10,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      letterSpacing: -0.45,
      fontSize: 14,
      color: colors.grey3,
      textAlign: 'center',
      marginBottom: 10,
    },
    button: {
      borderRadius: 20,
      height: 56,
      paddingHorizontal: 0,
    },
    buttonLabel: {
      letterSpacing: -0.45,
      lineHeight: 0,
      fontFamily: 'Poppins SemiBold',
      fontSize: 20,
    },
  });
