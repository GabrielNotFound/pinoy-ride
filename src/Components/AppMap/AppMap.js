import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Constants } from '@/Utils';

const fetchRoute = async (start, end, apiKey) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${start.lat},${start.lng}&destination=${end.lat},${end.lng}&mode=driving&key=${apiKey}`,
    );
    const json = await response.json();

    if (json.routes && json.routes.length > 0) {
      const points = json.routes[0].overview_polyline.points;

      // decode polyline → array of lat/lng
      return decodePolyline(points);
    }
    return [];
  } catch (e) {
    console.error('Error fetching Google route:', e);
    return [];
  }
};

// Polyline decoder for Google Directions API
function decodePolyline(encoded) {
  let points = [];
  let index = 0,
    lat = 0,
    lng = 0;

  while (index < encoded.length) {
    let b,
      shift = 0,
      result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

const AppMap = ({
  initialLat,
  initialLong,
  firstMarkerLat,
  firstMarkerLong,
  secondMarkerLat,
  secondMarkerLong,
  minDelta = 0.02,
  latOffset = -0.01,
  onMapPress,
  interactive = true,
  style,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLong,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);

  useEffect(() => {
    const apiKey = Constants.GOOGLE_MAP_API_KEY;

    if (firstMarkerLat != null && secondMarkerLat != null) {
      // Both markers present - show route between them
      fetchRoute(
        { lat: parseFloat(firstMarkerLat), lng: parseFloat(firstMarkerLong) },
        { lat: parseFloat(secondMarkerLat), lng: parseFloat(secondMarkerLong) },
        apiKey,
      ).then(setRouteCoords);

      const centerLat =
        (parseFloat(firstMarkerLat) + parseFloat(secondMarkerLat)) / 2;
      const centerLong =
        (parseFloat(firstMarkerLong) + parseFloat(secondMarkerLong)) / 2;
      const latDelta =
        Math.abs(parseFloat(firstMarkerLat) - parseFloat(secondMarkerLat)) *
        1.5;
      const lonDelta =
        Math.abs(parseFloat(firstMarkerLong) - parseFloat(secondMarkerLong)) *
        1.5;

      setRegion({
        latitude: centerLat + latOffset,
        longitude: centerLong,
        latitudeDelta: Math.max(latDelta, minDelta),
        longitudeDelta: Math.max(lonDelta, minDelta),
      });
    } else if (firstMarkerLat != null) {
      // Only first marker (pickup) - center on it
      setRegion({
        latitude: parseFloat(firstMarkerLat),
        longitude: parseFloat(firstMarkerLong),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      // No markers - use initial location (user's GPS or fallback)
      setRegion({
        latitude: initialLat,
        longitude: initialLong,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [
    initialLat, // Added to dependencies
    initialLong, // Added to dependencies
    firstMarkerLat,
    firstMarkerLong,
    secondMarkerLat,
    secondMarkerLong,
  ]);

  return (
    <MapView
      style={[styles.container, style]}
      region={region}
      provider="google"
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      rotateEnabled={interactive}
      pitchEnabled={interactive}
      toolbarEnabled={interactive}
      onPress={
        interactive && onMapPress
          ? e => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              setSelectedMarker({ latitude, longitude });
              onMapPress({ latitude, longitude });
            }
          : null
      }>
      {selectedMarker && (
        <Marker coordinate={selectedMarker} title="Selected Location" />
      )}
      {firstMarkerLat != null && firstMarkerLong != null && (
        <Marker
          coordinate={{
            latitude: parseFloat(firstMarkerLat),
            longitude: parseFloat(firstMarkerLong),
          }}
          title="Pickup"
          pinColor="blue"
          anchor={{ x: 0.5, y: 1 }}
        />
      )}
      {secondMarkerLat != null && secondMarkerLong != null && (
        <Marker
          coordinate={{
            latitude: parseFloat(secondMarkerLat),
            longitude: parseFloat(secondMarkerLong),
          }}
          title="Dropoff"
          pinColor="red"
          anchor={{ x: 0.5, y: 1 }}
        />
      )}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor={colors.primary}
          strokeWidth={6}
        />
      )}
    </MapView>
  );
};

export default AppMap;

const getStyles = ({ colors }) => StyleSheet.create({ container: { flex: 1 } });
