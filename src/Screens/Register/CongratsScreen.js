import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Container from '@/Components/Container/Container';
import { useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { AppButton } from '@/Components';

const CongratsScreen = () => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const navigation = useNavigation();

  // Animations
  const circleScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      // Circle pops in
      Animated.spring(circleScale, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      // Icon fades in
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      // Content slides up
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(contentSlide, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [circleScale, contentOpacity, contentSlide, iconOpacity]);

  const handleGoToLogin = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoginScreen', params: { registrationComplete: true } }],
    });
  };

  return (
    <Container style={styles.container}>
      {/* Full step bar — all filled */}
      <View style={styles.stepIndicatorContainer}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={[styles.stepDot, styles.stepDotActive]} />
        ))}
      </View>

      <View style={styles.centerContent}>
        {/* Animated success circle */}
        <Animated.View
          style={[
            styles.successCircle,
            { transform: [{ scale: circleScale }] },
          ]}>
          <Animated.Text style={[styles.checkIcon, { opacity: iconOpacity }]}>
            ✓
          </Animated.Text>
        </Animated.View>

        {/* Animated text content */}
        <Animated.View
          style={[
            styles.textContent,
            {
              opacity: contentOpacity,
              transform: [{ translateY: contentSlide }],
            },
          ]}>
          <Text style={styles.congratsLabel}>All done!</Text>
          <Text style={styles.congratsTitle}>Registration{'\n'}Successful</Text>
          <Text style={styles.congratsSubtitle}>
            Your application has been submitted. We'll review your information
            and notify you once your account is verified. This usually takes 1–2
            business days.
          </Text>

          {/* Status steps */}
          <View style={styles.statusSteps}>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, styles.statusDotDone]} />
              <View style={styles.statusLine} />
              <Text style={styles.statusText}>Details submitted</Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, styles.statusDotPending]} />
              <View style={styles.statusLine} />
              <Text style={styles.statusText}>
                Identity verification (in progress)
              </Text>
            </View>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, styles.statusDotWaiting]} />
              <View style={styles.statusLine} />
              <Text
                style={[
                  styles.statusText,
                  { color: styles.statusTextMuted.color },
                ]}>
                Account activation
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={[styles.footer, { opacity: contentOpacity }]}>
        <AppButton title="Go to Login" onPress={handleGoToLogin} isBold />
      </Animated.View>
    </Container>
  );
};

export default CongratsScreen;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 10,
    },
    stepIndicatorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
      marginBottom: 24,
    },
    stepDot: { height: 6, borderRadius: 3 },
    stepDotActive: { width: 24, backgroundColor: colors.primary },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    successCircle: {
      width: 110,
      height: 110,
      borderRadius: 55,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 32,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    checkIcon: {
      fontSize: 52,
      color: '#FFFFFF',
      fontWeight: '700',
      lineHeight: 60,
    },
    textContent: {
      alignItems: 'center',
      width: '100%',
    },
    congratsLabel: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
    },
    congratsTitle: {
      fontSize: 30,
      fontFamily: 'Poppins Medium',
      color: colors.text,
      textAlign: 'center',
      lineHeight: 38,
      marginBottom: 16,
    },
    congratsSubtitle: {
      fontSize: 14,
      fontFamily: 'Poppins Regular',
      color: colors.onSurfaceGrey || '#888',
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 32,
    },
    statusSteps: {
      width: '100%',
      gap: 12,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    statusDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    statusDotDone: { backgroundColor: colors.primary },
    statusDotPending: {
      backgroundColor: colors.primary + '60',
      borderWidth: 2,
      borderColor: colors.primary,
    },
    statusDotWaiting: {
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: colors.surfaceVariant || '#E0E0E0',
    },
    statusLine: { display: 'none' },
    statusText: {
      fontSize: 13,
      fontFamily: 'Poppins Regular',
      color: colors.text,
    },
    statusTextMuted: {
      color: colors.onSurfaceGrey || '#AAA',
    },
    footer: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
  });
