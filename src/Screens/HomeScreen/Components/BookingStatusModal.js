import { AppButton } from '@/Components';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const BookingStatusModal = ({
  onLayout,
  riderDetails,
  onShareTrip,
  bookingDetails,
  bookingStatus,
  pickup,
  dropoff,
  selectedService,
  onChangeService,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  if (!riderDetails) {
    return null;
  }

  return (
    <View style={styles.overlay} onLayout={onLayout}>
      <View style={styles.container}>
        {/* Fare + Vehicle - Now tappable to change service */}
        <TouchableOpacity
          style={styles.rowBetween}
          onPress={onChangeService}
          disabled={!(bookingStatus === 0 || bookingStatus === 4)}>
          <View>
            <Text style={styles.label}>
              {selectedService?.title || 'Vehicle'}
            </Text>

            {(bookingStatus === 0 || bookingStatus === 4) && (
              <Text style={styles.changeText}>Tap to change</Text>
            )}
          </View>

          <Text style={styles.price}>₱{bookingDetails?.total_amount || 0}</Text>
        </TouchableOpacity>

        {(bookingStatus === 2 || bookingStatus === 3) && (
          <>
            {/* Pickup & Dropoff */}
            <View style={styles.locationColumn}>
              <View style={styles.locationGroup}>
                {/* Pickup */}
                <View style={styles.locationButton}>
                  <Image
                    source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {pickup?.description || bookingDetails?.pickup_location}
                  </Text>
                </View>

                <View style={styles.dotLine}>
                  {[...Array(2)].map((_, i) => (
                    <View key={i} style={styles.dot} />
                  ))}
                </View>

                {/* Dropoff */}
                <View style={styles.locationButton}>
                  <Image
                    source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
                    style={styles.locationIcon}
                  />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {dropoff?.description || bookingDetails?.dropoff_location}
                  </Text>
                </View>
              </View>
            </View>

            {/*  Fare Breakdown */}
            <View style={styles.fareBreakdown}>
              <View style={styles.fareRow}>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  Final Fare
                </Text>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  ₱{bookingDetails?.payment_details?.total_amount}
                </Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Booking Fee</Text>
                <Text style={styles.feeText}>
                  ₱{bookingDetails?.payment_details?.booking_fee}
                </Text>
              </View>

              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Payment Method</Text>
                <Text style={styles.feeText}>
                  {bookingDetails?.payment_details?.type}
                </Text>
              </View>
            </View>
          </>
        )}
        <View style={styles.separator} />

        {/* Rider Info */}
        <View style={styles.riderRow}>
          <Image
            source={
              riderDetails?.avatar
                ? { uri: riderDetails.vehicle_details[0].motorcyle_img }
                : {
                    uri:
                      'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(
                        (riderDetails?.fname || '') +
                          ' ' +
                          (riderDetails?.lname || ''),
                      ),
                  }
            }
            style={styles.avatar}
          />

          <View style={{ flex: 1 }}>
            <Text style={styles.riderName}>
              {riderDetails.first_name} {riderDetails.last_name}
            </Text>
            <Text style={styles.plate}>
              {riderDetails.vehicle_details?.[0]?.plate_number}
            </Text>
            <Text style={styles.vehicle}>
              {riderDetails.vehicle_details?.[0]?.brand}{' '}
              {riderDetails.vehicle_details?.[0]?.model}
            </Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.circleBtn}>
              <Text>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.circleBtn}>
              <Text>📞</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/*  Share Trip using AppButton */}
        <AppButton
          title="Share Your Trip Details"
          onPress={onShareTrip}
          mode="outlined"
          buttonColor={colors.primary}
          textColor={colors.primary}
          isBold
          noSpacing
        />
      </View>
    </View>
  );
};

export default BookingStatusModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'transparent',
    },
    container: {
      backgroundColor: colors.onPrimary,
      padding: 20,
      elevation: 10,
      paddingBottom: 50,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    vehicleInfo: {
      flexDirection: 'column',
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins SemiBold',
    },
    changeText: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: 'Poppins Regular',
      marginTop: 2,
    },
    price: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Poppins SemiBold',
    },
    separator: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.backdrop,
      marginVertical: 10,
    },
    riderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    riderName: {
      fontWeight: 'bold',
      fontSize: 16,
      fontFamily: 'Poppins SemiBold',
    },
    plate: {
      color: colors.shadow,
      fontFamily: 'Poppins Regular',
    },
    vehicle: {
      color: colors.shadow,
      fontSize: 12,
      fontFamily: 'Poppins Regular',
    },
    actions: { flexDirection: 'row' },
    circleBtn: {
      backgroundColor: colors.primary,
      borderRadius: 30,
      padding: 10,
      marginLeft: 8,
    },

    locationColumn: {
      marginTop: 20,
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
  });
