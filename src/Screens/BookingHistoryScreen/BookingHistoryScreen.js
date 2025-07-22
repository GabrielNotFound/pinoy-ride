// BookingHistoryScreen.js
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import BookingCard from './BookingCard';

const BookingHistoryScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const bookingData = [
    {
      id: 1,
      title: 'Motorcycle',
      image: require('@/Assets/Common/LandingScreen/Motorcycle.png'),
      status: 'Completed',
      destination: 'Makati City',
      date: 'July 20, 2025 - 3:30 PM',
      price: '120.00',
      bookingId: '46739523034830',
      pickup: 'Cabuyao City, Laguna, Philippines',
      paymentMethod: 'Cash',
      riderName: 'Juan Dela Cruz',
      riderRating: 4.5,
    },
    {
      id: 2,
      title: 'Motorcycle',
      image: require('@/Assets/Common/LandingScreen/Motorcycle.png'),
      status: 'Cancelled',
      destination: 'Quezon City',
      date: 'July 18, 2025 - 1:00 PM',
      price: '95.00',
      bookingId: '12345678901234',
      pickup: 'Malabon City, Metro Manila, Philippines',
      paymentMethod: 'Cash',
      riderName: 'Maria Santos',
      riderRating: 5.0,
    },
  ];

  const handleRebook = item => {
    console.log('Rebooking ride:', item.destination);
    // Add navigation or logic here
  };

  const handleBack = () => {
    navigation.navigate('LandingScreen'); // Ensure 'LandingScreen' is the correct route name
  };

  // --- NEW: Handle pressing a card to view details ---
  const handleCardPress = item => {
    navigation.navigate('BookingDetailsScreen', { bookingDetails: item });
  };
  // ---------------------------------------------------

  const renderCards = ({ item }) => (
    // Wrap BookingCard in TouchableOpacity to make it clickable
    <TouchableOpacity onPress={() => handleCardPress(item)} activeOpacity={0.8}>
      <BookingCard
        image={item.image}
        title={item.title}
        status={item.status}
        destination={item.destination}
        date={item.date}
        price={item.price}
        onRebook={() => handleRebook(item)}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')} // Make sure this path is correct
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Booking History</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      <FlatList
        data={bookingData}
        keyExtractor={item => item.id.toString()}
        renderItem={renderCards}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default BookingHistoryScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
      // Removed marginBottom to match the flat header from the provided image
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconButton: {
      width: 25,
    },
    spacing: {
      width: 25,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      fontWeight: '400',
      color: colors.onPrimary,
      textAlign: 'center',
      flex: 1,
    },
    listContent: {
      paddingBottom: 20,
    },
  });
