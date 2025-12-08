import { create } from "zustand";

interface RightPanelState {
  open: boolean;
  content: React.ReactNode | null;
  width: number;
  panelName: string | null;

  openPanel: (content: React.ReactNode, panelName: string) => void;
  closePanel: () => void;
  setWidth: (w: number) => void;
}

export const useRightPanelStore = create<RightPanelState>((set) => ({
  open: false,
  content: null,
  width: 360,
  panelName: null,

  openPanel: (content, panelName) => set({ open: true, content, panelName: panelName }),
  closePanel: () => set({ open: false, panelName: null }),
  setWidth: (width) => set({ width }),
}));
