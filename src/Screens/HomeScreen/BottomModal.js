import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppButton } from '@/Components';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const buttons = [
  {
    image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
    text: 'Cash',
  },
  {
    image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
    text: 'Promo',
  },
  {
    image: require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png'),
    text: 'Note to Rider',
  },
];

const BottomModal = ({ selectedService, onBookPressed, onConfirmBooking }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <View style={styles.modalContainer}>
      {selectedService ? (
        <>
          <View style={styles.serviceHeader}>
            <Text style={styles.modalTitle}>
              {selectedService.title}
              <Text style={styles.arrow}>{' >'}</Text>
            </Text>
          </View>

          <View style={styles.locationColumn}>
            <View style={styles.locationGroup}>
              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => navigation.navigate('InputLocation')}>
                <Image
                  source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_5.png')}
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText}>Pick up From?</Text>
              </TouchableOpacity>

              <View style={styles.dotLine}>
                {[...Array(2)].map((_, i) => (
                  <View key={i} style={styles.dot} />
                ))}
              </View>

              <TouchableOpacity
                style={styles.locationButton}
                onPress={() => navigation.navigate('InputLocation')}>
                <Image
                  source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_8.png')}
                  style={styles.locationIcon}
                />
                <Text style={styles.locationText}>Drop off To?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isConfirmed ? (
            <View style={styles.optionButtonsRow}>
              {buttons.map((btn, index) => (
                <View key={index} style={styles.optionWrapper}>
                  <TouchableOpacity style={styles.optionButton}>
                    <Image source={btn.image} style={styles.optionIcon} />
                    <Text style={styles.optionText}>{btn.text}</Text>
                  </TouchableOpacity>
                  {index < buttons.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.fareBreakdown}>
              <View style={styles.fareRow}>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  Final Fare
                </Text>
                <Text
                  style={[styles.feeText, { fontFamily: 'Poppins SemiBold' }]}>
                  ₱120.00
                </Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Total Fare w/ Discount</Text>
                <Text style={styles.feeText}>₱10.00</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.feeText}>Total</Text>
                <Image
                  source={require('@/Assets/Common/HomeScreen/BottomModal/Ellipse_9.png')}
                  style={styles.optionIcon}
                />
              </View>
            </View>
          )}

          {isConfirmed ? (
            <AppButton
              title="Cancel"
              onPress={() => setIsConfirmed(false)}
              isBold
              mode="outlined"
              buttonColor={colors.error}
              textColor={colors.error}
            />
          ) : (
            <AppButton
              title="Book"
              onPress={() => {
                setIsConfirmed(true);
                onConfirmBooking?.();
              }}
              isBold
              buttonColor={colors.primary}
            />
          )}
        </>
      ) : (
        <>
          <Text style={styles.modalTitle}>
            Choose a service <Text style={styles.arrow}>{'>'}</Text>
          </Text>
          <AppButton
            title="Book"
            onPress={onBookPressed}
            isBold
            buttonColor={colors.grey}
          />
        </>
      )}
    </View>
  );
};

export default BottomModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    modalContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.onPrimary,
      paddingVertical: 30,
      paddingHorizontal: 30,
    },
    modalTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 19,
      fontWeight: '400',
      color: colors.text,
    },
    arrow: {
      fontFamily: 'Poppins Medium',
      fontSize: 20,
      color: colors.blue,
      fontWeight: '600',
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    locationColumn: {
      marginBottom: 20,
      alignItems: 'flex-start',
    },
    locationGroup: {
      alignItems: 'flex-start',
    },
    dotLine: {
      height: 24,
      justifyContent: 'space-between',
      marginLeft: 11,
      paddingVertical: 5,
    },
    dot: {
      width: 5,
      height: 5,
      borderRadius: 2,
      backgroundColor: colors.grey,
    },
    locationButton: {
      width: 150,
      flexDirection: 'row',
      alignItems: 'center',
    },
    locationIcon: {
      width: 27,
      height: 27,
      resizeMode: 'contain',
      marginRight: 10,
    },
    locationText: {
      fontSize: 14,
      color: '#333',
      fontFamily: 'Poppins Regular',
    },
    optionButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    optionWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    divider: {
      width: 1,
      height: '60%',
      backgroundColor: '#ccc',
      marginHorizontal: 10,
    },
    optionIcon: {
      width: 22,
      height: 22,
      resizeMode: 'contain',
      marginRight: 6,
    },
    optionText: {
      fontSize: 13,
      color: '#555',
      fontFamily: 'Poppins Regular',
    },
    fareBreakdown: {
      marginTop: 10,
      marginBottom: 20,
    },
    fareRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 4,
    },
    feeText: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      color: '#333',
    },
  });
