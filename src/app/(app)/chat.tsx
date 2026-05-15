import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { socketService } from "../../shared/api/socket";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { useConversations } from "./hooks/useChat";
import { ChatConversation, useChatStore } from "./store/chatStore";
import { useChildrenStore } from "./store/childrenStore";

export default function ChatScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const { activeChild, children } = useChildrenStore();
  const { setActiveConversation } = useChatStore();

  // Connect socket FIRST before fetching conversations
  useEffect(() => {
    socketService.connect();
    const timer = setTimeout(() => {
      setSocketConnected(true);
    }, 500);

    return () => {
      clearTimeout(timer);
      // Don't disconnect on unmount, keep connection alive
    };
  }, []);

  // Only fetch conversations after socket is connected and we have an active child
  const { data: conversations, isLoading } = useConversations(
    activeChild?.childId,
  );

  const handleChatPress = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    router.push("/(app)/(doctor)/doctor-chat" as Href);
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filteredConversations = conversations?.filter((conv) => {
    const clinicianName =
      `${conv.clinician.firstName} ${conv.clinician.lastName}`.toLowerCase();
    return clinicianName.includes(searchQuery.toLowerCase());
  });

  const renderConversation = ({ item }: { item: ChatConversation }) => {
    const isUnread = item.lastMessage && !item.lastMessage.readAt;
    const lastMessageText = item.lastMessage?.content || "No messages yet";
    const timestamp = item.lastMessage?.createdAt
      ? formatTimestamp(item.lastMessage.createdAt)
      : "";

    // Build clinician display name with surname if available
    const clinicianDisplayName = item.clinician.surname
      ? `${item.clinician.surname} ${item.clinician.firstName} ${item.clinician.lastName}`
      : `Dr. ${item.clinician.firstName} ${item.clinician.lastName}`;

    return (
      <TouchableOpacity
        style={styles.conversationCard}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={28} color="#0C4A6E" />
          </View>
        </View>

        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={styles.doctorName}>{clinicianDisplayName}</Text>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>
          <View style={styles.messageRow}>
            <Text
              style={[styles.lastMessage, isUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {lastMessageText}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <View style={styles.unreadDot} />
              </View>
            )}
          </View>
          <Text style={styles.childName}>Child: {item.child.firstName}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity
          style={styles.avatar}
          onPress={() => children.length > 0 && setShowChildSelector(true)}
          activeOpacity={0.7}
        >
          {activeChild?.profilePictureUrl ? (
            <Image
              source={{ uri: activeChild.profilePictureUrl }}
              style={styles.avatarImage}
            />
          ) : (
            <Ionicons name="person" size={24} color="#0C4A6E" />
          )}
          {children.length > 1 && (
            <View style={styles.childCountBadge}>
              <Text style={styles.childCountText}>{children.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#A0B8C8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search conversations..."
            placeholderTextColor="#A0B8C8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Conversations List */}
      <View style={styles.conversationsContainer}>
        {!socketConnected || isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0C4A6E" />
            <Text style={styles.loadingText}>
              {!socketConnected ? "Connecting..." : "Loading conversations..."}
            </Text>
          </View>
        ) : !activeChild ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={64} color="#A0B8C8" />
            <Text style={styles.emptyText}>No child selected</Text>
            <Text style={styles.emptySubtext}>
              Please select a child to view conversations
            </Text>
          </View>
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) => item.conversationId || item.child.childId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.conversationsList}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#A0B8C8" />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              Start chatting with {activeChild.firstName}'s doctor
            </Text>
          </View>
        )}
      </View>

      {/* Child Selector Modal */}
      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundBlue,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
    paddingTop: 60,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: "#0C4A6E",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  childCountBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#10B981",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  childCountText: {
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  searchContainer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: "#0C4A6E",
    padding: 0,
  },
  conversationsContainer: {
    flex: 1,
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxxl,
    borderTopRightRadius: borderRadius.xxxl,
    paddingTop: spacing.lg,
  },
  conversationsList: {
    paddingHorizontal: spacing.xxl,
  },
  conversationCard: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  avatarContainer: {
    position: "relative",
    marginRight: spacing.md,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E8F0F5",
    justifyContent: "center",
    alignItems: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#10B981",
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
    justifyContent: "center",
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  doctorName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: "#A0B8C8",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastMessage: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: "#5A7A8F",
    marginRight: spacing.sm,
  },
  unreadMessage: {
    fontWeight: typography.fontWeight.medium,
    color: "#0C4A6E",
  },
  unreadBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0C4A6E",
  },
  unreadDot: {
    width: "100%",
    height: "100%",
  },
  childName: {
    fontSize: typography.fontSize.xs,
    color: "#A0B8C8",
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: "#5A7A8F",
    marginTop: spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.xxl,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: "#0C4A6E",
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: typography.fontSize.md,
    color: "#A0B8C8",
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
