import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';

import BottomModal from './BottomModal';
import { AlertBox, AppMap, OfflineAlertBox } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import PendingBookingModal from './PendingBookingModal';
import VehicleSelectionModal from './VehicleSelectionModal';

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

  // ✅ State for rider's location - starts with Manila in testing mode
  const [riderLocation, setRiderLocation] = useState(
    isTesting ? MANILA_LOCATION : { latitude: 14.53507, longitude: 120.98216 },
  );

  const [showDropoff, setShowDropoff] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(1); // Start at 1 when booking accepted

  // ✅ FIXED MARKER LOGIC - Based on bookingStatus from BottomModal
  const showRiderMarker = activeBooking !== null; // Always show rider when there's a booking

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

    getUserLocation();

    const watchId = Geolocation.watchPosition(
      pos => {
        setRiderLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => console.warn('Location watch error:', error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 5000,
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  }, []);

  const getUserLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        setRiderLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => {
        console.warn('⚠️ Location error:', error);
        setAlertMessage('Unable to get your location. Using default location.');
        setShowAlert(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const triggerGetPendingBooking = () => {
    const postdata = {
      rider_id: userInfo?.id,
      current_lat: riderLocation.latitude,
      current_long: riderLocation.longitude,
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

  const handleVehicleSelect = vehicle => {
    console.log('Vehicle selected:', vehicle);
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
          initialLat={riderLocation.latitude}
          initialLong={riderLocation.longitude}
          riderLat={showRiderMarker ? riderLocation.latitude : null}
          riderLong={showRiderMarker ? riderLocation.longitude : null}
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
