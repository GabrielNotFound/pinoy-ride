import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { openSettings } from 'react-native-permissions';

import BottomModal from './BottomModal';
import { AlertBox, AppMap, OfflineAlertBox } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import PendingBookingModal from './PendingBookingModal';
import VehicleSelectionModal from './VehicleSelectionModal';
import { useLocationWatch } from '@/Hooks/useLocation';
import { ensureLocationPermission } from '@/Utils/Permissions';

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
  const userInfo = useSelector(selectUserInfo);

  const [showOffline, setShowOffline] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [showBooking, setShowBooking] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Vehicle selection state
  const [showVehicleSelection, setShowVehicleSelection] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // ✅ Use location watch hook for real-time location updates
  const {
    location: riderLocation,
    watching,
    error: locationError,
    permissionStatus,
    startWatching,
    stopWatching,
  } = useLocationWatch(false); // Don't start watching immediately

  // Default location
  const defaultLocation = isTesting
    ? MANILA_LOCATION
    : { latitude: 14.53507, longitude: 120.98216 };

  const currentLocation = riderLocation || defaultLocation;
  const locationReady = permissionStatus === 'granted';

  const [showDropoff, setShowDropoff] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(1);

  // ✅ FIXED MARKER LOGIC - Based on bookingStatus from BottomModal
  const showRiderMarker = activeBooking !== null;

  // First marker changes based on status
  const firstMarkerLat =
    bookingStatus === 1 || bookingStatus === 2
      ? activeBooking?.pickup_lat
      : null;

  const firstMarkerLong =
    bookingStatus === 1 || bookingStatus === 2
      ? activeBooking?.pickup_long
      : null;

  // Second marker only shows when going to dropoff (status 3)
  const secondMarkerLat =
    bookingStatus === 3 ? activeBooking?.dropoff_lat : null;
  const secondMarkerLong =
    bookingStatus === 3 ? activeBooking?.dropoff_long : null;

  const getPendingBooking = usePostRequest();
  const acceptBooking = usePostRequest();
  const updateBookingStatus = usePostRequest();

  useEffect(() => {
    AppUtil.debugDeep(userInfo);
    setShowOffline(true);

    if (isTesting) {
      AppUtil.debugDeep('Testing Mode On - turn off if Building');
      return;
    }

    // Request location permission and start watching
    requestLocationAndStartWatching();

    return () => {
      stopWatching();
    };
  }, []);

  // ✅ Request location permission and start watching
  const requestLocationAndStartWatching = async () => {
    const permission = await ensureLocationPermission();

    if (permission === 'granted') {
      startWatching();
    } else if (permission === 'blocked') {
      Alert.alert(
        'Location Required',
        'Location access is blocked. Riders need location enabled to accept bookings. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    } else if (permission === 'denied') {
      Alert.alert(
        'Location Required',
        'Riders need location access to accept and track bookings. Please enable location services.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Try Again',
            onPress: () => requestLocationAndStartWatching(),
          },
        ],
      );
    }
  };

  // ✅ Show location error if any
  useEffect(() => {
    if (locationError && permissionStatus === 'granted') {
      console.warn('⚠️ Location error:', locationError);
      setAlertMessage('Unable to get your location. Using default location.');
      setShowAlert(true);
    }
  }, [locationError, permissionStatus]);

  const triggerGetPendingBooking = async () => {
    // ✅ Check location permission before getting pending bookings
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      Alert.alert(
        'Location Required',
        'Location access is required to view pending bookings.',
        [{ text: 'OK' }],
      );
      return;
    }

    const postdata = {
      rider_id: userInfo?.id,
      current_lat: currentLocation.latitude,
      current_long: currentLocation.longitude,
      booking_type: selectedVehicleId,
    };
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
  const triggerAcceptBooking = async bookingId => {
    // ✅ Check location permission before accepting booking
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      Alert.alert(
        'Location Required',
        'Location access is required to accept bookings.',
        [{ text: 'OK' }],
      );
      return;
    }

    const postdata = {
      rider_id: userInfo?.id,
      booking_id: bookingId,
      current_lat: currentLocation.latitude,
      current_long: currentLocation.longitude,
    };
    acceptBooking.makePostRequest(Constants.ENDPOINT.ACCEPT_BOOKING, postdata);
  };

  const handleAcceptBookingRequest = () => {
    if (acceptBooking.error) {
      setAlertMessage(acceptBooking.error);
      setShowAlert(true);
      return;
    }
    if (!acceptBooking.response) {
      return;
    }

    const results = acceptBooking.response;
    if (results?.code === 200) {
      setActiveBooking(results.data);
      setShowBooking(false);
      setShowDropoff(false);
      setBookingStatus(1); // Reset to status 1 (Going to pickup)
    }
  };

  useEffect(() => {
    handleAcceptBookingRequest();
  }, [acceptBooking.response, acceptBooking.error]);

  /** ───── UPDATE BOOKING STATUS ───── */
  const triggerUpdateBookingStatus = async (bookingId, status) => {
    // ✅ Check location permission before updating status
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      Alert.alert(
        'Location Required',
        'Location access is required to update booking status.',
        [{ text: 'OK' }],
      );
      return;
    }

    const postdata = {
      rider_id: userInfo?.id,
      booking_id: bookingId,
      current_lat: currentLocation.latitude,
      current_long: currentLocation.longitude,
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
    }
  };

  useEffect(() => {
    handleUpdateBookingStatusResponse();
  }, [updateBookingStatus.response, updateBookingStatus.error]);

  /** ───── HANDLERS ───── */
  const handleAccept = booking => {
    setActiveBooking(booking);
    setBookingStatus(1); // Start at status 1
    triggerAcceptBooking(booking.id);
  };

  const handleIgnore = () => {
    if (currentIndex < pendingBookings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowBooking(false);
    }
  };

  const handleUpdateBookingStatus = (booking, newStatus) => {
    setActiveBooking(prev => (prev ? { ...prev, status: newStatus } : prev));
    setBookingStatus(newStatus); // Update local status
    triggerUpdateBookingStatus(booking.id, newStatus);
  };

  const handleVehicleSelect = async vehicle => {
    console.log('Vehicle selected:', vehicle);

    // ✅ Check location permission before viewing bookings
    const permission = await ensureLocationPermission();

    if (permission !== 'granted') {
      if (permission === 'blocked') {
        Alert.alert(
          'Location Required',
          'Location access is blocked. Please enable it in Settings to view bookings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings() },
          ],
        );
      } else {
        Alert.alert(
          'Location Required',
          'Location access is required to view bookings. Please enable location services.',
          [{ text: 'OK' }],
        );
      }
      return;
    }

    setSelectedVehicleId(vehicle.id);
    setShowVehicleSelection(false);
    triggerGetPendingBooking();
    setShowBooking(true);
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
          riderLat={showRiderMarker ? currentLocation.latitude : null}
          riderLong={showRiderMarker ? currentLocation.longitude : null}
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
          onAcceptBooking={setActiveBooking}
          onViewBooking={() => {
            // Show vehicle selection first instead of booking list
            setShowVehicleSelection(true);
          }}
          activeBooking={activeBooking}
          onUpdateStatus={handleUpdateBookingStatus}
          bookingStatus={bookingStatus}
          permissionStatus={permissionStatus}
        />

        <VehicleSelectionModal
          visible={showVehicleSelection}
          onClose={() => setShowVehicleSelection(false)}
          onProceed={handleVehicleSelect}
        />

        <PendingBookingModal
          visible={showBooking}
          onClose={() => setShowBooking(false)}
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
    container: { flex: 1, position: 'relative' },
  });
