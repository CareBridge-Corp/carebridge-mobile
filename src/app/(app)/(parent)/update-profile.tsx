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
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { apiClient } from "../../../shared/api/client";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Button,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { colors, layout, spacing } from "../../../shared/theme";
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
      await updateProfileDetailsMutation.mutateAsync();

      if (profileImage) {
        await uploadProfilePicMutation.mutateAsync();
      }

      queryClient.invalidateQueries({ queryKey: ["profile"] });

      setStatusConfig({
        type: "success",
        title: "Profile updated",
        message: "Your profile has been successfully updated.",
      });
      setStatusModalVisible(true);
    } catch (error: any) {
      setStatusConfig({
        type: "error",
        title: "Update failed",
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
        title: "Permission required",
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
      <Screen background={colors.surfaceMuted}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </Screen>
    );
  }

  const isSaving =
    updateProfileDetailsMutation.isPending ||
    uploadProfilePicMutation.isPending;

  const avatarUri = profileImage || profile?.profilePictureUrl;

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title="Edit profile" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.avatarSection}>
            <Pressable
              onPress={handleImagePick}
              style={({ pressed }) => [
                styles.avatarPressable,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.avatarShell}>
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons
                      name="person"
                      size={48}
                      color={colors.iconMuted}
                    />
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Ionicons
                    name="camera"
                    size={16}
                    color={colors.textInverse}
                  />
                </View>
              </View>
              <Text
                variant="bodySmall"
                tone="secondary"
                align="center"
                style={styles.avatarHint}
              >
                Tap to change profile photo
              </Text>
            </Pressable>
          </View>

          <SectionHeader title="Personal info" />

          <View style={styles.formGroup}>
            <TextField
              label="First name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              leadingIcon="person-outline"
            />
            <TextField
              label="Last name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
            />
            <TextField
              label="Surname"
              value={surname}
              onChangeText={setSurname}
              placeholder="Surname (optional)"
            />
          </View>

          <SectionHeader title="Contact info" />

          <View style={styles.formGroup}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              leadingIcon="mail-outline"
            />
            <TextField
              label="Phone number"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Phone number"
              leadingIcon="call-outline"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Button
          label={isSaving ? "Saving..." : "Save changes"}
          onPress={handleSaveProfile}
          loading={isSaving}
          trailingIcon="checkmark-circle"
        />
      </View>

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

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[2],
    paddingBottom: spacing[8],
    gap: spacing[4],
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: spacing[4],
  },
  avatarPressable: {
    alignItems: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  avatarShell: {
    position: "relative",
  },
  avatarImage: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 3,
    borderColor: colors.surface,
  },
  avatarPlaceholder: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: colors.surfaceSunken,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.surface,
  },
  editBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.surfaceMuted,
  },
  avatarHint: {
    marginTop: spacing[3],
  },
  formGroup: {
    gap: spacing[3],
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing[4],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
