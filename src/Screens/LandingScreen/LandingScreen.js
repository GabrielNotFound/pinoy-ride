import React, { useEffect, useState } from 'react';
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
import { RiderFoundAlertBox, SuccessAlertBox } from '@/Components';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    setShowSuccess(true);
  }, []);

  const onBookPressed = () => {
    setShowServiceModal(true);
  };

  const handleTopRightPress = () => {
    console.log('Top-right image button pressed');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/Assets/Common/Map_Dummy.png')}
        style={styles.map}
        resizeMode="cover"
      />

      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleTopRightPress}>
        <Image
          source={require('@/Assets/Common/LandingScreen/Profile_Icon_1.png')}
          style={styles.iconImage}
        />
      </TouchableOpacity>

      {/* ✅ Success Alert */}
      {showSuccess && (
        <SuccessAlertBox
          visible={showSuccess}
          onClose={() => setShowSuccess(false)}
          imageSource={require('@/Assets/Common/Check.png')}
          title="Success"
          message="You are now successfully Login."
        />
      )}

      {/* ✅ Rider Found Alert */}
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
        onConfirmBooking={() => setShowRiderFound(true)} // ✅ shows alert
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

export default LandingScreen;

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
