import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import { Constants } from '@/Utils';

const fetchRoute = async (start, end, apiKey) => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
    );
    const json = await response.json();
    if (json.features && json.features.length > 0) {
      return json.features[0].geometry.coordinates.map(c => ({
        latitude: c[1],
        longitude: c[0],
      }));
    }
    return [];
  } catch (e) {
    console.error('Error fetching route:', e);
    return [];
  }
};

const AppMap = ({
  initialLat,
  initialLong,
  firstMarkerLat,
  firstMarkerLong,
  secondMarkerLat,
  secondMarkerLong,
  minDelta = 0.02, // for maop zoom
  latOffset = -0.01, // for map centering
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

  // Recalculate route & region
  useEffect(() => {
    const apiKey = Constants.GOOGLE_MAP_API_KEY;

    if (firstMarkerLat != null && secondMarkerLat != null) {
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
      setRegion({
        latitude: parseFloat(firstMarkerLat),
        longitude: parseFloat(firstMarkerLong),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      setRegion({
        latitude: initialLat,
        longitude: initialLong,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [firstMarkerLat, firstMarkerLong, secondMarkerLat, secondMarkerLong]);

  return (
    <MapView
      style={[styles.container, style]}
      region={region}
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
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />

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
          strokeColor="blue"
          strokeWidth={4}
        />
      )}
    </MapView>
  );
};

export default AppMap;

const getStyles = ({ colors }) => StyleSheet.create({ container: { flex: 1 } });
