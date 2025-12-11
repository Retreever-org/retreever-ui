// src/storage/tab-order-storage.ts
import localforage from "localforage";
import type { TabOrderList } from "../types/editor.types";

const ORDER_KEY = "TAB_ORDER_LIST";
const LAST_ACTIVE_TAB_KEY = "LAST_ACTIVE_TAB_KEY";

const orderStore = localforage.createInstance({
  name: "retreever-tabs",
  storeName: "order",
  description: "Tab order list + last viewed tab",
});

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

// --------- Last viewed tab key ----------
export async function getLastActiveTabKey(): Promise<string | null> {
  const key = await orderStore.getItem<string | null>(LAST_ACTIVE_TAB_KEY);
  return key ?? null;
}

export async function saveLastActiveTabKey(
  key: string | null
): Promise<void> {
  await orderStore.setItem<string | null>(LAST_ACTIVE_TAB_KEY, key);
}

// --------- Clear helpers ----------
export async function clearAllTabOrderData(): Promise<void> {
  await Promise.all([
    orderStore.removeItem(ORDER_KEY),
    orderStore.removeItem(LAST_ACTIVE_TAB_KEY),
  ]);
}
