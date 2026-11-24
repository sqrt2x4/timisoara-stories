import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.gold} size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.retry} onPress={onRetry}>
        Tap to try again
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center", paddingVertical: 48 },
  label: { color: colors.muted, fontSize: 16, marginTop: 16 },
  title: { color: colors.ink, fontSize: 20, fontWeight: "700", textAlign: "center" },
  message: { color: colors.muted, fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: "center" },
  retry: { color: colors.pinkDark, fontSize: 16, fontWeight: "700", marginTop: 20 },
});
