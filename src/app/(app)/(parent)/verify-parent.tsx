import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
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
import { useAuthStore } from "../../(auth)/store/authStore";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";

interface VerifyParentProps {
  onSuccess?: () => void;
  hideHeader?: boolean;
}

export default function VerifyParentScreen({
  onSuccess,
  hideHeader,
}: VerifyParentProps = {}) {
  const router = useRouter();
  const { user } = useAuthStore(); // Using auth store to get parent details

  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const uploadParentVerificationMutation = useMutation({
    mutationFn: async () => {
      if (!documentImage) {
        throw new Error("Missing parent document.");
      }

      const formData = new FormData();
      const filename = documentImage.split("/").pop() || "parent.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: documentImage,
        name: filename,
        type,
      } as any);

      const response: any = await multipartApiClient.post(
        `/users/me/verify/parent`,
        formData,
      );
      return response;
    },
    onSuccess: () => {
      setStatusConfig({
        type: "success",
        title: "Document Submitted",
        message:
          "Your Fayda ID has been uploaded successfully for verification.",
      });
      setStatusModalVisible(true);
      if (onSuccess) onSuccess();
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

  if (!user) {
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

      {!hideHeader && (
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Parent Verification</Text>
        <Text style={styles.subtitle}>
          Please securely upload your Fayda image for parent identity
          verification.
        </Text>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Your Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>First Name:</Text>
            <Text style={styles.detailValue}>{user.firstName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Last Name:</Text>
            <Text style={styles.detailValue}>{user.lastName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{user.email}</Text>
          </View>
        </View>

        <Text
          style={[
            styles.sectionHeader,
            { marginTop: spacing.xl, marginBottom: spacing.md },
          ]}
        >
          Fayda Image Upload
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
            <Text style={styles.uploadTitle}>Upload Fayda Image</Text>
            <Text style={styles.uploadSubtitle}>
              Tap to browse photos (Max file size 5MB)
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (uploadParentVerificationMutation.isPending || !documentImage) &&
              styles.submitButtonDisabled,
          ]}
          onPress={() => uploadParentVerificationMutation.mutate()}
          disabled={
            uploadParentVerificationMutation.isPending || !documentImage
          }
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {uploadParentVerificationMutation.isPending
              ? "Submitting..."
              : "Submit Document"}
          </Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

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
