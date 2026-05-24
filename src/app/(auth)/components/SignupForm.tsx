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
import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const signupMutation = useSignup();
  const { t } = useTranslation();

  const handleSignup = () => {
    const formattedPhone = phone ? `+251${phone}` : "";
    signupMutation.mutate({
      firstName,
      lastName,
      surname: null,
      email,
      password,
      role: "PARENT",
      phone: formattedPhone,
    });
  };

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6;

  return (
    <View style={styles.container}>
      {signupMutation.error && (
        <Card
          variant="flat"
          padding="md"
          style={{
            backgroundColor: colors.errorBackground,
            marginBottom: spacing[4],
          }}
        >
          <Text variant="bodySmall" tone="danger">
            {signupMutation.error.message}
          </Text>
        </Card>
      )}

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField
              label={t("auth.firstName", "First name")}
              placeholder="Jane"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label={t("auth.lastName", "Last name")}
              placeholder="Doe"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>
        </View>

        <TextField
          label={t("auth.email", "Email")}
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leadingIcon="mail-outline"
        />

        <TextField
          label={t("auth.phone", "Phone number")}
          placeholder="900000000"
          value={phone}
          onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ""))}
          keyboardType="phone-pad"
          maxLength={9}
          prefix="+251"
          leadingIcon="call-outline"
          helperText="Optional"
        />

        <TextField
          label={t("auth.password", "Password")}
          placeholder="At least 6 characters"
          value={password}
          onChangeText={setPassword}
          isPassword
          autoCapitalize="none"
          leadingIcon="lock-closed-outline"
          helperText={password.length > 0 && password.length < 6 ? undefined : ""}
          errorText={
            password.length > 0 && password.length < 6
              ? "Use at least 6 characters"
              : undefined
          }
        />
      </View>

      <Button
        label={t("auth.signup", "Create account")}
        onPress={handleSignup}
        loading={signupMutation.isPending}
        disabled={!canSubmit}
        trailingIcon="arrow-forward"
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
  row: {
    flexDirection: "row",
    gap: spacing[3],
  },
  flex: {
    flex: 1,
  },
});
