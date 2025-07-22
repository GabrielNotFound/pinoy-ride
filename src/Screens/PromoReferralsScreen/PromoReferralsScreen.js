import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const PromoReferralsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const renderPromoItem = ({ item }) => {
    return (
      <View style={styles.promoCard}>
        <Image
          source={{ uri: item.image }}
          style={styles.promoImage}
          resizeMode="cover"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
            <Image
              source={require('@/Assets/Common/Back_2.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promo & Referrals</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Contents */}
      <View style={styles.contents}>
        <Text style={styles.title}>Promotion</Text>

        {/* Promo Card FlatList */}
        <FlatList
          data={[]}
          renderItem={renderPromoItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.promoList}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.divider} />

        <Text style={styles.title}>Referrals</Text>
        <Text style={styles.subtitle}>
          Invite your friends and earn ride credits! They will get discounts too
          when they sign up using your code.
        </Text>

        <TouchableOpacity style={styles.referralCard}>
          <View style={styles.row}>
            <Text style={styles.label}>Referral Code:</Text>
            <Text style={styles.code}>4F45HFA9AS</Text>
            <Text style={styles.copy}>Copy</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PromoReferralsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerContainer: {
      backgroundColor: colors.primary,
      paddingTop: 60,
      paddingBottom: 20,
      paddingHorizontal: 20,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    iconButton: {
      width: 25,
    },
    spacing: {
      width: 25,
    },
    backIcon: {
      width: 23,
      height: 23,
    },
    headerTitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 16,
      fontWeight: '400',
      color: colors.onPrimary,
      textAlign: 'center',
      flex: 1,
    },
    contents: {
      paddingHorizontal: 30,
      paddingVertical: 20,
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontWeight: '500',
      fontSize: 16,
      color: colors.shadow,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      fontSize: 12,
      color: colors.grey4,
      marginTop: 6,
    },
    divider: {
      borderBottomWidth: 0.5,
      borderBottomColor: colors.grey5,
      marginVertical: 10,
    },
    referralCard: {
      backgroundColor: colors.onPrimary,
      padding: 16,
      marginVertical: 20,
      borderRadius: 12,
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    label: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      fontWeight: '400',
      marginRight: 8,
      color: colors.shadow,
    },
    code: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 14,
      color: colors.shadow,
    },
    copy: {
      fontFamily: 'Poppins Regular',
      fontSize: 8,
      color: colors.blue,
      marginLeft: 5,
      marginTop: -2,
      alignSelf: 'flex-start',
    },

    // Promo styles
    promoList: {
      marginTop: 10,
      gap: 10,
    },
    promoCard: {
      backgroundColor: colors.onPrimary,
      borderRadius: 12,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      marginBottom: 10,
    },
    promoImage: {
      width: '100%',
      height: 150,
      borderRadius: 12,
    },
  });
