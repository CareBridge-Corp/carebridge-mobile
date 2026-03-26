import React, { useState } from "react";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSignup } from "../hooks/useSignup";

export function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"patient" | "caregiver">("patient");
  const signupMutation = useSignup();

  const handleSignup = () => {
    signupMutation.mutate({ email, password, name, role });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      {signupMutation.error && (
        <Text style={styles.error}>{signupMutation.error.message}</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={signupMutation.isPending ? "Signing up..." : "Sign Up"}
        onPress={handleSignup}
        disabled={signupMutation.isPending}
      />

      {signupMutation.isPending && <ActivityIndicator style={styles.loader} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  loader: {
    marginTop: 10,
  },
});
