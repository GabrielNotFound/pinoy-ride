import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
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
  initialLat = 14.6042,
  initialLong = 120.9822,
  riderLat,
  riderLong,
  firstMarkerLat,
  firstMarkerLong,
  secondMarkerLat,
  secondMarkerLong,
  minDelta = 0.02,
  latOffset = 0,
  onMapPress,
  interactive = true,
  style,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude: initialLat || 14.53507,
    longitude: initialLong || 120.98216,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [isRouteView, setIsRouteView] = useState(true); // Toggle between route view and free view

  // Store the route coordinates for re-fitting
  const savedRouteCoords = useRef([]);

  useEffect(() => {
    const apiKey = Constants.GOOGLE_MAP_API_KEY;
    const waypoints = [];

    // Add rider location as starting point
    if (riderLat != null && riderLong != null) {
      waypoints.push({ lat: parseFloat(riderLat), lng: parseFloat(riderLong) });
    }

    // Add first marker (pickup)
    if (firstMarkerLat != null && firstMarkerLong != null) {
      waypoints.push({
        lat: parseFloat(firstMarkerLat),
        lng: parseFloat(firstMarkerLong),
      });
    }

    // Add second marker (dropoff)
    if (secondMarkerLat != null && secondMarkerLong != null) {
      waypoints.push({
        lat: parseFloat(secondMarkerLat),
        lng: parseFloat(secondMarkerLong),
      });
    }

    // Fetch route if we have at least 2 waypoints
    if (waypoints.length >= 2) {
      fetchRoute(waypoints, apiKey).then(coords => {
        setRouteCoords(coords);
        savedRouteCoords.current = coords;

        // Fit map to show entire route with padding (only if in route view mode)
        if (coords.length > 0 && mapRef.current && isRouteView) {
          setTimeout(() => {
            mapRef.current.fitToCoordinates(coords, {
              edgePadding: {
                top: 100,
                right: 50,
                bottom: 300, // More padding at bottom for UI
                left: 50,
              },
              animated: true,
            });
          }, 300);
        }
      });
    } else if (firstMarkerLat != null) {
      // Only first marker, center on it
      setRouteCoords([]);
      savedRouteCoords.current = [];
      setRegion({
        latitude: parseFloat(firstMarkerLat),
        longitude: parseFloat(firstMarkerLong),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else if (riderLat != null && riderLong != null) {
      // Only rider location, center on rider
      setRouteCoords([]);
      savedRouteCoords.current = [];
      setRegion({
        latitude: parseFloat(riderLat),
        longitude: parseFloat(riderLong),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    } else {
      // No markers or rider, use initial location
      setRouteCoords([]);
      savedRouteCoords.current = [];
      setRegion({
        latitude: initialLat || 14.6042,
        longitude: initialLong || 120.9822,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [
    initialLat,
    initialLong,
    riderLat,
    riderLong,
    firstMarkerLat,
    firstMarkerLong,
    secondMarkerLat,
    secondMarkerLong,
    isRouteView, // Re-fit when toggling back to route view
  ]);

  // Function to toggle between route view and free view
  const handleToggleView = () => {
    if (!isRouteView && savedRouteCoords.current.length > 0) {
      // Switching back to route view - re-fit to route
      mapRef.current?.fitToCoordinates(savedRouteCoords.current, {
        edgePadding: {
          top: 100,
          right: 50,
          bottom: 300,
          left: 50,
        },
        animated: true,
      });
    }
    setIsRouteView(!isRouteView);
  };

  // Center on rider location
  const handleCenterOnRider = () => {
    if (riderLat != null && riderLong != null && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: parseFloat(riderLat),
          longitude: parseFloat(riderLong),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <MapView
        ref={mapRef}
        style={[styles.container, style]}
        region={region}
        provider={PROVIDER_GOOGLE}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        toolbarEnabled={interactive}
        loadingEnabled={true}
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor="#ffffff"
        onPress={
          interactive && onMapPress
            ? e => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                setSelectedMarker({ latitude, longitude });
                onMapPress({ latitude, longitude });
              }
            : null
        }
        onRegionChangeComplete={() => {
          // When user manually moves map, switch to free view
          if (isRouteView) {
            setIsRouteView(false);
          }
        }}>
        {selectedMarker && (
          <Marker coordinate={selectedMarker} title="Selected Location" />
        )}

        {/* Route Polyline - Draw FIRST so markers appear on top */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* ✅ Rider Marker - Uses first point of route when route exists */}
        {riderLat != null && riderLong != null && (
          <Marker
            coordinate={
              routeCoords.length > 0
                ? routeCoords[0] // Use first point of route if route exists
                : {
                    latitude: parseFloat(riderLat),
                    longitude: parseFloat(riderLong),
                  }
            }
            title="You"
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={1000}>
            <Image
              source={require('@/Assets/Common/Rider_Pin.png')}
              style={{
                width: 70,
                height: 70,
                resizeMode: 'contain',
              }}
            />
          </Marker>
        )}

        {/* First Marker - Pickup */}
        {firstMarkerLat != null && firstMarkerLong != null && (
          <Marker
            coordinate={{
              latitude: parseFloat(firstMarkerLat),
              longitude: parseFloat(firstMarkerLong),
            }}
            title="Pickup Location"
            pinColor="blue"
            anchor={{ x: 0.5, y: 1 }}
            zIndex={999}
          />
        )}

        {/* Second Marker - Dropoff */}
        {secondMarkerLat != null && secondMarkerLong != null && (
          <Marker
            coordinate={{
              latitude: parseFloat(secondMarkerLat),
              longitude: parseFloat(secondMarkerLong),
            }}
            title="Drop-off Location"
            pinColor="red"
            anchor={{ x: 0.5, y: 1 }}
            zIndex={998}
          />
        )}
      </MapView>

      {/* View Toggle Button - Only show when there's a route */}
      {routeCoords.length > 0 && (
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={handleToggleView}>
          <Text style={styles.viewToggleText}>
            {isRouteView ? '🗺️ Free View' : '🧭 Route View'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Center on Rider Button */}
      {riderLat != null && riderLong != null && (
        <TouchableOpacity
          style={styles.centerButton}
          onPress={handleCenterOnRider}>
          <Text style={styles.centerButtonText}>📍</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AppMap;

const getStyles = ({ colors }) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    viewToggleButton: {
      position: 'absolute',
      top: 60,
      right: 16,
      backgroundColor: colors.background,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    viewToggleText: {
      color: colors.shadow,
      fontFamily: 'Poppins SemiBold',
      fontSize: 14,
    },
    centerButton: {
      position: 'absolute',
      top: 110,
      right: 16,
      backgroundColor: colors.background,
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    centerButtonText: {
      fontSize: 24,
    },
    riderMarker: {
      width: 50,
      height: 50,
      backgroundColor: '#FFD700',
      borderRadius: 25,
      borderWidth: 3,
      borderColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    riderEmoji: {
      fontSize: 28,
    },
    pickupMarker: {
      width: 45,
      height: 45,
      backgroundColor: '#2196F3',
      borderRadius: 23,
      borderWidth: 3,
      borderColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    dropoffMarker: {
      width: 45,
      height: 45,
      backgroundColor: '#F44336',
      borderRadius: 23,
      borderWidth: 3,
      borderColor: '#FFF',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 5,
    },
    markerEmoji: {
      fontSize: 24,
    },
  });
