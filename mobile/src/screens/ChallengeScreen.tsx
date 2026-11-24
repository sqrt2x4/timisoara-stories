import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../App";
import { getChallenge, solveChallenge } from "../api/client";
import type { Challenge } from "../api/types";
import { ErrorState, LoadingState } from "../components/AsyncState";
import { Screen } from "../components/Screen";
import { colors } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Challenge">;

export function ChallengeScreen({ route }: Props) {
  const { challengeId, locationName } = route.params;
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setChallenge(await getChallenge(challengeId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load this challenge.");
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitAnswer() {
    if (!answer.trim() || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    setError(null);
    try {
      const result = await solveChallenge(challengeId, answer);
      setFeedback({
        correct: result.correct,
        message: result.storyCompleted
          ? `${result.message} ${result.completion?.title ?? ""}`
          : result.message,
      });
      if (result.correct) setAnswer("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not submit your answer.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingState label="Unlocking the riddle..." />;
  if (error && !challenge) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!challenge) return null;

  return (
    <Screen>
      <Text style={styles.eyebrow}>🕵️  FIELD NOTE · {locationName.toUpperCase()}</Text>
      <Text style={styles.title}>Crack the clue!</Text>
      <View style={styles.clueCard}>
        <Text style={styles.clueSticker}>📜</Text>
        <Text style={styles.prompt}>{challenge.prompt}</Text>
        <Text style={styles.hint}>Hint: {challenge.hint}</Text>
      </View>
      <Text style={styles.label}>Your answer</Text>
      <TextInput
        autoCapitalize="none"
        editable={!submitting}
        onChangeText={setAnswer}
        onSubmitEditing={() => void submitAnswer()}
        placeholder="Type your answer"
        placeholderTextColor="#7b858e"
        returnKeyType="done"
        style={styles.input}
        value={answer}
      />
      <Pressable
        accessibilityRole="button"
        disabled={!answer.trim() || submitting}
        onPress={() => void submitAnswer()}
        style={[styles.button, (!answer.trim() || submitting) && styles.disabled]}
      >
        <Text style={styles.buttonLabel}>{submitting ? "Checking..." : "Submit answer"}</Text>
      </Pressable>
      {feedback ? (
        <Text style={[styles.feedback, feedback.correct ? styles.success : styles.failure]}>
          {feedback.message}
        </Text>
      ) : null}
      {error ? <Text style={styles.failure}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { color: colors.pinkDark, fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  title: { color: colors.ink, fontSize: 34, fontWeight: "900", marginTop: 10 },
  clueCard: {
    backgroundColor: colors.lavender,
    borderColor: "#DCCDF8",
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 24,
    padding: 22,
  },
  clueSticker: { fontSize: 34, marginBottom: 12 },
  prompt: { color: colors.ink, fontSize: 22, fontWeight: "700", lineHeight: 30 },
  hint: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 18 },
  label: { color: colors.ink, fontSize: 16, fontWeight: "700", marginTop: 28 },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 17,
    marginTop: 10,
    padding: 15,
  },
  button: { alignItems: "center", backgroundColor: colors.pink, borderRadius: 18, marginTop: 16, padding: 17 },
  disabled: { opacity: 0.45 },
  buttonLabel: { color: colors.white, fontSize: 16, fontWeight: "800" },
  feedback: { fontSize: 16, fontWeight: "700", lineHeight: 23, marginTop: 20 },
  success: { color: colors.pinkDark },
  failure: { color: colors.danger },
});
