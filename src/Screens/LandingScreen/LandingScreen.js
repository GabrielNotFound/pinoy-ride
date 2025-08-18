import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import ServiceModal from './ServiceModal';
import BottomModal from './BottomModal';
import { OfflineAlertBox } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const LandingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [showOffline, setShowOffline] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const riderFoundTimeout = useRef(null);

  useEffect(() => {
    setShowOffline(true);

    // Clear any timeouts when component unmounts
    return () => {
      if (riderFoundTimeout.current) {
        clearTimeout(riderFoundTimeout.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('@/Assets/Common/Map_Dummy.png')}
        style={styles.map}
        resizeMode="cover"
      />

      {/* ✅ Offline Alert */}
      {showOffline && (
        <OfflineAlertBox
          visible={showOffline}
          onClose={() => setShowOffline(false)}
        />
      )}

      <BottomModal />

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
