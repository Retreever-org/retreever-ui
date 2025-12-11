import localforage from "localforage";
import type { TabDoc, TabOrderList } from "../types/editor.types";
import { debounceWithFlush } from "../services/debounce-with-flush";

const TAB_PREFIX = "TAB::";
const ORDER_KEY = "TAB_ORDER_LIST";

// Stores for tabs and order
const tabsStore = localforage.createInstance({
  name: "retreever-tabs",
  storeName: "tabs",
  description: "TabDoc storage",
});

const orderStore = localforage.createInstance({
  name: "retreever-tabs",
  storeName: "order",
  description: "Tab order list",
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

export async function clearAll(): Promise<void> {
  const tabKeys = await tabsStore.keys();
  const filteredTabKeys = tabKeys.filter(
    (k) => typeof k === "string" && (k as string).startsWith(TAB_PREFIX)
  ) as string[];

  await Promise.all([
    ...filteredTabKeys.map((k) => tabsStore.removeItem(k)),
    orderStore.removeItem(ORDER_KEY),
  ]);
}

export async function clearAllByKeys(keysToRemove: string[]): Promise<void> {
  if (!Array.isArray(keysToRemove) || keysToRemove.length === 0) return;
  await Promise.all([
    ...keysToRemove.map((k) => tabsStore.removeItem(k)),
    removeKeysFromOrder(keysToRemove),
  ]);
}

// --------- TabOrderList persistence ----------
// --------- TabOrderList persistence ----------
export async function getTabOrderList(): Promise<TabOrderList> {
  const list = await orderStore.getItem<TabOrderList>(ORDER_KEY);
  return list ?? [];
}

export async function saveTabOrderList(list: TabOrderList): Promise<void> {
  await orderStore.setItem<TabOrderList>(ORDER_KEY, list);
}

export async function setTabOrderList(list: TabOrderList): Promise<void> {
  await saveTabOrderList(list);
}

// append key to last position (if not present)
export async function appendKeyToOrder(
  key: string,
  name: string
): Promise<void> {
  let list = await getTabOrderList();
  if (list.some((t) => t.tabKey === key)) return;

  const last =
    list.length > 0 ? Math.max(...list.map((t) => t.order)) : -1;
  const nextOrder = last + 1;

  list.push({ tabKey: key, order: nextOrder, name });
  await saveTabOrderList(list);
}

// remove single key and normalize remaining indices 0..n-1
export async function removeKeyFromOrder(key: string): Promise<void> {
  let list = await getTabOrderList();
  list = list.filter((t) => t.tabKey !== key);
  list = normalizeOrderList(list);
  await saveTabOrderList(list);
}

// remove multiple keys and normalize
export async function removeKeysFromOrder(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  let list = await getTabOrderList();
  const toRemove = new Set(keys);
  list = list.filter((t) => !toRemove.has(t.tabKey));
  list = normalizeOrderList(list);
  await saveTabOrderList(list);
}

// reorder a key to a new index (0-based)
export async function reorderKeys(
  key: string,
  newIndex: number
): Promise<void> {
  let list = await getTabOrderList();
  list = list.sort((a, b) => a.order - b.order);

  const from = list.findIndex((t) => t.tabKey === key);
  if (from === -1) return;

  const [item] = list.splice(from, 1);
  const safeIndex = Math.max(0, Math.min(newIndex, list.length));
  list.splice(safeIndex, 0, item);

  list = normalizeOrderList(list);
  await saveTabOrderList(list);
}

// normalize helper: reassign contiguous indices 0..n-1 based on current order
function normalizeOrderList(list: TabOrderList): TabOrderList {
  return list
    .sort((a, b) => a.order - b.order)
    .map((t, idx) => ({ ...t, order: idx }));
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
