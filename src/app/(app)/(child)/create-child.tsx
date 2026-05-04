import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import StatusModal from "../../../shared/components/StatusModal";
import {
  borderRadius,
  colors,
  spacing,
  typography,
} from "../../../shared/theme";
import { useCreateChild } from "../hooks/useChildren";

export default function CreateChildScreen() {
  const router = useRouter();
  const createChildMutation = useCreateChild();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [region, setRegion] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [birthCertificateImage, setBirthCertificateImage] = useState<
    string | null
  >(null);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusModalConfig, setStatusModalConfig] = useState({
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
    onPrimaryPress: () => {},
  });

  const regions = [
    "Addis Ababa",
    "Afar",
    "Amhara",
    "Benishangul-Gumuz",
    "Dire Dawa",
    "Gambela",
    "Harari",
    "Oromia",
    "Sidama",
    "Somali",
    "South Ethiopia",
    "South West Ethiopia Peoples",
    "Tigray",
  ];

  const handleImageUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusModalConfig({
        type: "error",
        title: "Permission Required",
        message: "Please grant camera roll permissions to upload an image.",
        onPrimaryPress: () => setStatusModalVisible(false),
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

    if (!result.canceled && result.assets?.[0]) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleBirthCertificateUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusModalConfig({
        type: "error",
        title: "Permission Required",
        message:
          "Please grant camera roll permissions to upload a certificate.",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setBirthCertificateImage(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!firstName.trim()) {
      setStatusModalConfig({
        type: "error",
        title: "Validation Error",
        message: "Please enter first name",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    if (!lastName.trim()) {
      setStatusModalConfig({
        type: "error",
        title: "Validation Error",
        message: "Please enter last name",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    if (!dob.trim()) {
      setStatusModalConfig({
        type: "error",
        title: "Validation Error",
        message: "Please enter date of birth",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    if (!gender) {
      setStatusModalConfig({
        type: "error",
        title: "Validation Error",
        message: "Please select gender",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    if (!region) {
      setStatusModalConfig({
        type: "error",
        title: "Validation Error",
        message: "Please select region",
        onPrimaryPress: () => setStatusModalVisible(false),
      });
      setStatusModalVisible(true);
      return;
    }

    // Create child profile
    createChildMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dob.trim(),
        gender: gender,
        region: region,
        profilePicture: profileImage || undefined,
        birthCertificate: birthCertificateImage || undefined,
      },
      {
        onSuccess: () => {
          setStatusModalConfig({
            type: "success",
            title: "Success",
            message: "Child profile created successfully.",
            onPrimaryPress: () => {
              setStatusModalVisible(false);
              router.replace("/(app)" as Href);
            },
          });
          setStatusModalVisible(true);
        },
        onError: (error: any) => {
          setStatusModalConfig({
            type: "error",
            title: "Error",
            message: error.message || "Failed to create child profile.",
            onPrimaryPress: () => setStatusModalVisible(false),
          });
          setStatusModalVisible(true);
        },
      },
    );
  };

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
        <Text style={styles.title}>Child's Info</Text>

        {/* Profile Image Upload */}
        <View style={styles.imageUploadWrapper}>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImageUpload}
            activeOpacity={0.7}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera" size={32} color="#A0B8C8" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.optionalText}>Profile Picture (Optional)</Text>
        </View>

        {/* First Name Input */}
        <TextInput
          style={styles.input}
          placeholder="First name"
          placeholderTextColor="#A0B8C8"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Last Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Last name"
          placeholderTextColor="#A0B8C8"
          value={lastName}
          onChangeText={setLastName}
        />

        {/* Date of Birth Input */}
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#A0B8C8"
          value={dob}
          onChangeText={setDob}
        />

        {/* Gender Selection */}
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Male" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Male")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Male" && styles.genderTextSelected,
              ]}
            >
              Male
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === "Female" && styles.genderButtonSelected,
            ]}
            onPress={() => setGender("Female")}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.genderText,
                gender === "Female" && styles.genderTextSelected,
              ]}
            >
              Female
            </Text>
          </TouchableOpacity>
        </View>

        {/* Region Dropdown */}
        <TouchableOpacity
          style={styles.dropdownSelector}
          onPress={() => setShowRegionDropdown(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.dropdownSelectorText,
              !region && styles.dropdownPlaceholderText,
            ]}
          >
            {region || "Select Region"}
          </Text>
          <Ionicons name="chevron-down" size={24} color="#A0B8C8" />
        </TouchableOpacity>

        {/* Upload Birth Certificate */}
        <TouchableOpacity
          style={styles.uploadCertificateContainer}
          activeOpacity={0.7}
          onPress={handleBirthCertificateUpload}
        >
          <View style={styles.uploadIconCircle}>
            <Ionicons name="cloud-upload-outline" size={28} color="#0C4A6E" />
          </View>
          <Text style={styles.uploadTitle}>
            Upload Birth Certificate (Optional)
          </Text>
          <Text style={styles.uploadSubtitle}>
            Max file size should be 100 GB
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            createChildMutation.isPending && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={createChildMutation.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {createChildMutation.isPending ? "Creating..." : "Next"}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Region Modal */}
      <Modal
        visible={showRegionDropdown}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegionDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRegionDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Region</Text>
              <TouchableOpacity onPress={() => setShowRegionDropdown(false)}>
                <Ionicons name="close" size={24} color="#0C4A6E" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {regions.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.regionOption,
                    region === item && styles.regionOptionSelected,
                  ]}
                  onPress={() => {
                    setRegion(item);
                    setShowRegionDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.regionOptionText,
                      region === item && styles.regionOptionTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                  {region === item && (
                    <Ionicons name="checkmark" size={24} color="#0C4A6E" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Reusable Custom Status Modal */}
      <StatusModal
        visible={statusModalVisible}
        type={statusModalConfig.type}
        title={statusModalConfig.title}
        message={statusModalConfig.message}
        onPrimaryPress={statusModalConfig.onPrimaryPress}
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
    marginBottom: spacing.xxxl,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
  },
  imageUploadWrapper: {
    alignItems: "center",
    marginBottom: spacing.xxxl,
  },
  imageUploadContainer: {
    alignSelf: "center",
    marginBottom: spacing.sm,
  },
  imagePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  optionalText: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    marginBottom: spacing.md,
  },
  genderContainer: {
    flexDirection: "row",
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  genderButton: {
    flex: 1,
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  genderButtonSelected: {
    backgroundColor: "#0C4A6E",
    borderColor: "#0C4A6E",
  },
  genderText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: "#5A7A8F",
  },
  genderTextSelected: {
    color: colors.white,
  },
  uploadCertificateContainer: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xxl,
    borderWidth: 2,
    borderColor: "#E8F0F5",
    borderStyle: "dashed",
    paddingVertical: spacing.xxxl,
    alignItems: "center",
    marginTop: spacing.lg,
  },
  uploadIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
  dropdownSelector: {
    backgroundColor: "#E8F0F5",
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  dropdownSelectorText: {
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
  },
  dropdownPlaceholderText: {
    color: "#A0B8C8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingHorizontal: spacing.xl,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
    marginBottom: spacing.sm,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  regionOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F4F8FA",
  },
  regionOptionSelected: {
    backgroundColor: "#F0F7FB",
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 0,
  },
  regionOptionText: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
  },
  regionOptionTextSelected: {
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  buttonContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  nextButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  nextButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
