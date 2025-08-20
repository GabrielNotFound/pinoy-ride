import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AlertBox = ({ title, message }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) {return null;}

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity
        onPress={() => setVisible(false)}
        style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AlertBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdecea',
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
    fontFamily: 'Poppins SemiBold',
    color: '#d32f2f',
  },
  message: {
    fontSize: 13,
    fontFamily: 'Poppins Regular',
    color: '#333',
  },
  closeButton: {
    marginLeft: 10,
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});
