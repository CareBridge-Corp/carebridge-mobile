import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { borderRadius, colors, layout, spacing, typography } from "../../theme";
import { Text } from "./Text";

interface TextFieldProps extends Omit<TextInputProps, "style"> {
  label?: string;
  helperText?: string;
  errorText?: string;
  leadingIcon?: keyof typeof Ionicons.glyphMap;
  trailingIcon?: keyof typeof Ionicons.glyphMap;
  onTrailingPress?: () => void;
  /** Renders a static prefix (e.g. "+251"). */
  prefix?: string;
  /** Multi-line input (textarea). */
  multiline?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  /** Toggle password visibility automatically when true. */
  isPassword?: boolean;
}

/**
 * Consistent form input with label, helper, error, prefix, and icons.
 * Replaces ~12 ad-hoc input wrappers across auth + child screens.
 */
export function TextField({
  label,
  helperText,
  errorText,
  leadingIcon,
  trailingIcon,
  onTrailingPress,
  prefix,
  multiline = false,
  containerStyle,
  isPassword = false,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);
  const secureTextEntry = isPassword ? !secureVisible : rest.secureTextEntry;
  const hasError = !!errorText;
  const resolvedTrailingIcon = isPassword
    ? secureVisible
      ? "eye-off-outline"
      : "eye-outline"
    : trailingIcon;
  const resolvedTrailingPress = isPassword
    ? () => setSecureVisible((v) => !v)
    : onTrailingPress;

  const borderColor = hasError
    ? colors.error
    : focused
      ? colors.borderFocus
      : colors.border;

  return (
    <View style={containerStyle}>
      {label ? (
        <Text variant="bodySmall" tone="secondary" style={styles.label}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.field,
          { borderColor },
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
        ]}
      >
        {leadingIcon ? (
          <Ionicons
            name={leadingIcon}
            size={18}
            color={focused ? colors.iconBrand : colors.icon}
            style={styles.leadingIcon}
          />
        ) : null}

        {prefix ? (
          <Text variant="body" tone="primary" style={styles.prefix}>
            {prefix}
          </Text>
        ) : null}

        <TextInput
          {...rest}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          placeholderTextColor={colors.textTertiary}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
        />

        {resolvedTrailingIcon ? (
          <Pressable
            onPress={resolvedTrailingPress}
            hitSlop={10}
            style={styles.trailing}
          >
            <Ionicons
              name={resolvedTrailingIcon}
              size={18}
              color={colors.icon}
            />
          </Pressable>
        ) : null}
      </View>

      {hasError ? (
        <Text variant="caption" tone="danger" style={styles.helper}>
          {errorText}
        </Text>
      ) : helperText ? (
        <Text variant="caption" tone="tertiary" style={styles.helper}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing[2],
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: layout.inputHeight,
    paddingHorizontal: spacing[4],
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  fieldFocused: {
    backgroundColor: colors.surface,
  },
  fieldMultiline: {
    alignItems: "flex-start",
    paddingVertical: spacing[3],
    minHeight: 120,
  },
  leadingIcon: {
    marginRight: spacing[2],
  },
  prefix: {
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    ...typography.textStyle.body,
    color: colors.textPrimary,
    padding: 0,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: "top",
  },
  trailing: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing[1],
  },
  helper: {
    marginTop: spacing[2],
    marginLeft: spacing[1],
  },
});
