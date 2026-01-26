import React, { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { openSettings } from 'react-native-permissions';

import { AlertBox } from '@/Components';
import {
  ensureLocationPermission,
  requestLocationPermission,
} from '@/Utils/Permissions';

/**
 * Global Location Monitor
 *
 * This component monitors location permission across the entire app.
 * Place it at the root of your navigation (e.g., in App.js or your main navigator).
 *
 * It will check location permission:
 * - On mount
 * - When app comes back from background
 * - Every 30 seconds while app is active (optional, can be removed)
 */
const GlobalLocationMonitor = ({ children }) => {
  const [showLocationAlert, setShowLocationAlert] = useState(false);
  const appState = useRef(AppState.currentState);
  const checkIntervalRef = useRef(null);

  // Check location permission
  const checkLocationPermission = async () => {
    const hasPermission = await ensureLocationPermission();

    if (!hasPermission) {
      setShowLocationAlert(true);
    } else {
      setShowLocationAlert(false);
    }

    return hasPermission;
  };

  // Handle retry permission
  const handleRetryPermission = async () => {
    const result = await requestLocationPermission();

    if (result === 'granted') {
      setShowLocationAlert(false);
    } else if (result === 'blocked') {
      // Permission is permanently blocked, open settings
      openSettings();
    } else {
      // Permission denied, keep showing alert
      setShowLocationAlert(true);
    }
  };

  // Initial check on mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Monitor app state changes (background/foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          // App came back to foreground, check permission
          await checkLocationPermission();
        }
        appState.current = nextAppState;
      },
    );

    return () => subscription.remove();
  }, []);

  // Optional: Periodic check while app is active (every 30 seconds)
  // Remove this useEffect if you don't want periodic checks
  useEffect(() => {
    // Start periodic check
    checkIntervalRef.current = setInterval(() => {
      if (appState.current === 'active') {
        checkLocationPermission();
      }
    }, 3000); // Check every 30 seconds

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Global Location Alert */}
      <AlertBox
        title="Location Required"
        message="This app requires location access to function properly. Please enable location services."
        visible={showLocationAlert}
        setVisible={setShowLocationAlert}
        onConfirm={handleRetryPermission}
        dismissable={false} // Prevent dismissing without action
      />

      {children}
    </>
  );
};

export default GlobalLocationMonitor;
