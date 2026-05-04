import { create } from "zustand";

interface MChatState {
  answers: Record<string, boolean>;
  parentDescription: string;
  childPictures: string[]; // array of local file URIs
  setAnswer: (questionId: string, answer: boolean) => void;
  setAllAnswers: (answers: Record<string, boolean>) => void;
  setSupportingInfo: (description: string, pictures: string[]) => void;
  clearStore: () => void;
}

export const useMChatStore = create<MChatState>((set) => ({
  answers: {},
  parentDescription: "",
  childPictures: [],

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

  setSupportingInfo: (description, pictures) =>
    set(() => ({
      parentDescription: description,
      childPictures: pictures,
    })),

  clearStore: () =>
    set(() => ({
      answers: {},
      parentDescription: "",
      childPictures: [],
    })),
}));
