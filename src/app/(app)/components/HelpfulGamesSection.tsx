import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import {
  Badge,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";

interface GameItem {
  id: string;
  title: string;
  focus: string;
  ageRange: string;
  description: string;
  icon: keyof typeof import("@expo/vector-icons/build/Ionicons").default.glyphMap;
  accent: string;
  url?: string;
}

const GAMES: GameItem[] = [
  {
    id: "feelings-match",
    title: "Feelings Match",
    focus: "Emotion recognition",
    ageRange: "3+ years",
    description:
      "Match faces with simple feelings — happy, sad, curious — to build social-emotional awareness.",
    icon: "happy-outline",
    accent: "#FDE68A",
    url: "https://www.understood.org/en/articles/games-that-teach-social-emotional-skills",
  },
  {
    id: "shape-sorter",
    title: "Shape Sorter",
    focus: "Visual reasoning",
    ageRange: "2+ years",
    description:
      "Calming sorting tasks that strengthen pattern recognition and fine motor control.",
    icon: "shapes-outline",
    accent: "#BFDBFE",
    url: "https://www.gamesforyoungminds.com/",
  },
  {
    id: "sound-safari",
    title: "Sound Safari",
    focus: "Auditory focus",
    ageRange: "3+ years",
    description:
      "Listen for animal sounds and tap the picture that matches — supports listening attention.",
    icon: "musical-notes-outline",
    accent: "#C7F0DB",
    url: "https://www.do2learn.com/games/auditory.htm",
  },
  {
    id: "story-builder",
    title: "Story Builder",
    focus: "Communication",
    ageRange: "4+ years",
    description:
      "Drag pictures to build short stories — encourages narrative skills and turn-taking.",
    icon: "book-outline",
    accent: "#FBCFE8",
    url: "https://www.autismparentingmagazine.com/best-autism-games/",
  },
  {
    id: "breath-buddy",
    title: "Breath Buddy",
    focus: "Self-regulation",
    ageRange: "3+ years",
    description:
      "Guided breathing animations that help regulate big feelings during transitions.",
    icon: "leaf-outline",
    accent: "#DDD6FE",
    url: "https://childmind.org/article/breathing-exercises-for-kids/",
  },
];

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
        {GAMES.map((game) => (
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
