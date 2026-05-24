import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { getDateLocale } from "../../../shared/localization/language";
import { useLanguageStore } from "../../../shared/store/languageStore";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  IconButton,
  Screen,
  ScreenHeader,
  Text,
} from "../../../shared/components/ui";
import { colors, shadows, spacing } from "../../../shared/theme";
import { ChildSelectorModal } from "../components/ChildSelectorModal";
import { useChildScreenings } from "../hooks/useScreenings";
import { useChildrenStore } from "../store/childrenStore";

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(getDateLocale(locale), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: string) {
  switch (status) {
    case "COMPLETE":
      return "success" as const;
    case "UNDER_REVIEW":
      return "warning" as const;
    case "PENDING":
      return "neutral" as const;
    default:
      return "neutral" as const;
  }
}

function statusLabel(status: string, t: (key: string) => string) {
  switch (status) {
    case "COMPLETE":
      return t("common.done");
    case "UNDER_REVIEW":
      return t("common.pending");
    case "PENDING":
      return t("common.pending");
    default:
      return status;
  }
}

export default function MChatProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const { activeChild, children } = useChildrenStore();
  const [selectorVisible, setSelectorVisible] = React.useState(false);

  const { data, isLoading } = useChildScreenings(activeChild?.childId);
  const screenings = data?.screenings || [];

  return (
    <Screen padded={false} background={colors.surfaceMuted} scroll>
      <ScreenHeader
        title={t("mchat.profileTitle")}
        subtitle={activeChild?.firstName}
        rightSlot={
          <Avatar
            uri={activeChild?.profilePictureUrl}
            name={activeChild?.firstName}
            size="sm"
            badgeCount={children.length}
            onPress={() => children.length > 0 && setSelectorVisible(true)}
          />
        }
      />

      <View style={styles.body}>
        <Card variant="elevated" padding="lg" style={styles.intro}>
          <View style={styles.introIcon}>
            <IconButton
              icon="clipboard-outline"
              accessibilityLabel=""
              variant="filled"
              size="lg"
              onPress={() => {}}
            />
          </View>
          <Text variant="title2" align="center">
            {t("mchat.mchatProfileTitle")}
          </Text>
          <Text variant="bodySmall" tone="secondary" align="center" style={styles.introBody}>
            {t("mchat.profileIntro")}
          </Text>
        </Card>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : screenings.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title={t("mchat.noScreenings")}
            description={t("mchat.noScreeningsDesc")}
            primaryAction={{
              label: t("mchat.startNewScreening"),
              onPress: () => router.push("/(app)/(mchat)/mchat-privacy" as any),
            }}
          />
        ) : (
          <View style={styles.list}>
            <Text variant="title3" style={styles.listHeader}>
              {t("mchat.recentScreenings")}
            </Text>
            {screenings.map((screening: any) => (
              <Card
                key={screening.screeningId}
                variant="elevated"
                padding="md"
                onPress={() =>
                  router.push(
                    `/(app)/(mchat)/screening-detail?id=${screening.screeningId}` as any,
                  )
                }
              >
                <View style={styles.itemTop}>
                  <Badge
                    label={statusLabel(screening.status, t)}
                    tone={statusTone(screening.status)}
                  />
                  <Text variant="caption" tone="secondary">
                    {formatDate(screening.date, language)}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  tone="tertiary"
                  style={styles.tapHint}
                >
                  {t("mchat.tapToView")}
                </Text>
              </Card>
            ))}
          </View>
        )}
      </View>

      <ChildSelectorModal
        visible={selectorVisible}
        onClose={() => setSelectorVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
    gap: spacing[5],
  },
  intro: {
    alignItems: "center",
    gap: spacing[2],
    ...shadows.sm,
  },
  introIcon: {
    marginBottom: spacing[2],
  },
  introBody: {
    maxWidth: 280,
  },
  loading: {
    paddingVertical: spacing[10],
    alignItems: "center",
  },
  list: {
    gap: spacing[3],
  },
  listHeader: {
    marginBottom: spacing[1],
  },
  itemTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing[2],
  },
  tapHint: {
    marginTop: spacing[1],
  },
});
