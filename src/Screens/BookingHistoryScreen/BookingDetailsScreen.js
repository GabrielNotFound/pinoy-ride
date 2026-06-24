import React, { useEffect, useState } from 'react';
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
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AlertBox } from '@/Components';
import { AppUtil, Constants } from '@/Utils';
import usePostRequest from '@/Services/Api';
import {
  setDropoffLocation,
  setPickupLocation,
  setSelectedService,
} from '@/Redux/Slices/userSlice';
import ReportIssueModal from './Components/ReportIssueModal';

const BookingDetailsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { bookingDetails } = route.params;

  const [showBreakdown, setShowBreakdown] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportAlertMessage, setReportAlertMessage] = useState('');
  const [reportAlertTitle, setReportAlertTitle] = useState('');
  const [showReportAlert, setShowReportAlert] = useState(false);

  const reportIssue = usePostRequest();

  const handleBack = () => navigation.goBack();

  const getBookingTypeLabel = type => {
    const types = { 1: 'Motorcycle', 2: 'Tricycle', 3: 'Car' };
    return types[type] || 'Ride';
  };

  const handleRebook = () => {
    dispatch(
      setPickupLocation({
        address: bookingDetails.pickup_location,
        lat: bookingDetails.pickup_lat,
        long: bookingDetails.pickup_long,
      }),
    );
    dispatch(
      setDropoffLocation({
        address: bookingDetails.dropoff_location,
        lat: bookingDetails.dropoff_lat,
        long: bookingDetails.dropoff_long,
      }),
    );
    dispatch(
      setSelectedService({
        id: bookingDetails.booking_type,
        title: getBookingTypeLabel(bookingDetails.booking_type),
      }),
    );
    navigation.navigate('HomeScreen');
  };

  const handleReportIssue = () => {
    setShowReportModal(true);
  };

  const handleSubmitIssue = message => {
    reportIssue.makePostRequest(Constants.ENDPOINT.REPORT_AN_ISSUE, {
      booking_id: bookingDetails.id,
      issue: message,
    });
  };

  useEffect(() => {
    if (!reportIssue.response && !reportIssue.error) {
      return;
    }

    if (reportIssue.error) {
      setShowReportModal(false);
      setTimeout(() => {
        setReportAlertTitle('Error');
        setReportAlertMessage(reportIssue.error);
        setShowReportAlert(true);
      }, 1000);
      return;
    }

    if (reportIssue.response?.code === 200) {
      AppUtil.debugDeep(reportIssue.response);
      setShowReportModal(false);
      setTimeout(() => {
        setReportAlertTitle('Report Sent!');
        setReportAlertMessage(reportIssue?.response?.message);
        setShowReportAlert(true);
      }, 1000);
    }
  }, [reportIssue.response, reportIssue.error]);

  const renderStars = rating => {
    const ratingNum = rating ? Math.floor(parseFloat(rating)) : 0;
    return (
      <View style={styles.starContainer}>
        {[...Array(5)].map((_, i) => (
          <Icon
            key={i}
            name={i < ratingNum ? 'star' : 'star-outline'}
            size={16}
            color={colors.primary}
            style={styles.starIcon}
          />
        ))}
      </View>
    );
  };

  const getStatusColor = status => {
    const statusColors = {
      Completed: colors.completed || '#4CAF50',
      Cancelled: colors.cancelled || '#F44336',
      Pending: '#FFA726',
      Accepted: '#42A5F5',
      'On the way': '#66BB6A',
    };
    return statusColors[status] || '#9E9E9E';
  };

  const data = [{ key: 'infoSection' }];

  const renderItem = () => (
    <View style={styles.infoContainer}>
      {/* Fare Section */}
      <View style={styles.fareRow}>
        <Text style={styles.fareLabel}>Total Fare w/Discount</Text>
        <Text style={styles.fareValue}>₱{bookingDetails.price}</Text>
      </View>

      {/* Breakdown Toggle */}
      <TouchableOpacity
        style={styles.breakdownButton}
        onPress={() => setShowBreakdown(!showBreakdown)}>
        <Text style={styles.breakdownText}>
          {showBreakdown ? 'Hide Breakdown' : 'View Breakdown'}
        </Text>
        <Icon
          name={showBreakdown ? 'chevron-up' : 'chevron-down'}
          size={10}
          color={colors.blue}
        />
      </TouchableOpacity>

      {/* Breakdown Details (Collapsible) */}
      {showBreakdown && bookingDetails.payment_details && (
        <View style={styles.breakdownContainer}>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Minimum Fare:</Text>
            <Text style={styles.breakdownValue}>
              ₱{bookingDetails.payment_details.minimum_fare?.toFixed(2)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>
              Distance ({bookingDetails.distance_km} km):
            </Text>
            <Text style={styles.breakdownValue}>
              ₱
              {(
                parseFloat(bookingDetails.distance_km || 0) *
                parseFloat(bookingDetails.payment_details.pesos_per_km || 0)
              ).toFixed(2)}
            </Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Booking Fee:</Text>
            <Text style={styles.breakdownValue}>
              ₱{bookingDetails.payment_details.booking_fee?.toFixed(2)}
            </Text>
          </View>
          {Number(bookingDetails.payment_details.promo_discount) > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Promo Discount:</Text>
              <Text style={styles.breakdownValue}>
                -₱
                {Number(bookingDetails.payment_details.promo_discount).toFixed(
                  2,
                )}
              </Text>
            </View>
          )}
          {bookingDetails.payment_details.tip > 0 && (
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Tip:</Text>
              <Text style={styles.breakdownValue}>
                ₱{bookingDetails.payment_details.tip?.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.divider} />

      {/* Final Fare */}
      <View style={styles.finalFareRow}>
        <Text style={styles.finalFareLabel}>Final Fare</Text>
        <Text style={styles.finalFareValue}>₱{bookingDetails.price}</Text>
      </View>

      <View style={styles.divider} />

      {/* Payment Method */}
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payment Method</Text>
        <View style={styles.paymentMethodContainer}>
          <Image
            source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png')}
            style={styles.iconSmall}
            resizeMode="contain"
          />
          <Text style={styles.paymentMethodText}>
            {bookingDetails.paymentMethod}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Rider Details */}
      {bookingDetails.riderName !== 'No rider assigned' && (
        <>
          <View style={styles.riderRow}>
            <Image
              source={
                bookingDetails.rider_details?.selfie
                  ? { uri: bookingDetails.rider_details.selfie }
                  : require('@/Assets/Common/Sample_Profile.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.riderName}>{bookingDetails.riderName}</Text>
            <View style={styles.riderRatingContainer}>
              <Text style={styles.riderRatingLabel}>Rider Rating</Text>
              {bookingDetails.riderRating ? (
                renderStars(bookingDetails.riderRating)
              ) : (
                <Text style={styles.noRatingText}>No rating yet</Text>
              )}
            </View>
          </View>
          <View style={styles.divider} />
        </>
      )}

      {/* Report Issue */}
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
      <ReportIssueModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitIssue}
        loading={reportIssue.loading}
      />

      {reportAlertMessage ? (
        <AlertBox
          title={reportAlertTitle}
          message={reportAlertMessage}
          visible={showReportAlert}
          setVisible={setShowReportAlert}
        />
      ) : null}

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
          <Text style={styles.headerTitle}>Booking Details</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Content */}
      <FlatList
        ListHeaderComponent={
          <View style={styles.card}>
            {/* Status Badge */}
            <View style={styles.upperDetails}>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: getStatusColor(bookingDetails.status),
                  },
                ]}>
                <Text style={styles.statusText}>{bookingDetails.status}</Text>
              </View>

              {/* Booking ID */}
              <Text style={styles.bookingIdText}>Booking ID:</Text>
              <Text style={styles.bookingIdNumber}>
                {bookingDetails.bookingId || bookingDetails.ref_code}
              </Text>
            </View>

            {/* Pickup Location */}
            <View style={styles.locationRow}>
              <Image
                source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
                style={styles.iconSmall}
                resizeMode="contain"
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {bookingDetails.pickup || bookingDetails.pickup_location}
              </Text>
            </View>

            {/* Dropoff Location */}
            <View style={styles.locationRow}>
              <Image
                source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
                style={styles.iconSmall}
                resizeMode="contain"
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {bookingDetails.destination || bookingDetails.dropoff_location}
              </Text>
            </View>

            {/* Rebook Button - Only show for completed rides */}
            {bookingDetails.status === 'Completed' && (
              <TouchableOpacity style={styles.rebookBtn} onPress={handleRebook}>
                <Text style={styles.rebookText}>Rebook</Text>
              </TouchableOpacity>
            )}
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
      fontWeight: '400',
      fontSize: 10,
      color: colors.grey4,
    },
    bookingIdNumber: {
      fontFamily: 'Poppins Medium',
      fontWeight: '500',
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
      fontWeight: '400',
      fontSize: 12,
      color: colors.shadow,
      flex: 1,
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
      fontWeight: '400',
      color: colors.onPrimary,
      fontFamily: 'Poppins Regular',
      fontSize: 12,
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
      marginVertical: 10,
    },
    breakdownText: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 8,
      color: colors.blue,
      marginRight: 2,
    },
    breakdownContainer: {
      backgroundColor: colors.background || '#F5F5F5',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    breakdownRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    breakdownLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 11,
      color: colors.shadow,
    },
    breakdownValue: {
      fontFamily: 'Poppins Medium',
      fontSize: 11,
      color: colors.shadow,
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
      fontWeight: '400',
      fontSize: 12,
      color: colors.grey4,
    },
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
    paymentMethodText: {
      fontFamily: 'Poppins Light',
      fontSize: 12,
      color: colors.shadow,
    },
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
      fontWeight: '400',
      fontSize: 12,
      color: colors.shadow,
      flex: 1,
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
    noRatingText: {
      fontFamily: 'Poppins Regular',
      fontSize: 10,
      color: colors.grey4,
      fontStyle: 'italic',
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
