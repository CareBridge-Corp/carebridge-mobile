import { StyleSheet, View } from "react-native";
import { borderRadius, colors, spacing } from "../../../../../shared/theme";

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
    gap: spacing[3],
  },
  gamePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: colors.surfaceSunken,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
