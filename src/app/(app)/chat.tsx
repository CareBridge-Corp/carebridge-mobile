import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { socketService } from "../../shared/api/socket";
import {
  Avatar,
  Badge,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "../../shared/components/ui";
import { colors, layout, shadows, spacing } from "../../shared/theme";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import { useConversations } from "./hooks/useChat";
import { ChatConversation, useChatStore } from "./store/chatStore";
import { useChildrenStore } from "./store/childrenStore";

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const { activeChild, children } = useChildrenStore();
  const { setActiveConversation } = useChatStore();

  useEffect(() => {
    socketService.connect();
    const timer = setTimeout(() => setSocketConnected(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const { data: conversations, isLoading } = useConversations(
    activeChild?.childId,
  );

  const handleChatPress = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    router.push("/(app)/(doctor)/doctor-chat" as Href);
  };

  const filteredConversations = conversations?.filter((conv) => {
    const clinicianName =
      `${conv.clinician.firstName} ${conv.clinician.lastName}`.toLowerCase();
    return clinicianName.includes(searchQuery.toLowerCase());
  });

  const renderConversation = ({ item }: { item: ChatConversation }) => {
    const isUnread = item.lastMessage && !item.lastMessage.readAt;
    const lastMessage = item.lastMessage?.content || "No messages yet";
    const timestamp = item.lastMessage?.createdAt
      ? formatTimestamp(item.lastMessage.createdAt)
      : "";
    const displayName = item.clinician.surname
      ? `${item.clinician.surname} ${item.clinician.firstName} ${item.clinician.lastName}`
      : `Dr. ${item.clinician.firstName} ${item.clinician.lastName}`;

    return (
      <Pressable
        onPress={() => handleChatPress(item)}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.rowPressed,
        ]}
      >
        <Avatar name={displayName} size="md" />
        <View style={styles.rowText}>
          <View style={styles.rowTopLine}>
            <Text variant="body" weight="semibold" numberOfLines={1}>
              {displayName}
            </Text>
            <Text variant="caption" tone="tertiary">
              {timestamp}
            </Text>
          </View>
          <View style={styles.rowBottomLine}>
            <Text
              variant="bodySmall"
              tone={isUnread ? "primary" : "secondary"}
              numberOfLines={1}
              style={[styles.preview, isUnread && styles.previewUnread]}
            >
              {lastMessage}
            </Text>
            {isUnread ? (
              <View style={styles.unreadDot} />
            ) : null}
          </View>
          <Text variant="caption" tone="tertiary" style={styles.childLine}>
            {item.child.firstName}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <Screen padded={false} background={colors.surfaceMuted}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text variant="title1">{t("chat.title", "Messages")}</Text>
          {!socketConnected ? (
            <Badge
              label="Connecting..."
              tone="warning"
              icon="time-outline"
              style={styles.statusBadge}
            />
          ) : null}
        </View>
        <Avatar
          uri={activeChild?.profilePictureUrl}
          name={activeChild?.firstName}
          size="md"
          badgeCount={children.length}
          onPress={() => children.length > 0 && setShowChildSelector(true)}
        />
      </View>

      <View style={styles.search}>
        <TextField
          placeholder={t("chat.search", "Search conversations")}
          value={searchQuery}
          onChangeText={setSearchQuery}
          leadingIcon="search-outline"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.list}>
        {!socketConnected || isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="bodySmall" tone="secondary" style={styles.loadingText}>
              {!socketConnected
                ? "Connecting to messaging..."
                : "Loading conversations..."}
            </Text>
          </View>
        ) : !activeChild ? (
          <EmptyState
            icon="person-outline"
            title={t("chat.noChildTitle", "No child selected")}
            description={t(
              "chat.noChildDescription",
              "Pick a child to see their conversations.",
            )}
            primaryAction={{
              label: "Choose child",
              onPress: () => setShowChildSelector(true),
            }}
          />
        ) : filteredConversations && filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            renderItem={renderConversation}
            keyExtractor={(item) =>
              item.conversationId || item.child.childId
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        ) : (
          <EmptyState
            icon="chatbubbles-outline"
            title="No conversations yet"
            description={`Your assigned clinician will message you here once they've reviewed ${
              activeChild.firstName
            }'s screening.`}
          />
        )}
      </View>

      <ChildSelectorModal
        visible={showChildSelector}
        onClose={() => setShowChildSelector(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[5],
    paddingTop: spacing[2],
    paddingBottom: spacing[3],
  },
  headerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing[2],
  },
  statusBadge: {
    marginLeft: spacing[1],
  },
  search: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[3],
  },
  list: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: spacing[3],
    ...shadows.xs,
  },
  flatListContent: {
    paddingHorizontal: spacing[3],
    paddingBottom: layout.tabBarHeight + spacing[8],
  },
  row: {
    flexDirection: "row",
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    borderRadius: 14,
    alignItems: "center",
  },
  rowPressed: {
    backgroundColor: colors.surfaceSunken,
  },
  rowText: {
    flex: 1,
  },
  rowTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  rowBottomLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  preview: {
    flex: 1,
    marginRight: spacing[2],
  },
  previewUnread: {
    fontWeight: "600",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  childLine: {
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: 60,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing[3],
  },
  loadingText: {
    marginTop: spacing[2],
  },
});
