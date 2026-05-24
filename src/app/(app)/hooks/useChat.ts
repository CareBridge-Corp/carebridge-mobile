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

      const response: any = await apiClient.get("/chat/conversations");
      const conversations = response.conversations || [];
      return conversations as ChatConversation[];
    },
    enabled: true,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
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

      const endpoint = conversationId
        ? `/chat/${childId}/conversations/${conversationId}/messages?limit=50`
        : `/chat/children/${childId}/messages?limit=50`;

      const response: any = await apiClient.get(endpoint);
      const messages = response.messages || [];
      return messages as ChatMessage[];
    },
    enabled: !!childId,
    refetchOnWindowFocus: true,
    staleTime: 0,
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
      const endpoint = `/chat/children/${childId}/messages`;

      const response: any = await apiClient.post(endpoint, { content });
      return response.chatMessage as ChatMessage;
    },
    onSuccess: (_message, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-messages", variables.childId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations", variables.childId],
      });
      queryClient.invalidateQueries({
        queryKey: ["chat-conversations"],
      });
    },
  });
}
