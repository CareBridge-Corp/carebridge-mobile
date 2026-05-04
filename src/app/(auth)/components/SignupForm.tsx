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
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const signupMutation = useSignup();

  const handleSignup = () => {
    // Only prepend +251 if phone is provided
    const formattedPhone = phone.trim() ? `+251${phone}` : undefined;

    signupMutation.mutate({
      email,
      password,
      firstName,
      lastName,
      surname: null,
      role: "PARENT",
      phone: formattedPhone,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        {/* Phone Input */}
        <View style={styles.inputWrapper}>
          <View style={styles.phonePrefixContainer}>
            <Text style={styles.phonePrefix}>+251</Text>
          </View>
          <TextInput
            style={[styles.input, { paddingLeft: 64 }]} // Make room for +251 prefix
            placeholder="900000000"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={(text) => {
              // allow numbers only
              const numericValue = text.replace(/[^0-9]/g, "");
              setPhone(numericValue);
            }}
            keyboardType="phone-pad"
            maxLength={9}
          />
          <View style={styles.iconContainer}>
            <Ionicons name="call-outline" size={20} color={colors.icon} />
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
  phonePrefixContainer: {
    position: "absolute",
    left: spacing.xl,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1, // ensure it's clickable through if needed, or sit on top
  },
  phonePrefix: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
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
