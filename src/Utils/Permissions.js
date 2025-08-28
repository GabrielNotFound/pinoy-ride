import { Platform } from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  check,
  openSettings,
  request,
} from 'react-native-permissions';

export const LOCATION_PERMISSION = Platform.select({
  ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
  android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
});

export async function requestLocationPermission() {
  const result = await request(LOCATION_PERMISSION);

  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.DENIED:
    case RESULTS.UNAVAILABLE:
    default:
      return 'denied';
  }
}

export async function ensureLocationPermission() {
  const status = await check(LOCATION_PERMISSION);

  if (status === RESULTS.GRANTED) {
    return 'granted';
  }
  if (status === RESULTS.BLOCKED) {
    return 'blocked';
  }

  const newStatus = await requestLocationPermission();
  return newStatus;
}
