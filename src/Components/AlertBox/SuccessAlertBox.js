import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const SuccessAlertBox = ({ imageSource, title, message, visible, onClose }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  if (!visible) {return null;}

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <View style={styles.container}>
        {imageSource && <Image source={imageSource} style={styles.image} />}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Pressable>
  );
};

export default SuccessAlertBox;

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
      width: 335,
      height: 215,
      padding: 24,
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 5,
    },
    image: {
      width: 64,
      height: 64,
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
