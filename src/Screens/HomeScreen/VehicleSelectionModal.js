import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';
import { AppButton } from '@/Components';

const VEHICLES = [
  {
    id: 1,
    name: 'Motorcycle',
    description: 'Lorem Ipsum',
    icon: require('@/Assets/Common/HomeScreen/Motorcycle.png'),
  },
  {
    id: 2,
    name: 'Car (4 Seaters)',
    description: 'Lorem Ipsum',
    icon: require('@/Assets/Common/HomeScreen/Car.png'),
  },
  {
    id: 3,
    name: 'Car (6 Seaters)',
    description: 'Lorem Ipsum',
    icon: require('@/Assets/Common/HomeScreen/Car.png'),
  },
];

const VehicleSelectionModal = ({ visible, onClose, onProceed }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleProceed = () => {
    if (selectedVehicle) {
      onProceed(selectedVehicle);
      setSelectedVehicle(null);
    }
  };

  const handleGoBack = () => {
    setSelectedVehicle(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Select Vehicle</Text>
            <Text style={styles.subtitle}>
              Choose the vehicle you'd like to use
            </Text>

            <View style={styles.vehicleList}>
              {VEHICLES.map(vehicle => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.card,
                    selectedVehicle?.id === vehicle.id && styles.cardSelected,
                  ]}
                  onPress={() => setSelectedVehicle(vehicle)}
                  activeOpacity={0.7}>
                  <View style={styles.iconWrapper}>
                    <Image source={vehicle.icon} style={styles.icon} />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{vehicle.name}</Text>
                    <Text style={styles.desc}>{vehicle.description}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <AppButton
              title="Proceed"
              onPress={handleProceed}
              isBold
              disabled={!selectedVehicle}
            />

            <TouchableOpacity style={styles.goBack} onPress={handleGoBack}>
              <Text style={styles.goBackText}>Go Back</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default VehicleSelectionModal;

const getStyles = () =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    modalContainer: {
      width: '100%',
      maxWidth: 500,
      backgroundColor: '#FFFFFF',
      borderRadius: 5,
      paddingVertical: 20,
      paddingHorizontal: 20,
    },
    title: {
      fontSize: 24,
      textAlign: 'center',
      color: '#E4B400',
      fontFamily: 'Poppins SemiBold',
    },
    subtitle: {
      fontSize: 12,
      textAlign: 'center',
      color: '#777',
      marginBottom: 20,
      fontFamily: 'Poppins Regular',
    },
    vehicleList: {
      gap: 5,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 5,
      backgroundColor: '#FFFFFF',
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: '#EEE',
    },
    cardSelected: {
      borderColor: '#F9C933',
      backgroundColor: '#FFF7D9',
    },
    iconWrapper: {
      width: 50,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 18,
    },
    icon: {
      width: 40,
      height: 40,
      resizeMode: 'contain',
      tintColor: '#F9C933',
    },
    name: {
      fontSize: 14,
      fontFamily: 'Poppins SemiBold',
      color: '#000',
    },
    desc: {
      fontSize: 10,
      color: '#777',
      fontFamily: 'Poppins Regular',
    },
    goBack: {
      marginTop: 5,
      alignItems: 'center',
    },
    goBackText: {
      fontSize: 16,
      color: '#E4B400',
      fontFamily: 'Poppins SemiBold',
    },
  });
