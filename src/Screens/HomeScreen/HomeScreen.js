import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
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

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // Parse initial user coordinates
  const initialLat = parseFloat(userInfo.latitude.replace('° N', '').trim());
  const initialLong = parseFloat(userInfo.longitude.replace('° E', '').trim());

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('Cash');

  const riderFoundTimeout = useRef(null);
  const successShownRef = useRef(false);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

  const [isBooked, setIsBooked] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const inquireBooking = usePostRequest();
  const [inquireBookingResponse, setInquireBookingResponse] = useState([]);
  const isLoading = inquireBooking.loading;

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
    AppUtil.debugDeep(selectedService?.id);
    AppUtil.debugDeep(userInfo?.customer_id);
    AppUtil.debugDeep(dropoffLocation?.address);
    AppUtil.debugDeep(dropoffLocation?.lat);
    AppUtil.debugDeep(dropoffLocation?.long);
    AppUtil.debugDeep(selectedPayment.toLowerCase());
  }, [selectedService?.id, userInfo?.customer_id]);
  // Show login success only once
  useEffect(() => {
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

  const triggerInquireBooking = () => {
    inquireBooking.makePostRequest(Constants.ENDPOINT.INQUIRE_BOOKING, {
      customer_id: userInfo?.customer_id,
      booking_type: selectedService?.id,
      pickup_location: pickupLocation?.address,
      pickup_lat: pickupLocation?.lat,
      pickup_long: pickupLocation?.long,
      dropoff_location: dropoffLocation?.address,
      dropoff_lat: dropoffLocation?.lat,
      dropoff_long: dropoffLocation?.long,
    });
  };

  const handleInquireBookingRequest = () => {
    if (inquireBooking.error) {
      setAlertMessage(inquireBooking.error);
      setShowAlert(true);
      return;
    }

    if (!inquireBooking.response) {return;}

    const results = inquireBooking.response;
    AppUtil.debugDeep(results);

    if (results?.code === 200) {
      setInquireBookingResponse(results.data);
      setIsBooked(true);
    }
  };

  useEffect(() => {
    handleInquireBookingRequest();
  }, [inquireBooking.response, inquireBooking.error]);

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

        {showSuccess && (
          <SuccessAlertBox
            visible={showSuccess}
            onClose={() => setShowSuccess(false)}
            imageSource={require('@/Assets/Common/Check.png')}
            title="Success"
            message="You are now successfully Login."
          />
        )}

        <RiderFoundAlertBox
          visible={showRiderFound}
          onClose={() => setShowRiderFound(false)}
          riderName="Juan Dela Cruz"
          plateNumber="XYZ 5678"
          vehicle="Yamaha NMAX"
          imageSource={require('@/Assets/Common/Sample_Profile.png')}
        />

        <BottomModal
          selectedService={selectedService}
          onBookPressed={onBookPressed}
          pickup={pickupLocation}
          dropoff={dropoffLocation}
          onPickupChange={setPickupLocation}
          onDropoffChange={setDropoffLocation}
          onChangeService={() => setShowServiceModal(true)}
          onConfirmBooking={triggerInquireBooking}
          isBooked={isBooked}
          isConfirmed={isConfirmed}
          setIsBooked={setIsBooked}
          setIsConfirmed={setIsConfirmed}
          showPaymentModal={showPaymentModal}
          setShowPaymentModal={setShowPaymentModal}
          selectedPayment={selectedPayment}
          inquireBookingResponse={inquireBookingResponse}
          isLoading={isLoading}
        />

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
  });
