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

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [showRiderFound, setShowRiderFound] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const riderFoundTimeout = useRef(null);

  useEffect(() => {
    setShowSuccess(true);

    // Clear any timeouts when component unmounts
    return () => {
      if (riderFoundTimeout.current) {
        clearTimeout(riderFoundTimeout.current);
      }
    };
  }, []);

  const onBookPressed = () => {
    setShowServiceModal(true);

    // Schedule Rider Found modal after 15 seconds
    riderFoundTimeout.current = setTimeout(() => {
      setShowRiderFound(true);
    }, 15000); // 15,000 ms = 15 secs
  };

  const handleTopRightPress = () => {
    navigation.navigate('SettingsScreen');
  };

  return (
    <View style={styles.container}>
      <AppMap
        initialLat={14.5995} // Manila
        initialLong={120.9842}
        firstMarkerLat={14.5995}
        firstMarkerLong={120.9842}
        secondMarkerLat={14.6095}
        secondMarkerLong={120.9942}
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
