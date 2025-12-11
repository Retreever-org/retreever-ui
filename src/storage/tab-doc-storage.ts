// src/storage/doc-tab-storage.ts
import localforage from "localforage";
import type { TabDoc } from "../types/editor.types";
import { debounceWithFlush } from "../services/debounce-with-flush";

const TAB_PREFIX = "TAB::";

const tabsStore = localforage.createInstance({
  name: "retreever-tabs",
  storeName: "tabs",
  description: "TabDoc storage",
});

// --------- TabDoc persistence (debounced) ----------
const writeTabInner = async (tab: TabDoc): Promise<void> => {
  await tabsStore.setItem<TabDoc>(tab.key, tab);
};

export const saveTabDebounced = debounceWithFlush(writeTabInner, 400);

export function saveTabDoc(tab: TabDoc): void {
  void saveTabDebounced(tab);
}

export async function getTabDoc(key: string): Promise<TabDoc | null> {
  const item = await tabsStore.getItem<TabDoc>(key);
  return (item as TabDoc) ?? null;
}

export async function getAllTabDoc(): Promise<TabDoc[]> {
  const keys = await tabsStore.keys();
  const tabKeys = keys.filter(
    (k) => typeof k === "string" && (k as string).startsWith(TAB_PREFIX)
  ) as string[];

  const loaded: TabDoc[] = [];
  for (const k of tabKeys) {
    const t = await tabsStore.getItem<TabDoc>(k);
    if (t) loaded.push(t as TabDoc);
  }
  return loaded;
}

export async function removeTabDoc(key: string): Promise<void> {
  await flushPendingWrites();
  await tabsStore.removeItem(key);
}

export async function clearAllTabDocs(): Promise<void> {
  const keys = await tabsStore.keys();
  const tabKeys = keys.filter(
    (k) => typeof k === "string" && (k as string).startsWith(TAB_PREFIX)
  ) as string[];

  await Promise.all(tabKeys.map((k) => tabsStore.removeItem(k)));
}

// --------- Lifecycle helpers ----------
export async function flushPendingWrites(): Promise<void> {
  if (typeof (saveTabDebounced as any).flush === "function") {
    await (saveTabDebounced as any).flush();
  }
}

export function cancelPendingWrites(): void {
  if (typeof (saveTabDebounced as any).cancel === "function") {
    (saveTabDebounced as any).cancel();
  }
}
