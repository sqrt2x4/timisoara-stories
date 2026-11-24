import { Component, type ErrorInfo, type PropsWithChildren, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme";

type Props = PropsWithChildren;
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Mobile screen error", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>This screen needs a fresh start.</Text>
          <Text style={styles.message}>Please restart the app and try again.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { alignItems: "center", backgroundColor: colors.paper, flex: 1, justifyContent: "center", padding: 28 },
  title: { color: colors.ink, fontSize: 22, fontWeight: "700", textAlign: "center" },
  message: { color: colors.muted, fontSize: 16, marginTop: 10, textAlign: "center" },
});
