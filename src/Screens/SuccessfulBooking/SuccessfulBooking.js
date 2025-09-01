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
import { AppUtil } from '@/Utils';
import { Container } from '@/Components';

const SuccessfulBooking = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    AppUtil.debugDeep(route?.params); // debug output
  }, [route]);

  const booking = route?.params;

  // Extract passenger name
  const passengerName = booking?.customer
    ? `${booking.customer.fname} ${booking.customer.mname} ${booking.customer.lname}`
    : '';

  // Estimated time: you may want to calculate it or keep a placeholder
  const estTime = '10 mins'; // Placeholder, replace with your calculation if available

  // Fare and breakdown
  const fare = booking?.payment_details?.total_amount || 0;
  const minimumFare = booking?.payment_details?.minimum_fare || 0;
  const perKm = booking?.payment_details?.pesos_per_km || 0;
  const bookingFee = booking?.payment_details?.booking_fee || 0;

  // Distance
  const distance = booking?.distance_km ? `${booking.distance_km} km` : '0 km';

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

        {/* Ride summary */}
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

        {/* Fare Breakdown */}
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

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('HomeScreen')}>
          <Text style={styles.buttonText}>End Ride</Text>
        </TouchableOpacity>
      </ScrollView>
    </Container>
  );
};

export default SuccessfulBooking;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 20,
  },
  image: {
    width: '90%',
    height: 220,
    marginBottom: 20,
  },
  successText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  passengerLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  summaryBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 20,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  summaryValue: { fontSize: 14, fontWeight: '700', color: '#f1c40f' },
  fareBox: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  fareTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  fareLabel: { fontSize: 14, color: '#444' },
  fareValue: { fontSize: 14, color: '#444' },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginVertical: 10,
  },
  fareTotal: { fontSize: 16, fontWeight: '700' },
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
