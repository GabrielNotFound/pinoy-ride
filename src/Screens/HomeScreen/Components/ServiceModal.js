import React from 'react';
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from 'react-native-paper';

const services = [
  {
    id: 1,
    icon: require('@/Assets/Common/HomeScreen/Motorcycle.png'),
    title: 'Motorcycle',
    subtitle: 'Lorem ipsum dolor sit amet consectetur.',
  },
  {
    id: 2,
    icon: require('@/Assets/Common/HomeScreen/Car.png'),
    title: 'Car (4 Seaters)',
    subtitle: 'Lorem ipsum dolor sit amet consectetur.',
  },
  {
    id: 3,
    icon: require('@/Assets/Common/HomeScreen/Car.png'),
    title: 'Car (6 Seaters)',
    subtitle: 'Lorem ipsum dolor sit amet consectetur.',
  },
];

const ServiceModal = ({ visible, onClose, onSelect }) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.cardWrapper}>
              <View style={styles.card}>
                <View style={styles.header}>
                  <Text style={styles.title}>Lorem Ipsum</Text>
                  <Text style={styles.subtitle}>
                    Lorem ipsum dolor sit amet consectetur.
                  </Text>
                </View>
                <View style={styles.servicesContainer}>
                  {services.map((service, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.serviceItem,
                        index === services.length - 1 && { marginBottom: 0 },
                      ]}
                      onPress={() => {
                        onSelect(service);
                        onClose();
                      }}>
                      <Image source={service.icon} style={styles.serviceIcon} />
                      <View>
                        <Text style={styles.serviceTitle}>{service.title}</Text>
                        <Text style={styles.serviceSubtitle}>
                          {service.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ServiceModal;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    card: {
      backgroundColor: '#F7F9FC',
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 10,
      width: 335,
      height: 335,
      overflow: 'hidden',
    },
    header: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 23,
      paddingVertical: 18,
      backgroundColor: 'white',
    },
    title: {
      fontSize: 20,
      fontFamily: 'Poppins Medium',
      fontWeight: '500',
      color: colors.shadow,
    },
    subtitle: {
      fontSize: 8,
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      color: colors.darkGrey,
    },
    servicesContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#F4F7FF',
      paddingHorizontal: 23,
    },
    serviceItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 30,
    },
    serviceIcon: {
      width: 40,
      height: 40,
      marginRight: 16,
      resizeMode: 'contain',
    },
    serviceTitle: {
      fontSize: 16,
      fontFamily: 'Poppins Regular',
      fontWeight: '400',
      color: colors.shadow,
    },
    serviceSubtitle: {
      fontSize: 8,
      fontFamily: 'Poppins Regular',
      color: colors.darkGrey,
    },
  });
