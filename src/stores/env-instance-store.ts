import { create } from "zustand";
import type { Environment } from "../types/env.types";

interface EnvInstanceState {
  env: Environment | null;
  setEnv: (env: Environment) => void;
}

export const useEnvInstanceStore = create<EnvInstanceState>()((set) => ({
  env: null,
  setEnv: (env) => set({ env }),
}));

export const useEnvInstance = () => useEnvInstanceStore((s) => s.env);
