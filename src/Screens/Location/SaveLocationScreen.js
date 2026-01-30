import { AppButton, AppMap } from '@/Components';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Constants } from '@/Utils';
import Geolocation from 'react-native-geolocation-service';
import { addSavedPlace, updateSavedPlace } from '@/Redux/Slices/userSlice';

const SaveLocationScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { locationType, existingPlace } = route.params || {};

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [label, setLabel] = useState('');
  const [initialRegion, setInitialRegion] = useState({
    lat: 14.5995,
    lng: 120.9842,
  });

  useEffect(() => {
    // Set initial label based on location type
    if (locationType && !existingPlace) {
      setLabel(locationType.charAt(0).toUpperCase() + locationType.slice(1));
    }

    // If editing existing place, populate fields
    if (existingPlace) {
      setLabel(existingPlace.label);
      setSelectedAddress(existingPlace.address);
      setSelectedLocation({
        latitude: existingPlace.lat,
        longitude: existingPlace.long,
      });
      setInitialRegion({
        lat: existingPlace.lat,
        lng: existingPlace.long,
      });
    } else {
      // Get current location for initial map position
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
    }
  }, [locationType, existingPlace]);

  const handleMapPress = async ({ latitude, longitude }) => {
    setSelectedLocation({ latitude, longitude });
    reverseGeocode(latitude, longitude);
  };

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Constants.GOOGLE_MAP_API_KEY}`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setSelectedAddress(data.results[0].formatted_address);
      } else {
        setSelectedAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setSelectedAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const handleSave = () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    if (!label.trim()) {
      alert('Please enter a label for this location');
      return;
    }

    const savedPlace = {
      id: existingPlace?.id || `saved_${Date.now()}`,
      type: locationType || existingPlace?.type || 'other',
      label: label.trim(),
      address: selectedAddress,
      lat: selectedLocation.latitude,
      long: selectedLocation.longitude,
    };

    if (existingPlace) {
      dispatch(updateSavedPlace(savedPlace));
    } else {
      dispatch(addSavedPlace(savedPlace));
    }

    navigation.goBack();
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
        <Text style={styles.headerTitle}>
          {existingPlace ? 'Edit Saved Place' : 'Add Saved Place'}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Map Section - 60% */}
      <View style={styles.mapWrapper}>
        <AppMap
          initialLat={initialRegion.lat}
          initialLong={initialRegion.lng}
          firstMarkerLat={selectedLocation?.latitude}
          firstMarkerLong={selectedLocation?.longitude}
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
          {/* Label Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Label</Text>
            <View style={styles.inputRow}>
              <Image
                source={require('@/Assets/Common/Location/Home.png')}
                style={styles.inputIcon}
                resizeMode="contain"
              />
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder="e.g., Home, Office, Gym"
                style={styles.inputText}
                placeholderTextColor={colors.grey3}
              />
            </View>
          </View>

          {/* Selected Address */}
          <View style={styles.addressContainer}>
            <Text style={styles.inputLabel}>Selected Location</Text>
            <View style={styles.addressRow}>
              <Image
                source={require('@/Assets/Common/Location/Location.png')}
                style={styles.addressIcon}
                resizeMode="contain"
              />
              <Text style={styles.addressText} numberOfLines={2}>
                {selectedAddress || 'Tap map to select location'}
              </Text>
            </View>
          </View>

          <AppButton title="Save Location" onPress={handleSave} isBold />
        </ScrollView>
      </View>
    </View>
  );
};

export default SaveLocationScreen;

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
    inputSection: {
      marginBottom: 16,
    },
    inputLabel: {
      fontFamily: 'Poppins Medium',
      fontSize: 12,
      fontWeight: '500',
      color: colors.grey3,
      marginBottom: 8,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.grey2,
      borderRadius: 10,
    },
    inputIcon: {
      width: 16,
      height: 16,
      marginRight: 12,
    },
    inputText: {
      flex: 1,
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      color: colors.grey3,
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
