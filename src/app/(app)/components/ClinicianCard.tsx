import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Avatar, Card, Text } from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import type { Clinician } from "../store/clinicianStore";

interface ClinicianCardProps {
  clinician: Clinician;
  onPress?: () => void;
  /** Optional secondary CTA shown at the right (e.g. Message). */
  onMessagePress?: () => void;
}

/**
 * Compact card displaying the assigned clinician. Replaces the inline
 * "Curated by" row and the mock DoctorsSection carousel.
 */
export function ClinicianCard({
  clinician,
  onPress,
  onMessagePress,
}: ClinicianCardProps) {
  const fullName = [clinician.surname, clinician.firstName, clinician.lastName]
    .filter(Boolean)
    .join(" ");
  const specialization = clinician.specializations?.[0]?.name;

  return (
    <Card
      variant="elevated"
      padding="md"
      onPress={onPress}
      accessibilityLabel={`Your clinician ${fullName}`}
    >
      <View style={styles.row}>
        <Avatar uri={clinician.profilePictureUrl} name={fullName} size="md" />
        <View style={styles.info}>
          <Text variant="caption" tone="secondary">
            Your clinician
          </Text>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {fullName}
          </Text>
          {specialization ? (
            <Text variant="caption" tone="tertiary" numberOfLines={1}>
              {specialization}
            </Text>
          ) : null}
        </View>

        {onMessagePress ? (
          <Pressable
            onPress={onMessagePress}
            hitSlop={8}
            style={({ pressed }) => [
              styles.messageBtn,
              pressed && styles.pressed,
            ]}
            accessibilityLabel="Message clinician"
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={colors.primary}
            />
          </Pressable>
        ) : (
          <Ionicons name="chevron-forward" size={18} color={colors.iconMuted} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  info: {
    flex: 1,
  },
  messageBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryMuted,
  },
  pressed: {
    opacity: 0.7,
  },
});
