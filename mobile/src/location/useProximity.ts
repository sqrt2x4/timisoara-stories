import { useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";

import type { LocationMarker } from "../api/types";

type Coordinates = { latitude: number; longitude: number };

function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const earthRadius = 6_371_000;
  const latitudeDelta = ((to.latitude - from.latitude) * Math.PI) / 180;
  const longitudeDelta = ((to.longitude - from.longitude) * Math.PI) / 180;
  const latitude = (from.latitude * Math.PI) / 180;
  const targetLatitude = (to.latitude * Math.PI) / 180;
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const clampedHaversine = Math.min(1, Math.max(0, haversine));
  return earthRadius * 2 * Math.atan2(Math.sqrt(clampedHaversine), Math.sqrt(1 - clampedHaversine));
}

export function useProximity(selectedLocation: LocationMarker | null) {
  const [permission, setPermission] = useState<Location.PermissionStatus | null>(null);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    async function startTracking() {
      try {
        const result = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        setPermission(result.status);
        if (result.status !== Location.PermissionStatus.GRANTED) {
          setError("Location access was denied. You can still browse the map.");
          return;
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 25,
            timeInterval: 10_000,
          },
          (position) => {
            setCoordinates({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          },
        );
        if (cancelled) subscription.remove();
      } catch {
        if (!cancelled) {
          setError("We could not read your location. Check device location services.");
        }
      }
    }

    void startTracking();
    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);

  const distance = useMemo(() => {
    if (!coordinates || !selectedLocation) return null;
    return distanceInMeters(coordinates, selectedLocation);
  }, [coordinates, selectedLocation]);

  return {
    permission,
    coordinates,
    distance,
    isNearby: distance !== null && distance <= 100,
    error,
  };
}
