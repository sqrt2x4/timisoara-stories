import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { getCollection } from "../api/client";
import type { Collection } from "../api/types";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { Screen } from "../components/Screen";
import { colors } from "../theme";

export function CollectionScreen() {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setCollection(await getCollection());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load collection.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!collection) return <LoadingState label="Loading your collection..." />;

  return (
    <Screen>
      <View style={styles.heading}>
        <Text style={styles.headingSticker}>🧺</Text>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>YOUR LITTLE TREASURE TROVE</Text>
          <Text style={styles.title}>Story stickers</Text>
        </View>
      </View>
      <Text style={styles.progress}>
        🌟  {collection.collected} of {collection.total} story pieces found
      </Text>
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: `${collection.progress * 100}%` }]} />
      </View>
      {collection.fragments.map((fragment) => (
        <View key={fragment.id} style={[styles.card, fragment.order % 2 === 0 && styles.alternateCard]}>
          <Text style={styles.fragmentSticker}>{fragment.collected ? "🗝️" : "🔒"}</Text>
          <Text style={styles.fragmentNumber}>STORY PIECE {fragment.order}</Text>
          <Text style={styles.fragmentTitle}>{fragment.collected ? fragment.title : "Locked fragment"}</Text>
          <Text style={styles.text}>
            {fragment.collected ? fragment.text : "Solve the matching challenge to reveal this piece of the story."}
          </Text>
        </View>
      ))}
      {collection.stories.map((story) =>
        story.completion ? (
          <View key={story.id} style={styles.completionCard}>
            <Text style={styles.completionSticker}>🏆</Text>
            <Text style={styles.completionEyebrow}>YOU DID IT!</Text>
            <Text style={styles.completionTitle}>{story.completion.title}</Text>
            <Text style={styles.text}>{story.completion.text}</Text>
            <Text style={styles.reward}>Reward: {story.completion.reward}</Text>
          </View>
        ) : null,
      )}
      {!collection.fragments.length && <Text style={styles.empty}>Visit a location to unlock your first fragment.</Text>}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: "center", flexDirection: "row", marginBottom: 18 },
  headingSticker: {
    backgroundColor: colors.lavender,
    borderRadius: 20,
    fontSize: 34,
    marginRight: 14,
    overflow: "hidden",
    padding: 12,
  },
  headingCopy: { flex: 1 },
  eyebrow: { color: colors.pinkDark, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900", marginTop: 4 },
  progress: { color: colors.ink, fontSize: 15, fontWeight: "700", marginTop: 4 },
  progressTrack: { backgroundColor: colors.card, borderRadius: 10, height: 12, marginTop: 14, overflow: "hidden" },
  progressBar: { backgroundColor: colors.pink, borderRadius: 10, height: "100%" },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 18,
    padding: 20,
  },
  alternateCard: { backgroundColor: colors.lavender, borderColor: "#DCCDF8" },
  fragmentSticker: { fontSize: 27, marginBottom: 10 },
  fragmentNumber: { color: colors.pinkDark, fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  fragmentTitle: { color: colors.ink, fontSize: 21, fontWeight: "800", marginTop: 5 },
  text: { color: colors.ink, fontSize: 15, lineHeight: 23, marginTop: 8 },
  empty: { color: colors.muted, fontSize: 16, lineHeight: 24, marginTop: 28 },
  completionCard: {
    backgroundColor: colors.mint,
    borderColor: "#BCE6D7",
    borderRadius: 22,
    borderWidth: 1,
    marginTop: 24,
    padding: 20,
  },
  completionSticker: { fontSize: 32, marginBottom: 8 },
  completionEyebrow: { color: colors.pinkDark, fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  completionTitle: { color: colors.ink, fontSize: 22, fontWeight: "800", marginTop: 8 },
  reward: { color: colors.pinkDark, fontSize: 15, fontWeight: "800", marginTop: 14 },
});
