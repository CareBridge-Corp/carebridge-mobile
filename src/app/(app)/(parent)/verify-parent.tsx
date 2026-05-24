import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Button,
  Card,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
} from "../../../shared/components/ui";
import { colors, spacing } from "../../../shared/theme";
import { useAuthStore } from "../../(auth)/store/authStore";
import { DocumentUpload } from "../components/DocumentUpload";

interface VerifyParentProps {
  onSuccess?: () => void;
  hideHeader?: boolean;
}

export default function VerifyParentScreen({
  onSuccess,
  hideHeader,
}: VerifyParentProps = {}) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const uploadParentVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!documentImage) throw new Error("Missing parent document.");
      const formData = new FormData();
      const filename = documentImage.split("/").pop() || "parent.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", {
        uri:
          Platform.OS === "android"
            ? documentImage
            : documentImage.replace("file://", ""),
        name: filename,
        type,
      } as any);
      return await multipartApiClient.post(`/users/me/verify/parent`, formData);
    },
    onSuccess: () => {
      setStatusConfig({
        type: "success",
        title: "Document submitted",
        message: "Your Fayda ID has been uploaded for verification.",
      });
      setStatusModalVisible(true);
      onSuccess?.();
    },
    onError: (error: any) => {
      setStatusConfig({
        type: "error",
        title: "Upload failed",
        message: error.message || "Failed to upload document. Please try again.",
      });
      setStatusModalVisible(true);
    },
  });

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusConfig({
        type: "error",
        title: "Permission required",
        message: "Please grant camera roll permissions to upload an ID.",
      });
      setStatusModalVisible(true);
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setDocumentImage(result.assets[0].uri);
    }
  };

  const handleModalPrimaryPress = () => {
    setStatusModalVisible(false);
    if (statusConfig.type === "success") router.back();
  };

  if (!user) {
    return (
      <Screen background={colors.surfaceMuted}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const body = (
    <View style={styles.body}>
      <Text variant="display">Verify yourself</Text>
      <Text variant="body" tone="secondary" style={styles.subtitle}>
        Upload a photo of your Fayda ID for parent identity verification.
      </Text>

      <Card variant="tinted" padding="lg" style={styles.detailsCard}>
        <SectionHeader title="Your details" />
        <DetailRow label="First name" value={user.firstName} />
        <DetailRow label="Last name" value={user.lastName} />
        <DetailRow label="Email" value={user.email} last />
      </Card>

      <SectionHeader title="Fayda ID photo" />
      <DocumentUpload
        imageUri={documentImage}
        onUpload={handleUpload}
        onRemove={() => setDocumentImage(null)}
        title="Upload Fayda ID"
        description="Tap to browse photos (max 5 MB)"
      />
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Button
        label="Submit document"
        onPress={() => uploadParentVerificationMutation.mutate()}
        loading={uploadParentVerificationMutation.isPending}
        disabled={!documentImage}
        trailingIcon="checkmark-circle"
      />
    </View>
  );

  if (hideHeader) {
    return (
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Screen padded={false} background={colors.surfaceMuted} scroll>
            {body}
          </Screen>
        </View>
        {footer}
        <StatusModal
          visible={statusModalVisible}
          type={statusConfig.type}
          title={statusConfig.title}
          message={statusConfig.message}
          onPrimaryPress={handleModalPrimaryPress}
        />
      </View>
    );
  }

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader />
      {body}
      {footer}
      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={handleModalPrimaryPress}
      />
    </Screen>
  );
}

function DetailRow({
  label,
  value,
  last,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.detailRow, !last && styles.detailRowDivider]}>
      <Text variant="bodySmall" tone="secondary">
        {label}
      </Text>
      <Text variant="bodySmall" weight="semibold">
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing[5],
    paddingTop: spacing[4],
  },
  subtitle: {
    marginTop: spacing[2],
    marginBottom: spacing[5],
  },
  detailsCard: {
    marginBottom: spacing[5],
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing[3],
  },
  detailRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    backgroundColor: colors.surfaceMuted,
  },
});
