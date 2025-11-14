import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import ServiceModal from './ServiceModal';
import BottomModal from './BottomModal';
import {
  AlertBox,
  AppMap,
  RiderFoundAlertBox,
  SuccessAlertBox,
} from '@/Components';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { AppUtil, Constants } from '@/Utils';
import PaymentMethodModal from './PaymentMethodModal';
import usePostRequest from '@/Services/Api';
import BookingStatusModal from './BookingStatusModal';

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [modalHeight, setModalHeight] = useState(0);

  // Parse initial map location
  const initialLat = 14.5995;
  const initialLong = 120.9842;

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const riderAlertShownRef = useRef(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Cash');

  const statusMessages = {
    0: 'Waiting for the Rider to accept your Booking',
    1: 'Your Rider will arrive soon',
    2: 'In transit, Don’t Use your Phone',
  };

  const riderFoundTimeout = useRef(null);
  const successShownRef = useRef(false);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  const [isBooked, setIsBooked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const inquireBooking = usePostRequest();
  const [inquireBookingResponse, setInquireBookingResponse] = useState([]);
  const createBooking = usePostRequest();
  const [bookingDetails, setBookingDetails] = useState([]);
  const updateBookingStatus = usePostRequest();
  const getBookingDetails = usePostRequest();
  const [bookingStatus, setBookingStatus] = useState(0);
  const [riderDetails, setRiderDetails] = useState(null);
  const isLoading = inquireBooking.loading || createBooking.loading;
  const [showWaitingBanner, setShowWaitingBanner] = useState(false);

  const onBookPressed = () => {
    setShowServiceModal(true);
    riderFoundTimeout.current = setTimeout(() => {
      // setShowRiderFound(true);
    }, 15000);
  };

  const handleTopRightPress = () => {
    navigation.navigate('SettingsScreen');
  };

  useEffect(() => {
    AppUtil.debugDeep(userInfo.wallet_details.user_type);
    if (!successShownRef.current) {
      setShowSuccess(true);
      successShownRef.current = true;
    }
    return () => {
      if (riderFoundTimeout.current) {
        clearTimeout(riderFoundTimeout.current);
      }
    };
  }, []);

  //INQUIRE BOOKING
  const triggerInquireBooking = () => {
    const postdata = {
      booking_type: selectedService?.id,
      pickup_location: pickupLocation?.address,
      pickup_lat: pickupLocation?.lat,
      pickup_long: pickupLocation?.long,
      dropoff_location: dropoffLocation?.address,
      dropoff_lat: dropoffLocation?.lat,
      dropoff_long: dropoffLocation?.long,
    };
    inquireBooking.makePostRequest(
      Constants.ENDPOINT.INQUIRE_BOOKING,
      postdata,
    );
  };

  const handleInquireBookingRequest = () => {
    if (inquireBooking.error) {
      setAlertMessage(inquireBooking.error);
      setShowAlert(true);
      return;
    }

    if (!inquireBooking.response) {
      return;
    }

    const results = inquireBooking?.response;
    AppUtil.debugDeep(results?.data);

    if (results?.code === 200) {
      setInquireBookingResponse(results.data);
      setIsBooked(true);
    }
  };

  useEffect(() => {
    handleInquireBookingRequest();
  }, [inquireBooking.response, inquireBooking.error]);

  //CREATE BOOKING
  const triggerCreateBooking = () => {
    const payment_details = {
      type: selectedPayment.toLowerCase(),
      distance_km_round: inquireBookingResponse.distance_km_round,
      minimum_fare: inquireBookingResponse.minimum_fare,
      pesos_per_km: inquireBookingResponse.pesos_per_km,
      booking_fee: inquireBookingResponse.booking_fee,
      base_amount: inquireBookingResponse.base_amount,
      commission: inquireBookingResponse.commission,
      rider_net_amount: inquireBookingResponse.rider_net_amount,
      tip: 0, // until tip is added make sure this is 0, also add thsi to total_amount
      total_amount: inquireBookingResponse.total_amount,
    };
    const postdata = {
      booking_type: selectedService?.id,
      pickup_location: pickupLocation?.address,
      pickup_lat: pickupLocation?.lat,
      pickup_long: pickupLocation?.long,
      dropoff_location: dropoffLocation?.address,
      dropoff_lat: dropoffLocation?.lat,
      dropoff_long: dropoffLocation?.long,
      payment_type: selectedPayment.toLowerCase(),
      note_to_rider: 'test',
      payment_details: JSON.stringify(payment_details),
    };
    createBooking.makePostRequest(Constants.ENDPOINT.CREATE_BOOKING, postdata);
  };

  const handleCreateBookingRequest = () => {
    if (createBooking.error) {
      setAlertMessage(createBooking.error);
      setShowAlert(true);
      return;
    }

    if (!createBooking.response) {
      return;
    }

    const results = createBooking?.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      setIsConfirmed(true);
      setBookingDetails(results?.data);
      setShowWaitingBanner(true);
    }
  };

  useEffect(() => {
    handleCreateBookingRequest();
  }, [createBooking.response, createBooking.error]);

  //GET BOOKING DETAILS
  const triggeGetBookingDetails = () => {
    const postdata = {
      booking_id: bookingDetails?.id,
    };
    getBookingDetails.makePostRequest(
      Constants.ENDPOINT.GET_BOOKING_DETAILS,
      postdata,
    );
  };

  const handleGetBookingDetails = () => {
    if (getBookingDetails.error) {
      setAlertMessage(getBookingDetails.error);
      setShowAlert(true);
      return;
    }

    const response = getBookingDetails.response;
    if (!response) {
      return;
    }

    const { code, data } = response;
    AppUtil.debugDeep(response);

    if (code === 200 && data) {
      const { status, rider_details } = data;

      setBookingStatus(status);

      if (status === 1) {
        setRiderDetails(rider_details);
        if (!riderAlertShownRef.current) {
          setShowRiderFound(true);
          riderAlertShownRef.current = true;
        }
      }
      if (status === 3) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RatingScreen',
              params: { bookingDetails: data },
            },
          ],
        });
      }
    }
  };

  useEffect(() => {
    handleGetBookingDetails();
  }, [getBookingDetails.response, getBookingDetails.error]);

  // Poll booking details when confirmed
  useEffect(() => {
    if (!bookingDetails?.id) {
      return;
    }

    let intervalId;
    const intervalTime = bookingStatus === 0 ? 1000 : 5000;

    intervalId = setInterval(() => {
      triggeGetBookingDetails();
    }, intervalTime);

    return () => {
      clearInterval(intervalId);
    };
  }, [bookingStatus, bookingDetails?.id]);

  //UPDATE BOOKING STATUS
  const triggerUpdateBookingStatus = () => {
    const postdata = {
      booking_id: bookingDetails?.id,
      status: '4',
    };
    updateBookingStatus.makePostRequest(
      Constants.ENDPOINT.UPDATE_BOOKING_STATUS,
      postdata,
    );
  };

  const handleUpdateBookingStatus = () => {
    if (updateBookingStatus.error) {
      setAlertMessage(updateBookingStatus.error);
      setShowAlert(true);
      return;
    }

    if (!updateBookingStatus.response) {
      return;
    }

    const results = updateBookingStatus.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      setIsConfirmed(false);
      setIsBooked(false);
      riderAlertShownRef.current = false;
      setBookingStatus(0);
    }
  };

  useEffect(() => {
    handleUpdateBookingStatus();
  }, [updateBookingStatus.response, updateBookingStatus.error]);

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
        <AppMap
          initialLat={initialLat}
          initialLong={initialLong}
          firstMarkerLat={pickupLocation?.lat}
          firstMarkerLong={pickupLocation?.long}
          secondMarkerLat={dropoffLocation?.lat}
          secondMarkerLong={dropoffLocation?.long}
          interactive
          style={styles.map}
        />

        <TouchableOpacity
          style={styles.profileButton}
          onPress={handleTopRightPress}>
          <Image
            source={require('@/Assets/Common/HomeScreen/Profile_Icon_1.png')}
            style={styles.iconImage}
          />
        </TouchableOpacity>

        <RiderFoundAlertBox
          visible={showRiderFound}
          onClose={() => setShowRiderFound(false)}
          riderName={
            riderDetails
              ? `${riderDetails.first_name} ${riderDetails.last_name}`
              : ''
          }
          plateNumber={riderDetails?.vehicle_details?.[0]?.plate_number || ''}
          vehicle={
            riderDetails?.vehicle_details?.[0]
              ? `${riderDetails.vehicle_details[0].brand} ${riderDetails.vehicle_details[0].model}`
              : ''
          }
          imageSource={
            riderDetails?.motorcyle_img
              ? { uri: riderDetails.vehicle_details?.[0]?.motorcyle_img }
              : require('@/Assets/Common/Sample_Profile.png')
          }
        />

        {showSuccess && (
          <SuccessAlertBox
            visible={showSuccess}
            onClose={() => setShowSuccess(false)}
            imageSource={require('@/Assets/Common/Check.png')}
            title="Success"
            message="You are now successfully Login."
          />
        )}

        {showWaitingBanner && (
          <View style={[styles.banner, { bottom: modalHeight + 15 }]}>
            <Text style={styles.bannerText}>
              {statusMessages[bookingStatus] || ''}
            </Text>
          </View>
        )}

        {(bookingStatus === 0 || bookingStatus === 4) && (
          <BottomModal
            onLayout={e => setModalHeight(e.nativeEvent.layout.height)}
            selectedService={selectedService}
            onBookPressed={onBookPressed}
            pickup={pickupLocation}
            dropoff={dropoffLocation}
            onPickupChange={setPickupLocation}
            onDropoffChange={setDropoffLocation}
            onChangeService={() => setShowServiceModal(true)}
            onInquireBooking={triggerInquireBooking}
            onCreateBooking={triggerCreateBooking}
            onCancelBooking={() => {
              triggerUpdateBookingStatus();
            }}
            isBooked={isBooked}
            isConfirmed={isConfirmed}
            showPaymentModal={showPaymentModal}
            setShowPaymentModal={setShowPaymentModal}
            selectedPayment={selectedPayment}
            inquireBookingResponse={inquireBookingResponse}
            isLoading={isLoading}
          />
        )}

        {bookingStatus !== 0 && (
          <BookingStatusModal
            onLayout={e => setModalHeight(e.nativeEvent.layout.height)}
            visible={bookingStatus !== 0}
            riderDetails={riderDetails}
            bookingDetails={bookingDetails}
            bookingStatus={bookingStatus}
            pickup={pickupLocation}
            dropoff={dropoffLocation}
          />
        )}

        {showPaymentModal && (
          <PaymentMethodModal
            onClose={() => setShowPaymentModal(false)}
            selectedPayment={selectedPayment}
            onSelect={method => {
              setSelectedPayment(method);
              setShowPaymentModal(false);
            }}
          />
        )}

        <ServiceModal
          visible={showServiceModal}
          onClose={() => setShowServiceModal(false)}
          onSelect={service => {
            setSelectedService(service);
            setShowServiceModal(false);
          }}
        />
      </View>
    </>
  );
};

export default HomeScreen;

const { width, height } = Dimensions.get('window');

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
    },
    map: {
      flex: 1,
      width,
      height,
    },
    profileButton: {
      position: 'absolute',
      top: 60,
      right: 28,
      zIndex: 15,
    },
    iconImage: {
      width: 51,
      height: 51,
      resizeMode: 'contain',
    },
    banner: {
      position: 'absolute',
      left: 20,
      right: 20,
      padding: 12,
      borderRadius: 8,
      backgroundColor: colors.primary,
      alignItems: 'center',
      zIndex: 10,
      elevation: 999,
    },
    bannerText: {
      fontWeight: '600',
      color: colors.onPrimary,
    },
  });
