import { create } from "zustand";
import type { RetreeverDoc } from "../types/response.types";
import type { Collection } from "../types/filtered.types";

interface DocState {
  // Core data
  doc: RetreeverDoc | null;
  collections: Collection[];

  // Loading states
  isInitializing: boolean;
  isLoadingDoc: boolean;

  // Actions
  setDoc: (doc: RetreeverDoc) => void;
  setCollections: (collections: Collection[]) => void;
  setInitializing: (loading: boolean) => void;
  setLoadingDoc: (loading: boolean) => void;
  clear: () => void;
}

export const docStore = create<DocState>()((set) => ({
  // Initial State

  doc: null,
  collections: [],
  isInitializing: false,
  isLoadingDoc: false,

  // setters

  setDoc: (doc) => set({ doc }),

  setCollections: (collections) => set({ collections }),

  setInitializing: (isInitializing) => set({ isInitializing }),
  setLoadingDoc: (isLoadingDoc) => set({ isLoadingDoc }),

  // clear function

  clear: () =>
    set({
      doc: null,
      collections: [],
      isInitializing: false,
      isLoadingDoc: false,
    }),
}));

export const useDocStore = docStore;

// Getter for uptime (from doc)
export const useDocUptime = () => {
  const doc = useDocStore((s) => s.doc);
  return doc?.up_time;
};

// Selector hooks
export const useDoc = () => useDocStore((s) => s.doc);
export const useCollections = () => useDocStore((s) => s.collections);
export const useIsInitializing = () => useDocStore((s) => s.isInitializing);
export const useIsLoadingDoc = () => useDocStore((s) => s.isLoadingDoc);
