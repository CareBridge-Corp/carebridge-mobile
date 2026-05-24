import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

  const handleClose = () => router.replace("/(app)" as Href);

  return (
    <Screen background={colors.surfaceMuted}>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }} />
        <IconButton
          icon="close"
          accessibilityLabel={t("common.cancel")}
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
          {t("mchat.successTitle")}
        </Text>
        <Text variant="body" tone="secondary" align="center" style={styles.body2}>
          {t("mchat.successDesc")}
        </Text>
      </View>

      <Button label={t("mchat.backHome")} onPress={handleClose} />
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
