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
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const BookingDetailsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { bookingDetails } = route.params;

  const handleBack = () => navigation.goBack();
  const handleRebook = () =>
    console.log('Rebooking from details:', bookingDetails.destination);
  const handleReportIssue = () =>
    console.log('Reporting issue for booking:', bookingDetails.id);

  const renderStars = rating => (
    <View style={styles.starContainer}>
      {[...Array(5)].map((_, i) => (
        <Icon
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={16}
          color={colors.primary}
          style={styles.starIcon}
        />
      ))}
    </View>
  );

  const data = [{ key: 'infoSection' }];

  const renderItem = () => (
    <View style={styles.infoContainer}>
      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Total Fare w/Discount</Text>
        <Text style={styles.fareValue}>₱{bookingDetails.price}</Text>
      </View>

      <TouchableOpacity style={styles.breakdownButton}>
        <Text style={styles.breakdownText}>View Breakdown</Text>
        <Icon name="chevron-down" size={10} color={colors.blue} />
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.finalFareRow}>
        <Text style={styles.finalFareLabel}>Final Fare</Text>
        <Text style={styles.finalFareValue}>₱{bookingDetails.price}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          <Image
            source={require('@/Assets/Common/LandingScreen/BottomModal/Ellipse_9.png')}
            style={styles.iconSmall}
            resizeMode="contain"
          />
          <Text style={styles.paymentMethodText}>
            {bookingDetails.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.riderRow}>
        <Image
          source={require('@/Assets/Common/Sample_Profile.png')}
          style={styles.profileImage}
        />
        <Text style={styles.riderName}>{bookingDetails.riderName}</Text>
        <View style={styles.riderRatingContainer}>
          <Text style={styles.riderRatingLabel}>Biker Rating</Text>
          {renderStars(bookingDetails.riderRating)}
        </View>
      </View>

      <View style={styles.divider} />

      <Text style={styles.reportIssueText}>
        Have concern or issue about this trip?
      </Text>
      <TouchableOpacity onPress={handleReportIssue}>
        <Text style={styles.reportIssueTextButton}>Report an issue</Text>
      </TouchableOpacity>
    </View>
  );

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

          <View style={styles.headerCenterRow}>
            <Text style={styles.headerDateTime}>
              {bookingDetails.date.split(' - ')[0]} |
            </Text>
            <Text style={[styles.headerDateTime, { marginLeft: 8 }]}>
              {bookingDetails.date.split(' - ')[1]}
            </Text>
          </View>

          <View style={styles.iconButton} />
        </View>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={styles.card}>
            <View style={styles.upperDetails}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      bookingDetails.status === 'Completed'
                        ? colors.completed
                        : colors.cancelled,
                  },
                ]}>
                <Text style={styles.statusText}>{bookingDetails.status}</Text>
              </View>

              <Text style={styles.bookingIdText}>Booking ID:</Text>
              <Text style={styles.bookingIdNumber}>
                {bookingDetails.bookingId}
              </Text>
            </View>

            <View style={styles.locationRow}>
              <Image
                source={require('@/Assets/Common/LandingScreen/BottomModal/Ellipse_5.png')}
                style={styles.iconSmall}
                resizeMode="contain"
              />
              <Text style={styles.locationText}>{bookingDetails.pickup}</Text>
            </View>
            <View style={styles.locationRow}>
              <Image
                source={require('@/Assets/Common/LandingScreen/BottomModal/Ellipse_8.png')}
                style={styles.iconSmall}
                resizeMode="contain"
              />
              <Text style={styles.locationText}>
                {bookingDetails.destination}
              </Text>
            </View>

            <TouchableOpacity style={styles.rebookBtn} onPress={handleRebook}>
              <Text style={styles.rebookText}>Rebook</Text>
            </TouchableOpacity>
          </View>
        }
        data={data}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        contentContainerStyle={styles.scrollViewContent}
      />
    </View>
  );
};

export default BookingDetailsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.onPrimary,
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

    headerCenterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'absolute',
      left: 0,
      right: 0,
    },

    headerDateTime: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 16,
      color: colors.onPrimary,
    },

    iconButton: {
      width: 25,
      marginRight: 10,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerDate: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      fontWeight: '400',
      color: colors.onPrimary,
    },
    headerTime: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      fontWeight: '400',
      color: colors.onPrimary,
      marginLeft: 5,
    },
    scrollViewContent: {
      paddingVertical: 10,
      paddingHorizontal: 16,
    },
    card: {
      backgroundColor: colors.onPrimary,
      marginVertical: 8,
      paddingHorizontal: 32,
      paddingVertical: 23,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
    upperDetails: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoContainer: {
      padding: 10,
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 5,
      marginBottom: 10,
    },
    statusText: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 8,
      color: colors.onPrimary,
    },
    bookingIdText: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 10,
      color: colors.grey4,
    },
    bookingIdNumber: {
      fontFamily: 'Poppins Medium',
      fontWeight: 500,
      fontSize: 12,
      color: colors.shadow,
      marginBottom: 15,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    iconSmall: {
      width: 19,
      height: 19,
      marginRight: 12,
    },
    locationText: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 12,
      color: colors.shadow,
    },
    rebookBtn: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      marginTop: 7,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    rebookText: {
      fontWeight: 400,
      color: colors.onPrimary,
      fontFamily: 'Poppins Regular', // Ensure consistent font
      fontSize: 12,
    },

    // Fare Section
    fareContainer: {
      backgroundColor: colors.onPrimary,
      marginVertical: 8,
      padding: 16,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fareLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey4,
    },
    fareValue: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey4,
    },
    breakdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginBottom: 10,
    },
    breakdownText: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 8,
      color: colors.blue,
      marginRight: 2,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
      marginVertical: 5,
    },
    finalFareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 14,
    },
    finalFareLabel: {
      fontFamily: 'Poppins Regular',
      fontWeight: 'bold',
      fontSize: 12,
      color: colors.shadow,
    },
    finalFareValue: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 12,
      color: colors.grey4,
    },

    // Payment Method Section
    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginVertical: 14,
    },
    paymentLabel: {
      fontFamily: 'Poppins Light',
      fontSize: 12,
      color: colors.shadow,
    },
    paymentMethodContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    paymentIcon: {
      marginRight: 5,
    },
    paymentMethodText: {
      fontFamily: 'Poppins Light',
      fontSize: 12,
      color: colors.shadow,
    },

    // rider Details Section
    riderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginVertical: 16,
    },
    profileImage: {
      width: 33,
      height: 33,
      borderRadius: 30,
      marginRight: 10,
    },
    riderName: {
      fontFamily: 'Poppins Light',
      fontWeight: 400,
      fontSize: 12,
      color: colors.shadow,
      flex: 1, // Take available space
    },
    riderRatingContainer: {
      alignItems: 'flex-end',
    },
    riderRatingLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey4,
      marginBottom: 3,
    },
    starContainer: {
      flexDirection: 'row',
    },
    starIcon: {
      marginHorizontal: 1,
    },
    reportIssueText: {
      fontFamily: 'Poppins Regular',
      fontSize: 10,
      color: colors.shadow,
      marginTop: 5,
    },
    reportIssueTextButton: {
      fontFamily: 'Poppins Regular',
      fontSize: 10,
      color: colors.blue,
    },
  });
