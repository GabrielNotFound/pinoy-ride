import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '@/Components';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const BottomModal = ({
  onLayout,
  selectedService,
  onBackToEdit,
  onBookPressed,
  onInquireBooking,
  onCreateBooking,
  onCancelBooking,
  onPickupChange,
  onDropoffChange,
  onChangeService,
  pickup,
  dropoff,
  isBooked,
  isConfirmed,
  setShowPaymentModal,
  setShowPromoModal,
  setShowNoteModal,
  selectedPayment,
  selectedPromo,
  noteToRider,
  inquireBookingResponse,
  isLoading,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const buttons = [
    {
      id: 'payment',
      image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      text: selectedPayment,
      onPress: () => setShowPaymentModal(true),
    },
    {
      id: 'promo',
      image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      text: selectedPromo ? selectedPromo.code : 'Promo',
      onPress: () => setShowPromoModal(true),
    },
    {
      id: 'note',
      image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
      text: noteToRider ? 'Note Added' : 'Note to Rider',
      onPress: () => setShowNoteModal(true),
    },
  ];

  const actionButtons = [
    {
      visible: !isBooked,
      title: 'Book',
      onPress: onInquireBooking,
      color: pickup && dropoff ? colors.primary : colors.grey5,
      disabled: !pickup || !dropoff || isLoading,
    },
    {
      visible: isBooked && !isConfirmed,
      title: 'Confirm',
      onPress: onCreateBooking,
      color: colors.primary,
      disabled: isLoading,
    },
    {
      visible: isConfirmed,
      title: 'Cancel',
      onPress: onCancelBooking,
      color: colors.error,
      outlined: true,
      textColor: colors.error,
      disabled: isLoading,
    },
  ];

  const navigateToInputLocation = () => {
    navigation.navigate('InputLocation', {
      pickup,
      dropoff,
      onPickupSelect: item => onPickupChange?.(item),
      onDropoffSelect: item => onDropoffChange?.(item),
    });
  };

  // Helper function to get display text for location
  const getLocationText = (location, placeholder) => {
    if (!location) {return placeholder;}
    // Try multiple possible property names
    return location.description || location.address || placeholder;
  };

  //  Extracted helper renderer
  const renderActionButton = () => {
    const btn = actionButtons.find(b => b.visible);
    if (!btn) {
      return null;
    }

    return (
      <AppButton
        title={btn.title}
        onPress={btn.onPress}
        isBold
        mode={btn.outlined ? 'outlined' : 'contained'}
        buttonColor={btn.color}
        textColor={btn.textColor}
        disabled={btn.disabled}
      />
    );
  };

  return (
    <View style={styles.modalContainer} onLayout={onLayout}>
      {selectedService ? (
        <>
          {/* Service Header */}
          <View style={styles.serviceHeader}>
            {isBooked && !isConfirmed ? (
              <TouchableOpacity onPress={onBackToEdit} disabled={isLoading}>
                <Text style={styles.arrow}>
                  {'< '}
                  <Text style={styles.modalTitle}>Back</Text>
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={onChangeService}
                disabled={isConfirmed}>
                <Text style={styles.modalTitle}>
                  {selectedService.title}
                  <Text style={styles.arrow}>{' >'}</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Pickup & Dropoff */}
          <View style={styles.locationColumn}>
            <View style={styles.locationGroup}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={navigateToInputLocation}
                disabled={isBooked}>
                <Image
                  source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {getLocationText(pickup, 'Pick up From?')}
                </Text>
              </TouchableOpacity>

              <View style={styles.dotLine}>
                {[...Array(2)].map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={navigateToInputLocation}
                disabled={isBooked}>
                <Image
                  source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText} numberOfLines={1}>
                  {getLocationText(dropoff, 'Drop off To?')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Options row or fare breakdown */}
          {!isBooked ? (
            <View style={styles.optionButtonsRow}>
              {buttons.map((btn, index) => (
                <React.Fragment key={index}>
                  <View style={styles.optionWrapper}>
                    <TouchableOpacity
                      style={styles.optionButton}
                      onPress={btn.onPress}>
                      <Image source={btn.image} style={styles.optionIcon} />
                      <Text style={styles.optionText}>{btn.text}</Text>
                    </TouchableOpacity>
                  </View>
                  {index < buttons.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          ) : (
            <View style={styles.fareBreakdown}>
              <View style={styles.fareRow}>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  Final Fare
                </Text>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  {inquireBookingResponse?.total_amount_wo_promo}
                </Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Total Fare w/ Discount</Text>
                <Text style={styles.feeText}>
                  {inquireBookingResponse?.total_amount}
                </Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Payment Method</Text>
                <Text>{selectedPayment}</Text>
              </View>
              {selectedPromo && (
                <View style={styles.fareRow}>
                  <Text style={styles.feeText}>Promo Applied</Text>
                  <Text style={styles.promoAppliedText}>
                    {selectedPromo.code}
                  </Text>
                </View>
              )}
              {noteToRider && (
                <View style={styles.fareRow}>
                  <Text style={styles.feeText}>Note to Rider</Text>
                  <Text style={styles.noteText} numberOfLines={1}>
                    {noteToRider}
                  </Text>
                </View>
              )}
            </View>
          )}
          {renderActionButton()}
        </>
      ) : (
        <>
          <TouchableOpacity onPress={onBookPressed}>
            <Text style={styles.modalTitle}>
              Choose a service <Text style={styles.arrow}>{'>'}</Text>
            </Text>
          </TouchableOpacity>
          <AppButton title="Book" isBold buttonColor={colors.grey5} disabled />
        </>
      )}
    </View>
  );
};

export default BottomModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.onPrimary,
      paddingVertical: 30,
      paddingHorizontal: 30,
    },
    modalTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 19,
      fontWeight: '400',
      color: colors.text,
    },
    arrow: {
      fontFamily: 'Poppins Medium',
      fontSize: 20,
      color: colors.blue,
      fontWeight: '600',
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    locationColumn: {
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    locationGroup: {
      alignItems: 'flex-start',
    },
    dotLine: {
      height: 24,
      justifyContent: 'space-between',
      marginLeft: 11,
      paddingVertical: 5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2,
      backgroundColor: colors.grey,
    },
    locationButton: {
      width: '90%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      width: 27,
      height: 27,
      resizeMode: 'contain',
      marginRight: 10,
    },
    locationText: {
      fontSize: 16,
      color: colors.locationTextColor,
      fontFamily: 'Poppins SemiBold',
    },
    optionButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionWrapper: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionButton: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      width: 2,
      height: '100%',
      backgroundColor: colors.grey,
      marginRight: 20,
    },
    optionIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      marginRight: 6,
    },
    optionText: {
      fontSize: 13,
      color: colors.darkGrey,
      fontFamily: 'Poppins Regular',
    },
    fareBreakdown: {
      marginTop: 10,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    feeText: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: colors.shadow,
    },
    promoAppliedText: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.primary,
    },
    noteText: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.text,
      maxWidth: '50%',
    },
  });
