import React, { useState } from 'react';
import {
  ActivityIndicator,
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
import { AlertBox, AppButton } from '@/Components';

const TOTAL_STEPS = 5;
const CURRENT_STEP = 4;

const ID_TYPE_LABELS = {
  passport: 'Passport',
  drivers_license: "Driver's License",
  national_id: 'National ID (PhilSys)',
  sss: 'SSS ID',
  umid: 'UMID',
  postal_id: 'Postal ID',
};

const ConfirmDetailsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const { personalDetails, idDetails, selfiePhoto } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = () => {
    // TODO: Wire up your submit API call here
    // All data is available:
    //   personalDetails → { firstName, middleName, lastName, email, dateOfBirth, address }
    //   idDetails       → { idType, frontPhoto, backPhoto }
    //   selfiePhoto     → uri string

    setIsLoading(true);

    // Simulate submission → replace with real API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('CongratsScreen');
    }, 1500);
  };

  const handleBack = () => navigation.goBack();

  const DetailRow = ({ label, value }) =>
    value ? (
      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    ) : null;

  const fullName = [
    personalDetails?.firstName,
    personalDetails?.middleName,
    personalDetails?.lastName,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

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
            <Text style={styles.headerTitle}>Confirm Details</Text>
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
            <Text style={styles.sectionLabel}>Step 4 of 5</Text>
            <Text style={styles.sectionTitle}>Review your info</Text>
            <Text style={styles.sectionSubtitle}>
              Please make sure everything is correct before submitting.
            </Text>

            {/* Selfie Preview */}
            {selfiePhoto && (
              <View style={styles.selfieRow}>
                <Image
                  source={{ uri: selfiePhoto }}
                  style={styles.selfieThumb}
                  resizeMode="cover"
                />
                <View style={styles.selfieInfo}>
                  <Text style={styles.selfieLabel}>Selfie</Text>
                  <Text style={styles.selfieStatus}>✅ Captured</Text>
                </View>
              </View>
            )}

            {/* Personal Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Personal Details</Text>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('PersonalDetailsScreen', {
                      prefill: personalDetails,
                    })
                  }>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <DetailRow label="Full Name" value={fullName} />
              <DetailRow label="Email" value={personalDetails?.email} />
              <DetailRow
                label="Date of Birth"
                value={personalDetails?.dateOfBirth}
              />
              <DetailRow label="Address" value={personalDetails?.address} />
            </View>

            {/* ID Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>ID Details</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('UploadIDScreen')}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>

              <DetailRow
                label="ID Type"
                value={ID_TYPE_LABELS[idDetails?.idType] || idDetails?.idType}
              />

              <View style={styles.idPhotosRow}>
                {idDetails?.frontPhoto && (
                  <View style={styles.idPhotoContainer}>
                    <Image
                      source={{ uri: idDetails.frontPhoto }}
                      style={styles.idPhoto}
                      resizeMode="cover"
                    />
                    <Text style={styles.idPhotoLabel}>Front</Text>
                  </View>
                )}
                {idDetails?.backPhoto && (
                  <View style={styles.idPhotoContainer}>
                    <Image
                      source={{ uri: idDetails.backPhoto }}
                      style={styles.idPhoto}
                      resizeMode="cover"
                    />
                    <Text style={styles.idPhotoLabel}>Back</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Consent Note */}
            <View style={styles.consentBox}>
              <Text style={styles.consentText}>
                By submitting, you confirm that the information provided is
                accurate and you consent to our{' '}
                <Text style={styles.consentLink}>Privacy Policy</Text> and{' '}
                <Text style={styles.consentLink}>Terms of Service</Text>.
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <AppButton
              title="Submit Registration"
              onPress={handleSubmit}
              isBold
              loading={isLoading}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </Container>
    </>
  );
};

export default ConfirmDetailsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 10 },
    loadingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 999,
    },
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
    selfieRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      marginBottom: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor: colors.surface || '#FAFAFA',
      borderWidth: 1,
      borderColor: colors.surfaceVariant || '#E0E0E0',
    },
    selfieThumb: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.surfaceVariant,
    },
    selfieInfo: { gap: 2 },
    selfieLabel: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.text,
    },
    selfieStatus: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
    },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.surfaceVariant || '#E0E0E0',
      backgroundColor: colors.surface || '#FAFAFA',
      padding: 16,
      marginBottom: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    cardTitle: {
      fontSize: 14,
      fontFamily: 'Poppins Medium',
      color: colors.text,
    },
    editText: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.primary,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: colors.surfaceVariant || '#F0F0F0',
    },
    detailLabel: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      flex: 1,
    },
    detailValue: {
      fontSize: 13,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      flex: 2,
      textAlign: 'right',
    },
    idPhotosRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 10,
    },
    idPhotoContainer: { alignItems: 'center', gap: 4 },
    idPhoto: {
      width: 100,
      height: 64,
      borderRadius: 8,
      backgroundColor: colors.surfaceVariant,
    },
    idPhotoLabel: {
      fontSize: 11,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
    },
    consentBox: {
      marginTop: 4,
      marginBottom: 8,
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.surfaceVariant + '50' || '#F5F5F5',
    },
    consentText: {
      fontSize: 12,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      lineHeight: 18,
    },
    consentLink: {
      color: colors.primary,
      fontFamily: 'Poppins Medium',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
      paddingTop: 16,
    },
  });
