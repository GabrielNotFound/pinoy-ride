import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import Geolocation from 'react-native-geolocation-service';

import BottomModal from './BottomModal';
import { AlertBox, AppMap, OfflineAlertBox } from '@/Components';
import usePostRequest from '@/Services/Api';
import { AppUtil, Constants } from '@/Utils';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import PendingBookingModal from './PendingBookingModal';

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

  const [userLocation, setUserLocation] = useState({});
  const [showDropoff, setShowDropoff] = useState(false);

  const [bookingStatus, setBookingStatus] = useState('0'); // 0 = Pending

  const dummyLocation = { lat: '14.542896', long: '120.988921' };

  const initialLat = userLocation?.latitude || userInfo?.current_lat;
  const initialLong = userLocation?.longitude || userInfo?.current_long;
  const showRiderMarker = activeBooking?.status !== 3;

  const firstMarkerLat =
    activeBooking?.status === 2 || activeBooking?.status === 3
      ? activeBooking.pickup_lat
      : activeBooking?.status === 0
      ? activeBooking.dropoff_lat
      : null;

  const firstMarkerLong =
    activeBooking?.status === 2 || activeBooking?.status === 3
      ? activeBooking.pickup_long
      : activeBooking?.status === 0
      ? activeBooking.dropoff_long
      : null;

  const secondMarkerLat =
    activeBooking?.status === 3 ? activeBooking.dropoff_lat : null;
  const secondMarkerLong =
    activeBooking?.status === 3 ? activeBooking.dropoff_long : null;

  const getPendingBooking = usePostRequest();
  const acceptBooking = usePostRequest();
  const updateBookingStatus = usePostRequest();

  useEffect(() => {
    setShowOffline(true);
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    Geolocation.getCurrentPosition(
      pos => {
        setUserLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      error => {
        console.warn(error);
        setAlertMessage('Unable to fetch location');
        setShowAlert(true);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  /** ───── GET PENDING BOOKINGS ───── */
  const triggerGetPendingBooking = () => {
    const postdata = {
      rider_id: userInfo.id,
      current_lat: dummyLocation.lat, // TODO: replace with actual
      current_long: dummyLocation.long,
    };
    getPendingBooking.makePostRequest(Constants.ENDPOINT.GET_PENDING, postdata);
  };

  const handleGetPendingBookingRequest = () => {
    if (getPendingBooking.error) {
      setAlertMessage(getPendingBooking.error);
      setShowAlert(true);
      return;
    }
    if (!getPendingBooking.response) {return;}

    const results = getPendingBooking.response;
    if (results?.code === 200) {
      setPendingBookings(results.data.bookings);
    }
  };

  useEffect(() => {
    handleGetPendingBookingRequest();
  }, [getPendingBooking.response, getPendingBooking.error]);

  /** ───── ACCEPT BOOKING ───── */
  const triggerAcceptBooking = bookingId => {
    const postdata = { rider_id: userInfo.id, booking_id: bookingId };
    acceptBooking.makePostRequest(Constants.ENDPOINT.ACCEPT_BOOKING, postdata);
  };

  const handleAcceptBookingRequest = () => {
    if (acceptBooking.error) {
      setAlertMessage(acceptBooking.error);
      setShowAlert(true);
      return;
    }
    if (!acceptBooking.response) {return;}

    const results = acceptBooking.response;
    if (results?.code === 200) {
      setActiveBooking(results.data);
      setShowBooking(false);
      setShowDropoff(false);
      setBookingStatus(1);
    }
  };

  useEffect(() => {
    handleAcceptBookingRequest();
  }, [acceptBooking.response, acceptBooking.error]);

  /** ───── UPDATE BOOKING STATUS ───── */
  const triggerUpdateBookingStatus = (bookingId, status) => {
    const postdata = {
      rider_id: userInfo.id,
      booking_id: bookingId,
      current_lat: dummyLocation.lat, // TODO: replace with actual
      current_long: dummyLocation.long,
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
    if (!updateBookingStatus.response) {return;}

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

    setBookingStatus(newStatus);
    triggerUpdateBookingStatus(booking.id, newStatus);
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
          initialLat={initialLat}
          initialLong={initialLong}
          riderLat={
            showRiderMarker ? (activeBooking ? dummyLocation.lat : null) : null
          }
          riderLong={
            showRiderMarker ? (activeBooking ? dummyLocation.long : null) : null
          }
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
            triggerGetPendingBooking();
            setShowBooking(true);
          }}
          activeBooking={activeBooking}
          onUpdateStatus={handleUpdateBookingStatus}
          bookingStatus={bookingStatus}
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
    map: { flex: 1, width, height },
    toggleButton: {
      position: 'absolute',
      bottom: 40,
      right: 20,
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      elevation: 4,
    },
    toggleButtonText: {
      color: colors.onPrimary,
      fontFamily: 'Poppins SemiBold',
      fontSize: 14,
    },
  });
