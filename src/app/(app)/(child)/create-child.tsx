import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { isPaymentRequiredError } from "../../../shared/api/client";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Button,
  IconButton,
  Screen,
  ScreenHeader,
  SectionHeader,
  Text,
  TextField,
} from "../../../shared/components/ui";
import {
  borderRadius,
  colors,
  shadows,
  spacing,
} from "../../../shared/theme";
import { PaywallCard } from "../components/PaywallCard";
import { useCreateChild } from "../hooks/useChildren";
import { useEntitlements } from "../hooks/useEntitlements";

const REGIONS = [
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

function calculateAge(birthDate: Date): string {
  const today = new Date();
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
    years--;
    months = months + 12;
  }
  if (today.getDate() < birthDate.getDate()) months--;
  if (years > 0)
    return years === 1 ? `${years} year old` : `${years} years old`;
  if (months > 0)
    return months === 1 ? `${months} month old` : `${months} months old`;
  return "Less than a month old";
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function CreateChildScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const createChildMutation = useCreateChild();
  const { data: entitlements, isLoading: entitlementsLoading } =
    useEntitlements();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<"Male" | "Female" | "">("");
  const [region, setRegion] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [birthCertImage, setBirthCertImage] = useState<string | null>(null);
  const [showRegionSheet, setShowRegionSheet] = useState(false);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
    onPrimaryPress: () => {},
  });

  const showStatus = (
    type: "success" | "error" | "info",
    title: string,
    message: string,
    onPrimaryPress: () => void = () => setStatusModalVisible(false),
  ) => {
    setStatusConfig({ type, title, message, onPrimaryPress });
    setStatusModalVisible(true);
  };

  const handleProfilePic = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showStatus("error", "Permission required", "Please grant camera roll access.");
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

  const handleBirthCert = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showStatus("error", "Permission required", "Please grant camera roll access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) {
      setBirthCertImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (event.type === "set" && selectedDate) setDob(selectedDate);
    if (Platform.OS === "android") setShowDatePicker(false);
  };

  const handleNext = () => {
    if (!firstName.trim())
      return showStatus("error", "Missing info", "Please enter first name");
    if (!lastName.trim())
      return showStatus("error", "Missing info", "Please enter last name");
    if (!dob)
      return showStatus("error", "Missing info", "Please select date of birth");
    if (!gender)
      return showStatus("error", "Missing info", "Please select gender");
    if (!region)
      return showStatus("error", "Missing info", "Please select region");

    createChildMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dob: formatDate(dob),
        gender,
        region,
        profilePicture: profileImage || undefined,
        birthCertificate: birthCertImage || undefined,
      },
      {
        onSuccess: () => {
          showStatus(
            "success",
            "Success",
            "Child profile created successfully.",
            () => {
              setStatusModalVisible(false);
              router.replace("/(app)" as Href);
            },
          );
        },
        onError: (error: unknown) => {
          if (isPaymentRequiredError(error)) {
            router.push("/(app)/payment?purpose=EXTRA_CHILD" as Href);
            return;
          }
          const message =
            error instanceof Error
              ? error.message
              : "Failed to create child profile.";
          showStatus("error", "Error", message);
        },
      },
    );
  };

  const isPaywalled =
    !entitlementsLoading && entitlements && !entitlements.canAddChild;

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <ScreenHeader title="Add child" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isPaywalled ? (
          <PaywallCard
            title={t("payment.gate.extraChildTitle", "Add another child")}
            description={t(
              "payment.gate.extraChildDescription",
              "Subscribe to add additional child profiles.",
            )}
            purpose="EXTRA_CHILD"
          />
        ) : null}

        <Pressable
          onPress={handleProfilePic}
          style={({ pressed }) => [
            styles.avatarBox,
            pressed && { opacity: 0.85 },
          ]}
        >
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="camera" size={28} color={colors.iconMuted} />
            </View>
          )}
          <Text variant="caption" tone="secondary" style={styles.avatarHint}>
            Profile picture (optional)
          </Text>
        </Pressable>

        <View style={styles.form}>
          <View style={styles.nameRow}>
            <View style={styles.flex}>
              <TextField
                label="First name"
                placeholder="Aman"
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.flex}>
              <TextField
                label="Last name"
                placeholder="Bekele"
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }) => [
              styles.pickerInput,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text variant="caption" tone="secondary">
              Date of birth
            </Text>
            <View style={styles.pickerRow}>
              <Text variant="body" tone={dob ? "primary" : "tertiary"}>
                {dob ? formatDate(dob) : "Select date of birth"}
              </Text>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={colors.iconMuted}
              />
            </View>
          </Pressable>

          {dob ? (
            <View style={styles.ageHint}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.primary}
              />
              <Text variant="caption" tone="brand">
                {calculateAge(dob)}
              </Text>
            </View>
          ) : null}

          {showDatePicker ? (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          ) : null}

          <View>
            <Text variant="caption" tone="secondary" style={styles.fieldLabel}>
              Gender
            </Text>
            <View style={styles.segmentRow}>
              {(["Male", "Female"] as const).map((g) => {
                const isActive = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    style={({ pressed }) => [
                      styles.segment,
                      isActive && styles.segmentActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Text
                      variant="bodyMedium"
                      style={{
                        color: isActive ? colors.textInverse : colors.textPrimary,
                      }}
                    >
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => setShowRegionSheet(true)}
            style={({ pressed }) => [
              styles.pickerInput,
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text variant="caption" tone="secondary">
              Region
            </Text>
            <View style={styles.pickerRow}>
              <Text variant="body" tone={region ? "primary" : "tertiary"}>
                {region || "Select region"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color={colors.iconMuted}
              />
            </View>
          </Pressable>

          <SectionHeader
            title="Birth certificate"
            style={{ marginTop: spacing[2] }}
          />
          {birthCertImage ? (
            <View style={styles.certPreview}>
              <Image
                source={{ uri: birthCertImage }}
                style={styles.certImage}
              />
              <View style={styles.certRemove}>
                <IconButton
                  icon="close"
                  accessibilityLabel="Remove certificate"
                  variant="tinted"
                  onPress={() => setBirthCertImage(null)}
                />
              </View>
            </View>
          ) : (
            <Pressable
              onPress={handleBirthCert}
              style={({ pressed }) => [
                styles.uploadBox,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.uploadIcon}>
                <Ionicons
                  name="cloud-upload-outline"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <Text variant="body" weight="semibold">
                Upload (optional)
              </Text>
              <Text variant="caption" tone="secondary">
                JPG or PNG · max 5 MB
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={createChildMutation.isPending ? "Creating..." : "Create profile"}
          onPress={handleNext}
          loading={createChildMutation.isPending}
          disabled={isPaywalled === true}
          trailingIcon="arrow-forward"
        />
      </View>

      {/* Region bottom sheet */}
      <Modal
        visible={showRegionSheet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRegionSheet(false)}
      >
        <Pressable
          style={styles.overlay}
          onPress={() => setShowRegionSheet(false)}
        >
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text variant="title2" align="center" style={styles.sheetTitle}>
              Select region
            </Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {REGIONS.map((r) => {
                const isActive = region === r;
                return (
                  <Pressable
                    key={r}
                    onPress={() => {
                      setRegion(r);
                      setShowRegionSheet(false);
                    }}
                    style={({ pressed }) => [
                      styles.regionRow,
                      isActive && styles.regionRowActive,
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      variant="body"
                      weight={isActive ? "semibold" : "regular"}
                      tone={isActive ? "brand" : "primary"}
                    >
                      {r}
                    </Text>
                    {isActive ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={statusConfig.onPrimaryPress}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[10],
  },
  avatarBox: {
    alignItems: "center",
    marginBottom: spacing[6],
    marginTop: spacing[3],
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarHint: {
    marginTop: spacing[2],
  },
  form: {
    gap: spacing[4],
  },
  nameRow: {
    flexDirection: "row",
    gap: spacing[3],
  },
  flex: { flex: 1 },
  pickerInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  pickerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing[1],
  },
  ageHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  fieldLabel: {
    marginBottom: spacing[2],
  },
  segmentRow: {
    flexDirection: "row",
    gap: spacing[2],
  },
  segment: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  uploadBox: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderStyle: "dashed",
    paddingVertical: spacing[6],
    alignItems: "center",
    gap: spacing[1],
    ...shadows.xs,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing[2],
  },
  certPreview: {
    position: "relative",
    width: "100%",
    height: 200,
    borderRadius: borderRadius.xl,
    overflow: "hidden",
    ...shadows.sm,
  },
  certImage: {
    width: "100%",
    height: "100%",
  },
  certRemove: {
    position: "absolute",
    top: spacing[2],
    right: spacing[2],
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    backgroundColor: colors.surfaceMuted,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing[2],
    paddingBottom: spacing[6],
    paddingHorizontal: spacing[4],
    maxHeight: "70%",
  },
  sheetHandle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing[2],
  },
  sheetTitle: {
    marginBottom: spacing[3],
  },
  regionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.lg,
  },
  regionRowActive: {
    backgroundColor: colors.primaryMuted,
  },
});
