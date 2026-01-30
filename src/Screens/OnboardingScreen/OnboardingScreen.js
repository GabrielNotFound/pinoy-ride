import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { AlertBox, AppButton } from '@/Components';
import {
  ensureCameraPermission,
  requestCameraPermission,
} from '@/Utils/Permissions';
import { openSettings } from 'react-native-permissions';

const { width, height } = Dimensions.get('window');

// Calculate responsive dimensions
const isSmallScreen = width < 375;
const imageScale = Math.min(width / 400, 1);

const slides = [
  {
    key: '1',
    title: 'Book Your Rides in Seconds',
    subtitle:
      "Just a few taps and you're set. Choose your pickup, track your rider, and get to your destination—fast and safe.",
    image: require('@/Assets/Common/OnboardingScreen/First_Page.png'),
    imagePosition: 'bottom',
    imageWidth: 408 * imageScale,
    imageHeight: 272 * imageScale,
  },
  {
    key: '2',
    title: 'Real-Time Tracking',
    subtitle:
      "Stay updated with live GPS tracking. Know your rider's exact location and estimated time of arrival.",
    image: require('@/Assets/Common/OnboardingScreen/Second_Page.png'),
    imagePosition: 'top',
    imageWidth: 401 * imageScale,
    imageHeight: 351 * imageScale,
  },
  {
    key: '3',
    title: 'Safe & Trusted Rides',
    subtitle:
      "All our riders are trained and verified. Ride with confidence wherever you're going.",
    image: require('@/Assets/Common/OnboardingScreen/Third_Page.png'),
    imagePosition: 'top',
    imageWidth: Math.min(540 * imageScale, width * 0.9),
    imageHeight: Math.min(490 * imageScale, height * 0.45),
    top: isSmallScreen ? 20 : 60,
  },
];

const OnboardingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  const appState = useRef(AppState.currentState);

  // Initial CAMERA permission check only
  useEffect(() => {
    (async () => {
      const cam = await ensureCameraPermission();
      if (!cam) {
        setShowAlert(true);
      }
    })();
  }, []);

  // Retry camera permission
  const handleRetryPermission = async () => {
    const result = await requestCameraPermission();

    if (result === 'granted') {
      setShowAlert(false);
    } else if (result === 'blocked') {
      openSettings();
    } else {
      setShowAlert(true);
    }
  };

  // Re-check camera when app returns to foreground
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          const cam = await ensureCameraPermission();
          if (!cam) {
            setShowAlert(true);
          }
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('LandingScreen');
    }
  };

  const handleSkip = () => {
    navigation.replace('LandingScreen');
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      flatListRef.current.scrollToIndex({ index: prevIndex });
      setCurrentIndex(prevIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera Permission Alert */}
      {showAlert && (
        <AlertBox
          title="Camera Required"
          message="Camera access is required to verify your identity. Please enable it."
          visible={showAlert}
          setVisible={setShowAlert}
          onConfirm={handleRetryPermission}
        />
      )}

      {currentIndex > 0 && (
        <TouchableOpacity
          onPress={handleBack}
          style={[
            styles.backButton,
            { top: Platform.OS === 'ios' ? insets.top + 20 : 70 },
          ]}>
          <Image
            source={require('@/Assets/Common/OnboardingScreen/Back_Button.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
      )}

      <View style={styles.flatListWrapper}>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          scrollEnabled={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={styles.slideContent}>
                {item.imagePosition === 'top' && (
                  <Image
                    source={item.image}
                    style={{
                      width: item.imageWidth,
                      height: item.imageHeight,
                      marginBottom: isSmallScreen ? 10 : 20,
                      top: item.top || 0,
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
                      marginTop: isSmallScreen ? 10 : 20,
                      top: item.top || 0,
                    }}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
          )}
        />
      </View>

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
          <AppButton title="Get Started" onPress={handleNext} isBold />
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
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.onPrimary,
    },
    flatListWrapper: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    slide: {
      width,
      flex: 1,
    },
    slideContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: isSmallScreen ? 15 : 20,
    },
    textContainer: {
      alignItems: 'center',
      marginVertical: isSmallScreen ? 5 : 10,
      paddingHorizontal: 10,
    },
    subtitleWrapper: {
      maxWidth: width * 0.85,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontSize: isSmallScreen ? 20 : 25,
      textAlign: 'center',
      letterSpacing: -0.45,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: isSmallScreen ? 14 : 16,
      textAlign: 'center',
      letterSpacing: -0.5,
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
      backgroundColor: colors.grey,
      margin: 4,
    },
    activeDot: {
      backgroundColor: colors.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: isSmallScreen ? 30 : 61,
      marginTop: isSmallScreen ? 20 : 30,
      marginBottom: isSmallScreen ? 30 : 40,
    },
    continueButtonContainer: {
      paddingHorizontal: 30,
      marginBottom: isSmallScreen ? 30 : 40,
    },
    skip: {
      color: colors.primary,
      fontFamily: 'Poppins Medium',
      fontSize: isSmallScreen ? 14 : 16,
    },
    nextButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: isSmallScreen ? 15 : 20,
      paddingVertical: 10,
      borderRadius: 30,
    },
    next: {
      color: 'white',
      fontFamily: 'Poppins Medium',
      fontSize: isSmallScreen ? 14 : 16,
    },
    nextContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    arrowIcon: {
      width: 11,
      height: 13,
      marginLeft: 8,
    },
    backButton: {
      position: 'absolute',
      left: 20,
      zIndex: 10,
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 52,
      height: 52,
      marginBottom: 20,
    },
  });
