import { useViewingDocStore } from "../stores/viewing-doc-store";
import { tabOrderStore } from "../stores/tab-order-store";
import { buildTabDocFromEndpoint, tabKeyForEndpoint } from "./tab-factory";
import type { Endpoint } from "../types/response.types";
import type { TabDoc } from "../types/editor.types";
import { getTabDoc, saveTabDoc } from "../storage/tab-doc-storage";

let lastEndpointKey: string | null = null;

// ---- single subscriber ----

useViewingDocStore.subscribe(async (state) => {
  const { endpoint, tabDoc } = state;

  persistTabDoc(tabDoc);
  await syncEndpointToTab(endpoint, tabDoc);
});

// ---- helpers ----

function persistTabDoc(tabDoc: TabDoc | null) {
  if (!tabDoc) return;
  saveTabDoc(tabDoc);
}

async function syncEndpointToTab(
  endpoint: Endpoint | null,
  currentTab: TabDoc | null
) {
  if (!endpoint) {
    lastEndpointKey = null;
    return;
  }

  const key = tabKeyForEndpoint(endpoint.method, endpoint.path);

  // endpoint effectively unchanged
  if (lastEndpointKey === key) return;
  lastEndpointKey = key;

  // already viewing correct tab
  if (currentTab && currentTab.key === key) return;

  // load or create TabDoc
  let tab = await getTabDoc(key);
  const isNew = !tab;

  if (!tab) {
    tab = buildTabDocFromEndpoint(endpoint);
    saveTabDoc(tab);
  }

  // ensure endpoint still same after async work
  const latest = useViewingDocStore.getState().endpoint;
  if (!latest || tabKeyForEndpoint(latest.method, latest.path) !== key) return;

  // update viewing doc
  useViewingDocStore.setState({ tabDoc: tab });

  // update tab-order store
  const { orderList, addNewTab, setActiveTab } = tabOrderStore.getState();

  if (isNew && !orderList.some((t) => t.tabKey === key)) {
    const nextOrder =
      orderList.length > 0
        ? Math.max(...orderList.map((t) => t.order)) + 1
        : 0;

    addNewTab({
      tabKey: key,
      order: nextOrder,
      name: endpoint.name,
    });
  }

  setActiveTab(key);
}
