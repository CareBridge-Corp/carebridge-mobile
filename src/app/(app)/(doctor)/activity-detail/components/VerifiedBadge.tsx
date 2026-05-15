import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, spacing } from "../../../../../shared/theme";

interface VerifiedBadgeProps {
  label: string;
  onPress?: () => void;
}

export function VerifiedBadge({ label, onPress }: VerifiedBadgeProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.subtext}>Your information is safe with us</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#0C4A6E" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F8FAFC",
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0C4A6E",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 12,
    color: "#94A3B8",
  },
});
