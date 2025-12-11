import {
  getTabDoc,
  saveTabDoc,
  appendKeyToOrder,
} from "../storage/tab-doc-storage";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import { buildTabDocFromEndpoint, tabKeyForEndpoint } from "./tab-factory";
import type { Endpoint } from "../types/response.types";
import type { TabDoc } from "../types/editor.types";

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

  const existing = await getTabDoc(key);
  if (existing) {
    useViewingDocStore.setState({ tabDoc: existing });
    return;
  }

  const newTab = buildTabDocFromEndpoint(endpoint);

  saveTabDoc(newTab);
  await appendKeyToOrder(newTab.key, endpoint.name);

  // ensure endpoint still same after async work
  const latest = useViewingDocStore.getState().endpoint;
  if (!latest || tabKeyForEndpoint(latest.method, latest.path) !== key) return;

  useViewingDocStore.setState({ tabDoc: newTab });
}
