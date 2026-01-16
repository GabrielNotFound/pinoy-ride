import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';

const TAC = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
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
          <Text style={styles.headerTitle}>Terms And Condition</Text>
          <View style={styles.spacing} />
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <Text style={styles.documentTitle}>
          PINOY RIDE TRANSPORT CORPORATION{'\n'}
          TERMS & CONDITIONS
        </Text>

        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Welcome to Pinoy Ride, a Filipino-made ride-hailing platform
            dedicated to providing safe, reliable and sustainable great-seat
            transportation services within the Philippines. By downloading or
            using the Pinoy Ride App or by requesting a ride, you agree to be
            bound by these Terms and Conditions ("T&Cs").
          </Text>
          <Text style={styles.paragraph}>
            Please read these T&Cs carefully before using the platform. These
            T&Cs govern the contractual agreement between Pinoy Ride Transport
            Corporation and you, the passenger or driver.
          </Text>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Definitions</Text>
          <Text style={styles.paragraph}>
            • "App" – The Pinoy Ride app or any other platform operating under
            the Pinoy Ride brand.
          </Text>
          <Text style={styles.paragraph}>
            • "User" – The Pinoy Ride technology user which may include both
            passengers and drivers.
          </Text>
          <Text style={styles.paragraph}>
            • "Passenger" – Any individual using Pinoy Ride to request
            transportation.
          </Text>
          <Text style={styles.paragraph}>
            • "Driver" or "Driver" – Any individual providing transportation
            services using the Pinoy Ride platform.
          </Text>
          <Text style={styles.paragraph}>
            • "Ride" – The service provided to the Passenger through the App.
          </Text>
        </View>

        {/* Section 3 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Eligibility</Text>
          <Text style={styles.paragraph}>
            To use Pinoy Ride services, you must:
          </Text>
          <Text style={styles.paragraph}>• Be at least 18 years old</Text>
          <Text style={styles.paragraph}>
            • Must be physically located within the Philippines and its
            territories at the time of booking
          </Text>
          <Text style={styles.paragraph}>
            • Have a valid mobile number registered with the app
          </Text>
          <Text style={styles.paragraph}>
            • Provide a valid payment method (cash or e-payment, depending on
            area)
          </Text>
          <Text style={styles.paragraph}>
            • Must use the app on a registered device for security and
            verification purposes
          </Text>
          <Text style={styles.paragraph}>
            • Must accept and agree to all terms before using the service
          </Text>
          <Text style={styles.paragraph}>
            • Must show a valid professional driver's license. Must prove
            car/motorcycle ownership or authority.
          </Text>
        </View>

        {/* Section 4 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Use of the Platform</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>
              4.1 Passenger Responsibilities{'\n'}
            </Text>
            Passengers agree to use Pinoy Ride in accordance with Philippine
            laws and regulations. You must:
          </Text>
          <Text style={styles.paragraph}>
            • Provide accurate pickup and drop-off information
          </Text>
          <Text style={styles.paragraph}>
            • Treat the driver, co-passengers, and other road users with respect
            and courtesy
          </Text>
          <Text style={styles.paragraph}>
            • Comply with safety regulations (e.g. wearing seatbelts, not
            endangering passengers, etc.)
          </Text>
          <Text style={styles.paragraph}>
            • Not bring prohibited items, hazardous materials, or weapons
          </Text>
          <Text style={styles.paragraph}>
            • Follow public health compliance guidelines provided and advised by
            the national government
          </Text>
        </View>

        {/* Section 5 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Booking and Pricing</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>5.1 Ride Booking{'\n'}</Text>
            All ride bookings are made through the app. Pricing is calculated
            based on the Order computation and:
          </Text>
          <Text style={styles.paragraph}>• Distance</Text>
          <Text style={styles.paragraph}>
            • Expected ride duration (time, traffic, and vehicular flow)
          </Text>
          <Text style={styles.paragraph}>
            • Ride Type (standard, executive/luxury, roaming, etc.)
          </Text>
          <Text style={styles.paragraph}>
            • Traffic conditions (delay/congestion/accident/emergency/surge)
          </Text>
          <Text style={styles.paragraph}>
            • Dynamic pricing during high-demand periods
          </Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>5.2 Rider Cancellations{'\n'}</Text>•
            Riders should only cancel for valid reasons (vehicle issues,
            illness, unsafe drop-offs, emergencies, safety concerns).
          </Text>
          <Text style={styles.paragraph}>
            • Multiple cancellations may lead to suspension, temporary or
            permanent.
          </Text>
          <Text style={styles.paragraph}>
            • In certain cases, excessive safety concerns, inappropriate use or
            abuse of services, inappropriate cancellation practices.
          </Text>
        </View>

        {/* Section 6 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Fares and Payments</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6.1 Accepted Payment Methods{'\n'}</Text>
            Pinoy Ride accepts:
          </Text>
          <Text style={styles.paragraph}>
            • Cash (subject to driver acceptance)
          </Text>
          <Text style={styles.paragraph}>
            • E-Wallet (GCash, PayMaya, etc.)
          </Text>
          <Text style={styles.paragraph}>• Credit/Debit Cards</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>6.2 Fare Adjustments{'\n'}</Text>
            Fares may change based on route changes, traffic, tolls, additional
            stops, and unforeseen delays.
          </Text>
        </View>

        {/* Section 7 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Ratings and Feedback</Text>
          <Text style={styles.paragraph}>
            Passengers and drivers may rate each other through the app.
          </Text>
          <Text style={styles.paragraph}>
            • Passengers may rate after or during ride completion
          </Text>
          <Text style={styles.paragraph}>
            • Drivers rate/provide only upon ride confirmation
          </Text>
          <Text style={styles.paragraph}>
            • Rates or reviews based on any inappropriate or offensive conduct
            may be removed
          </Text>
        </View>

        {/* Section 8 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Safety and Security</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>8.1 Prohibited Behaviors{'\n'}</Text>
            Passengers agree to refrain from:
          </Text>
          <Text style={styles.paragraph}>
            • Harassing, threatening or discriminating or harassing drivers
          </Text>
          <Text style={styles.paragraph}>
            • Riding illegally (intoxicated, with banned items, unsafe items,
            etc.)
          </Text>
          <Text style={styles.paragraph}>• Damaging the driver's vehicle</Text>
          <Text style={styles.paragraph}>
            <Text style={styles.bold}>8.2 Safety Measures{'\n'}</Text>
            Pinoy Ride has implemented:
          </Text>
          <Text style={styles.paragraph}>
            • Background and safety checks for drivers
          </Text>
          <Text style={styles.paragraph}>
            • In-app emergency features (e.g. SOS button, sharing rides)
          </Text>
          <Text style={styles.paragraph}>• 24/7 customer support</Text>
        </View>

        {/* Section 9 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            9. Vehicle & Rider Compliance (For Drivers)
          </Text>
          <Text style={styles.paragraph}>Drivers must:</Text>
          <Text style={styles.paragraph}>
            • Ensure their vehicle meets all safety, regulatory and operational
            requirements
          </Text>
          <Text style={styles.paragraph}>
            • Maintain valid LTFRB accreditation and vehicle registration
          </Text>
          <Text style={styles.paragraph}>
            • Keep current Philippine professional driver's license
          </Text>
          <Text style={styles.paragraph}>
            • Follow all applicable traffic laws and regulations
          </Text>
          <Text style={styles.paragraph}>
            • Maintain and responsibly service their vehicle at all times
          </Text>
        </View>

        {/* Section 10 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Personal Data & Privacy</Text>
          <Text style={styles.paragraph}>
            Pinoy Ride collects and processes your personal information for
            service delivery.
          </Text>
          <Text style={styles.paragraph}>
            By using the platform, you consent to our Data Privacy Act of 2012
            (R.A. No. 10173) compliance policy.
          </Text>
          <Text style={styles.paragraph}>
            • Data may be shared with authorized law enforcement upon request
          </Text>
        </View>

        {/* Section 11 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            Pinoy Ride is a technology platform and is not a transportation
            service provider.
          </Text>
          <Text style={styles.paragraph}>Pinoy Ride is not liable for:</Text>
          <Text style={styles.paragraph}>• Violations of traffic policies</Text>
          <Text style={styles.paragraph}>
            • Accidents, injuries or property damage during transport
          </Text>
          <Text style={styles.paragraph}>
            • Loss or theft of personal property
          </Text>
          <Text style={styles.paragraph}>
            • Inappropriateness or delays by drivers or third parties
          </Text>
        </View>

        {/* Section 12 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            12. Account Suspension or Termination
          </Text>
          <Text style={styles.paragraph}>
            Pinoy Ride may suspend or terminate user accounts for:
          </Text>
          <Text style={styles.paragraph}>• Repeated violations of terms</Text>
          <Text style={styles.paragraph}>
            • Violations of policy guidelines
          </Text>
          <Text style={styles.paragraph}>
            • Fraudulent or illegal activities
          </Text>
          <Text style={styles.paragraph}>
            • Misuse of the platform or inappropriate conduct
          </Text>
          <Text style={styles.paragraph}>
            • Unsafe driving practices or complaints
          </Text>
          <Text style={styles.paragraph}>
            • Inappropriate or abusive or breach of terms
          </Text>
        </View>

        {/* Section 13 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Dispute Resolution</Text>
          <Text style={styles.paragraph}>
            Users may file complaints through the in-app help center, or through
            official Pinoy Ride channels.
          </Text>
          <Text style={styles.paragraph}>
            Disputes will be resolved through:
          </Text>
          <Text style={styles.paragraph}>
            • Mediation or arbitration as necessary
          </Text>
          <Text style={styles.paragraph}>
            • Legal action (under the jurisdiction of Philippine courts) and
            judicial courts proceedings
          </Text>
        </View>

        {/* Section 14 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Amendments to Terms</Text>
          <Text style={styles.paragraph}>
            Pinoy Ride reserves the right to update or modify these terms at any
            time. Users will be notified of significant changes.
          </Text>
          <Text style={styles.paragraph}>
            Continued use of the platform signifies acceptance of any changes.
          </Text>
        </View>

        {/* Section 15 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>15. Contact Information</Text>
          <Text style={styles.paragraph}>
            For questions, concerns or assistance, users may contact:
          </Text>
          <Text style={styles.paragraph}>
            Pinoy Ride via email, customer service or in-app support.
          </Text>
        </View>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

export default TAC;

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
    scrollView: {
      flex: 1,
      backgroundColor: '#fff',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 30,
    },
    documentTitle: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 20,
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontFamily: 'Poppins SemiBold',
      fontSize: 13,
      marginBottom: 8,
      lineHeight: 18,
    },
    paragraph: {
      fontFamily: 'Poppins Regular',
      fontSize: 11,
      lineHeight: 16,
      marginBottom: 6,
      marginLeft: 10,
      textAlign: 'justify',
    },
    bold: {
      fontFamily: 'Poppins SemiBold',
    },
    bottomSpacer: {
      height: 20,
    },
  });
