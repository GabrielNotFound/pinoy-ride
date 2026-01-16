import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const AlertBox = ({ title, message, onConfirm, visible, setVisible }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const handleConfirm = () => {
    setVisible(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={() => setVisible(false)}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmButton}>
            <Text style={styles.confirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default AlertBox;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      width: '80%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      elevation: 5,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
      fontFamily: 'Poppins SemiBold',
      color: colors.primary,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 16,
    },
    confirmButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
      alignSelf: 'center',
    },
    confirmText: {
      fontSize: 14,
      fontFamily: 'Poppins Medium',
      color: colors.onPrimary,
    },
  });
