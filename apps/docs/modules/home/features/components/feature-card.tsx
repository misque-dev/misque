import { Feature } from '@/modules/home/features/config/types';
import { cn } from '@misque/ui/lib/utils';
import { ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';

interface Props {
  feature: Feature;
  index: number;
  totalItems: number;
}

export const FeatureCard = ({ feature, index, totalItems }: Props) => {
  const Icon = feature.icon;

  return (
    <div
      key={feature.id}
      className={cn(
        'relative p-6 md:p-8 group hover:bg-muted/30 transition-colors duration-200 flex flex-col h-full',
        // Small screens: bottom border for all except last (only on small screens)
        index < totalItems - 1 && 'border-b md:border-b-0 ',
        // Medium screens: right border for all even indices (left column), bottom border for first 2 rows
        index % 2 === 0 && index < totalItems - 1 && 'md:border-r ',
        index < 4 && 'md:border-b ',
        // Large screens: right border for all except last in row, bottom border for first row
        index % 3 !== 2 && 'lg:border-r ',
        index < 3 && 'lg:border-b '
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center justify-center ">
          <Icon className={cn(feature.iconColor, 'w-4 h-4')} />
        </div>
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {feature.label}
        </span>
      </div>

      <h3
        className="text-xl font-medium text-primary dark:text-zinc-100 mb-2"
        dangerouslySetInnerHTML={{ __html: feature.title }}
      />

      <p className="text-sm text-muted-foreground mb-4 flex-1">
        {feature.description}
      </p>

      <Link
        href={feature.href}
        className="inline-flex items-center text-sm text-blue-500 hover:text-blue-500/80 transition-colors group-hover:underline mt-auto"
      >
        Learn more
        <ChevronRightIcon className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5 text-blue-500" />
      </Link>
    </div>
  );
};
