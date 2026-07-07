import React, { useEffect } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppUtil } from '@/Utils';
import { Container } from '@/Components';
import { clearRiderBookingState } from '@/Redux/Slices/userSlice';

const SuccessfulBooking = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // ✅ FIX: HomeScreen navigates with
  // `navigation.navigate('SuccessfulBooking', { booking: completedBooking })`,
  // so the booking data is nested under route.params.booking — not
  // route.params itself. The old code (`const booking = route?.params`) was
  // grabbing the wrapper object, so `booking.customer` was always undefined.
  const { booking } = route?.params || {};

  useEffect(() => {
    AppUtil.debugDeep(booking?.payment_details);
  }, [route]);

  // ✅ FIX: Customer name fields live under customer.ekyc_details
  // (first_name / last_name), matching the shape used everywhere else in the
  // app (see BottomModal.js: activeBooking.customer.ekyc_details.first_name).
  // There is no fname/mname/lname on the customer object.
  const passengerName = booking?.customer?.ekyc_details
    ? `${booking.customer.ekyc_details.first_name || ''} ${
        booking.customer.ekyc_details.last_name || ''
      }`.trim()
    : '';

  const estTime = '10 mins';

  const paymentDetails = booking?.payment_details || {};
  const allPaymentDetails = paymentDetails?.all_payment_details || {};

  const fare = paymentDetails?.total_amount || 0;
  const minimumFare = allPaymentDetails?.minimum_fare || 0;
  const perKm = allPaymentDetails?.pesos_per_km || 0;
  const bookingFee = allPaymentDetails?.booking_fee || 0;

  // ✅ NEW: these extra fields (from payment_details.all_payment_details)
  // are what actually make up the total_amount. Showing them lets the rider
  // see the real math instead of just the flat minimum-fare/per-km card:
  //   total = minimum_fare + base_amount + exceeding_kms_total
  //   rider_net_amount = total - commission
  const kmBasis = allPaymentDetails?.km_basis || 0; // km covered by base_amount
  const baseAmount = allPaymentDetails?.base_amount || 0; // kmBasis * pesos_per_km
  const exceedingKms = allPaymentDetails?.exceeding_kms || 0; // distance beyond kmBasis
  const pesosPerKm2 = allPaymentDetails?.pesos_per_km2 || 0; // rate charged for exceeding km
  const exceedingKmsTotal = allPaymentDetails?.exceeding_kms_total || 0; // exceedingKms * pesosPerKm2
  const promoDiscount = allPaymentDetails?.promo_discount || 0;
  const commission = allPaymentDetails?.commission || 0; // platform's cut
  const riderNetAmount = allPaymentDetails?.rider_net_amount || fare; // driver's take-home after commission

  const distance = booking?.distance_km ? `${booking.distance_km} km` : '0 km';

  // Small helper so we don't sprinkle .toFixed(2) everywhere in the JSX
  const money = value => Number(value || 0).toFixed(2);

  const handleEndRide = () => {
    dispatch(clearRiderBookingState());

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'HomeScreen',
          params: { reset: true },
        },
      ],
    });
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.container}>
        <Image
          source={require('@/Assets/Common/SuccessfulScreen/Success_Image.png')}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.successText}>
          Matagumpay mong naihatid ang iyong pasahero sa drop-off location.
        </Text>

        <Text style={styles.passengerLabel}>Passenger Name</Text>
        <Text style={styles.passengerName}>{passengerName}</Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Est. Time</Text>
            <Text style={styles.summaryValue}>{estTime}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Fare</Text>
            <Text style={styles.summaryValue}>₱{fare}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Distance</Text>
            <Text style={styles.summaryValue}>{distance}</Text>
          </View>
        </View>

        <View style={styles.fareBox}>
          <Text style={styles.fareTitle}>Fare Breakdown</Text>

          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Minimum Fare</Text>
            <Text style={styles.fareValue}>₱{money(minimumFare)}</Text>
          </View>

          {baseAmount > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Base Fare</Text>
              <Text style={styles.fareValue}>₱{money(baseAmount)}</Text>
            </View>
          )}

          {exceedingKms > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Additional Distance</Text>
              <Text style={styles.fareValue}>₱{money(exceedingKmsTotal)}</Text>
            </View>
          )}

          {bookingFee > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Booking Fee</Text>
              <Text style={styles.fareValue}>₱{money(bookingFee)}</Text>
            </View>
          )}

          {promoDiscount > 0 && (
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Promo Discount</Text>
              <Text style={styles.fareValue}>-₱{money(promoDiscount)}</Text>
            </View>
          )}

          <View style={styles.separator} />

          <View style={styles.fareRow}>
            <Text style={styles.fareTotal}>Total Fare</Text>
            <Text style={styles.fareTotal}>₱{money(fare)}</Text>
          </View>

          {commission > 0 && (
            <>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Platform Commission</Text>
                <Text style={styles.fareValue}>-₱{money(commission)}</Text>
              </View>

              <View style={styles.separator} />

              <View style={styles.fareRow}>
                <Text style={styles.fareTotal}>Total Earnings</Text>
                <Text style={[styles.fareTotal, { color: colors.primary }]}>
                  ₱{money(riderNetAmount)}
                </Text>
              </View>
            </>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleEndRide}>
          <Text style={styles.buttonText}>End Ride</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

export default SuccessfulBooking;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
    },
    image: {
      width: '120%',
      height: 220,
      marginBottom: 20,
      marginTop: '20%',
    },
    successText: {
      fontFamily: 'Poppins Bold',
      fontSize: 16,
      fontWeight: '600',
      color: colors.onSurface,
      textAlign: 'center',
      marginBottom: 20,
    },
    passengerLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    passengerName: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 20,
    },
    summaryBox: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 12,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 2 },
      marginBottom: 20,
    },
    summaryItem: { flex: 1, alignItems: 'center' },
    summaryLabel: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      marginBottom: 4,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    fareBox: {
      width: '100%',
      backgroundColor: colors.surface,
      padding: 15,
      borderRadius: 12,
      marginBottom: 20,
      elevation: 2,
    },
    fareTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
      marginBottom: 10,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    fareLabel: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    fareValue: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    separator: {
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
      marginVertical: 10,
    },
    fareTotal: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.onSurface,
    },
    button: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 30,
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    buttonText: {
      color: colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
