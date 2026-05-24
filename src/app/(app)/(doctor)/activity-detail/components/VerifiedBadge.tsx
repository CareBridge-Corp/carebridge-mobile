import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, View } from "react-native";
import { Card, Text } from "../../../../../shared/components/ui";
import { colors, spacing } from "../../../../../shared/theme";

interface VerifiedBadgeProps {
  label: string;
  onPress?: () => void;
}

export function VerifiedBadge({ label, onPress }: VerifiedBadgeProps) {
  const Wrapper = (onPress ? Pressable : View) as any;
  return (
    <Wrapper
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.wrapper,
        pressed && styles.pressed,
      ]}
    >
      <Card variant="tinted" padding="md" style={styles.card}>
        <View style={styles.row}>
          <View style={styles.icon}>
            <Ionicons
              name="shield-checkmark"
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="bodyMedium" weight="semibold">
              {label}
            </Text>
            <Text variant="caption" tone="tertiary">
              Your information is safe with us
            </Text>
          </View>
          {onPress ? (
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.iconMuted}
            />
          ) : null}
        </View>
      </Card>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing[2],
  },
  pressed: {
    opacity: 0.85,
  },
  card: {
    backgroundColor: colors.surface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryMuted,
    justifyContent: "center",
    alignItems: "center",
  },
});
