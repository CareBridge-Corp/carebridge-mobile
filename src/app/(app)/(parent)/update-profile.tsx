import { Ionicons } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { apiClient } from "../../../shared/api/client";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useProfile } from "../hooks/useProfile";

export default function UpdateProfileScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  const [firstName, setFirstName] = useState(profile?.firstName || "");
  const [lastName, setLastName] = useState(profile?.lastName || "");
  const [surname, setSurname] = useState(profile?.surname || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || "");
      setLastName(profile.lastName || "");
      setSurname(profile.surname || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const updateProfileDetailsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.put("/users/me", {
        firstName,
        lastName,
        surname,
        email,
        phone,
      });
      return response.data;
    },
  });

  const uploadProfilePicMutation = useMutation({
    mutationFn: async () => {
      if (!profileImage) return null;

      const formData = new FormData();
      const filename = profileImage.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: profileImage,
        name: filename,
        type,
      } as any);

      const response = await multipartApiClient.post(
        "/users/me/profile-picture",
        formData,
      );
      return response.data;
    },
  });

  const handleSaveProfile = async () => {
    try {
      // 1. Update text fields
      await updateProfileDetailsMutation.mutateAsync();

      // 2. Upload image if selected
      if (profileImage) {
        await uploadProfilePicMutation.mutateAsync();
      }

      // 3. Update local auth store user optimistically
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      setStatusConfig({
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been successfully updated.",
      });
      setStatusModalVisible(true);
    } catch (error: any) {
      setStatusConfig({
        type: "error",
        title: "Update Failed",
        message: error.message || "Failed to update profile. Please try again.",
      });
      setStatusModalVisible(true);
    }
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusConfig({
        type: "error",
        title: "Permission Required",
        message:
          "Please grant camera roll permissions to upload a profile picture.",
      });
      setStatusModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleModalPrimaryPress = () => {
    setStatusModalVisible(false);
    if (statusConfig.type === "success") {
      router.back();
    }
  };

  if (isLoadingProfile && !profile) {
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

  const isSaving =
    updateProfileDetailsMutation.isPending ||
    uploadProfilePicMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Picture Upload */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleImagePick} activeOpacity={0.8}>
            <View style={styles.avatarContainer}>
              {profileImage || profile?.profilePictureUrl ? (
                <Image
                  source={{
                    uri: profileImage || profile?.profilePictureUrl,
                  }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={48} color="#A0B8C8" />
                </View>
              )}
              <View style={styles.editIconBadge}>
                <Ionicons name="camera" size={18} color={colors.white} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#A0B8C8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#A0B8C8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Surname</Text>
            <TextInput
              style={styles.input}
              value={surname}
              onChangeText={setSurname}
              placeholder="Surname (Optional)"
              placeholderTextColor="#A0B8C8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Email Address"
              placeholderTextColor="#A0B8C8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone Number"
              placeholderTextColor="#A0B8C8"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveProfile}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Text>
          {!isSaving && (
            <Ionicons name="checkmark-circle" size={20} color={colors.white} />
          )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge * 2,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  editIconBadge: {
    position: "absolute",
    bottom: 0,
    right: 4,
    backgroundColor: "#0C4A6E",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  formContainer: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#5A7A8F",
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "#E8F0F5",
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: Platform.OS === "ios" ? spacing.lg : spacing.md,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: "#E8F0F5",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  saveButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
