import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

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

  const [location, setLocation] = useState('');

  const handleBack = () => {
    navigation.navigate('LandingScreen');
  };

  const handleOpenMap = () => {
    navigation.navigate('MapSelectionModal', {
      onLocationSelect: value => {
        setLocation(value);
      },
    });
  };

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
          <TouchableOpacity style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Location/Profile_Icon_2.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.locationButtonsContainer}>
          <TouchableOpacity style={styles.iconWithTextButton}>
            <Image
              source={require('@/Assets/Common/LandingScreen/BottomModal/Ellipse_5.png')}
              style={styles.iconSmall}
              resizeMode="contain"
            />
            <Text style={styles.locationIconText}>
              {location || 'Input pickup location'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconWithTextButton}>
            <Image
              source={require('@/Assets/Common/LandingScreen/BottomModal/Ellipse_8.png')}
              style={styles.iconSmall}
              resizeMode="contain"
            />
            <Text style={styles.locationIconText}>Drop off to?</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={() => console.log('Use my current location pressed')}>
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
    iconSmall: {
      width: 19,
      height: 19,
      marginRight: 12,
    },
    locationIconText: {
      fontFamily: 'Poppins SemiBold',
      color: colors.onPrimary,
      fontSize: 15,
      fontWeight: '600',
    },
    body: {
      paddingHorizontal: 30,
      flex: 1,
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
  });
