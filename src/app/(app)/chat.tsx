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
  Button,
  EmptyState,
  Screen,
  Text,
  TextField,
} from "../../shared/components/ui";
import { colors, layout, shadows, spacing } from "../../shared/theme";
import { useAuthStore } from "../(auth)/store/authStore";
import { ChildSelectorModal } from "./components/ChildSelectorModal";
import {
  useChatRequests,
  useConversations,
  useRespondToChatRequest,
} from "./hooks/useChat";
import { ChatConversation, ChatDmRequest, useChatStore } from "./store/chatStore";
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

function getConversationTitle(
  conversation: ChatConversation,
  viewerRole?: string,
): string {
  if (conversation.channelType === "CLINICIANS_GROUP") {
    return conversation.title || "Care team";
  }

  if (conversation.channelType === "PEER_DM" && viewerRole === "CLINICIAN") {
    const parent = conversation.parent;
    if (parent?.firstName || parent?.lastName) {
      return `${parent.firstName || ""} ${parent.lastName || ""}`.trim();
    }
  }

  const clinician = conversation.clinician;
  if (!clinician) return "Assigned clinician";
  return clinician.surname
    ? `${clinician.surname} ${clinician.firstName} ${clinician.lastName}`
    : `Dr. ${clinician.firstName} ${clinician.lastName}`;
}

function requestParentName(request: ChatDmRequest): string {
  const parent = request.parent;
  if (!parent) return "Parent";
  return `${parent.firstName} ${parent.lastName}`.trim() || "Parent";
}

export default function ChatScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);
  const { user } = useAuthStore();
  const { activeChild, children } = useChildrenStore();
  const { setActiveConversation } = useChatStore();
  const isClinician = user?.role === "CLINICIAN";

  const { data: pendingRequests = [] } = useChatRequests(
    "PENDING",
    isClinician,
  );
  const respondMutation = useRespondToChatRequest();

  useEffect(() => {
    socketService.connect();
    const unsubscribe = socketService.subscribeConnection(setSocketConnected);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (activeChild?.childId) {
      socketService.joinChildRoom(activeChild.childId);
      socketService.joinCliniciansGroupRoom(activeChild.childId);
    }
  }, [activeChild?.childId]);

  const { data: conversations, isLoading } = useConversations(
    activeChild?.childId,
  );

  const handleChatPress = (conversation: ChatConversation) => {
    setActiveConversation(conversation);
    router.push("/(app)/(doctor)/doctor-chat" as Href);
  };

  const openAcceptedRequest = (request: ChatDmRequest) => {
    if (!request.child) return;
    setActiveConversation({
      channelType: "PEER_DM",
      conversationId: `peer:${request.childId}:${request.clinicianId}`,
      child: {
        childId: request.childId,
        firstName: request.child.firstName,
        parentId: request.parentId,
        assignedClinicianId: null,
      },
      parent: {
        userId: request.parentId,
        firstName: request.parent?.firstName || "",
        lastName: request.parent?.lastName || "",
        surname: request.parent?.surname,
      },
      clinician: request.clinician
        ? {
            userId: request.clinician.userId,
            firstName: request.clinician.firstName,
            lastName: request.clinician.lastName,
            surname: request.clinician.surname,
          }
        : {
            userId: request.clinicianId,
            firstName: "",
            lastName: "",
          },
      lastMessage: null,
    });
    router.push("/(app)/(doctor)/doctor-chat" as Href);
  };

  const filteredConversations = conversations?.filter((conv) => {
    const title = getConversationTitle(conv, user?.role).toLowerCase();
    return title.includes(searchQuery.toLowerCase());
  });

  const clinicianPending = isClinician
    ? pendingRequests.filter((request) => request.status === "PENDING")
    : [];

  const renderRequest = ({ item }: { item: ChatDmRequest }) => {
    const title = requestParentName(item);
    const childName = item.child?.firstName || "Child";

    return (
      <View style={styles.requestRow}>
        <Avatar name={title} size="md" />
        <View style={styles.rowText}>
          <Text variant="body" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
          <Text variant="bodySmall" tone="secondary" numberOfLines={2}>
            {item.message?.trim() ||
              `Wants to chat about ${childName}`}
          </Text>
          <View style={styles.requestActions}>
            <Button
              label="Decline"
              variant="secondary"
              fullWidth={false}
              style={styles.requestBtn}
              loading={respondMutation.isPending}
              onPress={() =>
                respondMutation.mutate({
                  requestId: item.requestId,
                  status: "DECLINED",
                })
              }
            />
            <Button
              label="Accept"
              fullWidth={false}
              style={styles.requestBtn}
              loading={respondMutation.isPending}
              onPress={() =>
                respondMutation.mutate(
                  {
                    requestId: item.requestId,
                    status: "ACCEPTED",
                  },
                  {
                    onSuccess: (accepted) => openAcceptedRequest(accepted),
                  },
                )
              }
            />
          </View>
        </View>
      </View>
    );
  };

  const renderConversation = ({ item }: { item: ChatConversation }) => {
    const isGroup = item.channelType === "CLINICIANS_GROUP";
    const isPeer = item.channelType === "PEER_DM";
    const isUnread = item.lastMessage && !item.lastMessage.readAt;
    const lastMessage = item.lastMessage?.content || "No messages yet";
    const timestamp = item.lastMessage?.createdAt
      ? formatTimestamp(item.lastMessage.createdAt)
      : "";
    const displayName = getConversationTitle(item, user?.role);

    return (
      <Pressable
        onPress={() => handleChatPress(item)}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
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
            {isUnread ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text variant="caption" tone="tertiary" style={styles.childLine}>
            {isGroup
              ? `${item.memberCount || 0} members · ${item.child.firstName}`
              : isPeer
                ? `Individual · ${item.child.firstName}`
                : item.child.firstName}
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
            <Text
              variant="bodySmall"
              tone="secondary"
              style={styles.loadingText}
            >
              {!socketConnected
                ? "Connecting to messaging..."
                : "Loading conversations..."}
            </Text>
          </View>
        ) : !activeChild && !isClinician ? (
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
        ) : (
          <FlatList
            data={filteredConversations || []}
            renderItem={renderConversation}
            keyExtractor={(item) =>
              item.conversationId ||
              `${item.channelType || "ASSIGNED_DM"}:${item.child.childId}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListHeaderComponent={
              clinicianPending.length > 0 ? (
                <View style={styles.requestsSection}>
                  <Text variant="title3" style={styles.requestsHeading}>
                    Chat requests
                  </Text>
                  {clinicianPending.map((request) => (
                    <View key={request.requestId}>
                      {renderRequest({ item: request })}
                    </View>
                  ))}
                  <View style={styles.requestsDivider} />
                </View>
              ) : null
            }
            ListEmptyComponent={
              clinicianPending.length === 0 ? (
                <EmptyState
                  icon="chatbubbles-outline"
                  title="No conversations yet"
                  description={
                    isClinician
                      ? "When a parent requests an individual chat and you accept, it will appear here."
                      : `Message your assigned clinician or the full care team about ${activeChild?.firstName || "your child"}.`
                  }
                />
              ) : null
            }
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
    flexGrow: 1,
  },
  requestsSection: {
    marginBottom: spacing[2],
  },
  requestsHeading: {
    marginBottom: spacing[2],
    paddingHorizontal: spacing[2],
  },
  requestsDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing[3],
  },
  requestRow: {
    flexDirection: "row",
    gap: spacing[3],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    alignItems: "flex-start",
  },
  requestActions: {
    flexDirection: "row",
    gap: spacing[2],
    marginTop: spacing[2],
  },
  requestBtn: {
    flex: 1,
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
