import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useChildrenStore } from "../store/childrenStore";

export default function VerifyChildScreen() {
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

  const uploadVerificationDocMutation = useMutation({
    mutationFn: async () => {
      if (!activeChild?.childId || !documentImage) {
        throw new Error("Missing required information or document.");
      }

      const formData = new FormData();
      const filename = documentImage.split("/").pop() || "certificate.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("file", {
        uri: documentImage,
        name: filename,
        type,
      } as any);

      // Send to verification endpoint
      const response: any = await multipartApiClient.post(
        `/users/children/${activeChild.childId}/birth-certificate`,
        formData,
      );
      return response;
    },
    onSuccess: () => {
      if (activeChild) {
        // Optimistically update the child status to PENDING
        updateChild(activeChild.childId, { status: "PENDING" });
      }
      queryClient.invalidateQueries({ queryKey: ["children"] });
      setStatusConfig({
        type: "success",
        title: "Document Submitted",
        message:
          "Your document has been uploaded successfully for verification. We will notify you once it's reviewed.",
      });
      setStatusModalVisible(true);
    },
    onError: (error: any) => {
      setStatusConfig({
        type: "error",
        title: "Upload Failed",
        message:
          error.message || "Failed to upload document. Please try again.",
      });
      setStatusModalVisible(true);
    },
  });

  const handleDocumentUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusConfig({
        type: "error",
        title: "Permission Required",
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

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setDocumentImage(result.assets[0].uri);
    }
  };

  const handleModalPrimaryPress = () => {
    setStatusModalVisible(false);
    if (statusConfig.type === "success") {
      router.back();
    }
  };

  if (!activeChild) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#0C4A6E" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Verify Profile</Text>
        <Text style={styles.subtitle}>
          Please review the child details below and securely upload a birth
          certificate or vaccine document.
        </Text>

        {/* Existing Child Details (Read-only representation) */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Child Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Name:</Text>
            <Text style={styles.detailValue}>
              {activeChild.firstName} {activeChild.lastName}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date of Birth:</Text>
            <Text style={styles.detailValue}>{activeChild.dob}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gender:</Text>
            <Text style={styles.detailValue}>{activeChild.gender}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Region:</Text>
            <Text style={styles.detailValue}>
              {activeChild.region || "Not specified"}
            </Text>
          </View>
        </View>

        {/* Document Upload Area */}
        <Text
          style={[
            styles.sectionHeader,
            { marginTop: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Document Upload
        </Text>

        {documentImage ? (
          <View style={styles.uploadedImageContainer}>
            <Image
              source={{ uri: documentImage }}
              style={styles.uploadedImage}
            />
            <TouchableOpacity
              style={styles.removeImageBtn}
              onPress={() => setDocumentImage(null)}
            >
              <Ionicons name="close-circle" size={32} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadCertificateContainer}
            activeOpacity={0.7}
            onPress={handleDocumentUpload}
          >
            <View style={styles.uploadIconCircle}>
              <Ionicons
                name="document-text-outline"
                size={32}
                color="#0C4A6E"
              />
            </View>
            <Text style={styles.uploadTitle}>Upload Official Document</Text>
            <Text style={styles.uploadSubtitle}>
              Tap to browse photos (Max file size 5MB)
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Submit Action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (uploadVerificationDocMutation.isPending || !documentImage) &&
              styles.submitButtonDisabled,
          ]}
          onPress={() => uploadVerificationDocMutation.mutate()}
          disabled={uploadVerificationDocMutation.isPending || !documentImage}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {uploadVerificationDocMutation.isPending
              ? "Submitting..."
              : "Submit Document"}
          </Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Response Modal */}
      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={handleModalPrimaryPress}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backButton: {
    padding: spacing.sm,
    alignSelf: "flex-start",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  title: {
    fontSize: 32,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: "#A0B8C8",
    marginBottom: spacing.xl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  detailsCard: {
    backgroundColor: "#F4F8FA",
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  sectionHeader: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  detailLabel: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    fontWeight: typography.fontWeight.medium,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.semibold,
  },
  uploadCertificateContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: "#E8F0F5",
    borderStyle: "dashed",
    paddingVertical: spacing.xxxl,
    alignItems: "center",
  },
  uploadIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
  },
  uploadedImageContainer: {
    width: "100%",
    height: 250,
    borderRadius: borderRadius.xl,
    position: "relative",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8F0F5",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeImageBtn: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    borderRadius: 16,
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  submitButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  submitButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
