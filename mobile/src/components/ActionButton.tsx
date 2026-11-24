import { Pressable, StyleSheet, Text } from "react-native";

import { colors } from "../theme";

export function ActionButton({
  label,
  onPress,
  variant = "primary",
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === "secondary" && styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, variant === "secondary" && styles.secondaryLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.pink,
    borderRadius: 18,
    marginTop: 16,
    padding: 17,
  },
  secondary: { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
  pressed: { opacity: 0.75 },
  label: { color: colors.white, fontSize: 16, fontWeight: "800" },
  secondaryLabel: { color: colors.pinkDark },
});
