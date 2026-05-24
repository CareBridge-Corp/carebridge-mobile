import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { IconButton, Text } from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";

interface DocumentUploadProps {
  imageUri: string | null;
  onUpload: () => void;
  onRemove: () => void;
  title: string;
  description?: string;
}

/**
 * Reusable document upload box used by verify-parent + verify-child.
 */
export function DocumentUpload({
  imageUri,
  onUpload,
  onRemove,
  title,
  description,
}: DocumentUploadProps) {
  if (imageUri) {
    return (
      <View style={styles.preview}>
        <Image source={{ uri: imageUri }} style={styles.previewImage} />
        <View style={styles.removeBtnWrap}>
          <IconButton
            icon="close"
            accessibilityLabel="Remove document"
            variant="tinted"
            onPress={onRemove}
          />
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onUpload}
      style={({ pressed }) => [styles.box, pressed && { opacity: 0.85 }]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name="cloud-upload-outline"
          size={28}
          color={colors.primary}
        />
      </View>
      <Text variant="body" weight="semibold" align="center">
        {title}
      </Text>
      {description ? (
        <Text
          variant="caption"
          tone="secondary"
          align="center"
          style={styles.descr}
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    paddingVertical: spacing[8],
    paddingHorizontal: spacing[5],
    alignItems: "center",
    ...shadows.xs,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[3],
  },
  descr: {
    marginTop: spacing[1],
    maxWidth: 240,
  },
  preview: {
    position: "relative",
    width: "100%",
    height: 220,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  removeBtnWrap: {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
  },
});
