import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { borderRadius, colors, spacing, typography } from "../../../shared/theme";

interface PaywallCardProps {
  title: string;
  description: string;
  purpose?: "SUBSCRIPTION" | "EXTRA_CHILD" | "APPOINTMENT";
}

export function PaywallCard({ title, description, purpose }: PaywallCardProps) {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.iconCircle}>
        <Ionicons name="lock-closed" size={22} color={colors.white} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push(
            purpose
              ? (`/(app)/payment?purpose=${purpose}` as Href)
              : ("/(app)/payment" as Href),
          )
        }
      >
        <Text style={styles.buttonText}>{t("payment.unlock")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFF7ED",
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "#FDBA74",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F59E0B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxl,
  },
  buttonText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});
