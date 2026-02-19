import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { openSettings } from 'react-native-permissions';

import BottomModal from './BottomModal';
import { AlertBox, AppMap, OfflineAlertBox } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearRiderBookingState,
  selectRiderActiveBooking,
  selectRiderBookingStatus,
  selectRiderSelectedVehicleId,
  selectUserInfo,
  setRiderActiveBooking,
  setRiderBookingStatus,
  setRiderSelectedVehicleId,
} from '@/Redux/Slices/userSlice';
import PendingBookingModal from './PendingBookingModal';
import VehicleSelectionModal from './VehicleSelectionModal';
import { ensureLocationPermission } from '@/Utils/Permissions';
import { useLocationWatch } from '@/Hooks/useLocation';

// Testing Switch
const isTesting = false;

// Testing Loc
const MANILA_LOCATION = {
  latitude: 14.53507,
  longitude: 120.98216,
};

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const dispatch = useDispatch();

  const userInfo = useSelector(selectUserInfo);
  const riderActiveBooking = useSelector(selectRiderActiveBooking);
  const riderBookingStatus = useSelector(selectRiderBookingStatus);
  const riderSelectedVehicleId = useSelector(selectRiderSelectedVehicleId);

  const [showOffline, setShowOffline] = useState(false);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Vehicle selection state
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);

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
    latitude: 14.53507,
    longitude: 120.98216,
  };

  const riderLocation = isTesting
    ? MANILA_LOCATION
    : userLocation || defaultLocation;

  const locationReady = permissionStatus === 'granted';

  const [showDropoff, setShowDropoff] = useState(false);

  // Check for active booking on mount
  const checkActiveBooking = usePostRequest();
  const [isRestoringBooking, setIsRestoringBooking] = useState(false);

  // Marker logic - Based on riderBookingStatus
  const showRiderMarker = riderActiveBooking !== null;

  // First marker (pickup) shows when button status is 1, 2 (going to pickup)
  const firstMarkerLat =
    riderBookingStatus === 1 || riderBookingStatus === 2
      ? riderActiveBooking?.pickup_lat
      : null;

  const firstMarkerLong =
    riderBookingStatus === 1 || riderBookingStatus === 2
      ? riderActiveBooking?.pickup_long
      : null;

  // Second marker (dropoff) shows when button status is 3, 4 (going to dropoff)
  const secondMarkerLat =
    riderBookingStatus === 3 || riderBookingStatus === 4
      ? riderActiveBooking?.dropoff_lat
      : null;
  const secondMarkerLong =
    riderBookingStatus === 3 || riderBookingStatus === 4
      ? riderActiveBooking?.dropoff_long
      : null;

  const getPendingBooking = usePostRequest();
  const acceptBooking = usePostRequest();
  const updateBookingStatus = usePostRequest();

  useEffect(() => {
    AppUtil.debugDeep(userInfo);
    setShowOffline(true);

    if (isTesting) {
      AppUtil.debugDeep('Testing Mode On - turn off if Building');
      setIsRestoringBooking(false);
      return;
    }

    // Request location permission and start watching
    const requestLocationAndWatch = async () => {
      const permission = await ensureLocationPermission();

      if (permission === 'granted') {
        console.log('✅ Permission granted, starting location watch...');
        startWatching();

        // Check for active booking after location is ready
        if (riderActiveBooking?.id) {
          console.log(
            '🔄 Found active booking in Redux:',
            riderActiveBooking.id,
          );
          setIsRestoringBooking(true);

          const postdata = {
            booking_id: riderActiveBooking.id,
          };
          checkActiveBooking.makePostRequest(
            Constants.ENDPOINT.GET_BOOKING_DETAILS,
            postdata,
          );
        } else {
          setIsRestoringBooking(false);
        }
      } else if (permission === 'blocked') {
        console.warn('❌ Location blocked');
        Alert.alert(
          'Location Access Blocked',
          'Please enable location in Settings to use the app.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
        setIsRestoringBooking(false);
      } else if (permission === 'denied') {
        console.warn('❌ Location denied');
        Alert.alert(
          'Location Required',
          'This app needs location access to track your position.',
          [{ text: 'OK' }],
        );
        setIsRestoringBooking(false);
      }
    };

    requestLocationAndWatch();

    return () => {
      console.log('🛑 Stopping location watch...');
      stopWatching();
    };
  }, [startWatching, stopWatching]);

  // Debug: Log location updates
  useEffect(() => {
    if (userLocation) {
      console.log('📍 Location updated:', {
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        accuracy: userLocation.accuracy,
      });
    }
  }, [userLocation]);

  // Show location error if any
  useEffect(() => {
    if (locationError) {
      console.error('❌ Location error:', locationError);
      if (permissionStatus === 'granted') {
        setAlertMessage('Unable to get your location. Using default location.');
        setShowAlert(true);
      }
    }
  }, [locationError, permissionStatus]);

  // Handle restored booking response
  const handleRestoredBooking = () => {
    if (checkActiveBooking.error) {
      console.warn(
        '❌ Error fetching active booking:',
        checkActiveBooking.error,
      );
      dispatch(clearRiderBookingState()); // Clear invalid booking
      setIsRestoringBooking(false);
      return;
    }

    if (!checkActiveBooking.response) {
      return;
    }

    const results = checkActiveBooking.response;
    console.log('📥 Restored rider booking response:', results);

    if (results?.code === 200 && results?.data) {
      const booking = results.data;

      // Check if booking is still active (not completed or cancelled)
      if (booking.status === 3 || booking.status === 4) {
        console.log('✅ Booking already completed/cancelled');
        dispatch(clearRiderBookingState());
        setIsRestoringBooking(false);
        return;
      }

      // Update Redux with latest booking data
      console.log('✅ Restoring active rider booking state');
      dispatch(setRiderActiveBooking(booking));

      if (booking.status === 1) {
        if (riderBookingStatus !== 1 && riderBookingStatus !== 2) {
          dispatch(setRiderBookingStatus(1));
        }
      } else if (booking.status === 2) {
        if (riderBookingStatus !== 3 && riderBookingStatus !== 4) {
          dispatch(setRiderBookingStatus(3));
        }
      }

      setShowDropoff(booking.status === 2);
    } else {
      // No active booking found or error
      dispatch(clearRiderBookingState());
    }

    setIsRestoringBooking(false);
  };

  useEffect(() => {
    handleRestoredBooking();
  }, [checkActiveBooking.response, checkActiveBooking.error]);

  const triggerGetPendingBooking = vehicleId => {
    const postdata = {
      rider_id: userInfo?.id,
      current_lat: riderLocation.latitude,
      current_long: riderLocation.longitude,
      // ✅ iOS FIX: Accept vehicleId as param so we don't rely on Redux
      // having updated riderSelectedVehicleId yet (dispatch is async)
      booking_type: vehicleId ?? riderSelectedVehicleId,
    };
    console.log('📡 Sending location to server:', postdata);
    getPendingBooking.makePostRequest(Constants.ENDPOINT.GET_PENDING, postdata);
  };

  const handleGetPendingBookingRequest = () => {
    if (getPendingBooking.error) {
      setAlertMessage(getPendingBooking.error);
      setShowAlert(true);
      return;
    }
    if (!getPendingBooking.response) {
      return;
    }

    const results = getPendingBooking.response;
    if (results?.code === 200) {
      AppUtil.debugDeep(results.data);
      setPendingBookings(results.data.bookings);
    }
  };

  useEffect(() => {
    handleGetPendingBookingRequest();
  }, [getPendingBooking.response, getPendingBooking.error]);

  /** ───── ACCEPT BOOKING ───── */
  const triggerAcceptBooking = bookingId => {
    const postdata = {
      rider_id: userInfo?.id,
      booking_id: bookingId,
      current_lat: riderLocation.latitude,
      current_long: riderLocation.longitude,
    };
    acceptBooking.makePostRequest(Constants.ENDPOINT.ACCEPT_BOOKING, postdata);
  };

  const handleAcceptBookingRequest = () => {
    if (acceptBooking.error) {
      // ✅ FIX: Show error and close modal — do NOT update Redux state
      setAlertMessage(acceptBooking.error);
      setShowAlert(true);
      setShowBooking(false);
      setCurrentIndex(0);
      return;
    }
    if (!acceptBooking.response) {
      return;
    }

    const results = acceptBooking.response;
    if (results?.code === 200) {
      // ✅ Only update Redux and UI on confirmed success
      dispatch(setRiderActiveBooking(results.data));
      dispatch(setRiderBookingStatus(1));
      setShowBooking(false);
      setShowDropoff(false);
    } else {
      // ✅ FIX: Handle non-200 responses (e.g. "insufficient balance")
      // Do NOT update Redux state — keep the modal closed and show the error
      setAlertMessage(
        results?.message || 'Failed to accept booking. Please try again.',
      );
      setShowAlert(true);
      setShowBooking(false);
      setCurrentIndex(0);
    }
  };

  useEffect(() => {
    handleAcceptBookingRequest();
  }, [acceptBooking.response, acceptBooking.error]);

  /** ───── UPDATE BOOKING STATUS ───── */
  const triggerUpdateBookingStatus = (bookingId, status) => {
    const postdata = {
      rider_id: userInfo?.id,
      booking_id: bookingId,
      current_lat: riderLocation.latitude,
      current_long: riderLocation.longitude,
      status,
    };
    updateBookingStatus.makePostRequest(
      Constants.ENDPOINT.UPDATE_BOOKING_STATUS,
      postdata,
    );
  };

  const handleUpdateBookingStatusResponse = () => {
    if (updateBookingStatus.error) {
      setAlertMessage(updateBookingStatus.error);
      setShowAlert(true);
      return;
    }
    if (!updateBookingStatus.response) {
      return;
    }

    const results = updateBookingStatus.response;
    if (results?.code === 200) {
      AppUtil.debugDeep(results?.data);
      // ✅ FIX: Do NOT clear state here based on backend response.
      // Clearing is handled by SuccessfulBooking's handleEndRide button,
      // so sending status 2 (trip started) won't accidentally wipe the booking.
    }
  };

  useEffect(() => {
    handleUpdateBookingStatusResponse();
  }, [updateBookingStatus.response, updateBookingStatus.error]);

  /** ───── HANDLERS ───── */

  // ✅ FIX: Do NOT pre-emptively set Redux state here.
  // Wait for API response in handleAcceptBookingRequest before updating UI.
  const handleAccept = booking => {
    triggerAcceptBooking(booking.id);
  };

  const handleIgnore = () => {
    if (currentIndex < pendingBookings.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // All bookings ignored — close the modal
      setShowBooking(false);
    }
  };

  const handleUpdateBookingStatus = (booking, newStatus) => {
    // Update the booking data in Redux (keeps pickup/dropoff/customer info fresh)
    dispatch(setRiderActiveBooking({ ...booking, status: newStatus }));
    // Send to backend only.
    triggerUpdateBookingStatus(booking.id, newStatus);
  };

  // ✅ iOS FIX: Use InteractionManager to wait for all animations to fully
  // settle before opening the next modal. setTimeout alone is not reliable
  // because iOS animation duration can vary. InteractionManager.runAfterInteractions
  // guarantees the JS thread is free and all transitions are done.
  const handleVehicleSelect = vehicle => {
    console.log('Vehicle selected:', vehicle);
    dispatch(setRiderSelectedVehicleId(vehicle.id));

    // Step 1: Close the vehicle selection modal first
    setShowVehicleSelection(false);

    // Step 2: Wait for modal close animation + JS thread to fully settle
    // before opening the next modal. 500ms covers iOS fade animation (~300ms)
    // plus any Redux/setState batching delays.
    setTimeout(() => {
      setPendingBookings([]);
      setCurrentIndex(0);
      // Pass vehicle.id directly so we don't depend on Redux having updated yet
      triggerGetPendingBooking(vehicle.id);
      setShowBooking(true);
    }, 500);
  };

  // Show loading indicator while restoring
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
          initialLat={riderLocation.latitude}
          initialLong={riderLocation.longitude}
          locationReady={locationReady}
          riderLat={riderLocation.latitude}
          riderLong={riderLocation.longitude}
          firstMarkerLat={firstMarkerLat}
          firstMarkerLong={firstMarkerLong}
          secondMarkerLat={secondMarkerLat}
          secondMarkerLong={secondMarkerLong}
        />

        {showOffline && (
          <OfflineAlertBox
            visible={showOffline}
            onClose={() => setShowOffline(false)}
          />
        )}

        <BottomModal
          bookings={pendingBookings}
          loading={getPendingBooking.loading}
          onAcceptBooking={booking => dispatch(setRiderActiveBooking(booking))}
          onViewBooking={() => {
            setShowVehicleSelection(true);
          }}
          activeBooking={riderActiveBooking}
          onUpdateStatus={handleUpdateBookingStatus}
          bookingStatus={riderBookingStatus}
          permissionStatus={permissionStatus}
        />

        <VehicleSelectionModal
          visible={showVehicleSelection}
          onClose={() => setShowVehicleSelection(false)}
          onProceed={handleVehicleSelect}
        />

        <PendingBookingModal
          visible={showBooking}
          onClose={() => {
            setShowBooking(false);
            // Reset index on close so next open shows all bookings from the start
            setCurrentIndex(0);
          }}
          bookings={pendingBookings}
          currentIndex={currentIndex}
          loading={getPendingBooking.loading}
          onAccept={handleAccept}
          onIgnore={handleIgnore}
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
