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
  clearBookingState,
  selectActiveBooking,
  selectBookingStatus,
  selectDropoffLocation,
  selectHasShownLoginSuccess,
  selectInquireBookingResponse,
  selectIsBooked,
  selectIsConfirmed,
  selectPickupLocation,
  selectRiderDetails,
  selectSelectedService,
  selectUserInfo,
  setActiveBooking,
  setBookingStatus,
  setDropoffLocation,
  setHasShownLoginSuccess,
  setInquireBookingResponse,
  setIsBooked,
  setIsConfirmed,
  setPickupLocation,
  setRiderDetails,
  setSelectedService,
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

  // ✅ Use Redux selectors instead of local state
  const userInfo = useSelector(selectUserInfo);
  const hasShownLoginSuccess = useSelector(selectHasShownLoginSuccess);
  const activeBooking = useSelector(selectActiveBooking);
  const bookingStatus = useSelector(selectBookingStatus);
  const riderDetails = useSelector(selectRiderDetails);
  const pickupLocation = useSelector(selectPickupLocation);
  const dropoffLocation = useSelector(selectDropoffLocation);
  const selectedService = useSelector(selectSelectedService);
  const isBooked = useSelector(selectIsBooked);
  const isConfirmed = useSelector(selectIsConfirmed);
  const inquireBookingResponse = useSelector(selectInquireBookingResponse);

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
  } = useLocationWatch(true);

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

  // Modal states (not persisted)
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  // Selection states (not persisted)
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [noteToRider, setNoteToRider] = useState('');

  // Promo state
  const [availablePromos, setAvailablePromos] = useState([]);

  // 🆕 Rider real-time location state (transient, not persisted in Redux)
  const [riderLocation, setRiderLocation] = useState(null);

  const statusMessages = {
    0: 'Waiting for the Rider to accept your Booking',
    1: 'Your Rider will arrive soon',
    2: "In transit, Don't Use your Phone",
  };

  const riderFoundTimeout = useRef(null);
  const [showWaitingBanner, setShowWaitingBanner] = useState(false);

  // ✅ Ref to distinguish between "Cancel to go back to confirm" vs "Full cancel"
  // When true, handleUpdateBookingStatus will only clear the booking ID,
  // keeping all other details (locations, fare, service, etc.) intact
  const isCancellingToConfirmRef = useRef(false);

  const checkActiveBooking = usePostRequest();
  const [isRestoringBooking, setIsRestoringBooking] = useState(false);

  const inquireBooking = usePostRequest();
  const createBooking = usePostRequest();
  const updateBookingStatus = usePostRequest();
  const getBookingDetails = usePostRequest();
  const getPromoList = usePostRequest();
  // 🆕 Rider location request instance
  const getRiderLocation = usePostRequest();
  const isLoading = inquireBooking.loading || createBooking.loading;

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

  // ✅ NEW: Check for active booking on app launch (from Redux)
  useEffect(() => {
    AppUtil.debugDeep(userInfo);
    AppUtil.debugDeep(selectedService);

    triggerGetPromoList();

    // ✅ If there's an active booking in Redux, verify it's still valid
    if (activeBooking?.id) {
      console.log('🔄 Found active booking in Redux:', activeBooking.id);
      setIsRestoringBooking(true);

      const postdata = {
        booking_id: activeBooking.id,
      };
      checkActiveBooking.makePostRequest(
        Constants.ENDPOINT.GET_BOOKING_DETAILS,
        postdata,
      );
    }

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

  // ✅ NEW: Handle restored booking response
  const handleRestoredBooking = () => {
    if (checkActiveBooking.error) {
      console.warn(
        '❌ Error fetching active booking:',
        checkActiveBooking.error,
      );
      dispatch(clearBookingState()); // Clear invalid booking
      setIsRestoringBooking(false);
      return;
    }

    if (!checkActiveBooking.response) {
      return;
    }

    const results = checkActiveBooking.response;

    if (results?.code === 200 && results?.data) {
      const booking = results?.data;
      AppUtil.debugDeep(booking);

      // Check if booking is still active
      if (booking.status === 3) {
        console.log('✅ Booking completed, navigating to rating');
        dispatch(clearBookingState());
        setIsRestoringBooking(false);

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'RatingScreen',
              params: { bookingDetails: booking },
            },
          ],
        });
        return;
      }

      if (booking.status === 4) {
        console.log('✅ Booking cancelled');
        dispatch(clearBookingState());
        setIsRestoringBooking(false);
        return;
      }

      // ✅ Update Redux with latest booking data
      console.log('✅ Restoring active booking state');
      dispatch(setActiveBooking(booking));
      dispatch(setBookingStatus(booking.status));
      dispatch(setIsConfirmed(true));
      dispatch(setIsBooked(true));
      setShowWaitingBanner(true);

      // Restore rider details if available
      if (booking.rider_details) {
        dispatch(setRiderDetails(booking.rider_details));

        // Show rider found alert if status is 1
        if (booking.status === 1 && !riderAlertShownRef.current) {
          AppUtil.debugDeep(riderDetails);
          setShowRiderFound(true);
          riderAlertShownRef.current = true;
        }
      }
    } else {
      // No active booking found or error
      dispatch(clearBookingState());
    }

    setIsRestoringBooking(false);
  };

  useEffect(() => {
    handleRestoredBooking();
  }, [checkActiveBooking.response, checkActiveBooking.error]);

  // GET PROMO LIST
  const triggerGetPromoList = () => {
    const postdata = {};
    getPromoList.makePostRequest(Constants.ENDPOINT.GET_PROMO_LIST, postdata);
  };

  const handleGetPromoList = () => {
    if (getPromoList.error) {
      console.warn('Error fetching promo list:', getPromoList.error);
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
      promo_id: selectedPromo?.id || '',
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
      // ✅ Save to Redux instead of local state
      dispatch(setInquireBookingResponse(results.data));
      dispatch(setIsBooked(true));
    }
  };

  useEffect(() => {
    handleInquireBookingRequest();
  }, [inquireBooking.response, inquireBooking.error]);

  //CREATE BOOKING
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

    const all_payment_details = inquireBookingResponse;

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
      all_payment_details: JSON.stringify(all_payment_details),
      promo_code: selectedPromo?.code || '',
      promo_id: selectedPromo?.id || '',
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
      // ✅ Save to Redux (automatically persisted)
      dispatch(setIsConfirmed(true));
      dispatch(setActiveBooking(results?.data));
      setShowWaitingBanner(true);
    }
  };

  useEffect(() => {
    handleCreateBookingRequest();
  }, [createBooking.response, createBooking.error]);

  //GET BOOKING DETAILS
  const triggerGetBookingDetails = () => {
    const postdata = {
      booking_id: activeBooking?.id,
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

    if (code === 200 && data) {
      const { status, rider_details } = data;

      // ✅ Update Redux
      dispatch(setBookingStatus(status));
      AppUtil.debugDeep(rider_details);

      if (status === 1) {
        dispatch(setRiderDetails(rider_details));
        if (!riderAlertShownRef.current) {
          setShowRiderFound(true);
          riderAlertShownRef.current = true;
        }
      }
      if (status === 3) {
        // ✅ Clear Redux state when completed
        dispatch(clearBookingState());
        // 🆕 Clear rider location when booking is completed
        setRiderLocation(null);

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
    if (!activeBooking?.id) {
      return;
    }

    let intervalId;
    const intervalTime = bookingStatus === 0 ? 1000 : 2000;

    intervalId = setInterval(() => {
      triggerGetBookingDetails();
    }, intervalTime);

    return () => {
      clearInterval(intervalId);
    };
  }, [bookingStatus, activeBooking?.id]);

  //UPDATE BOOKING STATUS
  const triggerUpdateBookingStatus = () => {
    const postdata = {
      customer_id: userInfo?.id, // ✅ added missing customer_id
      booking_id: activeBooking?.id,
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
      // ✅ Check if this cancel was triggered by "go back to confirm" or a full cancel
      if (isCancellingToConfirmRef.current) {
        // Coming back to confirm screen — only clear the booking ID so a new
        // one can be created on next Confirm press. Keep everything else intact:
        // selectedService, pickupLocation, dropoffLocation, inquireBookingResponse,
        // selectedPayment, selectedPromo, noteToRider all stay as-is.
        console.log('🔄 Cancelled booking to return to confirm screen');
        dispatch(setActiveBooking(null));
        dispatch(setIsConfirmed(false));
        dispatch(setIsBooked(true)); // keep fare breakdown visible
        setShowWaitingBanner(false);
        isCancellingToConfirmRef.current = false; // reset the flag
      } else {
        // Full cancel — clear everything and go back to the start
        console.log('🗑️ Full booking cancel');
        dispatch(clearBookingState());
        riderAlertShownRef.current = false;
        setShowWaitingBanner(false);
        // Reset selections
        setSelectedPromo(null);
        setNoteToRider('');
        // 🆕 Clear rider location when booking is cancelled
        setRiderLocation(null);
      }
    }
  };

  useEffect(() => {
    handleUpdateBookingStatus();
  }, [updateBookingStatus.response, updateBookingStatus.error]);

  // 🆕 GET RIDER LOCATION
  const triggerGetRiderLocation = () => {
    const postdata = {
      customer_id: userInfo?.id,
      booking_id: activeBooking?.id,
    };
    getRiderLocation.makePostRequest(
      Constants.ENDPOINT.GET_RIDER_LOCATION,
      postdata,
    );
  };

  // 🆕 Handle rider location response
  const handleGetRiderLocation = () => {
    if (getRiderLocation.error) {
      console.warn('Error fetching rider location:', getRiderLocation.error);
      return;
    }

    if (!getRiderLocation.response) {
      return;
    }

    const results = getRiderLocation.response;

    if (results?.code === 200 && results?.data) {
      setRiderLocation({
        lat: results.data.current_lat,
        long: results.data.current_long,
      });
      console.log(
        '📍 Rider location updated:',
        results.data.current_lat,
        results.data.current_long,
      );
    }
  };

  useEffect(() => {
    handleGetRiderLocation();
  }, [getRiderLocation.response, getRiderLocation.error]);

  // 🆕 Poll rider location every 30 seconds only when status === 1 (rider on the way to pickup)
  useEffect(() => {
    if (bookingStatus !== 1 || !activeBooking?.id) {
      // Clear rider location when not on status 1
      setRiderLocation(null);
      return;
    }

    // Fetch immediately on status change to 1
    triggerGetRiderLocation();

    const intervalId = setInterval(() => {
      triggerGetRiderLocation();
    }, 30000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [bookingStatus, activeBooking?.id]);

  const handlePromoSelect = promo => {
    setSelectedPromo(promo);
    console.log('Selected promo:', promo);
  };

  const handleNoteSave = note => {
    setNoteToRider(note);
    console.log('Note to rider:', note);
  };

  // ✅ Show loading indicator while restoring
  if (isRestoringBooking) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Checking for active bookings...
          </Text>
        </View>
      </View>
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
        <AppMap
          initialLat={currentLocation.latitude}
          initialLong={currentLocation.longitude}
          locationReady={locationReady}
          firstMarkerLat={pickupLocation?.lat}
          firstMarkerLong={pickupLocation?.long}
          secondMarkerLat={dropoffLocation?.lat}
          secondMarkerLong={dropoffLocation?.long}
          // 🆕 Pass rider location to map (only has value when status === 1)
          riderMarkerLat={riderLocation?.lat}
          riderMarkerLong={riderLocation?.long}
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
              ? `${riderDetails.ekyc_details?.first_name} ${riderDetails.ekyc_details?.last_name}`
              : ''
          }
          plateNumber={riderDetails?.vehicle_details?.[0]?.plate_number || ''}
          vehicle={
            riderDetails?.vehicle_details?.[0]
              ? `${riderDetails.vehicle_details[0].brand} ${riderDetails.vehicle_details[0].model}`
              : ''
          }
          imageSource={
            riderDetails?.ekyc_details?.selfie
              ? { uri: riderDetails.ekyc_details.selfie }
              : require('@/Assets/Common/Default_Profile.png')
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
            onPickupChange={location => dispatch(setPickupLocation(location))}
            onDropoffChange={location => dispatch(setDropoffLocation(location))}
            onChangeService={() => setShowServiceModal(true)}
            onInquireBooking={triggerInquireBooking}
            onCreateBooking={triggerCreateBooking}
            onCancelBooking={() => {
              // Full cancel — clears everything
              triggerUpdateBookingStatus();
              setShowWaitingBanner(false);
            }}
            // ✅ Cancel the booking on the server but keep all form details
            // so the user lands back on the Confirm screen ready to re-confirm
            onBackToConfirm={() => {
              isCancellingToConfirmRef.current = true; // flag for handleUpdateBookingStatus
              triggerUpdateBookingStatus();
            }}
            onBackToEdit={() => {
              dispatch(setIsBooked(false));
              dispatch(setInquireBookingResponse(null));
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

        {bookingStatus !== 0 && bookingStatus !== 4 && (
          <BookingStatusModal
            onLayout={e => setModalHeight(e.nativeEvent.layout.height)}
            visible={bookingStatus !== 0}
            riderDetails={riderDetails}
            bookingDetails={activeBooking}
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
            dispatch(setSelectedService(service));
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.text,
    },
  });
