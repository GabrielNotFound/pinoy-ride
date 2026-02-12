import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppButton, AppTextInput } from '@/Components';

const NoteToRiderModal = ({ visible, onClose, onSave, initialNote = '' }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, visible]);

  const handleSave = () => {
    const cleanedNote = note.trimStart();
    onSave?.(cleanedNote);
    onClose();
  };

  const handleClose = () => {
    setNote(initialNote);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <Text style={styles.title}>Note To Rider</Text>

            <AppTextInput
              value={note}
              onChangeText={setNote}
              placeholder="Message"
              inputMode="comment"
              multiline
            />

            <AppButton
              title="Send"
              onPress={handleSave}
              isBold
              buttonColor={colors.primary}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default NoteToRiderModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    keyboardContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    modalContainer: {
      backgroundColor: '#D9D9D9',
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontSize: 20,
      marginBottom: 15,
      color: colors.text,
    },
  });
