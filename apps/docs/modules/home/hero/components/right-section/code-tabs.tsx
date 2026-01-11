import React from 'react';
import { tabs } from '../../config/constants';
import { useCodeTabsStore } from '../../config/code-tabs-store';
import { motion } from 'framer-motion';
import { cn } from '@misque/ui/lib/utils';
import { Tab } from '../../config/types';

export const CodeTabs = () => {
  const { currentTab, setCurrentTab, setCode } = useCodeTabsStore();

  const handleTabClick = (tabName: Tab) => {
    setCurrentTab(tabName);
    setCode(tabs.find((tab) => tab.name === tabName)?.code ?? '');
  };

  return (
    <div className="mt-4 flex space-x-2 text-xs">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          onClick={() => handleTabClick(tab.name)}
          className={cn(
            'relative isolate flex h-6 cursor-pointer items-center justify-center rounded-none px-2.5',
            currentTab === tab.name ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {tab.name}
          {tab.name === currentTab && (
            <motion.div
              layoutId="tab-code-preview"
              className="bg-muted dark:bg-sidebar absolute inset-0 -z-10 rounded-none"
            />
          )}
        </button>
      ))}
    </div>
  );
};
