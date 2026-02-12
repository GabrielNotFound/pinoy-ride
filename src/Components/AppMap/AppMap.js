import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { Constants } from '@/Utils';

const AppMap = ({
  initialLat = 14.6042,
  initialLong = 120.9822,
  locationReady,
  riderLat,
  riderLong,
  firstMarkerLat,
  firstMarkerLong,
  secondMarkerLat,
  secondMarkerLong,
  interactive = true,
  style,
}) => {
  const { colors } = useTheme();
  const styles = getStyles({ colors });
  const mapRef = useRef(null);
  const riderMarkerRef = useRef(null); // ✅ stable marker

  const [region, setRegion] = useState({
    latitude: initialLat,
    longitude: initialLong,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [routeCoords, setRouteCoords] = useState([]);
  const [isRouteView, setIsRouteView] = useState(false);
  const [currentHeading, setCurrentHeading] = useState(0);
  const hasCentered = useRef(false);

  /* =======================================================
     CONTROLLED REGION
     ======================================================= */
  useEffect(() => {
    if (
      riderLat != null &&
      riderLong != null &&
      locationReady &&
      !isRouteView
    ) {
      setRegion({
        latitude: parseFloat(riderLat),
        longitude: parseFloat(riderLong),
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [riderLat, riderLong, locationReady, isRouteView]);

  /* =======================================================
     INITIAL CENTER ANIMATION
     ======================================================= */
  useEffect(() => {
    if (
      riderLat != null &&
      riderLong != null &&
      mapRef.current &&
      locationReady &&
      !hasCentered.current
    ) {
      hasCentered.current = true;

      mapRef.current.animateToRegion(
        {
          latitude: parseFloat(riderLat),
          longitude: parseFloat(riderLong),
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        1000,
      );
    }
  }, [riderLat, riderLong, locationReady]);

  /* =======================================================
     ROUTE FETCH
     ======================================================= */
  useEffect(() => {
    if (
      riderLat == null ||
      riderLong == null ||
      firstMarkerLat == null ||
      firstMarkerLong == null
    ) {
      setRouteCoords([]);
      return;
    }

    const apiKey = Constants.GOOGLE_MAP_API_KEY;
    const waypoints = [
      { lat: parseFloat(riderLat), lng: parseFloat(riderLong) },
      { lat: parseFloat(firstMarkerLat), lng: parseFloat(firstMarkerLong) },
    ];

    if (secondMarkerLat != null && secondMarkerLong != null) {
      waypoints.push({
        lat: parseFloat(secondMarkerLat),
        lng: parseFloat(secondMarkerLong),
      });
    }

    fetchRoute(waypoints, apiKey).then(coords => {
      setRouteCoords(coords);

      if (coords.length > 0 && mapRef.current && !isRouteView) {
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 50, bottom: 300, left: 50 },
          animated: true,
        });
      }
    });
  }, [firstMarkerLat, firstMarkerLong, secondMarkerLat, secondMarkerLong]); // no riderLat/Long dependency!

  /* =======================================================
     ROUTE VIEW CAMERA FOLLOW
     ======================================================= */
  useEffect(() => {
    if (!isRouteView || !riderLat || !riderLong || !mapRef.current) {return;}

    const interval = setInterval(() => {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: parseFloat(riderLat),
            longitude: parseFloat(riderLong),
          },
          pitch: 60,
          heading: currentHeading,
          zoom: 17,
        },
        { duration: 1000 },
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [isRouteView, riderLat, riderLong, currentHeading]);

  /* =======================================================
     UPDATE RIDER MARKER COORDINATE WITHOUT RE-RENDER
     ======================================================= */
  useEffect(() => {
    if (riderMarkerRef.current && riderLat != null && riderLong != null) {
      riderMarkerRef.current.animateMarkerToCoordinate(
        {
          latitude: parseFloat(riderLat),
          longitude: parseFloat(riderLong),
        },
        500, // duration in ms
      );
    }
  }, [riderLat, riderLong]);

  const handleToggleView = () => {
    setIsRouteView(prev => !prev);
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
        pitchEnabled={interactive}>
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor={colors.primary}
            strokeWidth={5}
          />
        )}

        {/* ✅ Rider Marker Stable */}
        <Marker
          ref={riderMarkerRef}
          coordinate={{
            latitude: parseFloat(riderLat || 0),
            longitude: parseFloat(riderLong || 0),
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          flat={isRouteView}
          rotation={currentHeading}>
          <Image
            source={require('@/Assets/Common/Rider_Pin.png')}
            style={{ width: 60, height: 60 }}
          />
        </Marker>

        {firstMarkerLat != null && firstMarkerLong != null && (
          <Marker
            coordinate={{
              latitude: parseFloat(firstMarkerLat),
              longitude: parseFloat(firstMarkerLong),
            }}
            pinColor="blue"
          />
        )}

        {secondMarkerLat != null && secondMarkerLong != null && (
          <Marker
            coordinate={{
              latitude: parseFloat(secondMarkerLat),
              longitude: parseFloat(secondMarkerLong),
            }}
            pinColor="red"
          />
        )}
      </MapView>

      {routeCoords.length > 0 && (
        <TouchableOpacity
          style={styles.viewToggleButton}
          onPress={handleToggleView}>
          <Text style={styles.viewToggleText}>
            {isRouteView ? '🗺️ Overview' : '🧭 Route View'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default AppMap;

/* =======================================================
   GOOGLE ROUTE FETCH
   ======================================================= */
const fetchRoute = async (waypoints, apiKey) => {
  try {
    const origin = `${waypoints[0].lat},${waypoints[0].lng}`;
    const destination = `${waypoints[waypoints.length - 1].lat},${
      waypoints[waypoints.length - 1].lng
    }`;

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${apiKey}`,
    );

    const json = await response.json();

    if (json.routes && json.routes.length > 0) {
      return decodePolyline(json.routes[0].overview_polyline.points);
    }

    return [];
  } catch (e) {
    console.error('Route error:', e);
    return [];
  }
};

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
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }

  return points;
}

const getStyles = ({ colors }) =>
  StyleSheet.create({
    wrapper: { flex: 1 },
    container: { flex: 1 },
    viewToggleButton: {
      position: 'absolute',
      top: 60,
      right: 16,
      backgroundColor: colors.background,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 25,
      elevation: 6,
    },
    viewToggleText: {
      color: colors.text,
      fontSize: 14,
    },
  });
