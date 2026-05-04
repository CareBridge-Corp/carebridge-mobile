import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
    ChatConversation,
    ChatMessage,
    useChatStore,
} from "../store/chatStore";

export function useConversations() {
  const { setConversations } = useChatStore();

  return useQuery({
    queryKey: ["chat-conversations"],
    queryFn: async () => {
      const response: any = await apiClient.get("/chat/conversations");
      const conversations = response.conversations || [];
      setConversations(conversations);
      return conversations as ChatConversation[];
    },
  });
}

export function useConversation(childId: string) {
  const { setActiveConversation } = useChatStore();

  return useQuery({
    queryKey: ["chat-conversation", childId],
    queryFn: async () => {
      if (!childId) return null;
      const response: any = await apiClient.get(
        `/chat/conversations/${childId}`,
      );
      const conversation = response.conversation;
      if (conversation) {
        setActiveConversation(conversation);
      }
      return conversation as ChatConversation;
    },
    enabled: !!childId,
  });
}

export function useChatMessages(childId: string, conversationId?: string) {
  const { setMessages } = useChatStore();

  return useQuery({
    queryKey: ["chat-messages", childId, conversationId],
    queryFn: async () => {
      if (!childId) return [];

      // If conversationId is provided, use the new endpoint structure
      const endpoint = conversationId
        ? `/chat/${childId}/conversations/${conversationId}/messages?limit=50`
        : `/chat/children/${childId}/messages?limit=50`;

      const response: any = await apiClient.get(endpoint);
      const messages = response.messages || [];
      setMessages(childId, messages);
      return messages as ChatMessage[];
    },
    enabled: !!childId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { addMessage, updateLastMessage } = useChatStore();

  return useMutation({
    mutationFn: async ({
      childId,
      conversationId,
      content,
    }: {
      childId: string;
      conversationId?: string;
      content: string;
    }) => {
      // Use the new endpoint structure if conversationId is provided
      const endpoint = conversationId
        ? `/chat/${childId}/conversations/${conversationId}/messages`
        : `/chat/children/${childId}/messages`;

      const response: any = await apiClient.post(endpoint, { content });
      return response.chatMessage as ChatMessage;
    },
    onSuccess: (message, variables) => {
      addMessage(variables.childId, message);
      updateLastMessage(variables.childId, message);
      // Invalidate queries to refetch
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.childId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    },
  });
}
