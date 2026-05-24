import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import { useResetPassword } from "../hooks/useResetPassword";

export function ResetPasswordForm() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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
      setValidationError(t("auth.resetTokenRequired", "Reset token is required."));
      return;
    }

    if (newPassword.length < 8) {
      setValidationError(
        t("auth.passwordMinLength", "Password must be at least 8 characters."),
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t("auth.passwordMismatch", "Passwords do not match."));
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
      {displayError && (
        <Card
          variant="flat"
          padding="md"
          style={{
            backgroundColor: colors.errorBackground,
            marginBottom: spacing[4],
          }}
        >
          <Text variant="bodySmall" tone="danger">
            {displayError}
          </Text>
        </Card>
      )}

      <View style={styles.form}>
        <TextField
          label={t("auth.resetToken", "Reset token")}
          placeholder="Paste the token from your email"
          value={token}
          onChangeText={setToken}
          autoCapitalize="none"
          autoCorrect={false}
          leadingIcon="key-outline"
        />

        <TextField
          label={t("auth.newPassword", "New password")}
          placeholder="At least 8 characters"
          value={newPassword}
          onChangeText={setNewPassword}
          isPassword
          autoCapitalize="none"
          leadingIcon="lock-closed-outline"
        />

        <TextField
          label={t("auth.confirmPassword", "Confirm password")}
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword
          autoCapitalize="none"
          leadingIcon="lock-closed-outline"
        />
      </View>

      <View style={styles.actions}>
        <Button
          label={t("auth.resetPassword", "Reset password")}
          onPress={handleSubmit}
          loading={resetPasswordMutation.isPending}
        />
        <Button
          label={t("auth.backToLogin", "Back to log in")}
          variant="ghost"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[4],
  },
  form: {
    gap: spacing[4],
  },
  actions: {
    gap: spacing[2],
    marginTop: spacing[3],
  },
});
