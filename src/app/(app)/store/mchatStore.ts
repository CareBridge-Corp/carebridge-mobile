import { create } from "zustand";

interface MChatState {
  answers: Record<string, boolean>;
  parentDescription: string;
  childPictures: string[]; // array of local file URIs
  audioRecording: string | null;
  setAnswer: (questionId: string, answer: boolean) => void;
  setAllAnswers: (answers: Record<string, boolean>) => void;
  setSupportingInfo: (
    description: string,
    pictures: string[],
    audioRecording?: string | null,
  ) => void;
  clearStore: () => void;
}

export const useMChatStore = create<MChatState>((set) => ({
  answers: {},
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

  setSupportingInfo: (description, pictures, audioRecording = null) =>
    set(() => ({
      parentDescription: description,
      childPictures: pictures,
      audioRecording,
    })),

  clearStore: () =>
    set(() => ({
      answers: {},
      parentDescription: "",
      childPictures: [],
      audioRecording: null,
    })),
}));
