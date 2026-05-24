import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Badge, Card, Text } from "../../../../../shared/components/ui";
import {
  getGamesForActivity,
  type GameItem,
} from "../../../../../shared/data/gamesCatalog";
import { borderRadius, colors, shadows, spacing } from "../../../../../shared/theme";

interface RecommendedGamesProps {
  riskCategory?: string | null;
}

export function RecommendedGames({ riskCategory }: RecommendedGamesProps) {
  const { t } = useTranslation();
  const games = getGamesForActivity(riskCategory);

  const openGame = async (game: GameItem) => {
    if (!game.url) return;
    try {
      await WebBrowser.openBrowserAsync(game.url);
    } catch {
      // ignore
    }
  };

  if (games.length === 0) {
    return (
      <Text variant="bodySmall" tone="secondary">
        {t("activity.noGames")}
      </Text>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
    >
      {games.map((game) => (
        <Pressable
          key={game.id}
          onPress={() => openGame(game)}
          disabled={!game.url}
          style={({ pressed }) => [
            styles.card,
            pressed && game.url && styles.cardPressed,
            !game.url && styles.cardStatic,
          ]}
          accessibilityRole="button"
          accessibilityLabel={game.title}
        >
          <View style={[styles.iconWrap, { backgroundColor: game.accent }]}>
            <Ionicons name={game.icon} size={22} color={colors.textPrimary} />
          </View>
          <Text variant="bodyMedium" weight="semibold" numberOfLines={1}>
            {game.title}
          </Text>
          <Text variant="caption" tone="secondary" numberOfLines={2}>
            {game.description}
          </Text>
          <View style={styles.meta}>
            <Badge label={game.focus} tone="brand" size="sm" />
            {game.url ? (
              <View style={styles.openRow}>
                <Text variant="caption" tone="brand" weight="semibold">
                  {t("common.open")}
                </Text>
                <Ionicons name="open-outline" size={14} color={colors.primary} />
              </View>
            ) : (
              <Badge label={t("activity.tryAtHome")} tone="neutral" size="sm" />
            )}
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

/** Compact chips for inline display under instructions. */
export function RelatedGameChips({ riskCategory }: RecommendedGamesProps) {
  const games = getGamesForActivity(riskCategory).slice(0, 3);
  if (!games.length) return null;

  return (
    <View style={styles.chips}>
      {games.map((game) => (
        <View key={game.id} style={styles.chip}>
          <Ionicons name={game.icon} size={14} color={colors.primary} />
          <Text variant="caption" weight="medium" numberOfLines={1}>
            {game.title}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing[3],
    paddingRight: spacing[2],
  },
  card: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    ...shadows.sm,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  cardStatic: {
    opacity: 0.95,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
    marginTop: spacing[1],
  },
  openRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
    marginTop: spacing[2],
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[1],
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
    maxWidth: "100%",
  },
});
