import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { CollectionScreen } from "./src/screens/CollectionScreen";
import { ChallengeScreen } from "./src/screens/ChallengeScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ErrorBoundary } from "./src/components/ErrorBoundary";
import { colors } from "./src/theme";

export type RootStackParamList = {
  Home: undefined;
  Map: undefined;
  Collection: undefined;
  Challenge: { challengeId: string; locationName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.paper },
            headerTintColor: colors.ink,
            headerTitleStyle: { color: colors.ink, fontWeight: "800" },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.paper },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Map" component={MapScreen} options={{ title: "Explore Timișoara" }} />
          <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: "Location challenge" }} />
          <Stack.Screen name="Collection" component={CollectionScreen} options={{ title: "My collection" }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
