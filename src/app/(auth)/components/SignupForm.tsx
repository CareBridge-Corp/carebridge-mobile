import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
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
import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const signupMutation = useSignup();

  const handleSignup = () => {
    const name = `${firstName} ${lastName}`.trim();
    signupMutation.mutate({ email, password, name, role: "patient" });
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Sign up</Text>
      <Text style={styles.subtitle}>
        Autism is not a disease, it is a{"\n"}developmental disorder.
      </Text>

      {signupMutation.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{signupMutation.error.message}</Text>
        </View>
      )}

      <View style={styles.form}>
        {/* First Name Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="First name"
            placeholderTextColor={colors.textSecondary}
            value={firstName}
            onChangeText={setFirstName}
          />
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={20} color={colors.icon} />
          </View>
        </View>

        {/* Last Name Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Last name"
            placeholderTextColor={colors.textSecondary}
            value={lastName}
            onChangeText={setLastName}
          />
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={20} color={colors.icon} />
          </View>
        </View>

        {/* Email Input */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email"
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
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <View style={styles.iconContainer}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.icon}
            />
          </View>
        </View>
      </View>

      {/* Sign Up Button */}
      <TouchableOpacity
        style={[
          styles.button,
          signupMutation.isPending && styles.buttonDisabled,
        ]}
        onPress={handleSignup}
        disabled={signupMutation.isPending}
        activeOpacity={0.8}
      >
        {signupMutation.isPending ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonText}>Sign up</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xxl,
    paddingTop: 180,
    paddingBottom: 120,
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
    marginTop: spacing.xl,
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
