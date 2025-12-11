// hooks/useTabOrderInitializer.ts
import { useEffect } from "react";
import { tabOrderStore } from "../stores/tab-order-store";
import { getLastActiveTabKey, getTabOrderList } from "../storage/tab-order-storage";

export const useTabOrderInitializer = () => {
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const list = await getTabOrderList();
        const lastActive = await getLastActiveTabKey();

        if (cancelled) return;

        tabOrderStore.setState({ orderList: list, activeTab: lastActive });
      } catch {
        // ignore; start with empty list on failure
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, []);
};
