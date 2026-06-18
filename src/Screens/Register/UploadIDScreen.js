import React, { useState } from 'react';
import {
  ActionSheetIOS,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox, AppButton } from '@/Components';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 2;

const ID_TYPES = [
  { key: 'passport', label: 'Passport' },
  { key: 'drivers_license', label: "Driver's License" },
  { key: 'national_id', label: 'National ID (PhilSys)' },
  { key: 'sss', label: 'SSS ID' },
  { key: 'umid', label: 'UMID' },
  { key: 'postal_id', label: 'Postal ID' },
];

const UploadIDScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { personalDetails } = route.params || {};

  const [selectedIDType, setSelectedIDType] = useState('');
  const [frontPhoto, setFrontPhoto] = useState(null);
  const [backPhoto, setBackPhoto] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [errors, setErrors] = useState({});

  const imagePickerOptions = {
    mediaType: 'photo',
    quality: 0.8,
    saveToPhotos: false,
  };

  const openPickerSheet = onPick => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {openCamera(onPick);}
          if (buttonIndex === 2) {openGallery(onPick);}
        },
      );
    } else {
      // Android — use Alert as action sheet
      Alert.alert('Upload Photo', 'Choose an option', [
        { text: 'Cancel', style: 'cancel' },
        { text: '📷  Take Photo', onPress: () => openCamera(onPick) },
        { text: '🖼️  Choose from Gallery', onPress: () => openGallery(onPick) },
      ]);
    }
  };

  const openCamera = onPick => {
    launchCamera(imagePickerOptions, response => {
      if (response.didCancel || response.errorCode) {return;}
      const uri = response.assets?.[0]?.uri;
      if (uri) {onPick(uri);}
    });
  };

  const openGallery = onPick => {
    launchImageLibrary(imagePickerOptions, response => {
      if (response.didCancel || response.errorCode) {return;}
      const uri = response.assets?.[0]?.uri;
      if (uri) {onPick(uri);}
    });
  };

  const handlePickFront = () => {
    openPickerSheet(uri => {
      setFrontPhoto(uri);
      setErrors(prev => ({ ...prev, front: '' }));
    });
  };

  const handlePickBack = () => {
    openPickerSheet(uri => {
      setBackPhoto(uri);
      setErrors(prev => ({ ...prev, back: '' }));
    });
  };

  const handleNext = () => {
    const newErrors = {};
    if (!selectedIDType) {newErrors.idType = 'Please select an ID type';}
    if (!frontPhoto) {newErrors.front = 'Please upload the front of your ID';}
    if (!backPhoto && selectedIDType !== 'passport') {
      newErrors.back = 'Please upload the back of your ID';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    navigation.navigate('SelfieScreen', {
      personalDetails,
      idDetails: {
        idType: selectedIDType,
        frontPhoto,
        backPhoto,
      },
    });
  };

  const handleBack = () => navigation.goBack();

  const isPassport = selectedIDType === 'passport';

  return (
    <Container style={styles.container}>
      {showAlert && (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      )}

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
          <Text style={styles.headerTitle}>Upload ID</Text>
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
          <Text style={styles.sectionLabel}>Step 2 of 5</Text>
          <Text style={styles.sectionTitle}>Upload your ID</Text>
          <Text style={styles.sectionSubtitle}>
            Select a valid government-issued ID and upload a clear photo.
          </Text>

          {/* ID Type Selection */}
          <Text style={styles.fieldLabel}>ID Type</Text>
          <View style={styles.idTypeGrid}>
            {ID_TYPES.map(item => (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.idTypeChip,
                  selectedIDType === item.key && styles.idTypeChipSelected,
                ]}
                onPress={() => {
                  setSelectedIDType(item.key);
                  setErrors(prev => ({ ...prev, idType: '' }));
                }}>
                <Text
                  style={[
                    styles.idTypeChipText,
                    selectedIDType === item.key &&
                      styles.idTypeChipTextSelected,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.idType ? (
            <Text style={styles.errorText}>{errors.idType}</Text>
          ) : null}

          {/* Front Photo Upload */}
          <Text style={[styles.fieldLabel, { marginTop: 24 }]}>
            Front of ID
          </Text>
          <TouchableOpacity
            style={[
              styles.uploadBox,
              frontPhoto && styles.uploadBoxFilled,
              errors.front && styles.uploadBoxError,
            ]}
            onPress={handlePickFront}
            activeOpacity={0.75}>
            {frontPhoto ? (
              <Image
                source={{ uri: frontPhoto }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.uploadPlaceholder}>
                <Text style={styles.uploadIcon}>📷</Text>
                <Text style={styles.uploadHint}>Tap to upload front side</Text>
                <Text style={styles.uploadSubHint}>JPG or PNG, max 5MB</Text>
              </View>
            )}
          </TouchableOpacity>
          {errors.front ? (
            <Text style={styles.errorText}>{errors.front}</Text>
          ) : null}

          {/* Back Photo Upload — hidden for passport */}
          {!isPassport && (
            <>
              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>
                Back of ID
              </Text>
              <TouchableOpacity
                style={[
                  styles.uploadBox,
                  backPhoto && styles.uploadBoxFilled,
                  errors.back && styles.uploadBoxError,
                ]}
                onPress={handlePickBack}
                activeOpacity={0.75}>
                {backPhoto ? (
                  <Image
                    source={{ uri: backPhoto }}
                    style={styles.uploadedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Text style={styles.uploadIcon}>📷</Text>
                    <Text style={styles.uploadHint}>
                      Tap to upload back side
                    </Text>
                    <Text style={styles.uploadSubHint}>
                      JPG or PNG, max 5MB
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {errors.back ? (
                <Text style={styles.errorText}>{errors.back}</Text>
              ) : null}
            </>
          )}

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>📋 Photo tips</Text>
            <Text style={styles.tipItem}>
              • Make sure all text is clear and readable
            </Text>
            <Text style={styles.tipItem}>
              • Avoid glare or shadows on the ID
            </Text>
            <Text style={styles.tipItem}>
              • Place the ID on a flat, dark surface
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <AppButton title="Next" onPress={handleNext} isBold />
        </View>
      </ScrollView>
    </Container>
  );
};

export default UploadIDScreen;

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
      marginBottom: 20,
      lineHeight: 20,
    },
    fieldLabel: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      marginBottom: 8,
    },
    idTypeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    idTypeChip: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: colors.surfaceVariant || '#E0E0E0',
      backgroundColor: 'transparent',
    },
    idTypeChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    idTypeChipText: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
    },
    idTypeChipTextSelected: {
      color: colors.primary,
      fontFamily: 'Poppins Medium',
    },
    uploadBox: {
      height: 160,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.surfaceVariant || '#E0E0E0',
      borderStyle: 'dashed',
      overflow: 'hidden',
      backgroundColor: colors.surface || '#FAFAFA',
    },
    uploadBoxFilled: {
      borderStyle: 'solid',
      borderColor: colors.primary,
    },
    uploadBoxError: {
      borderColor: colors.error || '#D32F2F',
    },
    uploadPlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
    },
    uploadIcon: { fontSize: 28 },
    uploadHint: {
      fontSize: 14,
      fontFamily: 'Poppins Medium',
      color: colors.text,
    },
    uploadSubHint: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
    },
    uploadedImage: { width: '100%', height: '100%' },
    tipsBox: {
      marginTop: 20,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.primary + '10',
      gap: 4,
    },
    tipsTitle: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      marginBottom: 4,
    },
    tipItem: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      lineHeight: 18,
    },
    errorText: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.error || '#D32F2F',
      marginTop: 4,
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 16,
    },
  });
