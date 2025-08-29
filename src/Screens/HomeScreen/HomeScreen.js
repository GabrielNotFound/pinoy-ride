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
  const [showDropoff, setShowDropoff] = useState(false); // NEW toggle state

  const dummyLocation = { lat: '14.542896', long: '120.988921' };

  const initialLat = userLocation?.latitude || userInfo?.current_lat;
  const initialLong = userLocation?.longitude || userInfo?.current_long;

  const getPendingBooking = usePostRequest();
  const acceptBooking = usePostRequest();

  useEffect(() => {
    setShowOffline(true);
    AppUtil.debugDeep(userInfo);
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

  const triggerGetPendingBooking = () => {
    const postdata = {
      rider_id: userInfo.id,
      current_lat: dummyLocation.lat,
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

    if (!getPendingBooking.response) {
      return;
    }

    const results = getPendingBooking.response;
    AppUtil.debugDeep(results);
    if (results?.code === 200) {
      setPendingBookings(results.data.bookings);
    }
  };

  useEffect(() => {
    handleGetPendingBookingRequest();
  }, [getPendingBooking.response, getPendingBooking.error]);

  const triggerAcceptBooking = bookingId => {
    const postdata = {
      rider_id: userInfo.id,
      booking_id: bookingId,
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
    AppUtil.debugDeep(results);

    if (results?.code === 200 && results.data) {
      setActiveBooking(results.data);
      setShowBooking(false);
      setShowDropoff(false); // reset toggle → always start at pickup
    }
  };

  useEffect(() => {
    handleAcceptBookingRequest();
  }, [acceptBooking.response, acceptBooking.error]);

  const handleAccept = booking => {
    triggerAcceptBooking(booking.id);
  };

  const handleIgnore = () => {
    if (currentIndex < pendingBookings.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowBooking(false); // no more bookings
    }
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
          riderLat={activeBooking ? dummyLocation.lat : null}
          riderLong={activeBooking ? dummyLocation.long : null}
          firstMarkerLat={
            showDropoff ? activeBooking?.dropoff_lat : activeBooking?.pickup_lat
          }
          firstMarkerLong={
            showDropoff
              ? activeBooking?.dropoff_long
              : activeBooking?.pickup_long
          }
        />

        {activeBooking && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={() => setShowDropoff(!showDropoff)}>
            <Text style={styles.toggleButtonText}>
              {showDropoff ? 'Show Pickup' : 'Show Dropoff'}
            </Text>
          </TouchableOpacity>
        )}

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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.3)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    alertBox: {
      backgroundColor: colors.onPrimary,
      padding: 20,
      borderRadius: 12,
      width: '80%',
      alignItems: 'center',
    },
    alertName: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 16,
      marginBottom: 10,
    },
    alertAmount: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      marginVertical: 10,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginTop: 15,
    },
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
