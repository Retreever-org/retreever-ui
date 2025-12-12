import { docStore } from "./../stores/doc-store";
import { tabOrderStore } from "../stores/tab-order-store";
import {
  saveLastActiveTabKey,
  saveTabOrderList,
} from "../storage/tab-order-storage";
import type { TabOrderList } from "../types/editor.types";
import { tabKeyToEndpoint } from "./tab-factory";
import { viewingDocStore } from "../stores/viewing-doc-store";

let lastSerialized = "";
let lastActiveTab: string | null = null;

tabOrderStore.subscribe((state) => {
  const { orderList, activeTab } = state;

  // Update the current viewing endpoint if not lastActiveTab
  if (activeTab !== lastActiveTab) {
    setNewEndpoint(activeTab);
  }
  // proceed to persist in DB
  persistTabOrderState(orderList, activeTab);
});

const persistTabOrderState = (
  orderList: TabOrderList,
  activeTab: string | null
) => {
  // 1) persist orderList when it changes
  const serialized = JSON.stringify(orderList);
  if (serialized !== lastSerialized) {
    lastSerialized = serialized;
    saveTabOrderList(orderList);
  }

  // 2) persist activeTab when it changes
  if (activeTab !== lastActiveTab) {
    lastActiveTab = activeTab;
    saveLastActiveTabKey(activeTab);
  }
};

const setNewEndpoint = (activeTab: string | null) => {
  const { doc } = docStore.getState();
  const { setEndpoint } = viewingDocStore.getState();

  if (activeTab) {
    const newEndpoint = tabKeyToEndpoint(activeTab, doc);
    setEndpoint(newEndpoint);
  }
};
