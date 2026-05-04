import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from "../../../shared/theme";

export function EmptyChildView() {
  const router = useRouter();

  return (
    <View style={styles.mainContainer}>
      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <View style={styles.infoCardTitleContainer}>
            <Text style={styles.infoCardTitle}>
              Provide us your{"\n"}child's info
            </Text>
            <Text style={styles.infoCardSubtitle}>
              Lorem ipsum doler situm amet and his{"\n"}Your information is safe
              with us
            </Text>
          </View>
          <View style={styles.infoCardCircle} />
        </View>

        <View style={styles.safetySection}>
          <View style={styles.safetyIconContainer}>
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color="#0C4A6E"
            />
          </View>
          <View style={styles.safetyTexts}>
            <Text style={styles.safetyTitle}>Safety and regulations</Text>
            <Text style={styles.safetySubtitle}>
              Your information is safe with us
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => router.push("/(app)/create-child" as Href)}
          activeOpacity={0.8}
        >
          <View style={styles.continueIconCircle}>
            <View style={styles.continueIconInner} />
          </View>
          <Text style={styles.continueButtonText}>Register Children</Text>

          <MaterialCommunityIcons
            name="forwardburger"
            size={24}
            color="#0C4A6E"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: spacing.xl,
  },
  infoCard: {
    backgroundColor: "#E8F0F5",
    marginHorizontal: spacing.xxl,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
  },
  infoCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: spacing.xxxl,
  },
  infoCardTitleContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  infoCardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
    marginBottom: spacing.md,
  },
  infoCardCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  infoCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  safetySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  safetyIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  safetyTexts: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 2,
  },
  safetySubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  continueButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  continueIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#0C4A6E",
    justifyContent: "center",
    alignItems: "center",
  },
  continueIconInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#0A3A54",
  },
  continueButtonText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.medium,
  },
});
