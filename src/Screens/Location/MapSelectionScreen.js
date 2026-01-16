import { AppButton, AppMap } from '@/Components';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Constants } from '@/Utils';
import Geolocation from 'react-native-geolocation-service';

const MapSelectionScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();

  const { onPickupSelect, onDropoffSelect } = route.params || {};

  const [activeField, setActiveField] = useState('pickup');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropoffAddress, setDropoffAddress] = useState('');
  const [initialRegion, setInitialRegion] = useState({
    lat: 14.5995,
    lng: 120.9842,
  });

  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setInitialRegion({ lat: latitude, lng: longitude });
      },
      error => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  }, []);

  const handleMapPress = async ({ latitude, longitude }) => {
    if (activeField === 'pickup') {
      setPickupLocation({ latitude, longitude });
      reverseGeocode(latitude, longitude, setPickupAddress);
    } else {
      setDropoffLocation({ latitude, longitude });
      reverseGeocode(latitude, longitude, setDropoffAddress);
    }
  };

  const reverseGeocode = async (latitude, longitude, setAddress) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Constants.GOOGLE_MAP_API_KEY}`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      } else {
        setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const handleConfirm = () => {
    if (!pickupLocation && !dropoffLocation) {
      alert('Please select at least one location');
      return;
    }

    // Prepare location objects
    const pickupData = pickupLocation
      ? {
          address: pickupAddress,
          lat: pickupLocation.latitude,
          long: pickupLocation.longitude,
        }
      : null;

    const dropoffData = dropoffLocation
      ? {
          address: dropoffAddress,
          lat: dropoffLocation.latitude,
          long: dropoffLocation.longitude,
        }
      : null;

    // Call the callback functions if provided
    if (pickupData && onPickupSelect) {
      onPickupSelect(pickupData);
    }
    if (dropoffData && onDropoffSelect) {
      onDropoffSelect(dropoffData);
    }

    // Navigate back to HomeScreen, skipping InputLocation
    // pop(2) removes both MapSelectionScreen and InputLocation from stack
    navigation.pop(2);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back_2.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
        <View style={styles.backButton} />
      </View>

      {/* Map Section - 60% */}
      <View style={styles.mapWrapper}>
        <AppMap
          initialLat={initialRegion.lat}
          initialLong={initialRegion.lng}
          firstMarkerLat={pickupLocation?.latitude}
          firstMarkerLong={pickupLocation?.longitude}
          secondMarkerLat={dropoffLocation?.latitude}
          secondMarkerLong={dropoffLocation?.longitude}
          onMapPress={handleMapPress}
          interactive={true}
          latOffset={-5}
          style={{ flex: 1 }}
        />
      </View>

      {/* Bottom Panel - 40% */}
      <View style={styles.bottomPanel}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Toggle Buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeField === 'pickup' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveField('pickup')}>
              <Text
                style={[
                  styles.toggleButtonText,
                  activeField === 'pickup' && styles.toggleButtonTextActive,
                ]}>
                Pick-up
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleButton,
                activeField === 'dropoff' && styles.toggleButtonActive,
              ]}
              onPress={() => setActiveField('dropoff')}>
              <Text
                style={[
                  styles.toggleButtonText,
                  activeField === 'dropoff' && styles.toggleButtonTextActive,
                ]}>
                Drop-off
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected Addresses */}
          <View style={styles.addressContainer}>
            <View style={styles.addressRow}>
              <Image
                source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
                style={styles.addressIcon}
                resizeMode="contain"
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {pickupAddress || 'Tap map to select pickup'}
              </Text>
            </View>

            <View style={styles.addressRow}>
              <Image
                source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
                style={styles.addressIcon}
                resizeMode="contain"
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {dropoffAddress || 'Tap map to select drop-off'}
              </Text>
            </View>
          </View>

          <AppButton title="Confirm" onPress={handleConfirm} isBold />
        </ScrollView>
      </View>
    </View>
  );
};

export default MapSelectionScreen;

const { width } = Dimensions.get('window');

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      paddingTop: 60,
      paddingBottom: 16,
      backgroundColor: colors.primary,
    },
    backButton: {
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 23,
      height: 23,
      tintColor: '#fff',
    },
    headerTitle: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 18,
      fontWeight: '600',
      color: '#fff',
    },
    mapWrapper: {
      flex: 6,
      width,
    },
    bottomPanel: {
      flex: 4,
      backgroundColor: '#fff',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
      paddingHorizontal: 20,
      paddingTop: 16,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    toggleContainer: {
      flexDirection: 'row',
      backgroundColor: colors.grey2,
      borderRadius: 10,
      padding: 4,
      marginBottom: 16,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 8,
    },
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    toggleButtonText: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      fontWeight: '500',
      color: colors.grey3,
    },
    toggleButtonTextActive: {
      color: 'white',
    },
    addressContainer: {
      marginBottom: 16,
    },
    addressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.grey2,
      borderRadius: 10,
      marginBottom: 8,
      minHeight: 50,
    },
    addressIcon: {
      width: 16,
      height: 16,
      marginRight: 12,
    },
    addressText: {
      flex: 1,
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey3,
    },
  });
