import { AppButton, AppMap } from '@/Components';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { openSettings } from 'react-native-permissions';
import { Constants } from '@/Utils';
import { addSavedPlace, updateSavedPlace } from '@/Redux/Slices/userSlice';
import { useLocation } from '@/Hooks/useLocation';

const getIconForType = type => {
  switch (type) {
    case 'home':
      return require('@/Assets/Common/Location/Home.png');
    case 'work':
      return require('@/Assets/Common/Location/Suitcase.png');
    case 'school':
      return require('@/Assets/Common/Location/School.png');
    default:
      return require('@/Assets/Common/Location/Location.png');
  }
};

const SaveLocationScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const { locationType, existingPlace } = route.params || {};

  // Use location hook
  const { location, loading, error, permissionStatus, requestLocation } =
    useLocation();

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [label, setLabel] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // Default location (Manila)
  const defaultLocation = {
    lat: 14.5995,
    lng: 120.9842,
  };

  const currentLocation = location
    ? { lat: location.latitude, lng: location.longitude }
    : defaultLocation;

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
    }
  }, [locationType, existingPlace]);

  // ✅ Track keyboard visibility
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  // Check permission on mount
  useEffect(() => {
    if (permissionStatus === 'blocked') {
      Alert.alert(
        'Location Access Blocked',
        'Please enable location in Settings to save locations.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
          { text: 'Open Settings', onPress: () => openSettings() },
        ],
      );
    } else if (permissionStatus === 'denied') {
      Alert.alert(
        'Location Required',
        'Location access helps you save locations more easily.',
        [{ text: 'OK' }],
      );
    }
  }, [permissionStatus]);

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

  // ✅ Enhanced validation
  const handleSave = () => {
    // Validate label
    if (!label.trim()) {
      Alert.alert(
        'Label Required',
        'Please enter a label for this location (e.g., Home, Office, Gym).',
        [{ text: 'OK' }],
      );
      return;
    }

    // ✅ Validate that user actually selected a location on the map
    if (!selectedLocation || !selectedAddress) {
      Alert.alert(
        'Location Required',
        'Please tap on the map to select a location before saving.',
        [{ text: 'OK' }],
      );
      return;
    }

    // ✅ Additional validation: Check if address is not just coordinates
    // This prevents saving locations with generic "lat, lng" addresses
    if (
      selectedAddress.includes(',') &&
      selectedAddress.split(',').length === 2
    ) {
      const parts = selectedAddress.split(',');
      const isCoordinates = parts.every(
        part => !isNaN(parseFloat(part.trim())),
      );

      if (isCoordinates) {
        Alert.alert(
          'Invalid Location',
          'Unable to get address for this location. Please try selecting a different location or check your internet connection.',
          [{ text: 'OK' }],
        );
        return;
      }
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

          {/* ✅ Hide map when keyboard is visible to save space */}
          {!isKeyboardVisible && (
            <View style={styles.mapWrapper}>
              <AppMap
                initialLat={existingPlace?.lat || currentLocation.lat}
                initialLong={existingPlace?.long || currentLocation.lng}
                locationReady={permissionStatus === 'granted'}
                firstMarkerLat={selectedLocation?.latitude}
                firstMarkerLong={selectedLocation?.longitude}
                onMapPress={handleMapPress}
                interactive={true}
                latOffset={-5}
                style={{ flex: 1 }}
              />

              {/* ✅ Visual indicator when no location selected */}
              {!selectedLocation && (
                <View style={styles.mapOverlay}>
                  <View style={styles.instructionBubble}>
                    <Text style={styles.instructionText}>
                      📍 Tap anywhere on the map to select a location
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          <View
            style={[
              styles.bottomPanel,
              isKeyboardVisible && styles.bottomPanelExpanded,
            ]}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Label *</Text>
                <View style={styles.inputRow}>
                  <Image
                    source={getIconForType(
                      locationType || existingPlace?.type || 'other',
                    )}
                    style={styles.inputIcon}
                    resizeMode="contain"
                  />
                  <TextInput
                    value={label}
                    onChangeText={setLabel}
                    placeholder="e.g., Home, Office, Gym"
                    style={styles.inputText}
                    placeholderTextColor={colors.grey3}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              </View>

              <View style={styles.addressContainer}>
                <Text style={styles.inputLabel}>Selected Location *</Text>
                <View
                  style={[
                    styles.addressRow,
                    !selectedAddress && styles.addressRowEmpty,
                  ]}>
                  <Image
                    source={require('@/Assets/Common/Location/Location.png')}
                    style={styles.addressIcon}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.addressText,
                      !selectedAddress && styles.addressTextPlaceholder,
                    ]}
                    numberOfLines={2}>
                    {selectedAddress || 'Tap map to select location'}
                  </Text>
                </View>
              </View>

              {/* ✅ Show hint when keyboard is visible */}
              {isKeyboardVisible && !selectedLocation && (
                <View style={styles.keyboardHint}>
                  <Text style={styles.keyboardHintText}>
                    💡 Close keyboard to select location on map
                  </Text>
                </View>
              )}

              <AppButton
                title="Save Location"
                onPress={handleSave}
                isBold
                // ✅ Disable button if required fields are empty
                disabled={
                  !label.trim() || !selectedLocation || !selectedAddress
                }
              />
            </ScrollView>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
      position: 'relative',
    },
    mapOverlay: {
      position: 'absolute',
      top: 20,
      left: 20,
      right: 20,
      alignItems: 'center',
      pointerEvents: 'none',
    },
    instructionBubble: {
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 20,
    },
    instructionText: {
      color: 'white',
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      textAlign: 'center',
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
    // ✅ Expand bottom panel when keyboard is visible
    bottomPanelExpanded: {
      flex: 1,
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
    // ✅ New style for empty address state
    addressRowEmpty: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderStyle: 'dashed',
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
    // ✅ New style for placeholder text
    addressTextPlaceholder: {
      fontStyle: 'italic',
      opacity: 0.6,
    },
    // ✅ Hint shown when keyboard is visible
    keyboardHint: {
      backgroundColor: colors.grey2,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 10,
      marginBottom: 16,
    },
    keyboardHintText: {
      fontFamily: 'Poppins Regular',
      fontSize: 12,
      color: colors.grey4,
      textAlign: 'center',
    },
  });
