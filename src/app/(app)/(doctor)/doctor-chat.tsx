import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { socketService } from "../../../shared/api/socket";
import {
    borderRadius,
    colors,
    spacing,
    typography,
} from "../../../shared/theme";
import { useChatMessages, useSendMessage } from "../hooks/useChat";
import { useChatStore } from "../store/chatStore";

export default function DoctorChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const { activeConversation } = useChatStore();
  const childId = activeConversation?.child.childId || "";
  const conversationId = activeConversation?.conversationId || childId; // Use conversationId if available, fallback to childId

  const { data: messagesData, isLoading } = useChatMessages(
    childId,
    conversationId,
  );
  const sendMessageMutation = useSendMessage();

  const messages = useChatStore((state) => state.messages[childId] || []);

  // Join socket room for this child
  useEffect(() => {
    if (childId) {
      socketService.joinChildRoom(childId);
    }
    return () => {
      if (childId) {
        socketService.leaveChildRoom(childId);
      }
    };
  }, [childId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (message.trim() && childId) {
      sendMessageMutation.mutate(
        { childId, conversationId, content: message.trim() },
        {
          onSuccess: () => {
            setMessage("");
          },
        },
      );
    }
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const shouldShowDate = (currentMsg: any, prevMsg: any): boolean => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const prevMsg = index > 0 ? messages[index - 1] : null;
    const showDate = shouldShowDate(item, prevMsg);
    const isFromParent = item.senderId === activeConversation?.parent.userId;

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isFromParent
              ? styles.userMessageContainer
              : styles.doctorMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isFromParent ? styles.userBubble : styles.doctorBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isFromParent
                  ? styles.userMessageText
                  : styles.doctorMessageText,
              ]}
            >
              {item.content}
            </Text>
            <Text
              style={[
                styles.timestampText,
                isFromParent ? styles.userTimestamp : styles.doctorTimestamp,
              ]}
            >
              {formatTimestamp(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (!activeConversation) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>No conversation selected</Text>
        <TouchableOpacity
          style={styles.backToChatsButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backToChatsText}>Back to Chats</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Build clinician display name with surname if available
  const clinicianDisplayName = activeConversation.clinician.surname
    ? `${activeConversation.clinician.surname} ${activeConversation.clinician.firstName} ${activeConversation.clinician.lastName}`
    : `Dr. ${activeConversation.clinician.firstName} ${activeConversation.clinician.lastName}`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#0C4A6E" />
        </TouchableOpacity>

        <View style={styles.doctorInfo}>
          <View style={styles.doctorAvatarPlaceholder}>
            <Ionicons name="person" size={24} color="#0C4A6E" />
          </View>
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>{clinicianDisplayName}</Text>
            <Text style={styles.childText}>
              Child: {activeConversation.child.firstName}
            </Text>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Messages List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0C4A6E" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.messageId}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.attachButton} activeOpacity={0.7}>
          <Ionicons name="attach" size={24} color="#5A7A8F" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Send Message"
          placeholderTextColor="#A0B8C8"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity style={styles.emojiButton} activeOpacity={0.7}>
          <Ionicons name="happy-outline" size={24} color="#5A7A8F" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            sendMessageMutation.isPending && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={sendMessageMutation.isPending || !message.trim()}
          activeOpacity={0.7}
        >
          {sendMessageMutation.isPending ? (
            <ActivityIndicator size="small" color="#0C4A6E" />
          ) : (
            <Ionicons name="send" size={20} color="#0C4A6E" />
          )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "#E8F0F5",
  },
  backButton: {
    padding: spacing.sm,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  doctorAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  doctorDetails: {
    flex: 1,
  },
  doctorName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginBottom: 4,
  },
  childText: {
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
  },
  messagesList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  dateContainer: {
    alignItems: "center",
    marginVertical: spacing.lg,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    color: "#A0B8C8",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  userMessageContainer: {
    alignItems: "flex-start",
  },
  doctorMessageContainer: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  userBubble: {
    backgroundColor: "#0C4A6E",
    borderBottomLeftRadius: 4,
  },
  doctorBubble: {
    backgroundColor: "#E8F0F5",
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.md,
    marginBottom: spacing.xs,
  },
  userMessageText: {
    color: colors.white,
  },
  doctorMessageText: {
    color: "#5A7A8F",
  },
  timestampText: {
    fontSize: typography.fontSize.xs,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  doctorTimestamp: {
    color: "#A0B8C8",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: "#E8F0F5",
    gap: spacing.sm,
  },
  attachButton: {
    padding: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    maxHeight: 100,
  },
  emojiButton: {
    padding: spacing.sm,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: "#5A7A8F",
    marginBottom: spacing.lg,
  },
  backToChatsButton: {
    backgroundColor: "#0C4A6E",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  backToChatsText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
