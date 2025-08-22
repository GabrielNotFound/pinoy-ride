import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';

// Fetch route from OpenRouteService API
const fetchRoute = async (start, end, apiKey) => {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`,
    );
    const json = await response.json();

    if (json.features && json.features.length > 0) {
      return json.features[0].geometry.coordinates.map(coord => ({
        latitude: coord[1],
        longitude: coord[0],
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching route:', error);
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
  style,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });

  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    //ORS apiKey
    const apiKey =
      'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImYyNTU1ODYxOTc4NDQ4MzA5MjNhZmUzZmM1OTdmMjJmIiwiaCI6Im11cm11cjY0In0=';
    if (
      firstMarkerLat &&
      firstMarkerLong &&
      secondMarkerLat &&
      secondMarkerLong
    ) {
      fetchRoute(
        { lat: firstMarkerLat, lng: firstMarkerLong },
        { lat: secondMarkerLat, lng: secondMarkerLong },
        apiKey,
      ).then(setRouteCoords);
    }
  }, [firstMarkerLat, firstMarkerLong, secondMarkerLat, secondMarkerLong]);

  return (
    <MapView
      style={[styles.container, style]}
      initialRegion={{
        latitude: initialLat || 14.5995,
        longitude: initialLong || 120.9842,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
      {/* OSM Tiles */}
      <UrlTile
        urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maximumZ={19}
        flipY={false}
      />

      {/* Markers */}
      {firstMarkerLat && firstMarkerLong && (
        <Marker
          coordinate={{ latitude: firstMarkerLat, longitude: firstMarkerLong }}
          title="Start"
        />
      )}
      {secondMarkerLat && secondMarkerLong && (
        <Marker
          coordinate={{
            latitude: secondMarkerLat,
            longitude: secondMarkerLong,
          }}
          title="Destination"
        />
      )}

      {/* Route line (real roads from ORS) */}
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

const getStyles = ({ colors }) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
  });
