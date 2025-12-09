import { useEffect } from "react";
import { getEnvironment } from "../api/services/get-environment-config";
import { ping } from "../api/services/ping";

import { envStorage } from "../storage/env-storage";
import { envInstanceStorage } from "../storage/env-instance-storage";

import { useEnvVarsStore, isVariableEmpty } from "../stores/env-vars-store";
import { useEnvInstanceStore } from "../stores/env-instance-store";
import type { Environment, ResolvedVariable } from "../types/env.types";

export const useEnvInitializer = () => {
  const setVars = useEnvVarsStore((s) => s.setVars);
  const setEnvInstance = useEnvInstanceStore((s) => s.setEnv);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    const initialize = async () => {
      // 1. Offline-first: hydrate from DB snapshot as-is
      const localSnapshot = await envStorage.getAll();
      if (localSnapshot.length > 0) {
        setVars(localSnapshot);
      }

      try {
        // 2. Try to use cached server instance, if any
        const cached = await envInstanceStorage.get();

        if (cached && !aborted) {
          setEnvInstance(cached.instance);

          const merged = mergeEnvVars(cached.instance, localSnapshot);
          setVars(merged);

          // Background validation against live server
          validateCache(cached, controller.signal);
          return;
        }

        // 3. No cached instance → try fetching fresh from backend
        const env = await getEnvironment();
        const pong = await ping(); // uptime string

        if (aborted) return;

        await envInstanceStorage.save(env, pong.uptime);
        setEnvInstance(env);

        const merged = mergeEnvVars(env, localSnapshot);
        setVars(merged);
      } catch (err) {
        console.error("Env initializer failed:", err);

        if (aborted) return;

        // 4. If network failed but we have no cached instance,
        //    we already hydrated from DB in step 1.
        const cached = await envInstanceStorage.get();
        if (cached) {
          setEnvInstance(cached.instance);
          const merged = mergeEnvVars(cached.instance, localSnapshot);
          setVars(merged);
        }
      }
    };

    initialize();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [setEnvInstance, setVars]);
};

// ----------------- MERGING LOGIC -----------------
const mergeEnvVars = (
  serverEnv: Environment,
  localDB: ResolvedVariable[]
): ResolvedVariable[] => {
  const result: ResolvedVariable[] = [];
  const serverVars = serverEnv.variables;

  // Index local DB by name
  const localByName = new Map<string, ResolvedVariable>();
  for (const lv of localDB) {
    if (!lv.name) continue; // ignore empties/invalid
    localByName.set(lv.name, lv);
  }

  // 1. SERVER VARIABLES (authoritative key set for server-owned vars)
  for (const sv of serverVars) {
    const name = sv.name;
    const serverValue = sv.source.value ?? null;
    const localVar = localByName.get(name);

    const isStatic = sv.source.value !== null;

    // If static → always take server value.
    // If dynamic → prefer local override, else server value/null.
    const finalValue: string | null = isStatic
      ? serverValue
      : (localVar?.value ?? serverValue);

    result.push({
      name,
      value: finalValue,
      editable: !isStatic, // dynamic can be edited
      local: false,        // server-configured
    });

    // server var consumed; remove from localByName so only pure locals remain
    if (localVar) {
      localByName.delete(name);
    }
  }

  // 2. PURE LOCAL VARIABLES (not in server schema)
  for (const [, lv] of localByName) {
    if (!lv.name) continue;

    result.push({
      name: lv.name,
      value: lv.value ?? null,
      editable: true,
      local: true,
    });
  }

  // 3. ENSURE ONE EMPTY LOCAL ROW
  const hasEmpty = result.some((v) => isVariableEmpty(v));
  if (!hasEmpty) {
    result.push({
      name: null,
      value: null,
      editable: true,
      local: true,
    });
  }

  return result;
};

// ----------------- VALIDATION LAYER -----------------
const validateCache = async (
  cached: { instance: Environment; uptime: string },
  signal: AbortSignal
) => {
  try {
    const pong = await ping();
    if (signal.aborted) return;

    if (pong.uptime !== cached.uptime) {
      // server config changed
      const freshEnv = await getEnvironment();
      await envInstanceStorage.save(freshEnv, pong.uptime);
      useEnvInstanceStore.getState().setEnv(freshEnv);

      const localDB = await envStorage.getAll();
      const merged = mergeEnvVars(freshEnv, localDB);
      useEnvVarsStore.getState().setVars(merged);
    }
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "name" in err &&
      (err as any).name === "AbortError"
    ) {
      return;
    }
    console.warn("Env validation failed:", err);
  }
};
