import localforage from "localforage";
import type { TabDoc, KeyOrderMap } from "../types/editor.types";
import { debounceWithFlush } from "../services/debounce-with-flush";

const TAB_PREFIX = "TAB::";
const ORDER_KEY = "TAB_ORDER";

// --------- TabDoc persistence (debounced) ----------
const writeTabInner = async (tab: TabDoc): Promise<void> => {
  await localforage.setItem<TabDoc>(tab.key, tab);
};
export const saveTabDebounced = debounceWithFlush(writeTabInner, 400);

export function saveTabDoc(tab: TabDoc): void {
  void saveTabDebounced(tab);
}

export async function getTabDoc(key: string): Promise<TabDoc | null> {
  const item = await localforage.getItem<TabDoc>(key);
  return (item as TabDoc) ?? null;
}

export async function getAllTabDoc(): Promise<TabDoc[]> {
  const keys = await localforage.keys();
  const tabKeys = keys.filter(
    (k) => typeof k === "string" && (k as string).startsWith(TAB_PREFIX)
  ) as string[];

  const loaded: TabDoc[] = [];
  for (const k of tabKeys) {
    const t = await localforage.getItem<TabDoc>(k);
    if (t) loaded.push(t as TabDoc);
  }
  return loaded;
}

export async function removeTabDoc(key: string): Promise<void> {
  await flushPendingWrites();
  await localforage.removeItem(key);
}

export async function clearAll(): Promise<void> {
  const keys = await localforage.keys();
  const tabKeys = keys.filter(
    (k) => typeof k === "string" && (k as string).startsWith(TAB_PREFIX)
  ) as string[];
  await Promise.all(tabKeys.map((k) => localforage.removeItem(k)));
  await localforage.removeItem(ORDER_KEY);
}

export async function clearAllByKeys(keysToRemove: string[]): Promise<void> {
  if (!Array.isArray(keysToRemove) || keysToRemove.length === 0) return;
  await Promise.all(keysToRemove.map((k) => localforage.removeItem(k)));
  // update order map to remove those keys
  await removeKeysFromOrder(keysToRemove);
}

// --------- KeyOrderMap persistence (immediate, small) ----------
export async function getKeyOrderMap(): Promise<KeyOrderMap> {
  const raw = await localforage.getItem<string>(ORDER_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as KeyOrderMap;
  } catch {
    return {};
  }
}

export async function saveKeyOrderMap(map: KeyOrderMap): Promise<void> {
  await localforage.setItem(ORDER_KEY, JSON.stringify(map));
}

export async function setKeyOrderMap(map: KeyOrderMap): Promise<void> {
  await saveKeyOrderMap(map);
}

// append key to last position (if not present)
export async function appendKeyToOrder(key: string): Promise<void> {
  const map = await getKeyOrderMap();
  if (Object.prototype.hasOwnProperty.call(map, key)) return;
  const indices = Object.values(map);
  const last = indices.length ? Math.max(...indices) : -1;
  map[key] = last + 1;
  await saveKeyOrderMap(map);
}

// remove single key and normalize remaining indices 0..n-1
export async function removeKeyFromOrder(key: string): Promise<void> {
  const map = await getKeyOrderMap();
  if (!Object.prototype.hasOwnProperty.call(map, key)) return;
  delete map[key];
  await normalizeKeyOrderMap(map);
}

// remove multiple keys and normalize
export async function removeKeysFromOrder(keys: string[]): Promise<void> {
  const map = await getKeyOrderMap();
  let changed = false;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(map, k)) {
      delete map[k];
      changed = true;
    }
  }
  if (changed) await normalizeKeyOrderMap(map);
}

// reorder a key to a new index (0-based)
export async function reorderKeys(
  key: string,
  newIndex: number
): Promise<void> {
  const map = await getKeyOrderMap();
  if (!Object.prototype.hasOwnProperty.call(map, key)) return;

  // build an ordered array of keys
  const arr = Object.keys(map).sort((a, b) => map[a] - map[b]);

  const from = arr.indexOf(key);
  if (from === -1) return;

  const item = arr.splice(from, 1)[0];
  const safeIndex = Math.max(0, Math.min(newIndex, arr.length));
  arr.splice(safeIndex, 0, item);

  // rebuild map
  const newMap: KeyOrderMap = {};
  arr.forEach((k, idx) => (newMap[k] = idx));
  await saveKeyOrderMap(newMap);
}

// normalize helper: reassign contiguous indices 0..n-1 based on current map order
async function normalizeKeyOrderMap(existingMap: KeyOrderMap): Promise<void> {
  const arr = Object.keys(existingMap).sort(
    (a, b) => existingMap[a] - existingMap[b]
  );
  const newMap: KeyOrderMap = {};
  arr.forEach((k, idx) => (newMap[k] = idx));
  await saveKeyOrderMap(newMap);
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
