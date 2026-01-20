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
import { AlertBox, AppButton } from '@/Components';
import TopUpAmountModal from './TopUpAmountModal';

const PaymentMethodModal = ({
  visible,
  onClose,
  onSelect,
  selectedPayment = 'Wallet',
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [showTopUpModal, setShowTopUpModal] = React.useState(false);
  const [alertMessage, setAlertMessage] = React.useState('');
  const [showAlert, setShowAlert] = React.useState(false);

  const handleNext = () => {
    setShowTopUpModal(true);
  };

  const handleTopUpError = errorMessage => {
    setAlertMessage(errorMessage);
    setShowAlert(true);
  };

  const handleTopUpSuccess = () => {
    // Close the PaymentMethodModal when top-up is successful
    onClose();
  };

  return (
    <>
      {/* Alert for API errors */}
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}

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

          {/* Wallet option */}
          <TouchableOpacity
            style={[
              styles.option,
              selectedPayment === 'Wallet' && styles.optionSelected,
            ]}
            onPress={() => {
              onSelect?.('Wallet');
              onClose();
            }}>
            <Image
              source={require('@/Assets/Common/HomeScreen/BottomModal/cash.png')}
              style={styles.icon}
            />
            <Text style={styles.optionText}>Wallet</Text>
            {selectedPayment === 'Wallet' && (
              <View style={styles.radioCircle}>
                <View style={styles.radioInner} />
              </View>
            )}
          </TouchableOpacity>
          <AppButton title="Top Up" onPress={handleNext} isBold />
        </View>
      </Modal>

      {/* Top Up Amount Modal */}
      <TopUpAmountModal
        visible={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onError={handleTopUpError}
        onSuccess={handleTopUpSuccess}
      />
    </>
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
