import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
import { DocumentUpload } from "../components/DocumentUpload";
import { useChildrenStore } from "../store/childrenStore";

interface VerifyChildProps {
  onSuccess?: () => void;
  hideHeader?: boolean;
}

export default function VerifyChildScreen({
  onSuccess,
  hideHeader,
}: VerifyChildProps = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { activeChild, updateChild } = useChildrenStore();

  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!activeChild?.childId || !documentImage)
        throw new Error("Missing required information or document.");
      const formData = new FormData();
      const filename = documentImage.split("/").pop() || "certificate.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("image", {
        uri: documentImage,
        name: filename,
        type,
      } as any);
      return await multipartApiClient.post(
        `/users/children/${activeChild.childId}/verify/birth`,
        formData,
      );
    },
    onSuccess: () => {
      if (activeChild) {
        updateChild(activeChild.childId, { status: "PENDING" });
      }
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setStatusConfig({
        type: "success",
        title: "Document submitted",
        message:
          "Your document has been uploaded successfully. We'll notify you once it's reviewed.",
      });
      setStatusModalVisible(true);
      onSuccess?.();
    },
    onError: (error: any) => {
      setStatusConfig({
        type: "error",
        title: "Upload failed",
        message:
          error.message || "Failed to upload document. Please try again.",
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
        message:
          "Please grant camera roll permissions to upload a certificate.",
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

  if (!activeChild) {
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
      <Text variant="display">Verify {activeChild.firstName}</Text>
      <Text variant="body" tone="secondary" style={styles.subtitle}>
        Review the details below and upload a birth certificate or vaccination
        document.
      </Text>

      <Card variant="tinted" padding="lg" style={styles.detailsCard}>
        <SectionHeader title="Child details" />
        <DetailRow
          label="Name"
          value={`${activeChild.firstName} ${activeChild.lastName}`}
        />
        <DetailRow label="Date of birth" value={activeChild.dob} />
        <DetailRow label="Gender" value={activeChild.gender} />
        <DetailRow
          label="Region"
          value={activeChild.region || "Not specified"}
          last
        />
      </Card>

      <SectionHeader title="Document upload" />
      <DocumentUpload
        imageUri={documentImage}
        onUpload={handleUpload}
        onRemove={() => setDocumentImage(null)}
        title="Upload official document"
        description="Birth certificate or vaccination card · max 5 MB"
      />
    </View>
  );

  const footer = (
    <View style={styles.footer}>
      <Button
        label="Submit document"
        onPress={() => uploadMutation.mutate()}
        loading={uploadMutation.isPending}
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
