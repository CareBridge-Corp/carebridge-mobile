import { create } from "zustand";

export interface MChatCompanionMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export type MChatCompanionVoiceStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking";

export interface MChatCompanionConversation {
  messages: MChatCompanionMessage[];
  draft: string;
  isSending: boolean;
  voiceError: boolean;
}

interface MChatState {
  answers: Record<string, boolean>;
  questionIds: number[];
  screeningMonth: number;
  carryForwardCount: number;
  newQuestionCount: number;
  parentDescription: string;
  childPictures: string[];
  audioRecording: string | null;
  companionConversations: Record<string, MChatCompanionConversation>;
  companionVoiceQuestionId: number | null;
  companionVoiceStatus: MChatCompanionVoiceStatus;
  companionVoiceMuted: boolean;
  setAnswer: (questionId: string, answer: boolean) => void;
  setAllAnswers: (answers: Record<string, boolean>) => void;
  setSessionMeta: (meta: {
    questionIds: number[];
    screeningMonth?: number;
    carryForwardCount?: number;
    newQuestionCount?: number;
  }) => void;
  setSupportingInfo: (
    description: string,
    pictures: string[],
    audioRecording?: string | null,
  ) => void;
  clearStore: () => void;
  addCompanionMessage: (
    questionId: number,
    message: MChatCompanionMessage,
  ) => void;
  setCompanionDraft: (questionId: number, draft: string) => void;
  setCompanionSending: (questionId: number, isSending: boolean) => void;
  setCompanionVoiceError: (questionId: number, voiceError: boolean) => void;
  setCompanionVoiceState: (
    questionId: number | null,
    status: MChatCompanionVoiceStatus,
  ) => void;
  setCompanionVoiceMuted: (muted: boolean) => void;
  clearCompanionConversation: (questionId: number) => void;
  clearCompanionMessages: () => void;
}

const emptyConversation = (): MChatCompanionConversation => ({
  messages: [],
  draft: "",
  isSending: false,
  voiceError: false,
});

export const useMChatStore = create<MChatState>((set) => ({
  answers: {},
  questionIds: [],
  screeningMonth: 1,
  carryForwardCount: 0,
  newQuestionCount: 0,
  parentDescription: "",
  childPictures: [],
  audioRecording: null,
  companionConversations: {},
  companionVoiceQuestionId: null,
  companionVoiceStatus: "idle",
  companionVoiceMuted: false,

  setAnswer: (questionId, answer) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    })),

  setAllAnswers: (answers) =>
    set(() => ({
      answers,
    })),

  setSessionMeta: (meta) =>
    set(() => ({
      questionIds: meta.questionIds,
      screeningMonth: meta.screeningMonth ?? 1,
      carryForwardCount: meta.carryForwardCount ?? 0,
      newQuestionCount: meta.newQuestionCount ?? 0,
    })),

  setSupportingInfo: (description, pictures, audioRecording = null) =>
    set(() => ({
      parentDescription: description,
      childPictures: pictures,
      audioRecording,
    })),

  addCompanionMessage: (questionId, message) =>
    set((state) => ({
      companionConversations: {
        ...state.companionConversations,
        [questionId]: {
          ...(state.companionConversations[questionId] ?? emptyConversation()),
          messages: [
            ...(state.companionConversations[questionId]?.messages ?? []),
            message,
          ],
        },
      },
    })),

  setCompanionDraft: (questionId, draft) =>
    set((state) => ({
      companionConversations: {
        ...state.companionConversations,
        [questionId]: {
          ...(state.companionConversations[questionId] ?? emptyConversation()),
          draft,
        },
      },
    })),

  setCompanionSending: (questionId, isSending) =>
    set((state) => ({
      companionConversations: {
        ...state.companionConversations,
        [questionId]: {
          ...(state.companionConversations[questionId] ?? emptyConversation()),
          isSending,
        },
      },
    })),

  setCompanionVoiceError: (questionId, voiceError) =>
    set((state) => ({
      companionConversations: {
        ...state.companionConversations,
        [questionId]: {
          ...(state.companionConversations[questionId] ?? emptyConversation()),
          voiceError,
        },
      },
    })),

  setCompanionVoiceState: (questionId, status) =>
    set(() => ({
      companionVoiceQuestionId: questionId,
      companionVoiceStatus: status,
      ...(status === "idle" ? { companionVoiceMuted: false } : {}),
    })),

  setCompanionVoiceMuted: (companionVoiceMuted) =>
    set(() => ({ companionVoiceMuted })),

  clearCompanionConversation: (questionId) =>
    set((state) => {
      const companionConversations = { ...state.companionConversations };
      delete companionConversations[questionId];
      return {
        companionConversations,
        ...(state.companionVoiceQuestionId === questionId
          ? {
              companionVoiceQuestionId: null,
              companionVoiceStatus: "idle" as const,
              companionVoiceMuted: false,
            }
          : {}),
      };
    }),

  clearCompanionMessages: () =>
    set(() => ({
      companionConversations: {},
      companionVoiceQuestionId: null,
      companionVoiceStatus: "idle",
      companionVoiceMuted: false,
    })),

  clearStore: () =>
    set(() => ({
      answers: {},
      questionIds: [],
      screeningMonth: 1,
      carryForwardCount: 0,
      newQuestionCount: 0,
      parentDescription: "",
      childPictures: [],
      audioRecording: null,
      companionConversations: {},
      companionVoiceQuestionId: null,
      companionVoiceStatus: "idle",
      companionVoiceMuted: false,
    })),
}));
