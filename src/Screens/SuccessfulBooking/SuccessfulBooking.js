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

  useEffect(() => {
    AppUtil.debugDeep(route?.params);
  }, [route]);

  const booking = route?.params;

  const passengerName = booking?.customer
    ? `${booking.customer.fname} ${booking.customer.mname} ${booking.customer.lname}`
    : '';

  const estTime = '10 mins';

  const fare = booking?.payment_details?.total_amount || 0;
  const minimumFare = booking?.payment_details?.minimum_fare || 0;
  const perKm = booking?.payment_details?.pesos_per_km || 0;
  const bookingFee = booking?.payment_details?.booking_fee || 0;

  const distance = booking?.distance_km ? `${booking.distance_km} km` : '0 km';

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
            <Text style={styles.fareValue}>₱{minimumFare}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Pesos / km</Text>
            <Text style={styles.fareValue}>₱{perKm}</Text>
          </View>
          <View style={styles.fareRow}>
            <Text style={styles.fareLabel}>Booking Fee</Text>
            <Text style={styles.fareValue}>₱{bookingFee}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotal}>Total</Text>
            <Text style={styles.fareTotal}>₱{fare}</Text>
          </View>
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
