import { create } from 'zustand';
import { Tab } from './types';
import { tabs } from './constants';

interface CodeTabsState {
  code: string;
  setCode: (code: string) => void;
  currentTab: Tab;
  setCurrentTab: (tab: Tab) => void;
}

export const useCodeTabsStore = create<CodeTabsState>((set) => ({
  currentTab: 'prayer-times.ts',
  setCurrentTab: (tab: Tab) => set({ currentTab: tab }),
  code: tabs[0].code,
  setCode: (code: string) => set({ code }),
}));
