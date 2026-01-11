import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from 'next-themes';

import { motion } from 'framer-motion';
import { useCodeTabsStore } from '../../config/code-tabs-store';
import { cn } from '@misque/ui/lib/utils';

export const CodeDisplay = () => {
  const { resolvedTheme } = useTheme();
  const { currentTab, code } = useCodeTabsStore();

  return (
    <div className="w-full overflow-x-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        key={currentTab}
        className="relative flex items-center px-1 text-sm min-w-max"
      >
        <div
          aria-hidden="true"
          className="border-slate-300/5 text-slate-600 select-none border-r pr-4 font-mono"
        >
          {Array.from({
            length: code.split('\n').length,
          }).map((_, index) => (
            <div key={index}>
              {(index + 1).toString().padStart(2, '0')}
              <br />
            </div>
          ))}
        </div>
        <Highlight
          key={resolvedTheme}
          code={code}
          language={'typescript'}
          theme={{
            ...themes.duotoneDark,
            plain: {
              backgroundColor: 'transparent',
            },
          }}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={cn(className)} style={style}>
              <code className="px-4 font-mono whitespace-pre">
                {tokens.map((line, lineIndex) => (
                  <div key={lineIndex} {...getLineProps({ line })}>
                    {line.map((token, tokenIndex) => (
                      <span key={tokenIndex} {...getTokenProps({ token })} />
                    ))}
                  </div>
                ))}
              </code>
            </pre>
          )}
        </Highlight>
      </motion.div>
    </div>
  );
};
