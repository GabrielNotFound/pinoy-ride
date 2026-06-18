import React, { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AppButton } from '@/Components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 3;

const SelfieScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { personalDetails, idDetails } = route.params || {};

  const [selfiePhoto, setSelfiePhoto] = useState(null);
  const [error, setError] = useState('');

  // On emulator: camera may not work, so we offer gallery as fallback
  const handleTakeSelfie = () => {
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'front',
        saveToPhotos: false,
      },
      response => {
        if (response.errorCode === 'camera_unavailable') {
          // Emulator fallback — open gallery instead
          Alert.alert(
            'Camera Unavailable',
            'Camera is not available on this device. Please choose a photo from your gallery instead.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Gallery', onPress: handlePickFromGallery },
            ],
          );
          return;
        }
        if (response.didCancel || response.errorCode) {return;}
        const uri = response.assets?.[0]?.uri;
        if (uri) {
          setSelfiePhoto(uri);
          setError('');
        }
      },
    );
  };

  const handlePickFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, response => {
      if (response.didCancel || response.errorCode) {return;}
      const uri = response.assets?.[0]?.uri;
      if (uri) {
        setSelfiePhoto(uri);
        setError('');
      }
    });
  };

  const handleRetake = () => {
    setSelfiePhoto(null);
    setError('');
  };

  const handleNext = () => {
    if (!selfiePhoto) {
      setError('Please take a selfie to continue');
      return;
    }
    setError('');
    navigation.navigate('ConfirmDetailsScreen', {
      personalDetails,
      idDetails,
      selfiePhoto,
    });
  };

  const handleBack = () => navigation.goBack();

  return (
    <Container style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Image
            source={require('@/Assets/Common/Back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Take a Selfie</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.stepDot,
              index < CURRENT_STEP
                ? styles.stepDotActive
                : styles.stepDotInactive,
            ]}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <Text style={styles.sectionLabel}>Step 3 of 5</Text>
          <Text style={styles.sectionTitle}>Take a selfie</Text>
          <Text style={styles.sectionSubtitle}>
            We need to verify your identity. Please take a clear photo of your
            face.
          </Text>

          {/* Selfie Frame */}
          <TouchableOpacity
            style={styles.selfieFrame}
            onPress={selfiePhoto ? undefined : handleTakeSelfie}
            activeOpacity={selfiePhoto ? 1 : 0.75}>
            {selfiePhoto ? (
              <Image
                source={{ uri: selfiePhoto }}
                style={styles.selfieImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.selfiePlaceholder}>
                {/* Face oval outline */}
                <View style={styles.faceOval} />
                <Text style={styles.selfieIcon}>🤳</Text>
                <Text style={styles.selfieHint}>Tap to open camera</Text>
              </View>
            )}
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {selfiePhoto && (
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={handleRetake}>
              <Text style={styles.retakeText}>Retake</Text>
            </TouchableOpacity>
          )}

          {/* Guidelines */}
          <View style={styles.guidelinesBox}>
            <Text style={styles.guidelinesTitle}>✅ For best results</Text>
            <View style={styles.guidelineRow}>
              <Text style={styles.guidelineIcon}>💡</Text>
              <Text style={styles.guidelineText}>
                Find a well-lit area, preferably facing a window
              </Text>
            </View>
            <View style={styles.guidelineRow}>
              <Text style={styles.guidelineIcon}>😐</Text>
              <Text style={styles.guidelineText}>
                Look straight at the camera with a neutral expression
              </Text>
            </View>
            <View style={styles.guidelineRow}>
              <Text style={styles.guidelineIcon}>🕶️</Text>
              <Text style={styles.guidelineText}>
                Remove glasses, hats, or anything covering your face
              </Text>
            </View>
            <View style={styles.guidelineRow}>
              <Text style={styles.guidelineIcon}>📵</Text>
              <Text style={styles.guidelineText}>
                Don't use filters or edit the photo
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton
            title={selfiePhoto ? 'Next' : 'Open Camera'}
            onPress={selfiePhoto ? handleNext : handleTakeSelfie}
            isBold
          />
        </View>
      </ScrollView>
    </Container>
  );
};

export default SelfieScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10 },
    header: { height: 52, justifyContent: 'center', marginBottom: 12 },
    backButton: {
      position: 'absolute',
      width: 52,
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2,
    },
    backIcon: { width: 23, height: 23 },
    headerTitleContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontFamily: 'Poppins Medium',
      color: colors.text,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginBottom: 24,
    },
    stepDot: { height: 6, borderRadius: 3 },
    stepDotActive: { width: 24, backgroundColor: colors.primary },
    stepDotInactive: {
      width: 8,
      backgroundColor: colors.surfaceVariant || '#E0E0E0',
    },
    scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
    pageContainer: { paddingHorizontal: 20 },
    sectionLabel: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.primary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    sectionTitle: {
      fontSize: 22,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      marginBottom: 6,
    },
    sectionSubtitle: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      marginBottom: 24,
      lineHeight: 20,
    },
    selfieFrame: {
      width: 220,
      height: 220,
      borderRadius: 110,
      alignSelf: 'center',
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: colors.primary,
      backgroundColor: colors.surface || '#FAFAFA',
      marginBottom: 8,
    },
    selfieImage: { width: '100%', height: '100%' },
    selfiePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    faceOval: {
      position: 'absolute',
      width: 120,
      height: 155,
      borderRadius: 60,
      borderWidth: 2,
      borderColor: colors.primary + '50',
      borderStyle: 'dashed',
    },
    selfieIcon: { fontSize: 36 },
    selfieHint: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
    },
    errorText: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.error || '#D32F2F',
      textAlign: 'center',
      marginTop: 4,
    },
    retakeButton: {
      alignSelf: 'center',
      marginTop: 8,
      paddingVertical: 6,
      paddingHorizontal: 20,
    },
    retakeText: {
      fontSize: 14,
      fontFamily: 'Poppins Medium',
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    guidelinesBox: {
      marginTop: 24,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.primary + '10',
      gap: 10,
    },
    guidelinesTitle: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      marginBottom: 4,
    },
    guidelineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    guidelineIcon: { fontSize: 16, lineHeight: 20 },
    guidelineText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      lineHeight: 18,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 16,
    },
  });
