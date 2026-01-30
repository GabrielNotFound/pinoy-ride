import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Portal, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import usePostRequest from '@/Services/Api';
import { Constants } from '@/Utils';
import Geolocation from 'react-native-geolocation-service';
import { removeSavedPlace, selectSavedPlaces } from '@/Redux/Slices/userSlice';

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

const savedLocationButtons = [
  {
    id: 'home',
    type: 'home',
    icon: require('@/Assets/Common/Location/Home.png'),
    label: 'Add Home',
  },
  {
    id: 'work',
    type: 'work',
    icon: require('@/Assets/Common/Location/Suitcase.png'),
    label: 'Add Work',
  },
  {
    id: 'school',
    type: 'school',
    icon: require('@/Assets/Common/Location/School.png'),
    label: 'Add School',
  },
  {
    id: 'other',
    type: 'other',
    icon: require('@/Assets/Common/Location/Location.png'),
    label: 'Add Another Place',
  },
];

const InputLocation = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const savedPlaces = useSelector(selectSavedPlaces);

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropoffLocation, setDropoffLocation] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [dropdownTop, setDropdownTop] = useState(0);

  const searchLocationRequest = usePostRequest();
  const debounceRef = useRef(null);
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  useEffect(() => {
    if (route.params?.pickup) {
      const pickupData = route.params.pickup;
      setPickup(pickupData.description || pickupData.address || '');
      setPickupLocation(pickupData);
    }
    if (route.params?.dropoff) {
      const dropoffData = route.params.dropoff;
      setDropoff(dropoffData.description || dropoffData.address || '');
      setDropoffLocation(dropoffData);
    }
  }, [route.params?.pickup, route.params?.dropoff]);

  const searchLocation = query => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    searchLocationRequest.makePostRequest(Constants.ENDPOINT.SEARCH_LOCATION, {
      location_search_key: query,
    });
  };

  const handleSearchLocationRequest = async () => {
    if (searchLocationRequest.error) {
      console.error('Search location error:', searchLocationRequest.error);
      setSearchResults([]);
    }
    const results = searchLocationRequest.response?.data || [];
    setSearchResults(results);
  };

  useEffect(() => {
    handleSearchLocationRequest();
  }, [searchLocationRequest.response, searchLocationRequest.error]);

  const handleTextChange = (text, setFieldValue, inputRef) => {
    setFieldValue(text);
    setFocusedField(setFieldValue === setPickup ? 'pickup' : 'dropoff');

    inputRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setDropdownTop(pageY + height);
    });

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      if (text) {
        searchLocation(text);
      }
    }, 300);
  };

  const handleBack = () => navigation.goBack();
  const handleProfilePress = () => navigation.navigate('SettingsScreen');

  const handleOpenMap = () => {
    setFocusedField(null);
    setSearchResults([]);
    navigation.navigate('MapSelectionScreen', {
      onPickupSelect: route.params?.onPickupSelect,
      onDropoffSelect: route.params?.onDropoffSelect,
    });
  };

  const handleSelectItem = item => {
    let shouldNavigate = false;

    if (focusedField === 'pickup') {
      setPickup(item.address);
      setPickupLocation(item);
      route.params?.onPickupSelect?.(item);

      if (dropoffLocation) {
        shouldNavigate = true;
      }
    } else if (focusedField === 'dropoff') {
      setDropoff(item.address);
      setDropoffLocation(item);
      route.params?.onDropoffSelect?.(item);

      if (pickupLocation) {
        shouldNavigate = true;
      }
    }

    setSearchResults([]);
    setFocusedField(null);

    if (shouldNavigate) {
      navigation.goBack();
    }
  };

  const handleUseCurrentLocation = async () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Constants.GOOGLE_MAP_API_KEY}`,
          );
          const data = await response.json();

          const currentAddress =
            data.results[0]?.formatted_address || 'Current Location';

          const locationData = {
            address: currentAddress,
            lat: latitude,
            long: longitude,
          };

          let shouldNavigate = false;

          if (focusedField === 'dropoff') {
            setDropoff(currentAddress);
            setDropoffLocation(locationData);
            route.params?.onDropoffSelect?.(locationData);

            if (pickupLocation) {
              shouldNavigate = true;
            }
          } else {
            setPickup(currentAddress);
            setPickupLocation(locationData);
            route.params?.onPickupSelect?.(locationData);

            if (dropoffLocation) {
              shouldNavigate = true;
            }
          }

          setFocusedField(null);
          setSearchResults([]);

          if (shouldNavigate) {
            navigation.goBack();
          }
        } catch (error) {
          console.error('Reverse geocode error:', error);
          alert('Unable to get address from location.');
        }
      },
      error => {
        console.error('Location error:', error);
        alert('Unable to get location. Please try again.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  };

  const handleAddSavedPlace = type => {
    // Check if this type already exists (only for non-"other" types)
    if (type !== 'other') {
      const existingPlace = savedPlaces.find(place => place.type === type);

      if (existingPlace) {
        // Navigate to edit existing place
        navigation.navigate('SaveLocationScreen', {
          locationType: type,
          existingPlace: existingPlace,
        });
        return;
      }
    }

    // Navigate to add new place (for "other" type or non-existing places)
    navigation.navigate('SaveLocationScreen', {
      locationType: type,
    });
  };

  const handleSelectSavedPlace = place => {
    const locationData = {
      address: place.address,
      lat: place.lat,
      long: place.long,
    };

    let shouldNavigate = false;

    if (focusedField === 'dropoff' || (!focusedField && dropoff === '')) {
      setDropoff(place.address);
      setDropoffLocation(locationData);
      route.params?.onDropoffSelect?.(locationData);

      if (pickupLocation) {
        shouldNavigate = true;
      }
    } else {
      setPickup(place.address);
      setPickupLocation(locationData);
      route.params?.onPickupSelect?.(locationData);

      if (dropoffLocation) {
        shouldNavigate = true;
      }
    }

    if (shouldNavigate) {
      navigation.goBack();
    }
  };

  const handleDeleteSavedPlace = placeId => {
    Alert.alert(
      'Delete Saved Place',
      'Are you sure you want to delete this saved place?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => dispatch(removeSavedPlace(placeId)),
        },
      ],
    );
  };

  const renderDropdown = () => (
    <Portal>
      {focusedField && searchResults.length > 0 && (
        <View style={[styles.dropdown, { top: dropdownTop }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelectItem(item)}
                style={styles.dropdownItem}>
                <Text style={styles.dropdownText}>{item.address}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </Portal>
  );

  const renderSavedPlaceButton = button => {
    // For non-"other" types, check if place exists
    if (button.type !== 'other') {
      const existingPlace = savedPlaces.find(
        place => place.type === button.type,
      );

      if (existingPlace) {
        return (
          <TouchableOpacity
            key={existingPlace.id}
            style={styles.savedPlaceItem}
            onPress={() => handleSelectSavedPlace(existingPlace)}>
            <View style={styles.savedPlaceLeft}>
              <Image
                source={getIconForType(existingPlace.type)}
                style={styles.iconSmall}
                resizeMode="contain"
              />
              <View style={styles.savedPlaceTextContainer}>
                <Text style={styles.savedPlaceLabel}>
                  {existingPlace.label}
                </Text>
                <Text style={styles.savedPlaceAddress} numberOfLines={1}>
                  {existingPlace.address}
                </Text>
              </View>
            </View>
            <View style={styles.savedPlaceActions}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate('SaveLocationScreen', {
                    locationType: existingPlace.type,
                    existingPlace: existingPlace,
                  })
                }
                style={styles.actionButton}>
                <Image
                  source={require('@/Assets/Common/Location/Edit.png')}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDeleteSavedPlace(existingPlace.id)}
                style={styles.actionButton}>
                <Image
                  source={require('@/Assets/Common/Location/Delete.png')}
                  style={styles.actionIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        );
      }
    }

    // For "other" type or non-existing places, always show "Add" button
    return (
      <TouchableOpacity
        key={button.id}
        style={styles.buttons}
        onPress={() => handleAddSavedPlace(button.type)}>
        <Image
          source={button.icon}
          style={styles.iconSmall}
          resizeMode="contain"
        />
        <Text style={styles.iconText}>{button.label}</Text>
      </TouchableOpacity>
    );
  };

  // Render saved place item (used for "other" type places)
  const renderSavedPlaceItem = place => (
    <TouchableOpacity
      key={place.id}
      style={styles.savedPlaceItem}
      onPress={() => handleSelectSavedPlace(place)}>
      <View style={styles.savedPlaceLeft}>
        <Image
          source={require('@/Assets/Common/Location/Home.png')}
          style={styles.iconSmall}
          resizeMode="contain"
        />
        <View style={styles.savedPlaceTextContainer}>
          <Text style={styles.savedPlaceLabel}>{place.label}</Text>
          <Text style={styles.savedPlaceAddress} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      </View>
      <View style={styles.savedPlaceActions}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('SaveLocationScreen', {
              locationType: place.type,
              existingPlace: place,
            })
          }
          style={styles.actionButton}>
          <Image
            source={require('@/Assets/Common/Location/Edit.png')}
            style={styles.actionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteSavedPlace(place.id)}
          style={styles.actionButton}>
          <Image
            source={require('@/Assets/Common/Location/Delete.png')}
            style={styles.actionIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Filter out "other" type places for separate rendering
  const otherPlaces = savedPlaces.filter(place => place.type === 'other');

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.buttonGroupContainer}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleProfilePress}
            style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Location/Profile_Icon_2.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationButtonsContainer}>
          {/* Pickup */}
          <View style={styles.iconWithTextButton}>
            <Image
              source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
              style={styles.iconSmall}
              resizeMode="contain"
            />
            <View style={styles.inputContainer}>
              <TextInput
                ref={pickupInputRef}
                value={pickup}
                onChangeText={text =>
                  handleTextChange(text, setPickup, pickupInputRef)
                }
                onFocus={() => setFocusedField('pickup')}
                onBlur={() => {
                  setFocusedField(null);
                  setSearchResults([]);
                }}
                placeholder="Input pickup location"
                style={styles.locationIconText}
                placeholderTextColor={colors.onPrimary}
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
              />
              {pickup.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setPickup('');
                    setPickupLocation(null);
                  }}>
                  <Image
                    source={require('@/Assets/Common/Close.png')}
                    style={styles.clearIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
            {focusedField === 'pickup' && renderDropdown()}
          </View>

          {/* Dropoff */}
          <View style={styles.iconWithTextButton}>
            <Image
              source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
              style={styles.iconSmall}
              resizeMode="contain"
            />
            <View style={styles.inputContainer}>
              <TextInput
                ref={dropoffInputRef}
                value={dropoff}
                onChangeText={text =>
                  handleTextChange(text, setDropoff, dropoffInputRef)
                }
                onFocus={() => setFocusedField('dropoff')}
                onBlur={() => {
                  setFocusedField(null);
                  setSearchResults([]);
                }}
                placeholder="Drop off to?"
                style={styles.locationIconText}
                placeholderTextColor={colors.onPrimary}
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
              />
              {dropoff.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setDropoff('');
                    setDropoffLocation(null);
                  }}>
                  <Image
                    source={require('@/Assets/Common/Close.png')}
                    style={styles.clearIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
            {focusedField === 'dropoff' && renderDropdown()}
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleUseCurrentLocation}>
          <Image
            source={require('@/Assets/Common/Location/Location.png')}
            style={styles.iconSmall}
            resizeMode="contain"
          />
          <Text style={styles.iconText}>Use my current location</Text>
        </TouchableOpacity>

        <Text style={styles.savedPlacesText}>Saved Places</Text>
        <Text style={styles.savedPlacesSubtitleText}>
          Save your favorite places for faster booking.
        </Text>

        {/* Render Home, Work, School buttons/places */}
        {savedLocationButtons
          .filter(btn => btn.type !== 'other')
          .map(button => renderSavedPlaceButton(button))}

        {/* Render all "other" saved places */}
        {otherPlaces.map(place => renderSavedPlaceItem(place))}

        {/* Always show "Add Another Place" button */}
        {renderSavedPlaceButton(
          savedLocationButtons.find(btn => btn.type === 'other'),
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity onPress={handleOpenMap} style={styles.bottomButton}>
          <Image
            source={require('@/Assets/Common/Location/Map.png')}
            style={styles.bottomButtonIcon}
            resizeMode="contain"
          />
          <Text style={styles.bottomButtonText}>Choose from Map</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default InputLocation;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingLeft: 10,
      paddingRight: 30,
    },
    buttonGroupContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    iconButton: {
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: { width: 23, height: 23 },
    iconImage: { width: 51, height: 51 },
    locationButtonsContainer: { paddingHorizontal: 30 },
    iconWithTextButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 20,
    },
    iconSmall: { width: 19, height: 19, marginRight: 12 },
    inputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 0,
    },
    clearIcon: {
      width: 16,
      height: 16,
      marginLeft: 20,
      tintColor: colors.onPrimary,
    },
    locationIconText: {
      flex: 1,
      fontFamily: 'Poppins SemiBold',
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    body: {
      paddingHorizontal: 30,
      flex: 1,
      marginBottom: 67, // Reserve space for the fixed button (47 height + 20 bottom margin)
    },
    scrollContent: {
      paddingBottom: 20,
    },
    currentLocationButton: {
      backgroundColor: colors.grey2,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      marginTop: 8,
      marginBottom: 33,
    },
    iconText: {
      fontFamily: 'Poppins Medium',
      color: colors.grey3,
      fontSize: 16,
      fontWeight: '600',
    },
    savedPlacesText: {
      fontFamily: 'Poppins Medium',
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 4,
    },
    savedPlacesSubtitleText: {
      fontFamily: 'Poppins Regular',
      fontSize: 8,
      fontWeight: '400',
      marginBottom: 12,
    },
    buttons: {
      backgroundColor: colors.grey2,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      marginVertical: 5,
    },
    savedPlaceItem: {
      backgroundColor: colors.grey2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 10,
      marginVertical: 5,
    },
    savedPlaceLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    savedPlaceTextContainer: {
      flex: 1,
      marginRight: 8,
    },
    savedPlaceLabel: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 14,
      fontWeight: '600',
      color: colors.grey3,
      marginBottom: 2,
    },
    savedPlaceAddress: {
      fontFamily: 'Poppins Regular',
      fontSize: 11,
      color: colors.grey3,
      opacity: 0.7,
    },
    savedPlaceActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionButton: {
      padding: 8,
      marginLeft: 4,
    },
    actionIcon: {
      width: 16,
      height: 16,
      tintColor: colors.grey3,
    },
    bottomButtonContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'white',
      paddingBottom: 20,
      paddingTop: 10,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
    },
    bottomButton: {
      height: 47,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.grey2,
      elevation: 3,
    },
    bottomButtonIcon: { width: 20, height: 20, marginRight: 10 },
    bottomButtonText: {
      fontSize: 14,
      fontWeight: '500',
      fontFamily: 'Poppins Medium',
      color: colors.grey3,
    },
    dropdown: {
      position: 'absolute',
      left: 30,
      right: 30,
      maxHeight: 500,
      backgroundColor: 'white',
      borderRadius: 8,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 5,
      zIndex: 1000,
      paddingHorizontal: 10,
    },
    dropdownItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderColor: colors.onPrimary,
    },
    dropdownText: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: colors.grey3,
    },
  });
