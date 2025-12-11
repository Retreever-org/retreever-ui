import { create } from "zustand";
import type { Endpoint } from "../types/response.types";
import type { TabDoc } from "../types/editor.types";

/* ---------- Store shape ---------- */

interface ViewingDocState {
  endpoint: Endpoint | null;
  tabDoc: TabDoc | null;

  setEndpoint: (ep: Endpoint | null) => void;
  setTabDoc: (tab: TabDoc | null) => void;

  updateTabDoc: (patch: Partial<TabDoc>) => void;
  updateUiRequest: (patch: Partial<TabDoc["uiRequest"]>) => void;
  setLastResponse: (resp: TabDoc["lastResponse"]) => void;

  clear: () => void;
}

/* ---------- Store object ---------- */

export const viewingDocStore = create<ViewingDocState>((set, get) => ({
  endpoint: null,
  tabDoc: null,

  setEndpoint: (endpoint) => set({ endpoint }),
  setTabDoc: (tab) => set({ tabDoc: tab }),

  updateTabDoc: (patch) => {
    const current = get().tabDoc;
    if (!current) return;
    set({
      tabDoc: {
        ...current,
        ...patch,
        updatedAt: Date.now(),
      },
    });
  },

  updateUiRequest: (patch) => {
    const current = get().tabDoc;
    if (!current) return;
    set({
      tabDoc: {
        ...current,
        uiRequest: {
          ...current.uiRequest,
          ...patch,
        },
        updatedAt: Date.now(),
      },
    });
  },

  setLastResponse: (resp) => {
    const current = get().tabDoc;
    if (!current) return;
    set({
      tabDoc: {
        ...current,
        lastResponse: resp,
        updatedAt: Date.now(),
      },
    });
  },

  clear: () => set({ endpoint: null, tabDoc: null }),
}));

/* ---------- Hook + selectors ---------- */

export const useViewingDocStore = viewingDocStore;

export const useViewingEndpoint = () =>
  useViewingDocStore((s) => s.endpoint);

export const useViewingTabDoc = () =>
  useViewingDocStore((s) => s.tabDoc);
