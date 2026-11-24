import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { StyleSheet, Text, View } from "react-native";

import type { RootStackParamList } from "../../App";
import { ActionButton } from "../components/ActionButton";
import { Screen } from "../components/Screen";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.stickerRow}>
          <Text style={styles.sticker}>🏛️</Text>
          <Text style={styles.sticker}>🌷</Text>
          <Text style={[styles.sticker, styles.ticket]}>🎟️</Text>
        </View>
        <Text style={styles.eyebrow}>A LITTLE CITY ADVENTURE</Text>
        <Text style={styles.title}>Unlock{"\n"}the city.</Text>
        <Text style={styles.subtitle}>
          Follow the clues, find hidden stories, and collect little pieces of Timișoara’s past.
        </Text>
        <View style={styles.note}>
          <Text style={styles.noteIcon}>✨</Text>
          <Text style={styles.noteText}>History is more fun when you find it yourself!</Text>
        </View>
      </View>
      <ActionButton label="Start exploring" onPress={() => navigation.navigate("Map")} />
      <ActionButton
        label="View my collection  ✨"
        onPress={() => navigation.navigate("Collection")}
        variant="secondary"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 30,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: 8,
    minHeight: 420,
    overflow: "hidden",
    padding: 24,
  },
  stickerRow: { alignItems: "center", flexDirection: "row", marginBottom: 28 },
  sticker: {
    backgroundColor: colors.white,
    borderRadius: 22,
    fontSize: 32,
    marginRight: 12,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  ticket: { backgroundColor: colors.lavender, transform: [{ rotate: "8deg" }] },
  eyebrow: { color: colors.pinkDark, fontSize: 12, fontWeight: "800", letterSpacing: 1.6 },
  title: { color: colors.ink, fontSize: 48, fontWeight: "900", lineHeight: 53, marginTop: 12 },
  subtitle: { color: colors.muted, fontSize: 17, lineHeight: 25, marginTop: 14 },
  note: {
    alignItems: "center",
    backgroundColor: colors.mint,
    borderRadius: 16,
    flexDirection: "row",
    marginTop: 22,
    padding: 12,
  },
  noteIcon: { fontSize: 20, marginRight: 9 },
  noteText: { color: colors.ink, flex: 1, fontSize: 13, fontWeight: "700", lineHeight: 18 },
});
