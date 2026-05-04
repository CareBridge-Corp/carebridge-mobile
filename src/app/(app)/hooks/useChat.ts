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

export function useChatMessages(childId: string) {
  const { setMessages } = useChatStore();

  return useQuery({
    queryKey: ["chat-messages", childId],
    queryFn: async () => {
      if (!childId) return [];
      const response: any = await apiClient.get(
        `/chat/children/${childId}/messages?limit=50`,
      );
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
      content,
    }: {
      childId: string;
      content: string;
    }) => {
      const response: any = await apiClient.post(
        `/chat/children/${childId}/messages`,
        { content },
      );
      return response.chatMessage as ChatMessage;
    },
    onSuccess: (message, variables) => {
      addMessage(variables.childId, message);
      updateLastMessage(variables.childId, message);
      // We do not invalidate queries to avoid refetching, as we manually add to the store
    },
  });
}
