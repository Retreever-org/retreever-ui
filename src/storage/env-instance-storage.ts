import localForage from "localforage";
import type { Environment } from "../types/env.types";

export interface CachedEnvironment {
  instance: Environment;
  uptime: string; // from ping response
}

const envInstanceStore = localForage.createInstance({
  name: "retreever-env-instance",
  storeName: "env_instance",
});

export const envInstanceStorage = {
  save: async (env: Environment, uptime: string): Promise<void> => {
    const payload: CachedEnvironment = { instance: env, uptime };
    await envInstanceStore.setItem("env", payload);
  },

  get: async (): Promise<CachedEnvironment | null> => {
    return envInstanceStore.getItem("env");
  },

  clear: async (): Promise<void> => {
    await envInstanceStore.clear();
  },
};
