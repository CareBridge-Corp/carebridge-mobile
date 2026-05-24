import { useRouter } from "expo-router";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
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

function statusLabel(status: string) {
  switch (status) {
    case "COMPLETE":
      return "Complete";
    case "UNDER_REVIEW":
      return "Under review";
    case "PENDING":
      return "Pending";
    default:
      return status;
  }
}

export default function MChatProfileScreen() {
  const router = useRouter();
  const { activeChild, children } = useChildrenStore();
  const [selectorVisible, setSelectorVisible] = React.useState(false);

  const { data, isLoading } = useChildScreenings(activeChild?.childId);
  const screenings = data?.screenings || [];

  return (
    <Screen padded={false} background={colors.surfaceMuted} scroll>
      <ScreenHeader
        title="Screening history"
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
            M-CHAT-R/F profile
          </Text>
          <Text variant="bodySmall" tone="secondary" align="center" style={styles.introBody}>
            Review previous developmental screenings and clinician notes.
          </Text>
        </Card>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : screenings.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title="No screenings yet"
            description="Submit an M-CHAT-R/F to see results here."
            primaryAction={{
              label: "Start new screening",
              onPress: () => router.push("/(app)/(mchat)/mchat-privacy" as any),
            }}
          />
        ) : (
          <View style={styles.list}>
            <Text variant="title3" style={styles.listHeader}>
              Recent screenings
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
                    label={statusLabel(screening.status)}
                    tone={statusTone(screening.status)}
                  />
                  <Text variant="caption" tone="secondary">
                    {formatDate(screening.date)}
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  tone="tertiary"
                  style={styles.tapHint}
                >
                  Tap to view details
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
