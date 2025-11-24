// BookingHistoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { AlertBox } from '@/Components';

const BookingHistoryScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [bookingData, setBookingData] = useState([]); //  Now stores real API data

  const getBookingHistory = usePostRequest();

  useEffect(() => {
    triggerGetBookingHistory();
  }, []);

  const triggerGetBookingHistory = () => {
    getBookingHistory.makePostRequest(Constants.ENDPOINT.GET_BOOKING_HISTORY, {
      customer_id: userInfo.customer_id,
    });
  };

  const handleBookingHistory = () => {
    if (getBookingHistory.error) {
      setAlertMessage(getBookingHistory.error);
      setShowAlert(true);
      return;
    }

    if (!getBookingHistory.response) {
      return;
    }

    const result = getBookingHistory?.response;

    if (result?.code === 200 && result?.data?.bookings) {
      //  Transform API data to match BookingCard format
      const transformedBookings = result.data.bookings.map(booking => ({
        // Original API data (keep for details screen)
        ...booking,

        // Formatted data for BookingCard
        title: getBookingTypeLabel(booking.booking_type),
        image: getBookingTypeImage(booking.booking_type),
        status: booking.pretty_status || getStatusLabel(booking.status),
        destination: booking.dropoff_location,
        date: `${booking.date_created} - ${booking.time_created}`,
        price: booking.payment_details?.total_amount?.toFixed(2) || '0.00',
        bookingId: booking.ref_code,
        pickup: booking.pickup_location,
        paymentMethod: capitalizeFirst(booking.payment_type),
        riderName: getRiderName(booking.rider_details),
        riderRating: booking.booking_ratings?.rate
          ? parseFloat(booking.booking_ratings.rate)
          : null,
      }));

      setBookingData(transformedBookings);
      AppUtil.debugDeep(transformedBookings);
    }
  };

  useEffect(() => {
    handleBookingHistory();
  }, [getBookingHistory.response, getBookingHistory.error]);

  //  Helper functions to transform data
  const getBookingTypeLabel = type => {
    const types = {
      1: 'Motorcycle',
      2: 'Tricycle',
      3: 'Car',
    };
    return types[type] || 'Ride';
  };

  const getBookingTypeImage = type => {
    // Map booking types to images
    const images = {
      1: require('@/Assets/Common/HomeScreen/Motorcycle.png'),
      2: require('@/Assets/Common/HomeScreen/Motorcycle.png'), // Update with tricycle image if you have one
      3: require('@/Assets/Common/HomeScreen/Motorcycle.png'), // Update with car image if you have one
    };
    return images[type] || require('@/Assets/Common/HomeScreen/Motorcycle.png');
  };

  const getStatusLabel = status => {
    const statuses = {
      0: 'Pending',
      1: 'Accepted',
      2: 'On the way',
      3: 'Completed',
      4: 'Cancelled',
    };
    return statuses[status] || 'Unknown';
  };

  const capitalizeFirst = str => {
    if (!str) {return '';}
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getRiderName = riderDetails => {
    if (!riderDetails || Object.keys(riderDetails).length === 0) {
      return 'No rider assigned';
    }

    const { first_name = '', middle_name = '', last_name = '' } = riderDetails;
    const fullName = `${first_name} ${middle_name} ${last_name}`.trim();
    return fullName || 'Unknown Rider';
  };

  const handleRebook = item => {
    // Navigate back to home with pre-filled data
    navigation.navigate('HomeScreen', {
      rebookData: {
        pickup: {
          address: item.pickup_location,
          lat: item.pickup_lat,
          long: item.pickup_long,
        },
        dropoff: {
          address: item.dropoff_location,
          lat: item.dropoff_lat,
          long: item.dropoff_long,
        },
        bookingType: item.booking_type,
      },
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleCardPress = item => {
    navigation.navigate('BookingDetailsScreen', { bookingDetails: item });
  };

  const renderCards = ({ item }) => (
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

  //  Show loading state
  if (getBookingHistory.loading) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <Image
                source={require('@/Assets/Common/Back_2.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Booking History</Text>
            <View style={styles.spacing} />
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  //  Show empty state
  if (bookingData.length === 0 && !getBookingHistory.loading) {
    return (
      <>
        {alertMessage ? (
          <AlertBox
            title="Error"
            message={alertMessage}
            visible={showAlert}
            setVisible={setShowAlert}
          />
        ) : null}
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
                <Image
                  source={require('@/Assets/Common/Back_2.png')}
                  style={styles.backIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Booking History</Text>
              <View style={styles.spacing} />
            </View>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No booking history yet</Text>
            <Text style={styles.emptySubtext}>
              Your completed and cancelled rides will appear here
            </Text>
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <Image
                source={require('@/Assets/Common/Back_2.png')}
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
          refreshing={getBookingHistory.loading}
          onRefresh={triggerGetBookingHistory}
        />
      </View>
    </>
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
      marginTop: 12,
      paddingBottom: 20,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.shadow,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    emptyText: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      color: colors.shadow,
      marginBottom: 8,
    },
    emptySubtext: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.onSurfaceGrey,
      textAlign: 'center',
    },
  });
