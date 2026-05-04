import { create } from "zustand";

export interface ChatMessage {
  messageId: string;
  childId: string;
  parentId: string;
  clinicianId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatConversation {
  child: {
    childId: string;
    firstName: string;
    parentId: string;
    assignedClinicianId: string;
  };
  parent: {
    userId: string;
    firstName: string;
    lastName: string;
    name?: string;
    surname?: string;
  };
  clinician: {
    userId: string;
    firstName: string;
    lastName: string;
    name?: string;
    surname?: string;
  };
  lastMessage: ChatMessage | null;
  conversationId?: string; // Optional for backward compatibility
}

interface ChatState {
  conversations: ChatConversation[];
  activeConversation: ChatConversation | null;
  messages: Record<string, ChatMessage[]>; // childId -> messages
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
      // avoid duplicates
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
        conv.child.childId === childId
          ? { ...conv, lastMessage: message }
          : conv,
      ),
    })),
}));
