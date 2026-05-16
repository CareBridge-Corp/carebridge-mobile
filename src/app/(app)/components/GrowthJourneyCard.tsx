import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors, spacing } from "../../../shared/theme";

export function GrowthJourneyCard() {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push("/(app)/growth-journey")}
      activeOpacity={0.9}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="map" size={24} color="#0C4A6E" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Growth Journey</Text>
          <Text style={styles.subtitle}>View your progress path</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="chevron-forward" size={20} color="#0C4A6E" />
        </View>
      </View>

      {/* Visual progress bar as a hint of the game-like UI */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressBar, { width: "45%" }]} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#DBEAFE",
    marginHorizontal: spacing.xxl,
    padding: spacing.xl,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(12, 74, 110, 0.05)",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0C4A6E",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  badge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#0C4A6E",
    borderRadius: 4,
  },
});
