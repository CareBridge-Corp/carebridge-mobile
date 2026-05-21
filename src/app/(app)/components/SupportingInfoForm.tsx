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
  ScrollView,
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

  // Animated value for keyboard height
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

      // Get auth token
      const token = await SecureStore.getItemAsync("authToken");

      // Use fetch instead of axios for better React Native FormData support
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

      // Reset form
      setDescription("");
      setPictures([]);
      setAudioUri(null);
      setRecordingDuration(0);

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        setStatusModalVisible(false);
        onSuccess?.();
      }, 1500);
    },
    onError: (error: any) => {
      setStatusConfig({
        type: "error",
        title: "Submission Failed",
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
          title: "Permission Required",
          message: "Please grant microphone permissions to record audio.",
        });
        setStatusModalVisible(true);
      }
    } catch (err) {
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
    } catch (error) {
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
    } catch (error) {
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

  // Keyboard event listeners for smooth button transitions
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
          } catch (e) {}
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
        <Text style={styles.title}>Add Supporting Information</Text>
        <Text style={styles.subtitle}>
          Provide additional details to help clinicians with their analysis.
        </Text>

        {/* Additional Comments */}
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

        {/* Voice Note */}
        <Text style={styles.label}>Voice Note (Optional)</Text>
        <View style={styles.audioContainer}>
          {!audioUri ? (
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordingActive]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={24}
                color={isRecording ? colors.white : "#0C4A6E"}
              />
              <Text
                style={[
                  styles.recordBtnText,
                  isRecording && { color: colors.white },
                ]}
              >
                {isRecording
                  ? `Recording... ${formatDuration(recordingDuration)}`
                  : "Tap to Record"}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.audioPlayer}>
              <TouchableOpacity style={styles.playBtn} onPress={playAudio}>
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={24}
                  color="#0C4A6E"
                />
                <View>
                  <Text style={styles.playBtnText}>
                    {isPlaying ? "Pause Recording" : "Play Recording"}
                  </Text>
                  <Text style={styles.durationText}>
                    {formatDuration(recordingDuration)}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeAudioBtn}
                onPress={removeAudio}
              >
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Child Pictures */}
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

      {/* Action Buttons */}
      <Animated.View
        style={[styles.buttonContainer, { bottom: keyboardHeight }]}
      >
        {onCancel && (
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={onCancel}
            disabled={submitMutation.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            submitMutation.isPending && styles.primaryButtonDisabled,
            !onCancel && styles.primaryButtonFull,
          ]}
          onPress={() => submitMutation.mutate()}
          disabled={submitMutation.isPending}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>
            {submitMutation.isPending ? "Submitting..." : "Submit"}
          </Text>
          <Ionicons name="checkmark-circle" size={20} color={colors.white} />
        </TouchableOpacity>
      </Animated.View>

      {/* Status Modal */}
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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    paddingBottom: spacing.huge,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
    marginBottom: spacing.sm,
    marginTop: spacing.huge,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    marginBottom: spacing.xl,
    lineHeight: 20,
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
  audioContainer: {
    marginVertical: spacing.sm,
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F5",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  recordingActive: {
    backgroundColor: "#EF4444",
  },
  recordBtnText: {
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.semibold,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8F0F5",
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  playBtnText: {
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    fontWeight: typography.fontWeight.semibold,
  },
  durationText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginTop: 2,
  },
  removeAudioBtn: {
    padding: spacing.xs,
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingBottom: 50,
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0F5",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxxl,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0C4A6E",
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xxxl,
    gap: spacing.sm,
  },
  primaryButtonFull: {
    flex: 1,
  },
  primaryButtonDisabled: {
    backgroundColor: "#C0D4E0",
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
