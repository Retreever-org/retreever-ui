import { create } from "zustand";
import type { ResolvedVariable } from "../types/env.types";

export interface EnvVarsState {
  vars: ResolvedVariable[];

  setVars: (vars: ResolvedVariable[]) => void;
  updateValue: (name: string, value: string) => void;
  updateKey: (oldName: string, newName: string) => void;
  addVar: (entry?: Partial<ResolvedVariable>) => void;
  deleteVar: (name: string | null) => void;
}

// empty = both missing/blank
export const isVariableEmpty = (v: ResolvedVariable): boolean =>
  (!v.name || v.name.trim() === "") && (!v.value || v.value.trim() === "");

// ensure at least one empty variable in the list
const ensureTrailingEmpty = (vars: ResolvedVariable[]): ResolvedVariable[] => {
  const hasEmpty = vars.some(isVariableEmpty);
  if (hasEmpty) return vars;

  return [
    ...vars,
    {
      name: "",
      value: "",
      editable: true,
      local: true,
    },
  ];
};

export const useEnvVarsStore = create<EnvVarsState>((set, get) => ({
  vars: ensureTrailingEmpty([]),

  setVars: (vars) => {
    set({ vars: ensureTrailingEmpty(vars) });
  },

  updateValue: (name, value) => {
    const { vars } = get();
    const next = vars.map((v) => (v.name === name ? { ...v, value } : v));
    set({ vars: ensureTrailingEmpty(next) });
  },

  updateKey: (oldName, newName) => {
    const { vars } = get();
    const next = vars.map((v) =>
      v.name === oldName ? { ...v, name: newName } : v
    );
    set({ vars: ensureTrailingEmpty(next) });
  },

  addVar: (entry) => {
    const { vars } = get();
    const next: ResolvedVariable[] = [
      ...vars,
      {
        name: entry?.name ?? "",
        value: entry?.value ?? "",
        editable: entry?.editable ?? true,
        local: entry?.local ?? true, // ← use entry.local, default true
      },
    ];
    set({ vars: ensureTrailingEmpty(next) });
  },

  deleteVar: (name) => {
    const { vars } = get();
    const filtered = vars.filter((v) => v.name !== name);
    set({ vars: ensureTrailingEmpty(filtered) });
  },
}));
