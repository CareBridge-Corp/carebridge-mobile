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

type ResourceId = "zemi" | "cdc" | "who" | "autismSpeaks" | "nhs";

interface ResourceConfig {
  id: ResourceId;
  icon: keyof typeof import("@expo/vector-icons/build/Ionicons").default.glyphMap;
  tone: "brand" | "info" | "success" | "warning";
  featured?: boolean;
}

const RESOURCE_CONFIG: ResourceConfig[] = [
  {
    id: "zemi",
    icon: "play-circle-outline",
    tone: "warning",
    featured: true,
  },
  {
    id: "cdc",
    icon: "library-outline",
    tone: "info",
  },
  {
    id: "who",
    icon: "earth-outline",
    tone: "brand",
  },
  {
    id: "autismSpeaks",
    icon: "book-outline",
    tone: "success",
  },
  {
    id: "nhs",
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
      // silently ignore
    }
  };

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={t("resources.title")}
        subtitle={t("resources.subtitle")}
      />
      <View style={styles.list}>
        {RESOURCE_CONFIG.map((resource) => {
          const source = t(`resources.items.${resource.id}.source`);
          const title = t(`resources.items.${resource.id}.title`);
          const description = t(`resources.items.${resource.id}.description`);
          const url = t(`resources.items.${resource.id}.url`);
          const eyebrow = resource.featured
            ? t(`resources.items.${resource.id}.eyebrow`, "")
            : "";

          return (
            <Pressable
              key={resource.id}
              onPress={() => open(url)}
              style={({ pressed }) => [
                styles.item,
                resource.featured && styles.itemFeatured,
                pressed && styles.itemPressed,
              ]}
              accessibilityRole="link"
              accessibilityLabel={`${source}: ${title}`}
            >
              <View
                style={[
                  styles.iconWrap,
                  resource.featured && styles.iconWrapFeatured,
                ]}
              >
                <Ionicons name={resource.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.content}>
                {eyebrow ? (
                  <Text variant="caption" tone="brand" weight="semibold">
                    {eyebrow}
                  </Text>
                ) : null}
                <View style={styles.headerRow}>
                  <Badge label={source} tone={resource.tone} size="sm" />
                  <Ionicons
                    name="open-outline"
                    size={16}
                    color={colors.iconMuted}
                  />
                </View>
                <Text variant="bodyMedium" weight="semibold" numberOfLines={2}>
                  {title}
                </Text>
                <Text
                  variant="caption"
                  tone="secondary"
                  numberOfLines={4}
                  style={styles.description}
                >
                  {description}
                </Text>
              </View>
            </Pressable>
          );
        })}
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
  itemFeatured: {
    borderWidth: 1,
    borderColor: colors.primaryMuted,
    backgroundColor: colors.surface,
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
  iconWrapFeatured: {
    backgroundColor: colors.primaryMuted,
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
