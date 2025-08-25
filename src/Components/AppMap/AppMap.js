import { AppButton, AppMap } from '@/Components';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

const MapSelectionModal = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [pickupLocation, setPickupLocation] = useState(null); // store coords

  const navigation = useNavigation();
  const route = useRoute();

  // Get the callback passed from InputLocation
  const { onLocationSelect } = route.params || {};

  const handleTopRightPress = () => {
    console.log('Top-right image button pressed');
  };

  const handleChoosePickup = () => {
    if (!pickupLocation) {return;}

    console.log('Chosen location:', pickupLocation);

    // Call the parent callback if provided
    if (onLocationSelect) {
      onLocationSelect(pickupLocation);
    }

    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* ✅ Replace dummy image with AppMap */}
      <AppMap
        style={styles.map}
        initialLat={14.5995} // Manila default
        initialLong={120.9842}
        onMapPress={coords => {
          console.log('User clicked map:', coords);
          setPickupLocation(coords);
        }}
      />

      {/* Top-right profile button */}
      <TouchableOpacity
        style={styles.profileButton}
        onPress={handleTopRightPress}>
        <Image
          source={require('@/Assets/Common/HomeScreen/Profile_Icon_1.png')}
          style={styles.iconImage}
        />
      </TouchableOpacity>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        <TextInput
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor="transparent"
          placeholder="Tap on the map to choose location"
          placeholderTextColor={colors.darkGrey}
          value={
            pickupLocation
              ? `${pickupLocation.latitude}, ${pickupLocation.longitude}`
              : ''
          }
          editable={false} // ✅ user cannot type, only click on map
          style={styles.textInput}
        />

        <AppButton
          title="Choose this pick up"
          onPress={handleChoosePickup}
          isBold
          disabled={!pickupLocation} // ✅ disable until location chosen
        />
      </View>
    </View>
  );
};

export default MapSelectionModal;

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
    bottomPanel: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      paddingHorizontal: 30,
      paddingTop: 40,
      paddingBottom: 30,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 10,
    },
    textInput: {
      backgroundColor: colors.blueGrey,
      height: 40,
      borderRadius: 10,
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 12,
    },
  });
