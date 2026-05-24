import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  Badge,
  Card,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { GAMES_CATALOG } from "../../../shared/data/gamesCatalog";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";

export function HelpfulGamesSection() {
  const { t } = useTranslation();
  const openGame = async (url?: string) => {
    if (!url) return;
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={t("games.title")}
        subtitle={t("games.subtitle")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {GAMES_CATALOG.map((game) => (
          <Pressable
            key={game.id}
            onPress={() => openGame(game.url)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={`${game.title}: ${game.description}`}
          >
            <View style={[styles.iconWrap, { backgroundColor: game.accent }]}>
              <Ionicons
                name={game.icon}
                size={26}
                color={colors.textPrimary}
              />
            </View>
            <View style={styles.body}>
              <Text variant="bodyMedium" weight="semibold" numberOfLines={1}>
                {game.title}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={2}>
                {game.description}
              </Text>
              <View style={styles.meta}>
                <Badge label={game.focus} tone="brand" size="sm" />
                <Badge label={game.ageRange} tone="neutral" size="sm" />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[3],
  },
  list: {
    paddingRight: spacing[5],
    gap: spacing[3],
  },
  card: {
    width: 240,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    gap: spacing[1],
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    marginTop: spacing[2],
  },
});
