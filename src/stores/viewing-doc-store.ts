import { create } from "zustand";
import type { Endpoint } from "../types/response.types";
import type { TabDoc, KeyOrderMap } from "../types/editor.types";

interface ViewingDocState {
  endpoint: Endpoint | null;
  tabDoc: TabDoc | null;

  // order map: key -> index (0-based)
  keyOrderMap: KeyOrderMap;

  // the order/index of the currently viewing tab (nullable)
  currentTabOrder: number | null;

  // ---- Actions ----
  setKeyOrderMap: (map: KeyOrderMap) => void;
  setEndpoint: (ep: Endpoint | null) => void;
  setTabDoc: (tab: TabDoc | null) => void;
  setTabOrder: (order: number | null) => void;

  updateTabDoc: (patch: Partial<TabDoc>) => void;
  updateUiRequest: (patch: Partial<TabDoc["uiRequest"]>) => void;
  setLastResponse: (resp: TabDoc["lastResponse"]) => void;

  clear: () => void;
}

export const useViewingDocStore = create<ViewingDocState>((set, get) => ({
  endpoint: null,
  tabDoc: null,
  keyOrderMap: {},
  currentTabOrder: null,

  setKeyOrderMap: (map) => set({ keyOrderMap: map }),

  setEndpoint: (endpoint) => set({ endpoint }),

  setTabDoc: (tab) =>
    set({
      tabDoc: tab,
      currentTabOrder:
        tab && (get().keyOrderMap[tab.key] ?? null) !== null
          ? get().keyOrderMap[tab.key]
          : get().currentTabOrder,
    }),

  setTabOrder: (order) => set({ currentTabOrder: order }),

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

  clear: () =>
    set({
      endpoint: null,
      tabDoc: null,
      keyOrderMap: {},
      currentTabOrder: null,
    }),
}));

// selectors
export const useViewingEndpoint = () => useViewingDocStore((s) => s.endpoint);
export const useViewingTabDoc = () => useViewingDocStore((s) => s.tabDoc);
export const useKeyOrderMap = () => useViewingDocStore((s) => s.keyOrderMap);
export const useCurrentTabOrder = () => useViewingDocStore((s) => s.currentTabOrder);
