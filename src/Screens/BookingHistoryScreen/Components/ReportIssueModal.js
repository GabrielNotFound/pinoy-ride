import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const ReportIssueModal = ({ visible, onClose, onSubmit, loading }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) {return;}
    onSubmit(message.trim());
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Replace with your actual asset path */}
          <Image
            source={require('@/Assets/Common/BookingDetails/ReportIssue.png')}
            style={styles.icon}
            resizeMode="contain"
          />

          <Text style={styles.title}>Report an Issue</Text>

          <TextInput
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor={colors.grey4}
            multiline
            value={message}
            onChangeText={setMessage}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || loading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!message.trim() || loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.sendText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ReportIssueModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    container: {
      width: '100%',
      backgroundColor: colors.onPrimary,
      borderRadius: 20,
      paddingVertical: 30,
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    icon: {
      width: 55,
      height: 55,
      marginBottom: 16,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      color: colors.shadow,
      marginBottom: 20,
    },
    textInput: {
      width: '100%',
      minHeight: 120,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 14,
      fontFamily: 'Poppins Regular',
      fontSize: 13,
      color: colors.shadow,
      marginBottom: 24,
      shadowColor: colors.shadow,
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    sendButton: {
      width: '100%',
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 50,
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
    sendText: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 15,
      color: colors.onPrimary,
    },
  });
