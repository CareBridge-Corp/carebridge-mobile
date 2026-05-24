import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View } from "react-native";
import {
  Avatar,
  Badge,
  Button,
  Card,
  IconButton,
  ListRow,
  SectionHeader,
  Screen,
  Text,
} from "../../shared/components/ui";
import { useLogout } from "../(auth)/hooks/useLogout";
import { useLanguageStore } from "../../shared/store/languageStore";
import { APP_LANGUAGES } from "../../shared/localization/language";
import { colors, layout, spacing } from "../../shared/theme";
import { useAssignedClinician } from "./hooks/useClinician";
import { useProfile } from "./hooks/useProfile";
import { useChildrenStore } from "./store/childrenStore";

type Language = "en" | "am" | "om";

const LANGUAGE_OPTIONS = APP_LANGUAGES;

export default function ProfileScreen() {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { activeChild } = useChildrenStore();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();

  const { data: profile } = useProfile();
  const { data: clinician } = useAssignedClinician(activeChild?.childId);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.replace("/(auth)/welcome"),
    });
  };

  const fullName =
    profile?.fullName ||
    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
    "Account";

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.headerBar}>
        <Text variant="title1">{t("profile.title", "Profile")}</Text>
        <IconButton
          icon="settings-outline"
          accessibilityLabel="Settings"
          onPress={() => {
            // Placeholder for future settings screen
          }}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile summary */}
        <Card variant="elevated" padding="lg" style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Avatar uri={profile?.profilePictureUrl} name={fullName} size="xl" />
            <View style={styles.editBadge}>
              <IconButton
                icon="camera"
                size="sm"
                variant="filled"
                accessibilityLabel="Change photo"
                onPress={() =>
                  router.push("/(app)/(parent)/update-profile" as any)
                }
              />
            </View>
          </View>

          <Text variant="title1" align="center" style={styles.name}>
            {fullName}
          </Text>

          {profile?.role ? (
            <Badge
              label={profile.role}
              tone="brand"
              icon="shield-checkmark"
              style={styles.role}
            />
          ) : null}

          {profile?.email ? (
            <Text variant="bodySmall" tone="secondary" align="center" style={styles.email}>
              {profile.email}
            </Text>
          ) : null}

          <View style={styles.editButton}>
            <Button
              label={t("profile.editProfile", "Edit profile")}
              variant="secondary"
              size="sm"
              leadingIcon="create-outline"
              onPress={() => router.push("/(app)/(parent)/update-profile" as any)}
              fullWidth={false}
            />
          </View>
        </Card>

        {/* Screening highlight */}
        <View style={styles.section}>
          <Card
            variant="tinted"
            padding="md"
            onPress={() => router.push("/(app)/(mchat)/mchat-profile" as any)}
          >
            <View style={styles.screeningRow}>
              <View style={styles.screeningIcon}>
                <Text variant="title2" tone="inverse">
                  ✓
                </Text>
              </View>
              <View style={styles.screeningText}>
                <Text variant="body" weight="semibold">
                  M-CHAT-R/F history
                </Text>
                <Text variant="caption" tone="secondary">
                  Review past screenings
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Care team */}
        {clinician ? (
          <View style={styles.section}>
            <SectionHeader title={t("profile.careTeam", "Care team")} />
            <Card variant="flat" padding={0}>
              <ListRow
                icon="medical"
                title={`${clinician.surname ?? ""} ${clinician.firstName} ${clinician.lastName}`.trim()}
                subtitle={
                  clinician.specializations?.[0]?.name ?? "Assigned clinician"
                }
                onPress={() =>
                  router.push({
                    pathname: "/(app)/(doctor)/doctor-details",
                    params: { childId: activeChild?.childId },
                  } as any)
                }
                noDivider
              />
            </Card>
          </View>
        ) : null}

        {/* Account */}
        <View style={styles.section}>
          <SectionHeader title={t("profile.account", "Account")} />
          <Card variant="flat" padding={0}>
            <ListRow
              icon="person-outline"
              title={t("profile.personalInfo", "Personal information")}
              subtitle="Edit your name, photo and contact"
              onPress={() =>
                router.push("/(app)/(parent)/update-profile" as any)
              }
            />
            <ListRow
              icon="document-text-outline"
              title={t("profile.screeningHistory", "Screening history")}
              subtitle="View all M-CHAT submissions"
              onPress={() => router.push("/(app)/(mchat)/mchat-profile" as any)}
              noDivider
            />
          </Card>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <SectionHeader title={t("profile.preferences", "Preferences")} />
          <Card variant="flat" padding="md">
            <Text variant="bodySmall" tone="secondary" style={styles.langLabel}>
              {t("profile.language", "Language")}
            </Text>
            <View style={styles.langOptions}>
              {LANGUAGE_OPTIONS.map((opt) => {
                const isActive = language === opt.value;
                return (
                  <Text
                    key={opt.value}
                    onPress={() => setLanguage(opt.value)}
                    variant="bodySmall"
                    weight="semibold"
                    style={[
                      styles.langChip,
                      isActive && styles.langChipActive,
                      { color: isActive ? colors.textInverse : colors.textPrimary },
                    ]}
                  >
                    {opt.label}
                  </Text>
                );
              })}
            </View>
          </Card>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <Button
            label={
              logoutMutation.isPending
                ? t("profile.loggingOut", "Logging out...")
                : t("profile.logout", "Log out")
            }
            variant="secondary"
            onPress={handleLogout}
            disabled={logoutMutation.isPending}
            leadingIcon="log-out-outline"
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: layout.tabBarHeight + spacing[8],
    gap: spacing[5],
  },
  profileCard: {
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
    marginBottom: spacing[3],
  },
  editBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
  },
  name: {
    marginBottom: spacing[2],
  },
  role: {
    marginBottom: spacing[2],
  },
  email: {
    marginBottom: spacing[4],
  },
  editButton: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  section: {
    gap: spacing[3],
  },
  screeningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  screeningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  screeningText: {
    flex: 1,
  },
  langLabel: {
    marginBottom: spacing[3],
  },
  langOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing[2],
  },
  langChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 999,
    backgroundColor: colors.surfaceSunken,
    overflow: "hidden",
  },
  langChipActive: {
    backgroundColor: colors.primary,
  },
});
