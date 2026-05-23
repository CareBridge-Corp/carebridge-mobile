import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
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
import { useResetPassword } from "../hooks/useResetPassword";

export function ResetPasswordForm() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const resetPasswordMutation = useResetPassword();
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (typeof tokenParam === "string" && tokenParam.length > 0) {
      setToken(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = () => {
    setValidationError(null);

    if (!token.trim()) {
      setValidationError(t("auth.resetTokenRequired"));
      return;
    }

    if (newPassword.length < 8) {
      setValidationError(t("auth.passwordMinLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t("auth.passwordMismatch"));
      return;
    }

    resetPasswordMutation.mutate({
      token: token.trim(),
      newPassword,
    });
  };

  const displayError =
    validationError || resetPasswordMutation.error?.message || null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.resetPasswordTitle")}</Text>
      <Text style={styles.subtitle}>{t("auth.resetPasswordSubtitle")}</Text>

      {displayError && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{displayError}</Text>
        </View>
      )}

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.resetToken")}
            placeholderTextColor={colors.textSecondary}
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={20} color={colors.icon} />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.newPassword")}
            placeholderTextColor={colors.textSecondary}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.confirmPassword")}
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.icon} />
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          resetPasswordMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={resetPasswordMutation.isPending}
        activeOpacity={0.8}
      >
        {resetPasswordMutation.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t("auth.resetPassword")}</Text>
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
    paddingTop: 140,
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
