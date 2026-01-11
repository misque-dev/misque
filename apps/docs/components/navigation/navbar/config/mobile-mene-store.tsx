import { create } from 'zustand';

interface Props {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useMobileMenuStore = create<Props>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen }),
}));
