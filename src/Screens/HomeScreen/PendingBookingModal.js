import React from 'react';
import {
  ActivityIndicator,
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
  const customer = booking?.customer?.ekyc_details;

  // ✅ Counter label e.g. "1 of 3"
  const bookingCount = bookings.length;
  const counterLabel =
    bookingCount > 0 ? `${currentIndex + 1} of ${bookingCount}` : null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              {/* ✅ Close (X) button — always visible */}
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>

              {/* ✅ Loading state while API call is in-flight */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading bookings...</Text>
                </View>
              ) : booking ? (
                <>
                  {/* Counter badge */}
                  {counterLabel && (
                    <View style={styles.counterRow}>
                      <Text style={styles.counterText}>{counterLabel}</Text>
                    </View>
                  )}

                  {/* Header row */}
                  <View style={styles.header}>
                    <Image
                      source={{
                        uri:
                          customer?.selfie ||
                          'https://ui-avatars.com/api/?name=' +
                            customer?.first_name,
                      }}
                      style={styles.avatar}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.name}>
                        {customer?.first_name} {customer?.last_name}
                      </Text>
                    </View>
                    <View style={styles.amountBox}>
                      <Text style={styles.amount}>
                        +₱{booking.payment_details?.total_amount?.toFixed(2)}
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
                      <Text style={styles.ignoreText}>
                        {currentIndex < bookings.length - 1 ? 'Skip' : 'Ignore'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => onAccept(booking)}>
                      <Text style={styles.acceptText}>Accept</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                // ✅ No bookings found (loaded but empty)
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyEmoji}>🔍</Text>
                  <Text style={styles.emptyTitle}>No bookings available</Text>
                  <Text style={styles.emptySubtitle}>
                    There are no pending bookings in your area right now.
                  </Text>
                  <TouchableOpacity
                    style={styles.closeActionBtn}
                    onPress={onClose}>
                    <Text style={styles.closeActionText}>Close</Text>
                  </TouchableOpacity>
                </View>
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
      backgroundColor: colors.surface,
      padding: 16,
      paddingTop: 20,
      borderRadius: 16,
      width: '90%',
      elevation: 4,
      // Ensure minimum height so the close button is always visible
      minHeight: 120,
    },

    // ✅ Close button (top-right X)
    closeBtn: {
      position: 'absolute',
      top: 10,
      right: 12,
      zIndex: 10,
      padding: 6,
    },
    closeText: {
      fontSize: 18,
      color: colors.onSurfaceVariant,
      fontWeight: '600',
    },

    // ✅ Loading state
    loadingContainer: {
      paddingVertical: 32,
      alignItems: 'center',
      gap: 12,
    },
    loadingText: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.onSurfaceVariant,
      marginTop: 8,
      textAlign: 'center',
    },

    // ✅ Counter badge
    counterRow: {
      alignItems: 'flex-start',
      marginBottom: 10,
      marginTop: 2,
    },
    counterText: {
      fontSize: 11,
      color: colors.onSurfaceVariant,
      fontFamily: 'Poppins Regular',
      backgroundColor: colors.surfaceVariant,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: 'hidden',
    },

    // ✅ Empty state
    emptyContainer: {
      paddingVertical: 28,
      alignItems: 'center',
    },
    emptyEmoji: {
      fontSize: 36,
      marginBottom: 8,
    },
    emptyTitle: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      color: colors.onSurface,
      marginBottom: 4,
    },
    emptySubtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 13,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginBottom: 20,
      paddingHorizontal: 8,
    },
    closeActionBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 28,
      paddingVertical: 10,
      borderRadius: 8,
    },
    closeActionText: {
      color: colors.onPrimary,
      fontFamily: 'Poppins SemiBold',
      fontSize: 15,
    },

    // Existing styles
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
      color: colors.onSurface,
    },
    text: {
      color: colors.text,
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
      color: colors.onSurfaceVariant,
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
      color: colors.onSurface,
      flexShrink: 1,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    ignoreBtn: {
      backgroundColor: colors.surface,
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
      color: colors.onPrimary,
      fontFamily: 'Poppins-SemiBold',
      fontSize: 16,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outline,
      marginVertical: 12,
    },
  });
