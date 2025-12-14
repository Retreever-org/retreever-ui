import { create } from "zustand";
import type { ResolvedVariable } from "../types/env.types";

const uuid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

/* ---------- helpers ---------- */

export const isVariableEmpty = (v: ResolvedVariable): boolean =>
  (!v.name || v.name.trim() === "") && (!v.value || v.value.trim() === "");

const normalize = (vars: ResolvedVariable[]): ResolvedVariable[] => {
  const withIds = vars.map((v) => ({
    ...v,
    id: v.id == null || v.id === "" ? uuid() : v.id,
  }));

  return addTrailingRowIfNeeded(withIds);
};

const addTrailingRowIfNeeded = (vars: ResolvedVariable[]): ResolvedVariable[] => {
  const hasEmpty = vars.some(isVariableEmpty);
  if (hasEmpty) return vars;

  return [
    ...vars,
    {
      id: uuid(),
      name: "",
      value: "",
      editable: true,
      local: true,
    },
  ];
}

/* ---------- store ---------- */

interface EnvVarsState {
  vars: ResolvedVariable[];

  setVars: (vars: ResolvedVariable[]) => void;
  updateValue: (id: string, value: string) => void;
  updateKey: (id: string, name: string) => void;
  addVar: (entry?: Partial<ResolvedVariable>) => void;
  deleteVar: (id: string) => void;
}

export const useEnvVarsStore = create<EnvVarsState>((set, get) => ({
  vars: normalize([]),

  setVars: (vars) => {
    set({ vars: normalize(vars) });
  },

  updateValue: (id, value) => {
    set((state) => ({
      vars: state.vars.map((v) => (v.id === id ? { ...v, value } : v)),
    }));
    set({ vars: addTrailingRowIfNeeded(get().vars) });
  },

  updateKey: (id, name) => {
    set((state) => ({
      vars: state.vars.map((v) => (v.id === id ? { ...v, name } : v)),
    }));
    set({ vars: addTrailingRowIfNeeded(get().vars) });
  },

  addVar: (entry) => {
    const next = [
      ...get().vars,
      {
        id: uuid(),
        name: entry?.name ?? "",
        value: entry?.value ?? "",
        editable: entry?.editable ?? true,
        local: entry?.local ?? true,
      },
    ];
    set({ vars: normalize(next) });
  },

  deleteVar: (id) => {
    const next = get().vars.filter((v) => v.id !== id);
    set({ vars: normalize(next) });
  },
}));
