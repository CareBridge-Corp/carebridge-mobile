import { create } from "zustand";

interface MChatState {
  answers: Record<string, boolean>;
  questionIds: number[];
  screeningMonth: number;
  carryForwardCount: number;
  newQuestionCount: number;
  parentDescription: string;
  childPictures: string[];
  audioRecording: string | null;
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
}

export const useMChatStore = create<MChatState>((set) => ({
  answers: {},
  questionIds: [],
  screeningMonth: 1,
  carryForwardCount: 0,
  newQuestionCount: 0,
  parentDescription: "",
  childPictures: [],
  audioRecording: null,

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
    })),
}));
