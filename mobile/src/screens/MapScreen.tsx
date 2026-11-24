import { useCallback, useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Camera, Map, Marker, UserLocation } from "@maplibre/maplibre-react-native";

import type { RootStackParamList } from "../../App";
import { getLocations } from "../api/client";
import type { LocationMarker } from "../api/types";
import { ActionButton } from "../components/ActionButton";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { useProximity } from "../location/useProximity";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Map">;
const TIMISOARA_CENTER = [21.2300, 45.7581] as [number, number];
const MAP_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export function MapScreen({ navigation }: Props) {
  const [locations, setLocations] = useState<LocationMarker[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationMarker | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);
  const [loading, setLoading] = useState(true);
  const proximity = useProximity(selectedLocation);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const loadedLocations = await getLocations();
      setLocations(loadedLocations);
      setSelectedLocation(loadedLocations[0] ?? null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load locations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Finding stories..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle={MAP_STYLE}
        onDidFailLoadingMap={() => setMapError(true)}
        onDidFinishLoadingMap={() => setMapError(false)}
      >
        <Camera
          initialViewState={{ center: TIMISOARA_CENTER, zoom: 13 }}
        />
        <UserLocation accuracy animated />
        {locations.map((location) => (
          <Marker
            key={location.id}
            id={location.id}
            lngLat={[location.longitude, location.latitude]}
            onPress={() => setSelectedLocation(location)}
          >
            <View style={styles.marker}>
              <Text style={styles.markerText}>📍</Text>
            </View>
          </Marker>
        ))}
      </Map>

      <View style={styles.panel}>
        {mapError ? (
          <Text style={styles.notice}>Map tiles could not load. Check your internet connection.</Text>
        ) : null}
        <Text style={styles.eyebrow}>📜  YOUR NEXT CLUE</Text>
        <Text style={styles.name}>{selectedLocation?.name ?? "Choose a map pin"}</Text>
        <Text style={styles.description}>{selectedLocation?.description}</Text>
        {proximity.error ? <Text style={styles.notice}>{proximity.error}</Text> : null}
        {selectedLocation && proximity.distance !== null ? (
          <Text style={styles.distance}>
            {proximity.distance < 1000
              ? `${Math.round(proximity.distance)} m away`
              : `${(proximity.distance / 1000).toFixed(1)} km away`}
          </Text>
        ) : (
          <Text style={styles.notice}>Allow location access to check proximity.</Text>
        )}
        <ActionButton
          label={proximity.isNearby ? "Solve the challenge ✨" : "Get closer to unlock"}
          onPress={() => {
            if (!selectedLocation) return;
            if (proximity.isNearby) {
              navigation.navigate("Challenge", {
                challengeId: selectedLocation.challengeId,
                locationName: selectedLocation.name,
              });
            } else {
              Alert.alert(
                "Not quite there yet!",
                proximity.distance === null
                  ? "We’re waiting for your location. Check that location access is enabled."
                  : `To try this in the Android emulator, open Extended Controls (⋮) → Location, enter ${selectedLocation.latitude}, ${selectedLocation.longitude}, then choose Set location.`,
              );
            }
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.paper, flex: 1 },
  map: { flex: 1 },
  marker: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.pink,
    borderRadius: 22,
    borderWidth: 2,
    elevation: 3,
    height: 46,
    justifyContent: "center",
    width: 46,
  },
  markerText: { fontSize: 23 },
  panel: {
    backgroundColor: colors.paper,
    borderColor: colors.border,
    borderTopWidth: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
  },
  eyebrow: { color: colors.pinkDark, fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  name: { color: colors.ink, fontSize: 24, fontWeight: "800", marginTop: 6 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 4 },
  distance: { color: colors.ink, fontSize: 15, fontWeight: "700", marginTop: 12 },
  notice: { color: colors.pinkDark, fontSize: 14, lineHeight: 20, marginTop: 12 },
});
