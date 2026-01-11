import React, { useState } from 'react';

import { Copy, Check } from 'lucide-react';

interface Props {
  code: string;
}

export const CopyButton = ({ code }: Props) => {
  const [copyState, setCopyState] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyState(true);
      setTimeout(() => {
        setCopyState(false);
      }, 2000);
    });
  };
  return (
    <div className="absolute top-2 right-4">
      <button
        className="absolute w-5 border-none bg-transparent h-5 top-2 right-0 cursor-pointer"
        onClick={() => copyToClipboard(code)}
      >
        {copyState ? (
          <Check className="h-3 w-3" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
        <span className="sr-only">Copy code</span>
      </button>
    </div>
  );
};
