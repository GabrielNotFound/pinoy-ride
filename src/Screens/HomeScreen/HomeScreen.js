import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import BottomModal from './BottomModal';
import { AppMap, OfflineAlertBox } from '@/Components';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [showOffline, setShowOffline] = useState(false);

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
      <AppMap
        initialLat={14.5995}
        initialLong={120.9842}
        interactive
        style={styles.map}
      />

      {/* ✅ Offline Alert */}
      {showOffline && (
        <OfflineAlertBox
          visible={showOffline}
          onClose={() => setShowOffline(false)}
        />
      )}

      <BottomModal />
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
