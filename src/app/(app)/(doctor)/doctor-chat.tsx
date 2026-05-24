import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { socketService } from "../../../shared/api/socket";
import {
  Avatar,
  IconButton,
  Text,
} from "../../../shared/components/ui";
import { borderRadius, colors, shadows, spacing } from "../../../shared/theme";
import { useChatMessages, useSendMessage } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";

function formatTimestamp(dateString: string): string {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DoctorChatScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const textInputRef = useRef<TextInput>(null);

  const { activeConversation } = useChatStore();
  const childId = activeConversation?.child.childId || "";
  const conversationId = activeConversation?.conversationId || childId;

  const { data: messagesData, isLoading } = useChatMessages(
    childId,
    conversationId,
  );
  const sendMessageMutation = useSendMessage();
  const messages = messagesData || [];

  useEffect(() => {
    socketService.connect();
    socketService.setQueryClient(queryClient);
  }, [queryClient]);

  useEffect(() => {
    if (childId) socketService.joinChildRoom(childId);
    return () => {
      if (childId) socketService.leaveChildRoom(childId);
    };
  }, [childId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 80);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = () => {
    if (selectedImages.length > 0) return handleSendWithImages();
    if (message.trim() && childId) {
      sendMessageMutation.mutate(
        { childId, conversationId, content: message.trim() },
        { onSuccess: () => setMessage("") },
      );
    }
  };

  const handleAttachmentPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: false,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      setSelectedImages((prev) => [
        ...prev,
        ...result.assets.map((a) => a.uri),
      ]);
    }
  };

  const handleRemoveImage = (imageUri: string) => {
    setSelectedImages((prev) => prev.filter((uri) => uri !== imageUri));
  };

  const handleSendWithImages = () => {
    if (selectedImages.length > 0 && childId) {
      const imageCount = selectedImages.length;
      const content =
        message.trim() ||
        `📷 ${imageCount} ${imageCount === 1 ? "image" : "images"}`;
      sendMessageMutation.mutate(
        { childId, conversationId, content },
        {
          onSuccess: () => {
            setMessage("");
            setSelectedImages([]);
          },
        },
      );
    }
  };

  const shouldShowDate = (current: any, prev: any) => {
    if (!prev) return true;
    return (
      new Date(current.createdAt).toDateString() !==
      new Date(prev.createdAt).toDateString()
    );
  };

  const KEYBOARD_CLEARANCE = Platform.select({
    ios: 36,
    android: 48,
    default: 32,
  }) ?? 32;

  const footerPaddingBottom =
    keyboardHeight > 0 ? spacing[2] : Math.max(insets.bottom, spacing[2]);
  const footerBottom =
    keyboardHeight > 0 ? keyboardHeight + KEYBOARD_CLEARANCE : 0;
  const composerAreaHeight =
    (selectedImages.length > 0 ? 100 : 0) + 64 + footerPaddingBottom;

  if (!activeConversation) {
    return (
      <SafeAreaView style={[styles.container, styles.center]} edges={["top"]}>
        <Text variant="body" tone="secondary" style={{ marginBottom: spacing[4] }}>
          No conversation selected
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backChip,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text variant="bodyMedium" tone="brand">
            Back to chats
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const clinicianDisplayName = activeConversation.clinician.surname
    ? `${activeConversation.clinician.surname} ${activeConversation.clinician.firstName} ${activeConversation.clinician.lastName}`
    : `Dr. ${activeConversation.clinician.firstName} ${activeConversation.clinician.lastName}`;

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const prev = index > 0 ? messages[index - 1] : null;
    const showDate = shouldShowDate(item, prev);
    const isFromParent = item.senderId === activeConversation.parent.userId;

    return (
      <View>
        {showDate ? (
          <View style={styles.dateRow}>
            <Text variant="caption" tone="tertiary" style={styles.datePill}>
              {formatDate(item.createdAt)}
            </Text>
          </View>
        ) : null}
        <View
          style={[
            styles.bubbleRow,
            isFromParent ? styles.bubbleRowRight : styles.bubbleRowLeft,
          ]}
        >
          <View
            style={[
              styles.bubble,
              isFromParent ? styles.bubbleSelf : styles.bubbleOther,
            ]}
          >
            <Text
              variant="body"
              style={
                isFromParent
                  ? { color: colors.textInverse }
                  : { color: colors.textPrimary }
              }
            >
              {item.content}
            </Text>
            <Text
              variant="caption"
              style={[
                styles.bubbleTime,
                {
                  color: isFromParent
                    ? "rgba(255,255,255,0.7)"
                    : colors.textTertiary,
                },
              ]}
            >
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.flex}>
        <View style={styles.header}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel="Back"
            onPress={() => router.back()}
          />
          <View style={styles.headerInfo}>
            <Avatar name={clinicianDisplayName} size="sm" />
            <View style={styles.headerText}>
              <Text variant="body" weight="semibold" numberOfLines={1}>
                {clinicianDisplayName}
              </Text>
              <Text variant="caption" tone="secondary" numberOfLines={1}>
                Caring for {activeConversation.child.firstName}
              </Text>
            </View>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.messageId}
            style={styles.messagesContainer}
            contentContainerStyle={[
              styles.messagesList,
              { paddingBottom: composerAreaHeight + spacing[4] },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              flatListRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        <View style={[styles.inputFooter, { bottom: footerBottom }]}>
          {selectedImages.length > 0 ? (
            <View style={styles.previewBar}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.previewScroll}
              >
                {selectedImages.map((uri, idx) => (
                  <View key={idx} style={styles.previewWrap}>
                    <Image source={{ uri }} style={styles.previewImg} />
                    <Pressable
                      onPress={() => handleRemoveImage(uri)}
                      style={styles.previewRemove}
                      hitSlop={6}
                    >
                      <Ionicons
                        name="close-circle"
                        size={24}
                        color={colors.error}
                      />
                    </Pressable>
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : null}

          <View
            style={[
              styles.composer,
              { paddingBottom: footerPaddingBottom },
            ]}
          >
            <Pressable
              onPress={handleAttachmentPress}
              hitSlop={6}
              style={styles.attachBtn}
              accessibilityLabel="Attach image"
            >
              <Ionicons
                name="add-circle-outline"
                size={26}
                color={colors.primary}
              />
            </Pressable>
            <TextInput
              ref={textInputRef}
              style={styles.input}
              placeholder="Type a message"
              placeholderTextColor={colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              onFocus={() =>
                setTimeout(
                  () => flatListRef.current?.scrollToEnd({ animated: true }),
                  120,
                )
              }
              multiline
              maxLength={1000}
            />
            <Pressable
              onPress={handleSend}
              disabled={
                sendMessageMutation.isPending ||
                (!message.trim() && selectedImages.length === 0)
              }
              style={({ pressed }) => [
                styles.sendBtn,
                (sendMessageMutation.isPending ||
                  (!message.trim() && selectedImages.length === 0)) &&
                  styles.sendDisabled,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityLabel="Send"
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Ionicons name="send" size={18} color={colors.textInverse} />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  flex: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.full,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  headerText: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[4],
    flexGrow: 1,
  },
  dateRow: {
    alignItems: "center",
    marginVertical: spacing[3],
  },
  datePill: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: borderRadius.full,
  },
  bubbleRow: {
    marginBottom: spacing[2],
  },
  bubbleRowLeft: {
    alignItems: "flex-start",
  },
  bubbleRowRight: {
    alignItems: "flex-end",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: 20,
  },
  bubbleSelf: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 6,
  },
  bubbleOther: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 6,
    ...shadows.xs,
  },
  bubbleTime: {
    marginTop: spacing[1],
    alignSelf: "flex-end",
  },
  previewBar: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
  },
  previewScroll: {
    gap: spacing[2],
  },
  previewWrap: {
    position: "relative",
  },
  previewImg: {
    width: 84,
    height: 84,
    borderRadius: 12,
  },
  previewRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  inputFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
  },
  composer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingTop: spacing[2],
    backgroundColor: colors.surface,
  },
  attachBtn: {
    paddingBottom: spacing[2],
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.surfaceSunken,
    borderRadius: 20,
    color: colors.textPrimary,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  sendDisabled: {
    backgroundColor: colors.borderStrong,
  },
});
