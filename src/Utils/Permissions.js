import { Platform } from 'react-native';
import { PERMISSIONS, RESULTS, check, request } from 'react-native-permissions';

export const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

export const CAMERA_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.CAMERA,
  android: PERMISSIONS.ANDROID.CAMERA,
});

// Request Location Permission
export async function requestLocationPermission() {
  const result = await request(LOCATION_PERMISSION);

  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.DENIED:
      return 'denied';
    default:
      return 'unavailable';
  }
}

// Check location first, only ask if needed
export async function ensureLocationPermission() {
  const status = await check(LOCATION_PERMISSION);

  switch (status) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked'; // user must go to settings
    case RESULTS.DENIED:
      return await requestLocationPermission(); // now request
    default:
      return 'unavailable';
  }
}

// Request Camera Permission
export async function requestCameraPermission() {
  const result = await request(CAMERA_PERMISSION);

  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.DENIED:
      return 'denied';
    default:
      return 'unavailable';
  }
}

//  Check first, then request ONLY IF denied
export async function ensureCameraPermission() {
  const status = await check(CAMERA_PERMISSION);

  switch (status) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked'; // requires settings
    case RESULTS.DENIED:
      return await requestCameraPermission();
    default:
      return 'unavailable';
  }
}
