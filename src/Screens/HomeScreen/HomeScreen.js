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

// ✅ How often to refresh pending bookings while the modal is open (ms)
const POLL_INTERVAL_MS = 5000;

// ✅ How often to push rider location to backend while in transit (ms)
const LOCATION_UPDATE_INTERVAL_MS = 15000;

// ✅ Module-level flag (NOT component state) — persists across HomeScreen
// mount/unmount and navigation.reset() calls within the same app session,
// but resets to false on a real app restart (cold start re-evaluates this
// module). This gives us "show only on first app open" semantics, instead
// of component state which re-fires on every HomeScreen mount — including
// the remount caused by navigation.reset() after ending a ride, which
// previously made it look like the rider had been kicked back offline.
let hasShownOfflineAlertThisSession = false;

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

  // ✅ POLLING FIX: Track whether the pending booking fetch is the first one
  // (triggered by vehicle selection) or a background poll. Loading UI is only
  // shown on the first fetch — silent on all subsequent polls.
  const isInitialBookingFetch = useRef(false);

  // ✅ NEW: Booking IDs the rider has ignored during this app session.
  // Deliberately a plain useRef (NOT Redux, NOT AsyncStorage) — nothing here
  // is persisted to disk. That means a real app restart wipes this set
  // completely, so bookings the rider ignored will be visible again after
  // restart. Within the same session, though, an ignored booking stays
  // filtered out so it doesn't keep popping back up on every poll.
  const ignoredBookingIdsRef = useRef(new Set());

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

  // ✅ NEW: Hook for pushing rider location to backend
  const updateRiderLocation = usePostRequest();

  // ✅ NEW: Pinoy Rider Credit balance for the BottomModal home view.
  // Sourced from GET_RIDER_DETAILS, same endpoint/shape WalletScreen uses
  // (pr_wallet_details is a sibling of wallet_details in that response).
  const getRiderDetails = usePostRequest();
  const [prCreditBalance, setPrCreditBalance] = useState(null);

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
  const ignoreBooking = usePostRequest();
  const getServiceDetails = usePostRequest();
  const [serviceDetails, setServiceDetails] = useState(null);

  const triggerGetServiceDetails = () => {
    const postdata = { rider_id: userInfo?.id };
    getServiceDetails.makePostRequest(
      Constants.ENDPOINT.GET_SERVICE_DETAILS,
      postdata,
    );
  };

  const handleGetServiceDetailsResponse = () => {
    if (getServiceDetails.error || !getServiceDetails.response) {
      return;
    }

    const results = getServiceDetails.response;
    if (results?.code === 200 && results?.data) {
      setServiceDetails(results.data);
    }
  };

  useEffect(() => {
    handleGetServiceDetailsResponse();
  }, [getServiceDetails.response, getServiceDetails.error]);

  // ✅ NEW: Fetch rider/wallet details to populate the Pinoy Rider Credit
  // balance shown at the top of the home BottomModal.
  const triggerGetRiderDetails = () => {
    getRiderDetails.makePostRequest(Constants.ENDPOINT.GET_RIDER_DETAILS, {
      rider_id: userInfo?.id,
    });
  };

  const handleGetRiderDetailsResponse = () => {
    if (getRiderDetails.error) {
      console.warn('rider details fetch error:', getRiderDetails.error);
      return;
    }
    if (!getRiderDetails.response) {
      return;
    }

    // pr_wallet_details is a sibling of wallet_details in this response.
    const prWallet = getRiderDetails.response?.data?.pr_wallet_details;
    if (prWallet?.avail_balance !== undefined) {
      setPrCreditBalance(prWallet.avail_balance);
    }
  };

  useEffect(() => {
    handleGetRiderDetailsResponse();
  }, [getRiderDetails.response, getRiderDetails.error]);

  useEffect(() => {
    if (userInfo?.id) {
      triggerGetServiceDetails();
      triggerGetRiderDetails();
    }
  }, [userInfo?.id]);

  // ✅ FIX: Show the offline alert only once per true app session (first
  // HomeScreen mount after app launch), not once per HomeScreen mount.
  // Previously this ran on every mount, including the remount caused by
  // navigation.reset() after ending a ride — which made it look like the
  // rider had been kicked back offline even though nothing changed
  // server-side.
  useEffect(() => {
    if (hasShownOfflineAlertThisSession) {
      return;
    }
    hasShownOfflineAlertThisSession = true;
    setShowOffline(true);
  }, []);

  useEffect(() => {
    AppUtil.debugDeep(userInfo);

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

  // ✅ NEW: Push rider location to backend every 15 seconds while in transit.
  // "In transit" = riderBookingStatus >= 2 (rider has left to pickup or is
  // already carrying the customer). Stops automatically when booking ends.
  useEffect(() => {
    const isInTransit =
      riderActiveBooking?.id != null && riderBookingStatus >= 2;

    if (!isInTransit) {
      return;
    }

    console.log('🚀 Starting location update interval (every 15s)...');

    const pushLocation = () => {
      const postdata = {
        rider_id: userInfo?.id,
        current_lat: riderLocation.latitude,
        current_long: riderLocation.longitude,
      };
      console.log('📡 Pushing rider location to server:', postdata);
      updateRiderLocation.makePostRequest(
        Constants.ENDPOINT.UPDATE_RIDER_LOCATION,
        postdata,
      );
    };

    // Push immediately on first trigger, then every 15s
    pushLocation();
    const interval = setInterval(pushLocation, LOCATION_UPDATE_INTERVAL_MS);

    return () => {
      console.log('🛑 Stopping location update interval.');
      clearInterval(interval);
    };
  }, [
    riderActiveBooking?.id,
    riderBookingStatus,
    // Re-run when location changes so the interval always has fresh coords
    riderLocation.latitude,
    riderLocation.longitude,
  ]);

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

      // ✅ Clear the initial fetch flag so all subsequent polls are silent
      isInitialBookingFetch.current = false;

      // ✅ POLLING FIX: Merge new bookings instead of replacing the whole list.
      // This prevents the modal from jumping or losing the rider's current position
      // in the list when a new booking arrives during polling. Only newly arrived
      // bookings (by id) are appended to the end.
      //
      // ✅ NEW: Also exclude anything already in ignoredBookingIdsRef so a
      // booking the rider just ignored doesn't get re-merged back in by the
      // very next poll. This ref is session-only (see declaration above), so
      // this exclusion naturally goes away on app restart.
      setPendingBookings(prev => {
        const existingIds = new Set(prev.map(b => b.id));
        const newOnes = results.data.bookings.filter(
          b =>
            !existingIds.has(b.id) && !ignoredBookingIdsRef.current.has(b.id),
        );
        if (newOnes.length > 0) {
          console.log(`🆕 ${newOnes.length} new booking(s) found, appending.`);
        }
        return [...prev, ...newOnes];
      });
    }
  };

  useEffect(() => {
    handleGetPendingBookingRequest();
  }, [getPendingBooking.response, getPendingBooking.error]);

  // ✅ POLLING FIX: While PendingBookingModal is open, poll every POLL_INTERVAL_MS
  // so newly created customer bookings appear in real time without the rider
  // needing to close and reopen the modal.
  useEffect(() => {
    if (!showBooking) {
      return;
    }

    const interval = setInterval(() => {
      console.log('🔄 Polling for new pending bookings...');
      triggerGetPendingBooking(riderSelectedVehicleId);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval); // stop when modal closes
  }, [showBooking, riderSelectedVehicleId]);

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

  const triggerIgnoreBooking = bookingId => {
    const postdata = {
      rider_id: userInfo?.id,
      booking_id: bookingId,
    };
    ignoreBooking.makePostRequest(Constants.ENDPOINT.IGNORE_BOOKING, postdata);
  };

  // Handler (silent — no UI feedback needed, just log errors)
  const handleIgnoreBookingResponse = () => {
    if (ignoreBooking.error) {
      console.warn('❌ Failed to record ignored booking:', ignoreBooking.error);
    }
    if (ignoreBooking.response?.code === 200) {
      console.log('✅ Booking ignored recorded:', ignoreBooking.response.data);
    }
  };

  useEffect(() => {
    handleIgnoreBookingResponse();
  }, [ignoreBooking.response, ignoreBooking.error]);

  /** ───── HANDLERS ───── */

  // ✅ FIX: Do NOT pre-emptively set Redux state here.
  // Wait for API response in handleAcceptBookingRequest before updating UI.
  const handleAccept = booking => {
    triggerAcceptBooking(booking.id);
  };

  // ✅ UPDATED: Ignoring a booking now actually removes it from the visible
  // list (instead of just skipping past it via currentIndex), and records
  // its id in ignoredBookingIdsRef so it won't get re-added by a later poll
  // during this session. Because that ref is never persisted, a full app
  // restart clears it and the booking becomes visible again — this is
  // intentional, not a bug.
  const handleIgnore = () => {
    const currentBooking = pendingBookings[currentIndex];
    if (!currentBooking) {
      return;
    }

    if (currentBooking.id) {
      // Let the backend know it was ignored (analytics / no re-serving logic there, if any)
      triggerIgnoreBooking(currentBooking.id);
      // Track locally for this session only — NOT persisted anywhere.
      ignoredBookingIdsRef.current.add(currentBooking.id);
    }

    const remainingCount = pendingBookings.length - 1;

    // Remove the ignored booking from the list right away
    setPendingBookings(prev => prev.filter(b => b.id !== currentBooking.id));

    if (remainingCount <= 0) {
      // That was the last one — nothing left to show
      setShowBooking(false);
      setCurrentIndex(0);
    } else {
      // Keep currentIndex in bounds of the now-shorter list. Since the
      // ignored item is removed, whatever was "next" naturally shifts into
      // the current index, so we only need to clamp if we were at the end.
      setCurrentIndex(prev =>
        prev >= remainingCount ? remainingCount - 1 : prev,
      );
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
      // Mark this as the initial fetch so the loading UI shows just this once
      isInitialBookingFetch.current = true;
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
          serviceDetails={serviceDetails}
          creditBalance={prCreditBalance}
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
          // ✅ Only show loading spinner on the very first fetch, not on polls
          loading={getPendingBooking.loading && isInitialBookingFetch.current}
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
