import { create } from "zustand";
import type { BodyType, EditingType, RawBodyType } from "../types/editor.types";

interface CanvasState {
  displayApiDoc: boolean;
  editing: EditingType;
  bodyType: BodyType;
  rawType: RawBodyType | undefined;

  setDisplayApiDoc: (b: boolean) => void;
  setEditing: (s: EditingType) => void;
  setBodyType: (s: BodyType) => void;
  setRawType: (s: RawBodyType) => void;
}

export const useCanvasState = create<CanvasState>()((set) => ({
  displayApiDoc: false,
  editing: "params",
  bodyType: "none",
  rawType: "JSON",

  setDisplayApiDoc: (b: boolean) => set({ displayApiDoc: b }),
  setEditing: (s: EditingType) => set({ editing: s }),

  setBodyType: (s: BodyType) => set({bodyType: s}),
  setRawType: (s: RawBodyType) => set({rawType: s})
}));
