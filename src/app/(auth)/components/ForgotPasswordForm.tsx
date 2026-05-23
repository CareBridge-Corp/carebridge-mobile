import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useForgotPassword } from "../hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();
  const router = useRouter();
  const { t } = useTranslation();

  const handleSubmit = () => {
    forgotPasswordMutation.mutate({ email: email.trim() });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.forgotPasswordTitle")}</Text>
      <Text style={styles.subtitle}>{t("auth.forgotPasswordSubtitle")}</Text>

      {forgotPasswordMutation.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{forgotPasswordMutation.error.message}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.icon} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          forgotPasswordMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={forgotPasswordMutation.isPending || !email.trim()}
        activeOpacity={0.8}
      >
        {forgotPasswordMutation.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t("auth.sendResetLink")}</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backToLogin}
        onPress={() => router.push("/(auth)/login")}
      >
        <Text style={styles.backToLoginText}>{t("auth.backToLogin")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 180,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    marginBottom: spacing.xxxl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  form: {
    gap: spacing.lg,
    marginBottom: spacing.massive,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingRight: 56,
    fontSize: typography.fontSize.md,
    color: colors.text,
  },
  iconContainer: {
    position: "absolute",
    right: spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: "100%",
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxl,
    alignItems: "center",
    position: "absolute",
    bottom: spacing.huge + 40,
    left: spacing.xxl,
    right: spacing.xxl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
  },
  backToLogin: {
    position: "absolute",
    bottom: spacing.huge,
    left: spacing.xxl,
    right: spacing.xxl,
    alignItems: "center",
  },
  backToLoginText: {
    color: colors.textLink,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  errorContainer: {
    backgroundColor: "#FEE",
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  error: {
    color: colors.error,
    fontSize: typography.fontSize.sm,
  },
});
