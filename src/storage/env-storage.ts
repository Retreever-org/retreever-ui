import localForage from "localforage";
import type { ResolvedVariable } from "../types/env.types";

const envStore = localForage.createInstance({
  name: "retreever-env-store",
  storeName: "envVars",
});

const STORAGE_KEY = "envVars:list";

export const envStorage = {
  // Save whole list (already filtered/normalized by caller)
  saveAll: async (vars: ResolvedVariable[]): Promise<void> => {
    await envStore.setItem<ResolvedVariable[]>(STORAGE_KEY, vars);
  },

  // Load whole list
  getAll: async (): Promise<ResolvedVariable[]> => {
    const stored = await envStore.getItem<ResolvedVariable[]>(STORAGE_KEY);
    return stored ?? [];
  },

  clear: async (): Promise<void> => {
    await envStore.removeItem(STORAGE_KEY);
  },
};
