import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, StyleSheet, View } from "react-native";
import {
  Badge,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";

interface Resource {
  id: string;
  source: string;
  title: string;
  description: string;
  url: string;
  icon: keyof typeof import("@expo/vector-icons/build/Ionicons").default.glyphMap;
  tone: "brand" | "info" | "success" | "warning";
}

const RESOURCES: Resource[] = [
  {
    id: "cdc",
    source: "CDC",
    title: "What is Autism Spectrum Disorder?",
    description:
      "Plain-language overview from the U.S. Centers for Disease Control on signs, diagnosis and support.",
    url: "https://www.cdc.gov/ncbddd/autism/facts.html",
    icon: "library-outline",
    tone: "info",
  },
  {
    id: "who",
    source: "WHO",
    title: "Autism — World Health Organization",
    description:
      "Global guidance covering early intervention, family support and inclusive care.",
    url: "https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders",
    icon: "earth-outline",
    tone: "brand",
  },
  {
    id: "autism-speaks",
    source: "Autism Speaks",
    title: "First 100 days kit for families",
    description:
      "A practical action plan with checklists for the first weeks after diagnosis.",
    url: "https://www.autismspeaks.org/tool-kit/100-day-kit-young-children",
    icon: "book-outline",
    tone: "success",
  },
  {
    id: "nhs",
    source: "NHS",
    title: "Helping a child with autism communicate",
    description:
      "Evidence-based tips for everyday communication, routines and sensory needs.",
    url: "https://www.nhs.uk/conditions/autism/helping-your-child/",
    icon: "chatbubbles-outline",
    tone: "warning",
  },
];

export function AsdResourcesSection() {
  const { t } = useTranslation();
  const open = async (url: string) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch {
      // silently ignore — the user can always retry
    }
  };

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={t("resources.title")}
        subtitle={t("resources.subtitle")}
      />
      <View style={styles.list}>
        {RESOURCES.map((resource) => (
          <Pressable
            key={resource.id}
            onPress={() => open(resource.url)}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            accessibilityRole="link"
            accessibilityLabel={`${resource.source}: ${resource.title}`}
          >
            <View style={styles.iconWrap}>
              <Ionicons name={resource.icon} size={20} color={colors.primary} />
            </View>
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Badge label={resource.source} tone={resource.tone} size="sm" />
                <Ionicons
                  name="open-outline"
                  size={16}
                  color={colors.iconMuted}
                />
              </View>
              <Text variant="bodyMedium" weight="semibold" numberOfLines={2}>
                {resource.title}
              </Text>
              <Text
                variant="caption"
                tone="secondary"
                numberOfLines={2}
                style={styles.description}
              >
                {resource.description}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[3],
  },
  list: {
    gap: spacing[3],
  },
  item: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[3],
    ...shadows.sm,
  },
  itemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: spacing[1],
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[1],
  },
  description: {
    marginTop: 2,
  },
});
