import { tabOrderStore } from "../stores/tab-order-store";
import {
  saveLastActiveTabKey,
  saveTabOrderList,
} from "../storage/tab-order-storage";

let lastSerialized = "";
let lastActiveTab: string | null = null;

tabOrderStore.subscribe((state) => {
  const { orderList, activeTab } = state;

  // 1) persist orderList when it changes
  const serialized = JSON.stringify(orderList);
  if (serialized !== lastSerialized) {
    lastSerialized = serialized;
    void saveTabOrderList(orderList);
  }

  // 2) persist activeTab when it changes
  if (activeTab !== lastActiveTab) {
    lastActiveTab = activeTab;
    void saveLastActiveTabKey(activeTab);
  }
});
