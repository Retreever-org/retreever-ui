import { useViewingDocStore } from "../stores/viewing-doc-store";
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

  // already viewing tab --> return
  if (currentTab && currentTab.key === key) return;

  // ----------- continuing when endpoint has changed -----------
  // load or create TabDoc
  let tab = await getTabDoc(key);
  const isNew = !tab;

  if (isNew) {
    tab = buildTabDocFromEndpoint(endpoint);
    saveTabDoc(tab);
  }

  // update viewing doc
  useViewingDocStore.setState({ tabDoc: tab });
}
