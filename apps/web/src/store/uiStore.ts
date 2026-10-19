import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "light";
  activeModal: string | null;

  toggleSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "light",
  activeModal: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  openModal: (id: string) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
