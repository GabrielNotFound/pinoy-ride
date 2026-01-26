import { AppButton, Container } from '@/Components';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { CommonActions } from '@react-navigation/native';

const AppTransactionComplete = ({ route }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const { formattedAmount } = route?.params || {};

  const handleDone = () => {
    // Reset to HomeScreen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'HomeScreen' }],
      }),
    );
  };

  const handleViewWallet = () => {
    // Reset the navigation stack to: HomeScreen -> SettingsScreen -> WalletScreen
    // This removes all transaction flow screens
    navigation.dispatch(
      CommonActions.reset({
        index: 2,
        routes: [
          { name: 'HomeScreen' },
          { name: 'SettingsScreen' },
          { name: 'WalletScreen' },
        ],
      }),
    );
  };

  return (
    <Container style={styles.container}>
      <View style={styles.contents}>
        <Image
          source={require('@/Assets/Common/Success_Image.png')}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.amount}>₱{formattedAmount || '0.00'}</Text>
        <Text style={styles.title}>Transfer request sent!</Text>
        <Text style={styles.subtitle}>
          Will notify you if your transaction is successfully transferred.
        </Text>
      </View>
      <AppButton
        title="View Wallet"
        onPress={handleViewWallet}
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
      />
    </Container>
  );
};

export default AppTransactionComplete;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingVertical: 24,
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
      marginTop: 8,
    },
    subtitle: {
      fontFamily: 'Poppins Regular',
      fontSize: 14,
      color: colors.grey3,
      textAlign: 'center',
      paddingHorizontal: 16,
    },
  });
