import { create } from "zustand";

export type ChatChannelType = "ASSIGNED_DM" | "CLINICIANS_GROUP" | "PEER_DM";

export interface ChatMessage {
  messageId: string;
  childId: string;
  parentId: string;
  clinicianId?: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  channelType?: ChatChannelType;
}

export interface ChatConversation {
  child: {
    childId: string;
    firstName: string;
    parentId: string;
    assignedClinicianId: string | null;
  };
  parent: {
    userId: string;
    firstName: string;
    lastName: string;
    name?: string;
    surname?: string;
  };
  clinician?: {
    userId: string;
    firstName: string;
    lastName: string;
    name?: string;
    surname?: string;
    profilePictureUrl?: string | null;
  } | null;
  lastMessage: ChatMessage | null;
  conversationId?: string;
  channelType?: ChatChannelType;
  title?: string;
  memberCount?: number;
}

export interface ChatGroupMember {
  userId: string;
  firstName: string;
  lastName: string;
  surname?: string | null;
  role: "PARENT" | "CLINICIAN";
  isAssignedClinician: boolean;
}

export interface ChatDmRequest {
  requestId: string;
  childId: string;
  parentId: string;
  clinicianId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "CANCELLED";
  message?: string | null;
  respondedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  child?: {
    childId: string;
    firstName: string;
    lastName?: string;
  };
  parent?: {
    userId: string;
    firstName: string;
    lastName: string;
    surname?: string;
  };
  clinician?: {
    userId: string;
    firstName: string;
    lastName: string;
    surname?: string;
  };
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: Record<string, ChatMessage[]>;
}

interface ChatActions {
  setConversations: (conversations: ChatConversation[]) => void;
  setActiveConversation: (conversation: ChatConversation | null) => void;
  setMessages: (childId: string, messages: ChatMessage[]) => void;
  addMessage: (childId: string, message: ChatMessage) => void;
  updateLastMessage: (childId: string, message: ChatMessage) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  conversations: [],
  activeConversation: null,
  messages: {},

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (activeConversation) => set({ activeConversation }),

  setMessages: (childId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [childId]: messages,
      },
    })),

  addMessage: (childId, message) =>
    set((state) => {
      const existing = state.messages[childId] || [];
      if (existing.some((m) => m.messageId === message.messageId)) return state;
      return {
        messages: {
          ...state.messages,
          [childId]: [...existing, message],
        },
      };
    }),

  updateLastMessage: (childId, message) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.child.childId === childId &&
        (conv.channelType || "ASSIGNED_DM") ===
          (message.channelType || "ASSIGNED_DM")
          ? { ...conv, lastMessage: message }
          : conv,
      ),
    })),
}));
