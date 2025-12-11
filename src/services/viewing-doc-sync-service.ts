import { getTabDoc, saveTabDoc } from "../storage/tab-doc-storage";
import { appendKeyToOrder } from "../storage/tab-doc-storage";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import { buildTabDocFromEndpoint, tabKeyForEndpoint } from "./tab-factory";

let initialized = false;

/**
 * Called once on app startup to wire the autosave of the current tabDoc.
 */
export function initViewingDocSync() {
  if (initialized) return;
  initialized = true;

  useViewingDocStore.subscribe((state) => {
    if (state.tabDoc) saveTabDoc(state.tabDoc);
  });
}

/**
 * Called once on app startup to sync endpoint -> tabDoc.
 */
export function initViewingEndpointSync() {
  useViewingDocStore.subscribe(async (state) => {
    const ep = state.endpoint;

    if (!ep) {
      useViewingDocStore.setState({ tabDoc: null });
      return;
    }

    const key = tabKeyForEndpoint(ep.method, ep.path);
    const existing = await getTabDoc(key);

    if (existing) {
      useViewingDocStore.setState({ tabDoc: existing });
      return;
    }

    // create new TabDoc (order is managed separately)
    const newTab = buildTabDocFromEndpoint(ep);

    // persist doc and append key to order map
    saveTabDoc(newTab);
    await appendKeyToOrder(newTab.key);

    useViewingDocStore.setState({ tabDoc: newTab });
  });
}
