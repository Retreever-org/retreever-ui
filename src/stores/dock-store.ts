import { create } from "zustand";

interface DockState {
  open: boolean;
  x: number;
  y: number;
  width: number;
  height: number;

  hasMoved: boolean; // <--- FLAG

  openDock: () => void;
  closeDock: () => void;
  toggleDock: () => void;

  setPosition: (x: number, y: number) => void;
  setSize: (width: number, height: number) => void;
}

export const useDockStore = create<DockState>((set) => ({
  open: false,
  x: 260,
  y: 60,
  width: 580,
  height: 700,

  hasMoved: false, // <--- INIT

  openDock: () =>
    set((s) => {
      // If user never moved it → center it ONCE
      if (!s.hasMoved) {
        const x = (window.innerWidth - s.width) / 2;
        const y = (window.innerHeight - s.height) / 2;

        return { open: true, x, y };
      }

      // Otherwise just open without changing position
      return { open: true };
    }),

  closeDock: () => set({ open: false }),

  toggleDock: () =>
    set((s) => {
      // If opening and not moved → center once
      if (!s.open && !s.hasMoved) {
        const x = (window.innerWidth - s.width) / 2;
        const y = (window.innerHeight - s.height) / 2;

        return { open: true, x, y };
      }
      return { open: !s.open };
    }),

  setPosition: (x, y) =>
    set({
      x,
      y,
      hasMoved: true, // <--- once user drags, never re-center again
    }),

  setSize: (width, height) => set({ width, height }),
}));
