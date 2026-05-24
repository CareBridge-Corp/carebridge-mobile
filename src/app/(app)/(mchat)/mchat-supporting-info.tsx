import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import apiClient from "../../../shared/api/client";
import multipartApiClient from "../../../shared/api/multipartClient";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Button,
  Card,
  IconButton,
  ProgressBar,
  Screen,
  SectionHeader,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { borderRadius, colors, spacing } from "../../../shared/theme";
import { useChildrenStore } from "../store/childrenStore";
import { useMChatStore } from "../store/mchatStore";

export default function MChatSupportingInfoScreen() {
  const router = useRouter();
  const {
    answers,
    parentDescription,
    childPictures,
    audioRecording: storedAudioRecording,
    setSupportingInfo,
    clearStore,
  } = useMChatStore();
  const activeChild = useChildrenStore((state) => state.activeChild);

  const [description, setDescription] = useState(parentDescription);
  const [pictures, setPictures] = useState<string[]>(childPictures);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(
    storedAudioRecording || null,
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!activeChild?.childId) throw new Error("No active child selected");

      const screeningRes = await apiClient.post("/screenings", {
        childId: activeChild.childId,
        answers,
        questionIds: useMChatStore.getState().questionIds,
      });
      const screeningId =
        screeningRes.data?.screeningId ||
        screeningRes.screeningId ||
        screeningRes.screening?.screeningId;
      if (!screeningId)
        throw new Error("Failed to retrieve screening ID from server");

      if (description.trim() || pictures.length > 0 || audioUri) {
        const formData = new FormData();
        if (description.trim())
          formData.append("parentDescription", description.trim());
        pictures.forEach((uri, index) => {
          const filename = uri.split("/").pop() || `child_image_${index}.jpg`;
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : "image/jpeg";
          formData.append("childPictures", {
            uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
            name: filename,
            type,
          } as any);
        });
        if (audioUri) {
          const audioFilename = audioUri.split("/").pop() || "audio_note.m4a";
          formData.append("audioNote", {
            uri:
              Platform.OS === "android"
                ? audioUri
                : audioUri.replace("file://", ""),
            name: audioFilename,
            type: "audio/m4a",
          } as any);
        }
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
        title: "Submission failed",
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
        title: "Limit reached",
        message: "You can only upload up to 5 pictures.",
      });
      setStatusModalVisible(true);
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      setStatusConfig({
        type: "error",
        title: "Permission required",
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

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        setStatusConfig({
          type: "error",
          title: "Permission required",
          message: "Please grant microphone permissions to record audio.",
        });
        setStatusModalVisible(true);
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      setRecording(newRec);
      setIsRecording(true);
      setRecordingDuration(0);
      newRec.setOnRecordingStatusUpdate((s) => {
        if (s.isRecording) setRecordingDuration(Math.floor(s.durationMillis / 1000));
      });
    } catch (e) {
      console.error("Recording error", e);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      const status = await recording.getStatusAsync();
      if (status.canRecord) await recording.stopAndUnloadAsync();
      setAudioUri(recording.getURI());
      setRecording(null);
    } catch (e) {
      setIsRecording(false);
      setRecording(null);
    }
  };

  const playAudio = async () => {
    if (!audioUri) return;
    try {
      if (sound && isPlaying) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        return;
      }
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
      );
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setIsPlaying(false);
          newSound.unloadAsync();
          setSound(null);
        }
      });
    } catch {
      setIsPlaying(false);
      setSound(null);
    }
  };

  const removeAudio = () => {
    if (sound) {
      sound.stopAsync().catch(() => {});
      sound.unloadAsync().catch(() => {});
      setSound(null);
    }
    setIsPlaying(false);
    setAudioUri(null);
    setRecordingDuration(0);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleNext = () => {
    setSupportingInfo(description, pictures, audioUri);
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
    setSupportingInfo(description, pictures, audioUri);
    router.back();
  };

  useEffect(() => {
    return () => {
      (async () => {
        if (recording) {
          try {
            const s = await recording.getStatusAsync();
            if (s.canRecord) await recording.stopAndUnloadAsync();
          } catch {}
        }
        if (sound) {
          sound.stopAsync().catch(() => {});
          sound.unloadAsync().catch(() => {});
        }
      })();
    };
  }, [recording, sound]);

  return (
    <Screen padded={false}>
      <View style={styles.headerRow}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Back"
          onPress={handleBack}
        />
        <View style={styles.progressWrap}>
          <Text variant="caption" tone="secondary" style={styles.progressLabel}>
            Final step
          </Text>
          <ProgressBar value={100} />
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="display" style={styles.title}>
          Add supporting info
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          Optional. Sharing details, photos, or a short voice note helps your
          clinician give a richer analysis.
        </Text>

        <SectionHeader title="Notes for your clinician" />
        <TextField
          placeholder="e.g. I've noticed my child making less eye contact recently..."
          value={description}
          onChangeText={setDescription}
          multiline
          containerStyle={styles.field}
        />

        <SectionHeader title="Voice note" />
        {!audioUri ? (
          <Pressable
            onPress={isRecording ? stopRecording : startRecording}
            style={({ pressed }) => [
              styles.recordBtn,
              isRecording && styles.recordingActive,
              pressed && { opacity: 0.85 },
            ]}
          >
            <Ionicons
              name={isRecording ? "stop-circle" : "mic"}
              size={22}
              color={isRecording ? colors.textInverse : colors.primary}
            />
            <Text
              variant="bodyMedium"
              style={{
                color: isRecording ? colors.textInverse : colors.primary,
              }}
            >
              {isRecording
                ? `Recording · ${formatDuration(recordingDuration)}`
                : "Tap to record"}
            </Text>
          </Pressable>
        ) : (
          <Card variant="flat" padding="md" style={styles.audioCard}>
            <Pressable onPress={playAudio} style={styles.audioPlayBtn}>
              <Ionicons
                name={isPlaying ? "pause-circle" : "play-circle"}
                size={36}
                color={colors.primary}
              />
              <View>
                <Text variant="body" weight="semibold">
                  Voice note
                </Text>
                <Text variant="caption" tone="secondary">
                  {formatDuration(recordingDuration)}
                </Text>
              </View>
            </Pressable>
            <IconButton
              icon="trash-outline"
              accessibilityLabel="Remove audio"
              tint={colors.error}
              onPress={removeAudio}
            />
          </Card>
        )}

        <SectionHeader title={`Photos (${pictures.length}/5)`} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesRow}
          contentContainerStyle={styles.imagesRowContent}
        >
          {pictures.map((uri, idx) => (
            <View key={idx} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.thumb} />
              <Pressable
                style={styles.removeThumb}
                onPress={() => setPictures(pictures.filter((_, i) => i !== idx))}
                hitSlop={6}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </Pressable>
            </View>
          ))}
          {pictures.length < 5 ? (
            <Pressable
              onPress={handleAddPicture}
              style={({ pressed }) => [
                styles.addThumb,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityLabel="Add photo"
            >
              <Ionicons name="add" size={28} color={colors.primary} />
              <Text variant="caption" tone="brand">
                Add photo
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Submit screening"
          onPress={handleNext}
          loading={submitMutation.isPending}
          trailingIcon="checkmark-circle"
        />
      </View>

      <StatusModal
        visible={confirmModalVisible}
        type="info"
        title="Submit M-CHAT"
        message="Are you ready to submit your answers and any supporting info? You cannot edit them after submitting."
        primaryButtonText={
          submitMutation.isPending ? "Submitting..." : "Yes, submit"
        }
        onPrimaryPress={() => submitMutation.mutate()}
        secondaryButtonText="Go back"
        onSecondaryPress={() => setConfirmModalVisible(false)}
      />
      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={() => setStatusModalVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    gap: spacing[2],
  },
  progressWrap: {
    flex: 1,
  },
  progressLabel: {
    marginBottom: spacing[1],
    textAlign: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[3],
    paddingBottom: spacing[10],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[6],
  },
  field: {
    marginBottom: spacing[5],
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing[2],
    paddingVertical: spacing[4],
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.lg,
    marginBottom: spacing[5],
  },
  recordingActive: {
    backgroundColor: colors.error,
  },
  audioCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing[5],
  },
  audioPlayBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  imagesRow: {
    marginBottom: spacing[4],
  },
  imagesRowContent: {
    gap: spacing[3],
  },
  imageWrapper: {
    position: "relative",
  },
  thumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
  },
  removeThumb: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 11,
  },
  addThumb: {
    width: 96,
    height: 96,
    borderRadius: 14,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.borderStrong,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[5],
    backgroundColor: colors.surfaceMuted,
  },
});
