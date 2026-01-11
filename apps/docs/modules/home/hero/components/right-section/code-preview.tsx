import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import useMeasure from 'react-use-measure';

import { TrafficLightsIcon } from '@/components/icons/traffic-light-icon';
import { CodeTabs } from './code-tabs';
import { useCodeTabsStore } from '../../config/code-tabs-store';
import { CopyButton } from './copy-button';
import { CodeDisplay } from './code-display';

export const CodePreview = () => {
  const [ref, { height }] = useMeasure();

  const { code } = useCodeTabsStore();

  return (
    <AnimatePresence initial={false}>
      <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
        <motion.div
          animate={{ height: height > 0 ? height : undefined }}
          className="relative overflow-hidden rounded-sm border border-border"
        >
          <div ref={ref}>
            <div className="absolute -top-px left-0 right-0 h-px" />
            <div className="absolute -bottom-px left-11 right-20 h-px" />
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between">
                <TrafficLightsIcon className="stroke-slate-500/30 h-2.5 w-auto" />
                <CopyButton code={code} />
              </div>
              <CodeTabs />

              <div className="flex flex-col items-start px-1 text-sm">
                <CodeDisplay />
              </div>
            </div>
          </div>
        </motion.div>
      </MotionConfig>
    </AnimatePresence>
  );
};
