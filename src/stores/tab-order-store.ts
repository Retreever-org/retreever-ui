import { create } from "zustand";
import type { TabOrderItem, TabOrderList } from "../types/editor.types";

interface TabOrderState {
  orderList: TabOrderList;
  activeTab: string | null; // tabKey

  setTabOrderList: (list: TabOrderList) => void;
  setActiveTab: (key: string | null, name: string) => void;

  closeTab: (tabKey: string) => void;
  clearAllExcludeActive: () => void;
  clearAllTabs: () => void;
}

/* ---------- helpers ---------- */

const normalizeOrder = (list: TabOrderList): TabOrderList =>
  list
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((t, idx) => ({ ...t, order: idx }));

const removeByKey = (key: string | null, list: TabOrderList): TabOrderList => {
  const remaining = list.filter((t) => t.tabKey !== key);
  return normalizeOrder(remaining);
};

const getByKey = (
  key: string | null,
  list: TabOrderList
): TabOrderItem | undefined => {
  return list.find((t) => t.tabKey === key);
};

/* ---------- Store object ---------- */

export const tabOrderStore = create<TabOrderState>((set, get) => ({
  orderList: [],
  activeTab: null,

  setTabOrderList: (list) => set({ orderList: normalizeOrder(list) }),

  setActiveTab: (key, name) => {
    const { orderList } = get();
    if (orderList.some((t) => t.tabKey === key)) {
      set({ activeTab: key });
    } else {
      const nextOrder =
        orderList.length > 0
          ? Math.max(...orderList.map((t) => t.order)) + 1
          : 0;

      if (key) {
        const item: TabOrderItem = {
          tabKey: key,
          order: nextOrder,
          name: name,
        };

        const normalized = normalizeOrder([...orderList, item]);
        set({ orderList: normalized , activeTab: key});
      }
    }
  },

  closeTab: (tabKey) => {
    const { orderList, activeTab } = get();
    const item = getByKey(tabKey, orderList);
    const normList = removeByKey(tabKey, orderList);

    if (item?.tabKey === activeTab) {
      let next = normList.find((o) => o.order === item.order);

      if (!next && item && item.order > 0) {
        next = normList.find((o) => o.order === item.order - 1);
      }

      const newActiveTabKey = next?.tabKey ?? null;

      set({ activeTab: newActiveTabKey, orderList: normList });
      return;
    }

    set({ orderList: normList });
  },

  clearAllExcludeActive: () => {
    const { orderList, activeTab } = get();
    const item = getByKey(activeTab, orderList);

    if (item) {
      set({
        orderList: [item],
        activeTab,
      });
    } else {
      set({
        orderList: [],
        activeTab,
      });
    }
  },

  clearAllTabs: () => {
    set({
      orderList: [],
      activeTab: null,
    });
  },
}));
/* ---------- Hook + selectors ---------- */

export const useTabOrderStore = tabOrderStore;

export const useTabOrderList = () => useTabOrderStore((s) => s.orderList);

export const useActiveTabKey = () => useTabOrderStore((s) => s.activeTab);
