import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
    ChatConversation,
    ChatMessage,
    useChatStore,
} from "../store/chatStore";

export function useConversations(childId?: string) {
  return useQuery({
    queryKey: ["chat-conversations", childId],
    queryFn: async () => {
      // If childId is provided, fetch conversation for that specific child
      if (childId) {
        const response: any = await apiClient.get(
          `/chat/conversations/${childId}`,
        );
        const conversation = response.conversation;
        if (conversation) {
          return [conversation] as ChatConversation[];
        }
        return [];
      }

      // Otherwise fetch all conversations
      const response: any = await apiClient.get("/chat/conversations");
      const conversations = response.conversations || [];
      return conversations as ChatConversation[];
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
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
      return messages as ChatMessage[];
    },
    enabled: !!childId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

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
      // Invalidate and refetch messages immediately
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.childId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    },
  });
}
