import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Badge, Text } from "../../../../../shared/components/ui";
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
            styles.cardOuter,
            pressed && game.url && styles.cardPressed,
            !game.url && styles.cardStatic,
          ]}
          accessibilityRole="button"
          accessibilityLabel={game.title}
        >
          <View style={styles.cardInner}>
            <View style={[styles.iconWrap, { backgroundColor: game.accent }]}>
              <Ionicons name={game.icon} size={22} color={colors.textPrimary} />
            </View>
            <Text variant="bodyMedium" weight="semibold" numberOfLines={2}>
              {game.title}
            </Text>
            <Text variant="caption" tone="secondary" numberOfLines={3}>
              {game.description}
            </Text>
            <View style={styles.meta}>
              <Badge
                label={game.focus}
                tone="brand"
                size="sm"
                style={styles.focusBadge}
              />
              {game.url ? (
                <View style={styles.actionRow}>
                  <Text variant="caption" tone="brand" weight="semibold">
                    {t("common.open")}
                  </Text>
                  <Ionicons name="open-outline" size={14} color={colors.primary} />
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <Badge label={t("activity.tryAtHome")} tone="neutral" size="sm" />
                </View>
              )}
            </View>
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
  cardOuter: {
    width: 220,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    overflow: "hidden",
    ...shadows.sm,
  },
  cardInner: {
    padding: spacing[4],
    gap: spacing[2],
    minHeight: 188,
    justifyContent: "flex-start",
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
    marginTop: "auto",
    paddingTop: spacing[2],
    gap: spacing[2],
  },
  focusBadge: {
    alignSelf: "flex-start",
    maxWidth: "100%",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing[1],
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
