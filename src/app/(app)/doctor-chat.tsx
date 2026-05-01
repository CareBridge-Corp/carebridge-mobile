import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

interface Message {
  id: string;
  text: string;
  sender: "user" | "doctor";
  timestamp: string;
  date?: string;
}

export default function DoctorChatScreen() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "some message from the admin",
      sender: "user",
      timestamp: "09:21",
    },
    {
      id: "2",
      text: "some message from the admin",
      sender: "doctor",
      timestamp: "09:21",
      date: "Nov 11",
    },
    {
      id: "3",
      text: "some message from the admin",
      sender: "doctor",
      timestamp: "09:21",
    },
  ]);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: message,
        sender: "user",
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      };
      setMessages([...messages, newMessage]);
      setMessage("");
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isUser = item.sender === "user";
    const showDate = item.date !== undefined;

    return (
      <View>
        {showDate && (
          <View style={styles.dateContainer}>
            <Text style={styles.dateText}>{item.date}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            isUser
              ? styles.userMessageContainer
              : styles.doctorMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isUser ? styles.userBubble : styles.doctorBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isUser ? styles.userMessageText : styles.doctorMessageText,
              ]}
            >
              {item.text}
            </Text>
            <Text
              style={[
                styles.timestampText,
                isUser ? styles.userTimestamp : styles.doctorTimestamp,
              ]}
            >
              {item.timestamp}
            </Text>
          </View>
        </View>
      </View>
    );
  };

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
          <Image
            source={require("../../../assets/docs/doc1.png")}
            style={styles.doctorAvatar}
            resizeMode="cover"
          />
          <View style={styles.doctorDetails}>
            <Text style={styles.doctorName}>Dr. Sarah Johnson</Text>
            <View style={styles.onlineStatus}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

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
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
        >
          <Ionicons name="send" size={20} color="#0C4A6E" />
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
  doctorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  onlineText: {
    fontSize: typography.fontSize.sm,
    color: "#10B981",
    fontWeight: typography.fontWeight.medium,
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
});
