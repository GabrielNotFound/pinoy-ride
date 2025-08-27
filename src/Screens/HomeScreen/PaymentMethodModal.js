import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const PaymentMethodModal = ({
  visible,
  onClose,
  onSelect,
  selectedPayment,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.modalContainer}>
        <Text style={styles.title}>Select Payment</Text>
        {/* Cash option */}
        <TouchableOpacity
          style={[
            styles.option,
            selectedPayment === 'Cash' && styles.optionSelected,
          ]}
          onPress={() => {
            onSelect?.('Cash');
            onClose();
          }}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/cash.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Cash</Text>
          {selectedPayment === 'Cash' && (
            <View style={styles.radioCircle}>
              <View style={styles.radioInner} />
            </View>
          )}
        </TouchableOpacity>

        {/* GCash option */}
        <TouchableOpacity
          style={[
            styles.option,
            selectedPayment === 'GCash' && styles.optionSelected,
          ]}
          onPress={() => {
            onSelect?.('GCash');
            onClose();
          }}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/gcash.png')}
            style={styles.icon}
          />
          <Text style={styles.optionText}>Link your GCash now!</Text>
          {selectedPayment === 'GCash' && (
            <View style={styles.radioCircle}>
              <View style={styles.radioInner} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.manageText}>Manage Payment Methods</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PaymentMethodModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.lightGrey,
      padding: 20,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontSize: 20,
      marginBottom: 10,
      color: colors.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.onPrimary,
      padding: 12,
      borderRadius: 5,
      marginBottom: 12,
    },
    optionSelected: {
      backgroundColor: '#FEC10733',
    },
    icon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
      marginRight: 12,
    },
    optionText: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Poppins Regular',
      color: colors.text,
    },
    radioCircle: {
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    manageText: {
      fontSize: 16,
      fontFamily: 'Poppins Light',
      color: colors.primary,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
  });
