import { AppButton, Container } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

const AppTransactionComplete = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const handleDone = () => {
    navigation.navigate('LoginScreen');
  };

  return (
    <Container style={styles.container}>
      <View style={styles.contents}>
        <Image
          source={require('@/Assets/Common/Success_Image.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.amount}>₱200.00</Text>
        <Text style={styles.title}>Cash-out request sent!</Text>
        <Text style={styles.subtitle}>
          Will notify you if your transaction is successfully transferred.{' '}
        </Text>
      </View>
      <View style={{ paddingBottom: 24 }}>
        <AppButton
          title="View Wallet"
          onPress={() => {}}
          isBold
          noSpacing
          featureStyle={{ marginBottom: 10 }}
        />
        <AppButton
          title="Go to Dashboard"
          onPress={handleDone}
          isBold
          noSpacing
          mode="outlined"
          featureStyle={{ backgroundColor: colors.onPrimary }}
        />
      </View>
    </Container>
  );
};

export default AppTransactionComplete;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    contents: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      width: 122,
      height: 122,
      marginBottom: 24,
    },
    amount: {
      fontFamily: 'Poppins Bold',
      fontSize: 20,
      color: colors.primary,
      textAlign: 'center',
    },
    title: {
      fontFamily: 'Poppins Medium',
      fontSize: 16,
      color: colors.primary,
      textAlign: 'center',
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey3,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
  });
