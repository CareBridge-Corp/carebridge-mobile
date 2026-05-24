import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import {
  Button,
  Card,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const router = useRouter();
  const { t } = useTranslation();

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const canSubmit = email.trim().length > 0 && password.length > 0;

  return (
    <View style={styles.container}>
      {loginMutation.error && (
        <Card
          variant="flat"
          padding="md"
          style={{ backgroundColor: colors.errorBackground, marginBottom: spacing[4] }}
        >
          <Text variant="bodySmall" tone="danger">
            {loginMutation.error.message}
          </Text>
        </Card>
      )}

      <View style={styles.form}>
        <TextField
          label={t("auth.email", "Email")}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          leadingIcon="mail-outline"
          returnKeyType="next"
        />

        <TextField
          label={t("auth.password", "Password")}
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoCapitalize="none"
          autoComplete="password"
          leadingIcon="lock-closed-outline"
          returnKeyType="done"
          onSubmitEditing={canSubmit ? handleLogin : undefined}
        />

        <View style={styles.forgotRow}>
          <Text
            variant="bodySmall"
            weight="semibold"
            tone="brand"
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            {t("auth.forgotPassword", "Forgot password?")}
          </Text>
        </View>
      </View>

      <Button
        label={t("auth.login", "Log in")}
        onPress={handleLogin}
        loading={loginMutation.isPending}
        disabled={!canSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[6],
  },
  form: {
    gap: spacing[4],
  },
  forgotRow: {
    alignSelf: "flex-end",
  },
});
