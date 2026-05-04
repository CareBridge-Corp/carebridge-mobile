import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface Child {
  childId: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  profilePictureUrl?: string | null;
  dob: string;
  gender: string;
  parentId?: string;
  region: string | null;
  status?: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  assignedClinicianId: string | null;
  createdAt?: string;
}

interface ChildrenState {
  children: Child[];
  activeChild: Child | null;
  selectedChild: Child | null;
  isLoading: boolean;
  error: string | null;
}

interface ChildrenActions {
  setChildren: (children: Child[]) => void;
  addChild: (child: Child) => void;
  updateChild: (childId: string, updates: Partial<Child>) => void;
  removeChild: (childId: string) => void;
  setActiveChild: (child: Child | null) => void;
  setSelectedChild: (child: Child | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearChildren: () => void;
}

export type ChildrenStore = ChildrenState & ChildrenActions;

export const useChildrenStore = create<ChildrenStore>()(
  persist(
    (set) => ({
      children: [],
      activeChild: null,
      selectedChild: null,
      isLoading: false,
      error: null,

      setChildren: (children) =>
        set((state) => {
          // If there's no active child and we have children, set the first one as active
          const newActiveChild =
            state.activeChild || (children.length > 0 ? children[0] : null);
          return {
            children,
            activeChild: newActiveChild,
            error: null,
          };
        }),

      addChild: (child) =>
        set((state) => {
          const newChildren = [...state.children, child];
          // If this is the first child, set it as active
          const newActiveChild = state.activeChild || child;
          return {
            children: newChildren,
            activeChild: newActiveChild,
            error: null,
          };
        }),

      updateChild: (childId, updates) =>
        set((state) => ({
          children: state.children.map((child) =>
            child.childId === childId ? { ...child, ...updates } : child,
          ),
          activeChild:
            state.activeChild?.childId === childId
              ? { ...state.activeChild, ...updates }
              : state.activeChild,
          error: null,
        })),

      removeChild: (childId) =>
        set((state) => {
          const newChildren = state.children.filter(
            (child) => child.childId !== childId,
          );
          // If we removed the active child, set a new active child
          const newActiveChild =
            state.activeChild?.childId === childId
              ? newChildren.length > 0
                ? newChildren[0]
                : null
              : state.activeChild;
          return {
            children: newChildren,
            activeChild: newActiveChild,
            selectedChild:
              state.selectedChild?.childId === childId
                ? null
                : state.selectedChild,
            error: null,
          };
        }),

      setActiveChild: (child) => set({ activeChild: child }),

      setSelectedChild: (child) => set({ selectedChild: child }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      clearChildren: () =>
        set({
          children: [],
          activeChild: null,
          selectedChild: null,
          error: null,
        }),
    }),
    {
      name: "children-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        children: state.children,
        activeChild: state.activeChild,
      }),
    },
  ),
);
