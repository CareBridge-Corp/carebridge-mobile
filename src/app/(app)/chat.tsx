import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import {
    FlatList,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { borderRadius, colors, spacing, typography } from "../../shared/theme";

interface ChatConversation {
  id: string;
  doctorName: string;
  doctorImage: any;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function ChatScreen() {
  const router = useRouter();

  const conversations: ChatConversation[] = [
    {
      id: "1",
      doctorName: "Dr. Sarah Johnson",
      doctorImage: require("../../../assets/docs/doc1.png"),
      lastMessage: "Your appointment is confirmed for tomorrow at 10 AM",
      timestamp: "2m ago",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "2",
      doctorName: "Dr. Walter White",
      doctorImage: require("../../../assets/docs/doc1.png"),
      lastMessage: "Please bring the test results with you",
      timestamp: "1h ago",
      unreadCount: 0,
      isOnline: false,
    },
    {
      id: "3",
      doctorName: "Dr. Ermias Lema",
      doctorImage: require("../../../assets/docs/doc2.png"),
      lastMessage: "How is your child feeling today?",
      timestamp: "3h ago",
      unreadCount: 1,
      isOnline: true,
    },
    {
      id: "4",
      doctorName: "Dr. Michael Chen",
      doctorImage: require("../../../assets/docs/doc1.png"),
      lastMessage: "The medication should help with the symptoms",
      timestamp: "Yesterday",
      unreadCount: 0,
      isOnline: false,
    },
  ];

  const handleChatPress = (conversationId: string) => {
    router.push("/(app)/doctor-chat" as Href);
  };

  const renderConversation = ({ item }: { item: ChatConversation }) => (
    <TouchableOpacity
      style={styles.conversationCard}
      onPress={() => handleChatPress(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={item.doctorImage} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text style={styles.doctorName}>{item.doctorName}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
        <View style={styles.messageRow}>
          <Text
            style={[
              styles.lastMessage,
              item.unreadCount > 0 && styles.unreadMessage,
            ]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.backgroundBlue}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton} activeOpacity={0.7}>
          <Ionicons name="create-outline" size={24} color="#0C4A6E" />
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
          />
        </View>
      </View>

      {/* Conversations List */}
      <View style={styles.conversationsContainer}>
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.conversationsList}
        />
      </View>
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
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
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
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    backgroundColor: "#0C4A6E",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  unreadCount: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
