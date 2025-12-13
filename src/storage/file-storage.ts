import localforage from "localforage";

/* -------------------- Storage Instance -------------------- */

const fileStore = localforage.createInstance({
  name: "retreever-tabs",
  storeName: "images",
});

/* ------------------------ Helpers ------------------------- */

const generateId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/* -------------------------- API -------------------------- */

/**
 * Upload a file blob into IndexedDB.
 * Returns the generated file id.
 */
export async function uploadFile(blob: Blob): Promise<string> {
  const id = generateId();
  await fileStore.setItem(id, blob);
  return id;
}

/**
 * Retrieve a file blob by id.
 */
export async function getFile(id: string): Promise<Blob | null> {
  return (await fileStore.getItem<Blob>(id)) ?? null;
}

/**
 * Delete a specific file by id.
 */
export async function deleteFile(id: string): Promise<void> {
  await fileStore.removeItem(id);
}

/**
 * Delete all files except the given id.
 */
export async function deleteOtherFiles(id: string): Promise<void> {
  const keys = await fileStore.keys();
  await Promise.all(
    keys
      .filter((k) => k !== id)
      .map((k) => fileStore.removeItem(k))
  );
}

/**
 * Delete all stored files.
 */
export async function deleteAllFiles(): Promise<void> {
  await fileStore.clear();
}
