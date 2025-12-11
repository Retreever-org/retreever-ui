import { create } from "zustand";
import type { TabOrderItem, TabOrderList } from "../types/editor.types";

interface TabOrderState {
  orderList: TabOrderList;
  activeTab: string | null; // tabKey

  setTabOrderList: (list: TabOrderList) => void;
  addNewTab: (item: TabOrderItem) => void;
  setActiveTab: (key: string | null) => void;
}

/* ---------- Store object ---------- */

export const tabOrderStore = create<TabOrderState>((set, get) => ({
  orderList: [],
  activeTab: null,

  setTabOrderList: (list) => set({ orderList: list }),

  addNewTab: (item) => {
    const { orderList } = get();
    if (orderList.some((t) => t.tabKey === item.tabKey)) return;

    set({
      orderList: [...orderList, item],
    });
  },

  setActiveTab: (key) => set({ activeTab: key }),
}));

/* ---------- Hook + selectors ---------- */

export const useTabOrderStore = tabOrderStore;

export const useTabOrderList = () =>
  useTabOrderStore((s) => s.orderList);

export const useActiveTabKey = () =>
  useTabOrderStore((s) => s.activeTab);
