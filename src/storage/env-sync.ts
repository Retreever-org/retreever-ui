// storage/env-sync.ts
import { useEnvVarsStore, isVariableEmpty } from "../stores/env-vars-store";
import { envStorage } from "./env-storage";
import type { ResolvedVariable } from "../types/env.types";

// subscribe to the whole state, then pick vars inside
useEnvVarsStore.subscribe(async (state) => {
  const vars: ResolvedVariable[] = state.vars;
  const cleaned = vars.filter((v) => !isVariableEmpty(v));
  await envStorage.saveAll(cleaned);
});
