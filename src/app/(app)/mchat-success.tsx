import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

export default function MChatSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    // Auto-navigate to results after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/(app)/mchat-results" as Href);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    router.replace("/(app)" as Href);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Close Button */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#0C4A6E" />
      </TouchableOpacity>

      {/* Success Card */}
      <View style={styles.content}>
        <View style={styles.successCard}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInner} />
          </View>

          <Text style={styles.title}>Successfully finished</Text>
          <Text style={styles.subtitle}>
            Lorem ipsum doler situm amet and his{"\n"}Your information is safe
            with us
          </Text>
        </View>
      </View>

      {/* Back to Home Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={handleClose}
          activeOpacity={0.8}
        >
          <Text style={styles.homeButtonText}>Back to home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xxl,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginTop: 60,
    padding: spacing.sm,
    backgroundColor: "#E8F0F5",
    borderRadius: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  successCard: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxxl,
    padding: spacing.huge,
    alignItems: "center",
    width: "100%",
  },
  iconCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#D1DFE8",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#C0D4E0",
  },
  title: {
    fontSize: 28,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    textAlign: "center",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  buttonContainer: {
    paddingBottom: 50,
    paddingTop: spacing.lg,
  },
  homeButton: {
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    alignItems: "center",
  },
  homeButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
