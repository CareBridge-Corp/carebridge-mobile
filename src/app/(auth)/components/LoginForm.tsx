import React, { useState } from "react";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { useLogin } from "../hooks/useLogin";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {loginMutation.error && (
        <Text style={styles.error}>{loginMutation.error.message}</Text>
      )}

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
        title={loginMutation.isPending ? "Logging in..." : "Login"}
        onPress={handleLogin}
        disabled={loginMutation.isPending}
      />

      {loginMutation.isPending && <ActivityIndicator style={styles.loader} />}
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
