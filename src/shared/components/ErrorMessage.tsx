import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ErrorMessageProps {
  error: { message: string; field?: string };
}

export function ErrorMessage({ error }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{error.message}</Text>
      {error.field && <Text style={styles.field}>Field: {error.field}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fee",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    color: "#c00",
    fontSize: 14,
  },
  field: {
    color: "#900",
    fontSize: 12,
    marginTop: 5,
  },
});
