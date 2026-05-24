import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { colors, layout, spacing } from "../../theme";
import { Text } from "./Text";

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Icon shown in the leading circle. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Override default leading circle tint. */
  iconTint?: string;
  /** Element to render in the leading slot (e.g. avatar). Overrides `icon`. */
  leading?: React.ReactNode;
  /** Element to render in the trailing slot (e.g. badge, switch). */
  trailing?: React.ReactNode;
  /** Show chevron at the trailing edge. Defaults to true when onPress provided. */
  showChevron?: boolean;
  onPress?: PressableProps["onPress"];
  style?: StyleProp<ViewStyle>;
  /** Hide bottom divider. */
  noDivider?: boolean;
  /** Danger styling (used for logout, destructive actions). */
  destructive?: boolean;
  accessibilityLabel?: string;
}

/**
 * Reusable settings/menu row. Replaces ad-hoc `menuItem` styles in profile.
 */
export function ListRow({
  title,
  subtitle,
  icon,
  iconTint,
  leading,
  trailing,
  showChevron,
  onPress,
  style,
  noDivider = false,
  destructive = false,
  accessibilityLabel,
}: ListRowProps) {
  const chevronVisible = showChevron ?? !!onPress;

  const titleTone = destructive ? "danger" : "primary";
  const tint = iconTint ?? (destructive ? colors.error : colors.primary);
  const tintBg = destructive ? colors.errorBackground : colors.primaryMuted;

  const content = (
    <View style={styles.row}>
      <View style={styles.leading}>
        {leading ??
          (icon ? (
            <View style={[styles.iconCircle, { backgroundColor: tintBg }]}>
              <Ionicons name={icon} size={18} color={tint} />
            </View>
          ) : null)}
      </View>

      <View style={styles.text}>
        <Text variant="body" tone={titleTone} weight="medium">
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" tone="secondary" style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.trailing}>
        {trailing}
        {chevronVisible ? (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.iconMuted}
            style={trailing ? styles.chevronAfter : undefined}
          />
        ) : null}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? title}
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          !noDivider && styles.divider,
          pressed && styles.pressed,
          style,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, !noDivider && styles.divider, style]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[4],
    minHeight: layout.listRowMinHeight,
    justifyContent: "center",
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  pressed: {
    backgroundColor: colors.surfaceSunken,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing[3],
  },
  leading: {
    marginRight: spacing[3],
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
  },
  subtitle: {
    marginTop: 2,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing[2],
  },
  chevronAfter: {
    marginLeft: spacing[1],
  },
});
