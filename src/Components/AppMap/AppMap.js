import React, { useEffect, useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Constants } from '@/Utils';

const fetchRoute = async (waypoints, apiKey) => {
  try {
    const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
    const destination = `${waypoints[waypoints.length - 1].lat},${
      waypoints[waypoints.length - 1].lng
    }`;
    const wp =
      waypoints.length > 2
        ? `&waypoints=${waypoints
            .slice(1, -1)
            .map(p => `${p.lat},${p.lng}`)
            .join('|')}`
        : '';

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}${wp}&mode=driving&key=${apiKey}`,
    );
    const json = await response.json();

    if (json.routes && json.routes.length > 0) {
      const points = json.routes[0].overview_polyline.points;
      return decodePolyline(points);
    }
    return [];
  } catch (e) {
    console.error('Error fetching Google route:', e);
    return [];
  }
};

// Decode Google polyline
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
  riderLat,
  riderLong,
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

    const waypoints = [];
    if (riderLat && riderLong) {
      waypoints.push({ lat: parseFloat(riderLat), lng: parseFloat(riderLong) });
    }
    if (firstMarkerLat && firstMarkerLong) {
      waypoints.push({
        lat: parseFloat(firstMarkerLat),
        lng: parseFloat(firstMarkerLong),
      });
    }
    if (secondMarkerLat && secondMarkerLong) {
      waypoints.push({
        lat: parseFloat(secondMarkerLat),
        lng: parseFloat(secondMarkerLong),
      });
    }

    if (waypoints.length >= 2) {
      fetchRoute(waypoints, apiKey).then(setRouteCoords);

      const lats = waypoints.map(p => p.lat);
      const lngs = waypoints.map(p => p.lng);

      const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
      const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

      const latDelta = (Math.max(...lats) - Math.min(...lats)) * 1.5;
      const lonDelta = (Math.max(...lngs) - Math.min(...lngs)) * 1.5;

      setRegion({
        latitude: centerLat + latOffset,
        longitude: centerLng,
        latitudeDelta: Math.max(latDelta, minDelta),
        longitudeDelta: Math.max(lonDelta, minDelta),
      });
    }
  }, [
    riderLat,
    riderLong,
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
      {routeCoords.length > 0 && (
        <Marker
          coordinate={routeCoords[0]}
          title="Rider"
          anchor={{ x: 0.5, y: 0.5 }}>
          <Image
            source={require('@/Assets/Common/Rider_Pin.png')}
            style={{
              width: 75,
              height: 75,
              resizeMode: 'contain',
              tintColor: 'red',
            }}
          />
        </Marker>
      )}
      {firstMarkerLat && firstMarkerLong && (
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
      {secondMarkerLat && secondMarkerLong && (
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
