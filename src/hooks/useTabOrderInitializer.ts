import { useEffect } from "react";
import { useTabOrderStore } from "../stores/tab-order-store";
import {
  getLastActiveTabKey,
  getTabOrderList,
} from "../storage/tab-order-storage";

export const useTabOrderInitializer = () => {
  const { setTabOrderList, setActiveTab } = useTabOrderStore();

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const list = await getTabOrderList();
        const lastActive = await getLastActiveTabKey();

        if (cancelled) return;

        const lastActiveItem = list.find((o) => o.tabKey === lastActive);
        setTabOrderList(list);
        if (lastActiveItem) {
          setActiveTab(lastActive, lastActiveItem.name);
        }
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
