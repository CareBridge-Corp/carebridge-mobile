import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import {
  Button,
  IconButton,
  Screen,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";

export default function MChatSuccessScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(app)/mchat-results" as Href);
    }, 2400);
    return () => clearTimeout(timer);
  }, [router]);

  const handleClose = () => router.replace("/(app)" as Href);

  return (
    <Screen background={colors.surfaceMuted}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <IconButton
          icon="close"
          accessibilityLabel="Close"
          onPress={handleClose}
        />
      </View>

      <View style={styles.body}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="checkmark-circle"
            size={96}
            color={colors.success}
          />
        </View>
        <Text variant="display" align="center" style={styles.title}>
          Screening submitted
        </Text>
        <Text variant="body" tone="secondary" align="center" style={styles.body2}>
          {`Your clinician will review the answers and prepare a personalised care plan. You'll be notified the moment it's ready.`}
        </Text>
      </View>

      <Button label="Back to home" onPress={handleClose} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    marginBottom: spacing[5],
  },
  title: {
    marginBottom: spacing[3],
  },
  body2: {
    maxWidth: 320,
  },
});
