import React, { useEffect } from 'react';
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { selectUserInfo } from '@/Redux/Slices/userSlice';
import { useSelector } from 'react-redux';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();
  const userInfo = useSelector(selectUserInfo);
  const ekyc = userInfo?.ekyc_details;

  // Intercept hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        navigation.goBack();
        return true;
      },
    );
    return () => backHandler.remove();
  }, [navigation]);

  const toTitleCase = str => {
    if (!str) {return '';}
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatAddress = address => {
    if (!address) {return 'N/A';}
    // Remove leading dash/hyphen if present
    return address.startsWith('-') ? address.slice(1).trim() : address.trim();
  };

  const formatMobile = mobile => {
    if (!mobile) {return 'N/A';}
    // Format as +63 • XXXXXXXXXX
    if (mobile.startsWith('63')) {
      return `+63 •  0${mobile.slice(2)}`;
    }
    if (mobile.startsWith('09')) {
      return `+63 •  ${mobile}`;
    }
    return mobile;
  };

  const fields = [
    {
      label: 'Name',
      value: ekyc
        ? `${toTitleCase(ekyc.first_name)} ${toTitleCase(
            ekyc.middle_name,
          )} ${toTitleCase(ekyc.last_name)}`
        : 'N/A',
    },
    {
      label: 'Mobile Number',
      value: formatMobile(ekyc?.mobile_no || ekyc?.pretty_mobile_no),
    },
    {
      label: 'Email Address',
      value: ekyc?.email_address || 'N/A',
    },
    // {
    //   label: 'Date of Birth',
    //   value: ekyc?.date_of_birth || 'N/A',
    // },
    // {
    //   label: 'Place of Birth',
    //   value: ekyc?.place_of_birth || 'N/A',
    // },
    // {
    //   label: 'Nationality',
    //   value: ekyc?.nationality || 'N/A',
    // },
    {
      label: 'Gender',
      value: ekyc?.gender ? toTitleCase(ekyc.gender) : 'N/A',
    },
    {
      label: 'Address',
      value: formatAddress(ekyc?.current_address),
    },
    // {
    //   label: 'Nature of Work',
    //   value: ekyc?.nature_of_work || 'N/A',
    // },
    // {
    //   label: 'Source of Fund',
    //   value: ekyc?.source_of_fund || 'N/A',
    // },
  ];

  return (
    <Container style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Image
          source={require('@/Assets/Common/Back.png')}
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.avatarContainer}>
          <Image
            source={
              ekyc?.selfie
                ? { uri: ekyc.selfie }
                : require('@/Assets/Common/Sample_Profile.png')
            }
            style={styles.avatar}
          />
          {/* <TouchableOpacity style={styles.cameraButton} onPress={() => {}}>
            <Image
              source={require('@/Assets/Common/Camera.png')}
              style={styles.cameraIcon}
              resizeMode="contain"
            />
          </TouchableOpacity> */}
        </View>

        {/* Profile Fields */}
        <View style={styles.fieldsContainer}>
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              <Text style={styles.fieldValue}>{field.value}</Text>
              <View style={styles.divider} />
            </View>
          ))}
        </View>
      </ScrollView>
    </Container>
  );
};

export default ProfileScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 15,
    },
    backIcon: {
      width: 23,
      height: 23,
      marginBottom: 20,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 30,
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
    },
    cameraButton: {
      position: 'absolute',
      bottom: 0,
      right: '35%',
      backgroundColor: colors.primary,
      borderRadius: 14,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cameraIcon: {
      width: 14,
      height: 14,
      tintColor: '#FFFFFF',
    },
    fieldsContainer: {
      paddingBottom: 30,
    },
    fieldRow: {
      marginBottom: 4,
    },
    fieldLabel: {
      fontFamily: 'Poppins Regular',
      fontSize: 11,
      color: colors.grey4,
      marginBottom: 2,
    },
    fieldValue: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey3,
      paddingBottom: 10,
    },
    divider: {
      height: 1,
      backgroundColor: colors.grey5,
      marginBottom: 14,
    },
  });
