import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import {
  Avatar,
  Badge,
  Card,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";
import { useAllClinicians } from "../hooks/useClinician";
import type { Clinician } from "../store/clinicianStore";

interface PediatriciansSectionProps {
  /** Disable rendering when user shouldn't see it yet (e.g. no children). */
  visible?: boolean;
}

export function PediatriciansSection({
  visible = true,
}: PediatriciansSectionProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { data, isLoading } = useAllClinicians({ limit: 30 });

  if (!visible) return null;

  const clinicians = data?.clinicians ?? [];
  const total = data?.total ?? clinicians.length;
  const headline =
    total >= 20
      ? t("pediatricians.headlineMany", { count: total })
      : total > 0
        ? t("pediatricians.headlineSome", { count: total })
        : t("pediatricians.headlineDefault");

  return (
    <View style={styles.wrapper}>
      <SectionHeader
        title={headline}
        subtitle={t("pediatricians.subtitle")}
        action={
          clinicians.length > 0
            ? {
                label: t("common.seeAll"),
                onPress: () =>
                  router.push("/(app)/(booking)/booking-select-doctor" as any),
              }
            : undefined
        }
      />

      {isLoading ? (
        <Card variant="flat" padding="lg" style={styles.loading}>
          <ActivityIndicator color={colors.primary} />
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing[2] }}>
            {t("pediatricians.loading")}
          </Text>
        </Card>
      ) : clinicians.length === 0 ? (
        <Card variant="tinted" padding="lg">
          <Text variant="bodyMedium" weight="semibold">
            {t("pediatricians.onboardingTitle")}
          </Text>
          <Text variant="caption" tone="secondary" style={{ marginTop: spacing[1] }}>
            {t("pediatricians.onboardingDesc")}
          </Text>
        </Card>
      ) : (
        <FlatList
          data={clinicians}
          keyExtractor={(item) => item.userId}
          renderItem={({ item }) => (
            <PediatricianTile
              clinician={item}
              onPress={() =>
                router.push({
                  pathname: "/(app)/(doctor)/doctor-details",
                  params: { doctorId: item.userId },
                } as any)
              }
            />
          )}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
        />
      )}
    </View>
  );
}

function PediatricianTile({
  clinician,
  onPress,
}: {
  clinician: Clinician;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const fullName = [clinician.surname, clinician.firstName, clinician.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  const specialization = clinician.specializations?.[0]?.name;
  const verified = (clinician as any).doctorIsVerified === true;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      accessibilityRole="button"
      accessibilityLabel={`Open profile for ${fullName}`}
    >
      <View style={styles.avatarRow}>
        <Avatar uri={clinician.profilePictureUrl} name={fullName} size="lg" />
        {verified ? (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark" size={12} color={colors.surface} />
          </View>
        ) : null}
      </View>
      <Text
        variant="bodyMedium"
        weight="semibold"
        numberOfLines={1}
        style={styles.name}
      >
        {fullName || "Dr."}
      </Text>
      {specialization ? (
        <Text variant="caption" tone="secondary" numberOfLines={1}>
          {specialization}
        </Text>
      ) : (
        <Text variant="caption" tone="tertiary" numberOfLines={1}>
          {t("pediatricians.pediatrician")}
        </Text>
      )}
      <View style={styles.metaRow}>
        <Badge label={t("pediatricians.pediatrician")} tone="info" size="sm" />
      </View>
    </Pressable>
  );
}

function Separator() {
  return <View style={{ width: spacing[3] }} />;
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing[3],
  },
  listContent: {
    paddingRight: spacing[5],
  },
  loading: {
    alignItems: "center",
  },
  tile: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    gap: spacing[2],
    ...shadows.sm,
  },
  tilePressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  verifiedBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    marginTop: -spacing[2],
    marginRight: -spacing[1],
  },
  name: {
    marginTop: spacing[1],
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing[2],
    marginTop: spacing[1],
  },
});
