import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const BookingCard = ({
  image,
  title,
  status,
  destination,
  date,
  price,
  onRebook,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const isCompleted = status === 'Completed';

  return (
    <View style={styles.card}>
      <Image source={image} style={styles.icon} />

      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>To {destination}</Text>
        <Text style={styles.date}>{date}</Text>

        <TouchableOpacity style={styles.rebookBtn} onPress={onRebook}>
          <Text style={styles.rebookText}>Rebook</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'flex-end' }}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isCompleted
                ? colors.completed
                : colors.cancelled,
            },
          ]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        <Text style={styles.price}>₱{price}</Text>
      </View>
    </View>
  );
};

export default BookingCard;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.onPrimary,
      marginVertical: 5,
      marginHorizontal: 16,
      padding: 16,
      borderRadius: 16,
      shadowColor: colors.shadow,
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
      flexDirection: 'row',
    },
    icon: { width: 27, height: 27, marginRight: 10 },
    title: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 16,
      color: colors.text,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey4,
      fontWeight: 400,
    },
    date: {
      fontFamily: 'Poppins Regular',
      fontSize: 10,
      color: colors.grey5,
      fontWeight: 400,
      marginTop: 4,
    },
    statusBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 5,
      marginBottom: 6,
    },
    statusText: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 8,
      color: colors.onPrimary,
    },
    price: {
      fontFamily: 'Poppins Regular',
      fontWeight: 400,
      fontSize: 12,
      color: colors.text,
    },
    rebookBtn: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      marginTop: 11,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 8,
    },
    rebookText: { fontWeight: 'bold', color: colors.onPrimary },
  });
