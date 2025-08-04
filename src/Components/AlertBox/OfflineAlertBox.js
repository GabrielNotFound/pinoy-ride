import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppButton from '../AppButton/AppButton';

const OfflineAlertBox = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  if (!visible) {
    return null;
  }

  const closeModal = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.container}>
        <Image
          source={require('@/Assets/Common/Offline_Alert.png')}
          style={styles.image}
        />
        <Text style={styles.message}>
          Click{' '}
          <Text style={{ fontFamily: 'Poppins SemiBold' }}> Go Online</Text>{' '}
          para maka-receive ng bookings at makabyahe na ulit.
        </Text>

        <AppButton
          title="Go Online"
          onPress={closeModal}
          isBold
          featureStyle={{ width: '100%', marginTop: 16 }}
        />
      </View>
    </Pressable>
  );
};

export default OfflineAlertBox;

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
      zIndex: 999,
    },
    container: {
      width: 350,
      height: 246,
      paddingVertical: 40,
      paddingHorizontal: 31,
      backgroundColor: '#fff',
      borderRadius: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,

      alignItems: 'center',
    },
    image: {
      width: 270,
      height: 39,
      resizeMode: 'contain',
      marginBottom: 16,
    },
    title: {
      fontSize: 25,
      fontFamily: 'Poppins Semibold',
      fontWeight: '600',
      color: colors.darkGrey,
      marginBottom: 8,
    },
    message: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: colors.darkGrey,
      textAlign: 'center',
    },
  });
