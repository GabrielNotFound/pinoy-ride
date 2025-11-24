import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AlertBox, AppButton, AppTextInput } from '@/Components';
import { AppUtil, Constants } from '@/Utils';
import usePostRequest from '@/Services/Api';

const RatingScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const route = useRoute();
  const paymentDetails = route?.params?.bookingDetails?.payment_details;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const rateBooking = usePostRequest();

  const handleBack = () => {
    navigation.navigate('HomeScreen');
  };

  const handleSubmit = () => {
    triggerRateBooking();
  };

  const triggerRateBooking = () => {
    rateBooking.makePostRequest(Constants.ENDPOINT.RATE_BOOKING, {
      booking_id: paymentDetails?.booking_id,
      rate: rating,
      compliment: comment,
    });
  };

  const handleRateBooking = () => {
    if (rateBooking.error) {
      setAlertMessage(rateBooking.error);
      setShowAlert(true);
      return;
    }

    if (!rateBooking.response) {
      return;
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'HomeScreen' }],
    });
  };

  useEffect(() => {
    handleRateBooking();
  }, [rateBooking.response, rateBooking.error]);

  return (
    <>
      {alertMessage ? (
        <AlertBox
          title="Error"
          message={alertMessage}
          visible={showAlert}
          setVisible={setShowAlert}
        />
      ) : null}
      <Container style={styles.container}>
        <View style={{ flex: 1, paddingBottom: 70 }}>
          {/* Top buttons */}
          <View style={styles.buttonGroupContainer}>
            <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
              <Image
                source={require('@/Assets/Common/Close.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.contactSupport}>Contact Support</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>How was your Rider?</Text>

          {/* Rider Image + Stars */}
          <View style={styles.riderRatingRow}>
            <Image
              source={require('@/Assets/Common/Sample_Profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  activeOpacity={0.7}>
                  <Text
                    style={[styles.star, rating >= star && styles.filledStar]}>
                    {rating >= star ? '★' : '★'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Comment input */}
          <AppTextInput
            placeholder="Share your compliment (Optional)"
            value={comment}
            onChangeText={setComment}
            inputMode="comment"
          />

          {/* Fare and payment method */}
          <View style={styles.fareRow}>
            <Text style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
              Final Fare
            </Text>
            <Text style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
              ₱120.00
            </Text>
          </View>

          <View style={styles.fareRow}>
            <Text style={styles.feeText}>Payment Method</Text>
            <Image
              source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png')}
              style={styles.optionIcon}
            />
          </View>

          {/* View Booking Details */}
          <AppButton
            title="View Booking Details"
            onPress={() => console.log('View Booking Pressed')}
            isBold
            mode="outlined"
          />
        </View>

        {/* Submit Button fixed at bottom */}
        <View style={styles.bottomButtonWrapper}>
          <AppButton
            title="Submit"
            onPress={handleSubmit}
            isBold
            mode="contained"
          />
        </View>
      </Container>
    </>
  );
};

export default RatingScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
    },
    buttonGroupContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    contactSupport: {
      fontFamily: 'Poppins SemiBold',
      fontWeight: '600',
      fontSize: 12,
      color: colors.blue,
    },
    iconButton: {
      width: 14,
      height: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      width: 14,
      height: 14,
    },
    title: {
      fontFamily: 'Poppins SemiBold',
      fontWeight: '600',
      fontSize: 16,
      marginBottom: 10,
    },
    riderRatingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 55,
      height: 55,
      borderRadius: 30,
      marginRight: 10,
    },
    starsContainer: {
      flexDirection: 'row',
    },
    star: {
      fontSize: 24,
      color: colors.grey,
      marginHorizontal: 2,
    },
    filledStar: {
      color: colors.primary,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    optionIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      marginRight: 6,
    },
    feeText: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: '#333',
    },
    bottomButtonWrapper: {
      position: 'absolute',
      bottom: 20,
      left: 15,
      right: 15,
    },
  });
