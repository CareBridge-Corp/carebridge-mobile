import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
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
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageUpload = () => {
    // TODO: Implement image picker
    Alert.alert("Image Upload", "Image picker will be implemented");
  };

  const handleNext = () => {
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter first name");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter last name");
      return;
    }

    if (!dob.trim()) {
      Alert.alert("Error", "Please enter date of birth");
      return;
    }

    if (!gender) {
      Alert.alert("Error", "Please select gender");
      return;
    }

    // Create child profile
    createChildMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: dob.trim(),
        gender: gender,
        region: "Addis Ababa", // Defaulting region or could add an input for it
      },
      {
        onSuccess: () => {
          Alert.alert("Success", "Child profile created successfully", [
            {
              text: "OK",
              onPress: () => router.replace("/(app)" as Href),
            },
          ]);
        },
        onError: (error: any) => {
          Alert.alert(
            "Error",
            error.message || "Failed to create child profile",
          );
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
        <TouchableOpacity
          style={styles.imageUploadContainer}
          onPress={handleImageUpload}
          activeOpacity={0.7}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={32} color="#A0B8C8" />
            </View>
          )}
        </TouchableOpacity>

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

        {/* Upload Birth Certificate */}
        <TouchableOpacity
          style={styles.uploadCertificateContainer}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIconCircle}>
            <Ionicons name="cloud-upload-outline" size={28} color="#0C4A6E" />
          </View>
          <Text style={styles.uploadTitle}>Upload Birth Certificate</Text>
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
  imageUploadContainer: {
    alignSelf: "center",
    marginBottom: spacing.xxxl,
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
