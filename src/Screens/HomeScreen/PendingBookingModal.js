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

const PendingBookingModal = ({
  visible,
  onClose,
  bookings,
  currentIndex,
  loading,
  onAccept,
  onIgnore,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const booking = bookings[currentIndex];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {loading ? (
                <Text>Loading booking...</Text>
              ) : booking ? (
                <>
                  {/* Header row */}
                  <View style={styles.header}>
                    <Image
                      source={{
                        uri:
                          booking.customer.avatar ||
                          'https://ui-avatars.com/api/?name=' +
                            booking.customer.fname,
                      }}
                      style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>
                        {booking.customer.fname} {booking.customer.lname}
                      </Text>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={styles.amount}>
                        +₱{booking.payment_details.total_amount.toFixed(2)}
                      </Text>
                      <Text style={styles.paymentType}>
                        {booking.payment_type === 'cash' ? 'Cash' : 'Cashless'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.locationRow}>
                    <Image
                      source={require('@/Assets/Common/Location.png')}
                      style={styles.locationIcon}
                    />
                    <Text style={styles.locationText}>
                      {booking.pickup_location}
                    </Text>
                  </View>

                  <View style={styles.locationRow}>
                    <Image
                      source={require('@/Assets/Common/Pin.png')}
                      style={styles.locationIcon}
                    />
                    <Text style={styles.locationText}>
                      {booking.dropoff_location}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.footer}>
                    <TouchableOpacity
                      onPress={onIgnore}
                      style={styles.ignoreBtn}>
                      <Text style={styles.ignoreText}>Ignore</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => onAccept(booking)}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <Text>No bookings available</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PendingBookingModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#fff',
      padding: 16,
      borderRadius: 16,
      width: '90%',
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    name: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
      color: '#222',
    },
    amountBox: {
      alignItems: 'flex-end',
    },
    amount: {
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
      color: colors.primary,
    },
    paymentType: {
      fontSize: 12,
      color: '#888',
    },
    locationIcon: {
      width: 18,
      height: 18,
      resizeMode: 'contain',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    locationText: {
      marginLeft: 6,
      fontSize: 14,
      color: '#333',
      flexShrink: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    ignoreBtn: {
      backgroundColor: colors.onPrimary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
      marginRight: 10,
    },
    ignoreText: {
      fontSize: 16,
      color: colors.primary,
    },
    acceptBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 8,
    },
    acceptText: {
      color: '#fff',
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.grey,
      marginVertical: 12,
    },
  });
