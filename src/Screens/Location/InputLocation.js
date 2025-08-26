import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Portal, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import usePostRequest from '@/Services/Api';
import { Constants } from '@/Utils';
import Geolocation from 'react-native-geolocation-service';

const savedLocationButtons = [
  {
    id: 'home',
    icon: require('@/Assets/Common/Location/Home.png'),
    label: 'Add Home',
    onPress: () => console.log('Home pressed'),
  },
  {
    id: 'work',
    icon: require('@/Assets/Common/Location/Suitcase.png'),
    label: 'Add Work',
    onPress: () => console.log('Work pressed'),
  },
  {
    id: 'school',
    icon: require('@/Assets/Common/Location/School.png'),
    label: 'Add School',
    onPress: () => console.log('School pressed'),
  },
  {
    id: 'other',
    icon: require('@/Assets/Common/Location/Suitcase.png'),
    label: 'Add Another Places',
    onPress: () => console.log('Other pressed'),
  },
];

const InputLocation = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();

  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [focusedField, setFocusedField] = useState(null); // 'pickup' | 'dropoff'
  const [dropdownTop, setDropdownTop] = useState(0);

  const searchLocationRequest = usePostRequest();
  const debounceRef = useRef(null);
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  useEffect(() => {
    if (route.params?.pickup) {
      setPickup(
        route.params.pickup.description || route.params.pickup.address || '',
      );
    }
    if (route.params?.dropoff) {
      setDropoff(
        route.params.dropoff.description || route.params.dropoff.address || '',
      );
    }
  }, [route.params]);

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

    if (debounceRef.current) {clearTimeout(debounceRef.current);}
    debounceRef.current = setTimeout(() => {
      if (text) {searchLocation(text);}
    }, 300);
  };

  const handleBack = () => navigation.goBack();
  const handleProfilePress = () => navigation.navigate('SettingsScreen');
  const handleOpenMap = () => {
    navigation.navigate('MapSelectionModal', {
      onLocationSelect: value => setPickup(value),
    });
  };

  const handleSelectItem = item => {
    if (focusedField === 'pickup') {
      setPickup(item.address);
      route.params?.onPickupSelect?.(item);
    } else if (focusedField === 'dropoff') {
      setDropoff(item.address);
      route.params?.onDropoffSelect?.(item);
    }

    setSearchResults([]);
    setFocusedField(null);

    // Navigate back only if both pickup and dropoff have values
    if (
      (focusedField === 'pickup' && dropoff) ||
      (focusedField === 'dropoff' && pickup)
    ) {
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
          setPickup(currentAddress);
          route.params?.onPickupSelect?.({
            address: currentAddress,
            lat: latitude,
            long: longitude,
          });

          setFocusedField(null);
          setSearchResults([]);
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

  const renderDropdown = () => (
    <Portal>
      {focusedField && searchResults.length > 0 && (
        <View style={[styles.dropdown, { top: dropdownTop }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => index.toString()}
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
                placeholder="Input pickup location"
                style={styles.locationIconText}
                placeholderTextColor={colors.onPrimary}
                onFocus={() => setFocusedField('pickup')}
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
              />
              {pickup.length > 0 && (
                <TouchableOpacity onPress={() => setPickup('')}>
                  <Image
                    source={require('@/Assets/Common/Close.png')}
                    style={styles.clearIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
            {focusedField === 'pickup' && renderDropdown(setPickup)}
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
                placeholder="Drop off to?"
                style={styles.locationIconText}
                placeholderTextColor={colors.onPrimary}
                onFocus={() => setFocusedField('dropoff')}
                autoCorrect={false}
                autoComplete="off"
                spellCheck={false}
              />
              {dropoff.length > 0 && (
                <TouchableOpacity onPress={() => setDropoff('')}>
                  <Image
                    source={require('@/Assets/Common/Close.png')}
                    style={styles.clearIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}
            </View>
            {focusedField === 'dropoff' && renderDropdown(setDropoff)}
          </View>
        </View>
      </View>

      <View style={styles.body}>
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
          Lorem ipsum dolor sit amet consectetur.
        </Text>

        {savedLocationButtons.map(button => (
          <TouchableOpacity
            key={button.id}
            style={styles.buttons}
            onPress={button.onPress}>
            <Image
              source={button.icon}
              style={styles.iconSmall}
              resizeMode="contain"
            />
            <Text style={styles.iconText}>{button.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleOpenMap} style={styles.bottomButton}>
        <Image
          source={require('@/Assets/Common/Location/Map.png')}
          style={styles.bottomButtonIcon}
          resizeMode="contain"
        />
        <Text style={styles.bottomButtonText}>Choose from Map</Text>
      </TouchableOpacity>
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
    body: { paddingHorizontal: 30, flex: 1 },
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
    },
    savedPlacesSubtitleText: {
      fontFamily: 'Poppins Regular',
      fontSize: 8,
      fontWeight: '400',
    },
    buttons: {
      backgroundColor: colors.grey2,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 10,
      marginVertical: 5,
    },
    bottomButton: {
      marginVertical: 40,
      height: 47,
      backgroundColor: 'white',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
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
