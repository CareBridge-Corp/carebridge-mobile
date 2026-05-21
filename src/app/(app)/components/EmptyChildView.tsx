import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";

export function EmptyChildView() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cardWrapper}>
        <View style={styles.infoCard}>
          <View style={styles.infoCardHeaderRow}>
            <View style={styles.infoCardTitleContainer}>
              <Text style={styles.infoCardTitle}>
                {t("home.provideChildInfo")}
              </Text>
              <Text style={styles.infoCardSubtitle}>{t("home.infoSafe")}</Text>
            </View>

            <View
              style={styles.iconContainer}
              accessible
              accessibilityRole="image"
            >
              <MaterialCommunityIcons
                name="baby-face-outline"
                size={28}
                color={colors.primary || "#0C4A6E"}
              />
            </View>
          </View>

          <View style={styles.safetySection}>
            <View style={styles.safetyIconContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color={colors.primary || "#0C4A6E"}
              />
            </View>
            <View style={styles.safetyTexts}>
              <Text style={styles.safetyTitle}>
                {t("home.safetyRegulations")}
              </Text>
              <Text style={styles.safetySubtitle}>{t("home.infoSafe")}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => router.push("/(app)/(child)/create-child" as Href)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={t("home.registerChildren")}
          >
            <View style={styles.continueLeft}>
              <View style={styles.continueIconCircle}>
                <View style={styles.continueIconInner} />
              </View>
              <Text style={styles.continueButtonText}>
                {t("home.registerChildren")}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="arrow-right"
              size={22}
              color={colors.primary || "#0C4A6E"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    paddingBottom: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  cardWrapper: {
    width: "100%",
    paddingHorizontal: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.cardLightBlue || "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    // subtle shadow
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  infoCardHeader: {
    // legacy
  },
  infoCardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  infoCardTitleContainer: {
    flex: 1,
    paddingRight: spacing.md,
  },
  infoCardTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary || "#0C4A6E",
    lineHeight: typography.lineHeight.tight * typography.fontSize.xxl,
    marginBottom: spacing.sm,
  },
  infoCardCircle: {
    // legacy placeholder
  },
  infoCardSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight || "#5A7A8F",
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  safetySection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
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
    color: colors.primary || "#0C4A6E",
    marginBottom: 2,
  },
  safetySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textLight || "#5A7A8F",
  },
  continueButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // subtle button shadow
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
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
    fontSize: typography.fontSize.lg,
    color: colors.primary || "#0C4A6E",
    fontWeight: typography.fontWeight.medium,
  },
  continueLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
});
