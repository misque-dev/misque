import { Moon } from 'lucide-react';
import React from 'react';

export const LabelBadge = () => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-1 mt-2">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-green-500" />
          <span className="text-xs text-muted-foreground font-mono">
            Islamic Libraries for JavaScript
          </span>
        </div>
      </div>
    </div>
  );
};
