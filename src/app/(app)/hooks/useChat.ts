import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "../../../shared/api/client";
import {
  ChatChannelType,
  ChatConversation,
  ChatDmRequest,
  ChatGroupMember,
  ChatMessage,
  useChatStore,
} from "../store/chatStore";

export function useConversations(childId?: string) {
  return useQuery({
    queryKey: ["chat-conversations", childId],
    queryFn: async () => {
      const conversations: ChatConversation[] = [];

      if (childId) {
        try {
          const dmResponse: any = await apiClient.get(
            `/chat/conversations/${childId}`,
          );
          if (dmResponse.conversation) {
            conversations.push({
              ...dmResponse.conversation,
              channelType: "ASSIGNED_DM",
              conversationId:
                dmResponse.conversation.conversationId || `dm:${childId}`,
            } as ChatConversation);
          }
        } catch {
          // No assigned DM yet.
        }

        try {
          const groupResponse: any = await apiClient.get(
            `/chat/children/${childId}/clinicians-group`,
          );
          if (groupResponse.conversation) {
            conversations.push(groupResponse.conversation as ChatConversation);
          }
        } catch {
          // Group may be unavailable.
        }

        try {
          const requestsResponse: any = await apiClient.get(
            `/chat/requests?status=ACCEPTED`,
          );
          const accepted = (requestsResponse.requests || []) as ChatDmRequest[];
          for (const request of accepted) {
            if (request.childId !== childId) continue;
            if (
              request.clinicianId ===
              conversations.find((c) => c.channelType === "ASSIGNED_DM")?.child
                .assignedClinicianId
            ) {
              continue;
            }
            try {
              const peerResponse: any = await apiClient.get(
                `/chat/children/${childId}/clinicians/${request.clinicianId}/conversation`,
              );
              if (peerResponse.conversation) {
                conversations.push(
                  peerResponse.conversation as ChatConversation,
                );
              }
            } catch {
              // Skip unavailable peer threads.
            }
          }
        } catch {
          // No peer requests.
        }

        return conversations;
      }

      const response: any = await apiClient.get("/chat/conversations");
      return (response.conversations || []) as ChatConversation[];
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
        setActiveConversation({
          ...conversation,
          channelType: "ASSIGNED_DM",
        });
      }
      return conversation as ChatConversation;
    },
    enabled: !!childId,
  });
}

export function useChatMessages(
  childId: string,
  channelType: ChatChannelType = "ASSIGNED_DM",
  clinicianId?: string,
) {
  return useQuery({
    queryKey: ["chat-messages", childId, channelType, clinicianId || ""],
    queryFn: async () => {
      if (!childId) return [];

      let endpoint = `/chat/children/${childId}/messages?limit=50`;
      if (channelType === "CLINICIANS_GROUP") {
        endpoint = `/chat/children/${childId}/clinicians-group/messages?limit=50`;
      } else if (channelType === "PEER_DM" && clinicianId) {
        endpoint = `/chat/children/${childId}/clinicians/${clinicianId}/messages?limit=50`;
      }

      const response: any = await apiClient.get(endpoint);
      return (response.messages || []) as ChatMessage[];
    },
    enabled:
      !!childId && (channelType !== "PEER_DM" || !!clinicianId),
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

export function useCliniciansGroupMembers(childId: string, enabled = true) {
  return useQuery({
    queryKey: ["chat-group-members", childId],
    queryFn: async () => {
      const response: any = await apiClient.get(
        `/chat/children/${childId}/clinicians-group/members`,
      );
      return (response.members || []) as ChatGroupMember[];
    },
    enabled: !!childId && enabled,
    staleTime: 1000 * 60,
  });
}

export function useChatRequestStatus(
  childId?: string,
  clinicianId?: string,
) {
  return useQuery({
    queryKey: ["chat-request-status", childId, clinicianId],
    queryFn: async () => {
      const response: any = await apiClient.get(
        `/chat/children/${childId}/clinicians/${clinicianId}/request`,
      );
      return response as {
        status: "NONE" | "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED" | "ASSIGNED";
        canMessage: boolean;
        request: ChatDmRequest | null;
      };
    },
    enabled: !!childId && !!clinicianId,
    staleTime: 1000 * 15,
  });
}

export function useChatRequests(status?: string, enabled = true) {
  return useQuery({
    queryKey: ["chat-requests", status || "all"],
    queryFn: async () => {
      const query = status ? `?status=${status}` : "";
      const response: any = await apiClient.get(`/chat/requests${query}`);
      return (response.requests || []) as ChatDmRequest[];
    },
    enabled,
    staleTime: 1000 * 20,
    refetchInterval: 1000 * 45,
  });
}

export function useRequestClinicianChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      clinicianId,
      message,
    }: {
      childId: string;
      clinicianId: string;
      message?: string;
    }) => {
      const response: any = await apiClient.post(
        `/chat/children/${childId}/clinicians/${clinicianId}/request`,
        message ? { message } : {},
      );
      return response.request as ChatDmRequest;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat-request-status", variables.childId, variables.clinicianId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat-requests"] });
    },
  });
}

export function useRespondToChatRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "ACCEPTED" | "DECLINED";
    }) => {
      const response: any = await apiClient.patch(
        `/chat/requests/${requestId}`,
        { status },
      );
      return response.request as ChatDmRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-requests"] });
      queryClient.invalidateQueries({ queryKey: ["chat-conversations"] });
      queryClient.invalidateQueries({ queryKey: ["chat-request-status"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      childId,
      content,
      channelType = "ASSIGNED_DM",
      clinicianId,
    }: {
      childId: string;
      conversationId?: string;
      content: string;
      channelType?: ChatChannelType;
      clinicianId?: string;
    }) => {
      let endpoint = `/chat/children/${childId}/messages`;
      if (channelType === "CLINICIANS_GROUP") {
        endpoint = `/chat/children/${childId}/clinicians-group/messages`;
      } else if (channelType === "PEER_DM" && clinicianId) {
        endpoint = `/chat/children/${childId}/clinicians/${clinicianId}/messages`;
      }

      const response: any = await apiClient.post(endpoint, { content });
      return response.chatMessage as ChatMessage;
    },
    onSuccess: (_message, variables) => {
      const channelType = variables.channelType || "ASSIGNED_DM";
      queryClient.invalidateQueries({
        queryKey: [
          "chat-messages",
          variables.childId,
          channelType,
          variables.clinicianId || "",
        ],
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
