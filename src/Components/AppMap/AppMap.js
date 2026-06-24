import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Constants } from '@/Utils';

const AppMap = forwardRef(
  (
    {
      initialLat,
      initialLong,
      locationReady,
      firstMarkerLat,
      firstMarkerLong,
      secondMarkerLat,
      secondMarkerLong,
      // 🆕 Rider marker props (only passed when bookingStatus === 1)
      riderMarkerLat,
      riderMarkerLong,
      minDelta = 0.02,
      latOffset = -0.01,
      onMapPress,
      interactive = true,
      style,
    },
    ref,
  ) => {
    const { colors } = useTheme();
    const styles = getStyles({ colors });
    const mapRef = useRef(null);
    const [mapReady, setMapReady] = useState(false);
    const [routeCoords, setRouteCoords] = useState([]);

    useImperativeHandle(ref, () => ({
      fitToMarkers: () => {
        if (mapRef.current && firstMarkerLat && secondMarkerLat) {
          mapRef.current.fitToCoordinates(
            [
              {
                latitude: parseFloat(firstMarkerLat),
                longitude: parseFloat(firstMarkerLong),
              },
              {
                latitude: parseFloat(secondMarkerLat),
                longitude: parseFloat(secondMarkerLong),
              },
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
            },
          );
        }
      },
    }));

    useEffect(() => {
      if (!mapReady || !mapRef.current || !locationReady) {
        return;
      }

      if (firstMarkerLat && secondMarkerLat) {
        mapRef.current.fitToCoordinates(
          [
            {
              latitude: parseFloat(firstMarkerLat),
              longitude: parseFloat(firstMarkerLong),
            },
            {
              latitude: parseFloat(secondMarkerLat),
              longitude: parseFloat(secondMarkerLong),
            },
          ],
          {
            edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
            animated: true,
          },
        );
      } else if (firstMarkerLat) {
        mapRef.current.animateToRegion(
          {
            latitude: parseFloat(firstMarkerLat),
            longitude: parseFloat(firstMarkerLong),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500,
        );
      } else {
        mapRef.current.animateToRegion(
          {
            latitude: initialLat,
            longitude: initialLong,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          },
          500,
        );
      }
    }, [
      mapReady,
      locationReady,
      firstMarkerLat,
      firstMarkerLong,
      secondMarkerLat,
      secondMarkerLong,
      initialLat,
      initialLong,
    ]);

    useEffect(() => {
      const fetchRoute = async () => {
        if (!firstMarkerLat || !secondMarkerLat) {
          return;
        }
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${firstMarkerLat},${firstMarkerLong}&destination=${secondMarkerLat},${secondMarkerLong}&mode=driving&key=${Constants.GOOGLE_MAP_API_KEY}`,
          );
          const data = await response.json();
          if (data.routes && data.routes.length > 0) {
            setRouteCoords(
              decodePolyline(data.routes[0].overview_polyline.points),
            );
          }
        } catch (e) {
          console.error('Error fetching route:', e);
        }
      };
      fetchRoute();
    }, [firstMarkerLat, firstMarkerLong, secondMarkerLat, secondMarkerLong]);

    const decodePolyline = encoded => {
      let points = [],
        index = 0,
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
    };

    return (
      <MapView
        ref={mapRef}
        style={[styles.container, style]}
        provider="google"
        onMapReady={() => setMapReady(true)}
        initialRegion={{
          latitude: 14.5995,
          longitude: 120.9842,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={interactive}
        zoomEnabled={interactive}
        rotateEnabled={interactive}
        pitchEnabled={interactive}
        toolbarEnabled={interactive}
        onPress={
          interactive && onMapPress
            ? e => {
                const { latitude, longitude } = e.nativeEvent.coordinate;
                onMapPress({ latitude, longitude });
              }
            : null
        }>
        {firstMarkerLat && firstMarkerLong && (
          <Marker
            coordinate={{
              latitude: parseFloat(firstMarkerLat),
              longitude: parseFloat(firstMarkerLong),
            }}
            title="Pickup"
            pinColor="blue"
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
          />
        )}
        {/* 🆕 Rider marker - only visible when bookingStatus === 1 (rider on the way to pickup) */}
        {riderMarkerLat && riderMarkerLong && (
          <Marker
            coordinate={{
              latitude: parseFloat(riderMarkerLat),
              longitude: parseFloat(riderMarkerLong),
            }}
            title="Rider"
            description="Your rider is on the way"
            pinColor="yellow"
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
  },
);

export default AppMap;

const getStyles = ({ colors }) => StyleSheet.create({ container: { flex: 1 } });
