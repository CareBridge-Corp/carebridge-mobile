import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export interface SupportingInfoUploadInput {
  screeningId: string;
  parentDescription?: string;
  pictureUris?: string[];
  audioUri?: string | null;
}

export async function uploadScreeningSupportingInfo(
  input: SupportingInfoUploadInput,
): Promise<void> {
  const { screeningId, parentDescription, pictureUris = [], audioUri } = input;

  const hasText = !!parentDescription?.trim();
  const hasPictures = pictureUris.length > 0;
  const hasAudio = !!audioUri;

  if (!hasText && !hasPictures && !hasAudio) {
    return;
  }

  const formData = new FormData();

  if (hasText) {
    formData.append("parentDescription", parentDescription!.trim());
  }

  pictureUris.forEach((uri, index) => {
    const filename = uri.split("/").pop() || `child_image_${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match?.[1]?.toLowerCase();
    const type =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "heic"
            ? "image/heic"
            : "image/jpeg";

    formData.append("childPictures", {
      uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
      name: filename,
      type,
    } as any);
  });

  if (hasAudio && audioUri) {
    const audioFilename = audioUri.split("/").pop() || "audio_note.m4a";
    formData.append("audioNote", {
      uri:
        Platform.OS === "android" ? audioUri : audioUri.replace("file://", ""),
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
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error ||
        errorData.message ||
        `Upload failed (${response.status})`,
    );
  }
}
