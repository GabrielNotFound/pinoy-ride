import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { openSettings } from 'react-native-permissions';
import BottomModal from './BottomModal';
import {
  AlertBox,
  AppMap,
  RiderFoundAlertBox,
  SuccessAlertBox,
} from '@/Components';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectHasShownLoginSuccess,
  selectUserInfo,
  setHasShownLoginSuccess,
} from '@/Redux/Slices/userSlice';
import { AppUtil, Constants } from '@/Utils';
import usePostRequest from '@/Services/Api';
import ServiceModal from './Components/ServiceModal';
import PaymentMethodModal from './Components/PaymentMethodModal';
import BookingStatusModal from './Components/BookingStatusModal';
import NoteToRiderModal from './Components/NoteToRiderModal';
import PromoModal from './Components/PromoModal';
import { ensureLocationPermission } from '@/Utils/Permissions';
import { useLocationWatch } from '@/Hooks/useLocation';

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);
  const hasShownLoginSuccess = useSelector(selectHasShownLoginSuccess);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [modalHeight, setModalHeight] = useState(0);

  // Use location watch hook for real-time location updates
  const {
    location: userLocation,
    error: locationError,
    permissionStatus,
    startWatching,
    stopWatching,
  } = useLocationWatch(false); // Don't start watching immediately

  // Default location (Manila)
  const defaultLocation = {
    latitude: 14.5995,
    longitude: 120.9842,
  };

  const currentLocation = userLocation || defaultLocation;
  const locationReady = permissionStatus === 'granted';

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const riderAlertShownRef = useRef(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Selection states
  const [selectedPayment, setSelectedPayment] = useState('Wallet');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [noteToRider, setNoteToRider] = useState('');

  // Promo state
  const [availablePromos, setAvailablePromos] = useState([]);

  const statusMessages = {
    0: 'Waiting for the Rider to accept your Booking',
    1: 'Your Rider will arrive soon',
    2: "In transit, Don't Use your Phone",
  };

  const riderFoundTimeout = useRef(null);

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
  const getPromoList = usePostRequest();
  const [bookingStatus, setBookingStatus] = useState(0);
  const [riderDetails, setRiderDetails] = useState(null);
  const isLoading = inquireBooking.loading || createBooking.loading;
  const [showWaitingBanner, setShowWaitingBanner] = useState(false);

  const onBookPressed = async () => {
    // Check location permission before allowing booking
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      if (permission === 'blocked') {
        Alert.alert(
          'Location Required',
          'Location access is blocked. Please enable it in Settings to book a ride.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
      } else {
        Alert.alert(
          'Location Required',
          'Location access is required to book a ride. Please enable location services.',
          [{ text: 'OK' }],
        );
      }
      return;
    }

    setShowServiceModal(true);
    riderFoundTimeout.current = setTimeout(() => {
      // setShowRiderFound(true);
    }, 15000);
  };

  const handleTopRightPress = () => {
    navigation.navigate('SettingsScreen');
  };

  // Request location when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      const permission = await ensureLocationPermission();

      if (permission === 'granted') {
        startWatching();
      } else if (permission === 'blocked') {
        Alert.alert(
          'Location Access Blocked',
          'Please enable location in Settings to use the app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
      } else if (permission === 'denied') {
        Alert.alert(
          'Location Required',
          'This app needs location access to show your position on the map.',
          [{ text: 'OK' }],
        );
      }
    });

    return unsubscribe;
  }, [navigation, startWatching]);

  // Separate useEffect for login success modal - only runs once
  useEffect(() => {
    if (!hasShownLoginSuccess) {
      setShowSuccess(true);
      dispatch(setHasShownLoginSuccess(true));
    }
  }, [hasShownLoginSuccess, dispatch]);

  useEffect(() => {
    AppUtil.debugDeep(userInfo);
    AppUtil.debugDeep(selectedService);

    triggerGetPromoList();

    return () => {
      if (riderFoundTimeout.current) {
        clearTimeout(riderFoundTimeout.current);
      }
      stopWatching();
    };
  }, []);

  // Show location error if any
  useEffect(() => {
    if (locationError && permissionStatus === 'granted') {
      console.warn('Location error:', locationError);
    }
  }, [locationError, permissionStatus]);

  // GET PROMO LIST
  const triggerGetPromoList = () => {
    const postdata = {};
    getPromoList.makePostRequest(Constants.ENDPOINT.GET_PROMO_LIST, postdata);
  };

  const handleGetPromoList = () => {
    if (getPromoList.error) {
      console.warn('Error fetching promo list:', getPromoList.error);
      // Don't show alert here, just log it
      // setAlertMessage(getPromoList.error);
      // setShowAlert(true);
      return;
    }

    if (!getPromoList.response) {
      return;
    }

    const results = getPromoList.response;

    if (results?.code === 200 && results?.data?.promos) {
      setAvailablePromos(results.data.promos);
    }
  };

  useEffect(() => {
    handleGetPromoList();
  }, [getPromoList.response, getPromoList.error]);

  //INQUIRE BOOKING
  const triggerInquireBooking = async () => {
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      Alert.alert(
        'Location Required',
        'Location access is required to inquire booking.',
        [{ text: 'OK' }],
      );
      return;
    }

    const postdata = {
      booking_type: selectedService?.id,
      pickup_location: pickupLocation?.address,
      pickup_lat: pickupLocation?.lat,
      pickup_long: pickupLocation?.long,
      dropoff_location: dropoffLocation?.address,
      dropoff_lat: dropoffLocation?.lat,
      dropoff_long: dropoffLocation?.long,
      promo_code: selectedPromo?.code || '',
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
  const triggerCreateBooking = async () => {
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      Alert.alert(
        'Location Required',
        'Location access is required to create booking.',
        [{ text: 'OK' }],
      );
      return;
    }

    const payment_details = {
      type: selectedPayment.toLowerCase(),
      distance_km_round: inquireBookingResponse.distance_km_round,
      minimum_fare: inquireBookingResponse.minimum_fare,
      pesos_per_km: inquireBookingResponse.pesos_per_km,
      booking_fee: inquireBookingResponse.booking_fee,
      base_amount: inquireBookingResponse.base_amount,
      commission: inquireBookingResponse.commission,
      rider_net_amount: inquireBookingResponse.rider_net_amount,
      promo_discount: inquireBookingResponse.promo_discount,
      tip: 0,
      total_amount_wo_promo: inquireBookingResponse.total_amount_wo_promo,
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
      note_to_rider: noteToRider || '',
      payment_details: JSON.stringify(payment_details),
      promo_code: selectedPromo?.code || '',
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
    const intervalTime = bookingStatus === 0 ? 1000 : 2000;

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
      setBookingDetails(null);
      setRiderDetails(null);
      setShowWaitingBanner(false);
      // Reset selections
      setSelectedPromo(null);
      setNoteToRider('');
    }
  };

  useEffect(() => {
    handleUpdateBookingStatus();
  }, [updateBookingStatus.response, updateBookingStatus.error]);

  const handlePromoSelect = promo => {
    setSelectedPromo(promo);
    console.log('Selected promo:', promo);
  };

  const handleNoteSave = note => {
    setNoteToRider(note);
    console.log('Note to rider:', note);
  };

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
          initialLat={currentLocation.latitude}
          initialLong={currentLocation.longitude}
          locationReady={locationReady}
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
              setShowWaitingBanner(false);
            }}
            onBackToEdit={() => {
              setIsBooked(false);
              setInquireBookingResponse([]);
              setShowWaitingBanner(false);
            }}
            isBooked={isBooked}
            isConfirmed={isConfirmed}
            showPaymentModal={showPaymentModal}
            setShowPaymentModal={setShowPaymentModal}
            setShowPromoModal={setShowPromoModal}
            setShowNoteModal={setShowNoteModal}
            selectedPayment={selectedPayment}
            selectedPromo={selectedPromo}
            noteToRider={noteToRider}
            inquireBookingResponse={inquireBookingResponse}
            isLoading={isLoading}
            permissionStatus={permissionStatus}
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
            selectedService={selectedService}
            onChangeService={() => setShowServiceModal(true)}
          />
        )}

        <PaymentMethodModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          selectedPayment={selectedPayment}
          onSelect={method => {
            setSelectedPayment(method);
          }}
        />

        <PromoModal
          visible={showPromoModal}
          onClose={() => setShowPromoModal(false)}
          onSelect={handlePromoSelect}
          selectedPromo={selectedPromo}
          availablePromos={availablePromos}
          isLoading={getPromoList.loading}
        />

        <NoteToRiderModal
          visible={showNoteModal}
          onClose={() => setShowNoteModal(false)}
          onSave={handleNoteSave}
          initialNote={noteToRider}
        />

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
