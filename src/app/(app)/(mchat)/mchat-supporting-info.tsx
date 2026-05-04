import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import apiClient from "../../../shared/api/client";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useChildrenStore } from "../store/childrenStore";
import { useMChatStore } from "../store/mchatStore";

export default function MChatSupportingInfoScreen() {
  const router = useRouter();
  const {
    answers,
    parentDescription,
    childPictures,
    setSupportingInfo,
    clearStore,
  } = useMChatStore();
  const activeChild = useChildrenStore((state) => state.activeChild);

  const [description, setDescription] = useState(parentDescription);
  const [pictures, setPictures] = useState<string[]>(childPictures);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeChild?.childId) {
        throw new Error("No active child selected");
      }

      // 1. Submit M-CHAT answers first
      const screeningPayload = {
        childId: activeChild.childId,
        answers: answers,
      };

      const screeningRes = await apiClient.post(
        "/screenings",
        screeningPayload,
      );
      const screeningId =
        screeningRes.data?.screeningId ||
        screeningRes.screeningId ||
        screeningRes.screening?.screeningId;

      if (!screeningId) {
        throw new Error("Failed to retrieve screening ID from server");
      }

      // 2. Submit Supporting Info via Multipart
      if (description.trim() || pictures.length > 0) {
        const formData = new FormData();
        if (description.trim()) {
          formData.append("parentDescription", description.trim());
        }

        pictures.forEach((uri, index) => {
          formData.append("childPictures", {
            uri,
            name: `child_image_${index}.jpg`,
            type: "image/jpeg",
          } as any);
        });

        await multipartApiClient.post(
          `/screenings/${screeningId}/supporting-info`,
          formData,
        );
      }

      return true;
    },
    onSuccess: () => {
      setConfirmModalVisible(false);
      clearStore();
      router.replace("/(app)/(mchat)/mchat-success" as Href);
    },
    onError: (error: any) => {
      setConfirmModalVisible(false);
      setStatusConfig({
        type: "error",
        title: "Submission Failed",
        message:
          error.message || "An error occurred while submitting your screening.",
      });
      setStatusModalVisible(true);
    },
  });

  const handleAddPicture = async () => {
    if (pictures.length >= 5) {
      setStatusConfig({
        type: "info",
        title: "Limit Reached",
        message: "You can only upload up to 5 pictures.",
      });
      setStatusModalVisible(true);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusConfig({
        type: "error",
        title: "Permission Required",
        message: "Please grant camera roll permissions to upload images.",
      });
      setStatusModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 5 - pictures.length,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((a) => a.uri);
      setPictures((prev) => [...prev, ...uris].slice(0, 5));
    }
  };

  const handleNext = () => {
    // Save to store to persist state if going back
    setSupportingInfo(description, pictures);

    // Check if 20 questions are answered (basic check)
    if (Object.keys(answers).length < 20) {
      setStatusConfig({
        type: "error",
        title: "Incomplete",
        message: "Please answer all 20 questions before submitting.",
      });
      setStatusModalVisible(true);
      return;
    }

    setConfirmModalVisible(true);
  };

  const handleBack = () => {
    setSupportingInfo(description, pictures);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.navButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <View style={styles.progressDotsContainer}>
          {/* Mock progress just to show end indicator */}
          <View style={[styles.progressDot, styles.progressDotCompleted]} />
          <View style={[styles.progressDot, styles.progressDotActive]} />
        </View>
        <View style={styles.navButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Supporting Info</Text>
        <Text style={styles.subtitle}>
          Adding details and pictures will help our clinicians provide a better
          analysis. This is purely optional.
        </Text>

        {/* Parent Description */}
        <Text style={styles.label}>Additional Comments</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. I noticed my child making less eye contact recently..."
          placeholderTextColor="#A0B8C8"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
          textAlignVertical="top"
        />

        {/* Pictures List */}
        <Text style={styles.label}>Child Pictures (Up to 5)</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesScroll}
        >
          {pictures.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() =>
                  setPictures(pictures.filter((_, i) => i !== index))
                }
              >
                <Ionicons name="close-circle" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
          {pictures.length < 5 && (
            <TouchableOpacity
              style={styles.addImageBtn}
              onPress={handleAddPicture}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={32} color="#0C4A6E" />
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.primaryButton,
            submitMutation.isPending && styles.primaryButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={submitMutation.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Finish & Submit Analysis</Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <StatusModal
        visible={confirmModalVisible}
        type="info"
        title="Submit M-CHAT"
        message="Are you ready to submit your M-CHAT answers and any supporting info for clinical analysis? You cannot edit them after submitting."
        primaryButtonText={
          submitMutation.isPending ? "Submitting..." : "Yes, Submit"
        }
        onPrimaryPress={() => submitMutation.mutate()}
        secondaryButtonText="Go Back"
        onSecondaryPress={() => setConfirmModalVisible(false)}
      />

      {/* Success/Error/Info Responses Output Modal */}
      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={() => setStatusModalVisible(false)}
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  navButton: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  progressDotsContainer: {
    flexDirection: "row",
    gap: 4,
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#C0D4E0",
  },
  progressDotActive: {
    backgroundColor: "#0C4A6E",
    width: 20,
  },
  progressDotCompleted: {
    backgroundColor: "#5A7A8F",
    width: 20,
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
    marginBottom: spacing.xxl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  textArea: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    height: 120,
  },
  imagesScroll: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
  },
  imageWrapper: {
    marginRight: spacing.md,
    position: "relative",
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
  },
  removeImageBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D1DFE8",
    borderStyle: "dashed",
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  primaryButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  primaryButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
