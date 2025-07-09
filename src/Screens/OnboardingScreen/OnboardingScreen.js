import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';

const { width } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Book Your Rides in Seconds',
    subtitle:
      'Just a few taps and you’re set. Choose your pickup, track your rider, and get to your destination—fast and safe.',
    image: require('@/Assets/Common/OnboardingScreen/First_Page.png'),
    imagePosition: 'bottom',
    imageWidth: 408,
    imageHeight: 272,
  },
  {
    key: '2',
    title: 'Real-Time Tracking',
    subtitle:
      'Stay updated with live GPS tracking. Know your rider’s exact location and estimated time of arrival.',
    image: require('@/Assets/Common/OnboardingScreen/Second_Page.png'),
    imagePosition: 'top',
    imageWidth: 401,
    imageHeight: 351,
  },
  {
    key: '3',
    title: 'Safe & Trusted Rides',
    subtitle:
      'All our riders are trained and verified. Ride with confidence wherever you’re going.',
    image: require('@/Assets/Common/OnboardingScreen/Third_Page.png'),
    imagePosition: 'top',
    imageWidth: 500,
    imageHeight: 401,
    top: 60,
  },
];

const OnboardingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('LandingScreen');
    }
  };

  const handleSkip = () => {
    navigation.navigate('LandingScreen');
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      flatListRef.current.scrollToIndex({ index: currentIndex - 1 });
      setCurrentIndex(prev => prev - 1);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index ?? 0);
  }).current;

  return (
    <View style={styles.container}>
      {currentIndex > 0 && (
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/OnboardingScreen/Back_Button.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {item.imagePosition === 'top' && (
              <Image
                source={item.image}
                style={{
                  width: item.imageWidth,
                  height: item.imageHeight,
                  top: item.top,
                }}
                resizeMode="contain"
              />
            )}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.subtitleWrapper}>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
            {item.imagePosition === 'bottom' && (
              <Image
                source={item.image}
                style={{
                  width: item.imageWidth,
                  height: item.imageHeight,
                  top: item.top,
                }}
                resizeMode="contain"
              />
            )}
          </View>
        )}
      />

      <View style={styles.indicatorContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.activeDot]}
          />
        ))}
      </View>

      {currentIndex === slides.length - 1 ? (
        <View style={styles.continueButtonContainer}>
          <AppButton title="Continue" onPress={handleNext} />
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skip}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
            <View style={styles.nextContent}>
              <Text style={styles.next}>Next</Text>
              <Image
                source={require('@/Assets/Common/OnboardingScreen/Arrow_Right.png')}
                style={styles.arrowIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default OnboardingScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    slide: {
      width: width,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      position: 'relative',
    },
    textContainer: {
      marginVertical: 20,
      alignItems: 'center',
    },
    subtitleWrapper: {
      maxWidth: width - 80,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 25,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 16,
      textAlign: 'center',
      lineHeight: 25,
      marginTop: 10,
    },
    indicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: '#ccc',
      margin: 4,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 61,
      marginTop: 30,
      marginBottom: 40,
    },
    continueButtonContainer: {
      paddingHorizontal: 30,
      marginBottom: 40,
    },
    skip: {
      color: colors.primary,
      fontFamily: 'Poppins Regular',
      fontSize: 16,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 30,
    },
    next: {
      color: 'white',
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      lineHeight: 22,
    },
    nextContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowIcon: {
      width: 11,
      height: 13,
      marginLeft: 8,
    },
    backButton: {
      position: 'absolute',
      top: 40,
      left: 20,
      zIndex: 10,
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 30,
    },
    backIcon: {
      width: 52,
      height: 52,
      marginBottom: 20,
    },
  });
