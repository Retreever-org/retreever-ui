import { useEffect } from "react";
import { getEnvironment } from "../api/services/get-environment-config";
import { ping } from "../api/services/ping";

import { envStorage } from "../storage/env-storage";
import { envInstanceStorage } from "../storage/env-instance-storage";

import { useEnvVarsStore } from "../stores/env-vars-store";
import { useEnvInstanceStore } from "../stores/env-instance-store";
import type { Environment, ResolvedVariable } from "../types/env.types";

export const useEnvInitializer = () => {
  const setVars = useEnvVarsStore((s) => s.setVars);
  const setEnvInstance = useEnvInstanceStore((s) => s.setEnv);

  useEffect(() => {
    const controller = new AbortController();

    const initialize = async () => {
      const localSnapshot = await envStorage.getAll();

      if (localSnapshot.length > 0) {
        setVars(localSnapshot);
      }

      try {
        const cached = await envInstanceStorage.get();

        if (cached) {
          setEnvInstance(cached.instance);

          const merged = mergeEnvVars(cached.instance, localSnapshot);
          setVars(merged);

          validateEnvCache(cached, controller.signal);
          return;
        }

        const env = await getEnvironment();
        const pong = await ping();

        await envInstanceStorage.save(env, pong.uptime);
        setEnvInstance(env);

        const merged = mergeEnvVars(env, localSnapshot);
        setVars(merged);
      } catch (err) {
        console.error("Env initializer failed:", err);

        const cached = await envInstanceStorage.get();
        if (cached) {
          setEnvInstance(cached.instance);
          const merged = mergeEnvVars(cached.instance, localSnapshot);
          setVars(merged);
        }
      }
    };

    initialize();
    return () => controller.abort();
  }, [setEnvInstance, setVars]);
};

const mergeEnvVars = (
  serverEnv: Environment,
  localDB: ResolvedVariable[]
): ResolvedVariable[] => {
  const result: ResolvedVariable[] = [];
  const localByName = new Map<string, ResolvedVariable>();

  for (const lv of localDB) {
    if (lv.name) {
      localByName.set(lv.name, lv);
    }
  }

  for (const sv of serverEnv.variables) {
    const name = sv.name;
    const serverValue = sv.source.value ?? null;
    const localVar = localByName.get(name);

    const isStatic = sv.source.value !== null;

    result.push({
      id: "", // ← store will assign
      name,
      value: isStatic ? serverValue : localVar?.value ?? serverValue,
      editable: !isStatic,
      local: false,
    });

    localByName.delete(name);
  }

  for (const lv of localByName.values()) {
    result.push({
      id: "",
      name: lv.name,
      value: lv.value ?? null,
      editable: true,
      local: true,
    });
  }

  return result;
};

export const validateEnvCache = async (
  cached: { instance: Environment; uptime: string } | null,
  signal: AbortSignal
) => {
  try {
    const pong = await ping();
    if (signal.aborted) return;

    if (pong.uptime !== cached?.uptime) {
      const freshEnv = await getEnvironment();
      await envInstanceStorage.save(freshEnv, pong.uptime);

      useEnvInstanceStore.getState().setEnv(freshEnv);

      const localDB = await envStorage.getAll();
      const merged = mergeEnvVars(freshEnv, localDB);
      useEnvVarsStore.getState().setVars(merged);
    }
  } catch (err: any) {
    if (err?.name === "AbortError") return;
    console.warn("Env validation failed:", err);
  }
};
