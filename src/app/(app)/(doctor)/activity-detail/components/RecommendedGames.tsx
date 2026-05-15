import { StyleSheet, View } from "react-native";
import { borderRadius, spacing } from "../../../../../shared/theme";

export function RecommendedGames() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={styles.gamePlaceholder} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.md,
  },
  gamePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
});
