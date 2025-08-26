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
import { AppMap, RiderFoundAlertBox, SuccessAlertBox } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { AppUtil } from '@/Utils';

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const riderFoundTimeout = useRef(null);
  const successShownRef = useRef(false);

  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);

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
    AppUtil.debugDeep(selectedService);
  });

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

  // Parse initial user coordinates
  const initialLat = parseFloat(userInfo.latitude.replace('° N', '').trim());
  const initialLong = parseFloat(userInfo.longitude.replace('° E', '').trim());

  return (
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
