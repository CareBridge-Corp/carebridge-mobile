import { Ionicons } from "@expo/vector-icons";
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
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const { t } = useTranslation();

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("auth.loginTitle")}</Text>
      <Text style={styles.subtitle}>{t("auth.loginSubtitle")}</Text>

      {loginMutation.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{loginMutation.error.message}</Text>
        </View>
      )}

      <View style={styles.form}>
        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <View style={styles.iconContainer}>
            <Ionicons name="mail-outline" size={20} color={colors.icon} />
          </View>
        </View>

        {/* Password Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            style={styles.iconContainer}
            onPress={togglePasswordVisibility}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={colors.icon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[
          styles.button,
          loginMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
        activeOpacity={0.8}
      >
        {loginMutation.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t("auth.login")}</Text>
        )}
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
    bottom: spacing.huge,
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
