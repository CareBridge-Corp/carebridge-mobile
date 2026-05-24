import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import StatusModal from "../../../shared/components/StatusModal";
import {
  Button,
  IconButton,
  SectionHeader,
  Text,
  TextField,
} from "../../../shared/components/ui";
import { borderRadius, colors, layout, spacing } from "../../../shared/theme";

interface SupportingInfoFormProps {
  screeningId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupportingInfoForm({
  screeningId,
  onSuccess,
  onCancel,
}: SupportingInfoFormProps) {
  const [description, setDescription] = useState("");
  const [pictures, setPictures] = useState<string[]>([]);

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [statusConfig, setStatusConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const [keyboardHeight] = useState(new Animated.Value(0));

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!description.trim() && pictures.length === 0 && !audioUri) {
        throw new Error(
          "Please provide at least one piece of supporting information",
        );
      }

      const formData = new FormData();

      if (description.trim()) {
        formData.append("parentDescription", description.trim());
      }

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

      const token = await SecureStore.getItemAsync("authToken");

      const apiUrl =
        process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await fetch(
        `${apiUrl}/screenings/${screeningId}/supporting-info`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return response.json();
    },
    onSuccess: () => {
      setStatusConfig({
        type: "success",
        title: "Success",
        message: "Supporting information submitted successfully!",
      });
      setStatusModalVisible(true);

      setDescription("");
      setPictures([]);
      setAudioUri(null);
      setRecordingDuration(0);

      setTimeout(() => {
        setStatusModalVisible(false);
        onSuccess?.();
      }, 1500);
    },
    onError: (error: any) => {
      setStatusConfig({
        type: "error",
        title: "Submission failed",
        message:
          error.message ||
          "An error occurred while submitting supporting information.",
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
      if (permission.status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
        );

        setRecording(newRecording);
        setIsRecording(true);
        setRecordingDuration(0);

        newRecording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording) {
            setRecordingDuration(Math.floor(status.durationMillis / 1000));
          }
        });
      } else {
        setStatusConfig({
          type: "error",
          title: "Permission required",
          message: "Please grant microphone permissions to record audio.",
        });
        setStatusModalVisible(true);
      }
    } catch {
      // Silent error handling
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);

      const status = await recording.getStatusAsync();
      if (status.canRecord) {
        await recording.stopAndUnloadAsync();
      }

      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch {
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

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
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

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    const hideListener = Keyboard.addListener(hideEvent, (e) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration || 250,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false,
      }).start();
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [keyboardHeight]);

  useEffect(() => {
    return () => {
      async function cleanup() {
        if (recording) {
          try {
            const status = await recording.getStatusAsync();
            if (status.canRecord) {
              await recording.stopAndUnloadAsync();
            }
          } catch {}
        }
        if (sound) {
          sound.stopAsync().catch(() => {});
          sound.unloadAsync().catch(() => {});
        }
      }
      cleanup();
    };
  }, [recording, sound]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <Text variant="display" style={styles.title}>
          Add supporting info
        </Text>
        <Text variant="body" tone="secondary" style={styles.subtitle}>
          Provide additional details to help clinicians with their analysis.
        </Text>

        <SectionHeader title="Additional comments" />
        <TextField
          multiline
          placeholder="e.g. I noticed my child making less eye contact recently..."
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.spacer} />

        <SectionHeader title="Voice note" />
        <View>
          {!audioUri ? (
            <Pressable
              style={[styles.recordBtn, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={20}
                color={isRecording ? colors.textInverse : colors.primary}
              />
              <Text
                variant="bodyMedium"
                weight="semibold"
                style={{
                  color: isRecording
                    ? colors.textInverse
                    : colors.textPrimary,
                }}
              >
                {isRecording
                  ? `Recording... ${formatDuration(recordingDuration)}`
                  : "Tap to record"}
              </Text>
            </Pressable>
          ) : (
            <View style={styles.audioPlayer}>
              <Pressable style={styles.playBtn} onPress={playAudio}>
                <View style={styles.playIconCircle}>
                  <Ionicons
                    name={isPlaying ? "pause" : "play"}
                    size={20}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text variant="bodyMedium" weight="semibold">
                    {isPlaying ? "Pause recording" : "Play recording"}
                  </Text>
                  <Text variant="caption" tone="secondary">
                    {formatDuration(recordingDuration)}
                  </Text>
                </View>
              </Pressable>
              <IconButton
                icon="trash-outline"
                accessibilityLabel="Remove audio"
                onPress={removeAudio}
                tint={colors.error}
              />
            </View>
          )}
        </View>

        <View style={styles.spacer} />

        <SectionHeader title="Child pictures" eyebrow="Up to 5 photos" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesScroll}
        >
          {pictures.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imageThumb} />
              <Pressable
                style={styles.removeImageBtn}
                onPress={() =>
                  setPictures(pictures.filter((_, i) => i !== index))
                }
              >
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={colors.error}
                />
              </Pressable>
            </View>
          ))}
          {pictures.length < 5 ? (
            <Pressable style={styles.addImageBtn} onPress={handleAddPicture}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </Pressable>
          ) : null}
        </ScrollView>
      </ScrollView>

      <Animated.View
        style={[styles.buttonContainer, { bottom: keyboardHeight }]}
      >
        {onCancel ? (
          <Button
            label="Cancel"
            variant="secondary"
            onPress={onCancel}
            disabled={submitMutation.isPending}
            fullWidth={false}
            style={{ flex: 1 }}
          />
        ) : null}
        <Button
          label={submitMutation.isPending ? "Submitting..." : "Submit"}
          onPress={() => submitMutation.mutate()}
          loading={submitMutation.isPending}
          trailingIcon="checkmark-circle"
          fullWidth={false}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <StatusModal
        visible={statusModalVisible}
        type={statusConfig.type}
        title={statusConfig.title}
        message={statusConfig.message}
        onPrimaryPress={() => setStatusModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing[8],
    paddingBottom: spacing[10],
  },
  title: {
    marginBottom: spacing[2],
  },
  subtitle: {
    marginBottom: spacing[5],
  },
  spacer: {
    height: spacing[4],
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    paddingVertical: spacing[4],
    borderRadius: borderRadius.lg,
    gap: spacing[2],
    borderWidth: 1,
    borderColor: colors.border,
  },
  recordingActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    padding: spacing[3],
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[3],
    flex: 1,
  },
  playIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  imagesScroll: {
    paddingVertical: spacing[2],
    gap: spacing[3],
  },
  imageWrapper: {
    position: "relative",
  },
  imageThumb: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
  },
  removeImageBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  addImageBtn: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: "dashed",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing[3],
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing[10],
    paddingTop: spacing[3],
    backgroundColor: colors.surfaceMuted,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
});
