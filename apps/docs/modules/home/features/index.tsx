import React from 'react';
import { features } from '@/modules/home/features/config/constants';
import { FeatureCard } from '@/modules/home/features/components/feature-card';

export const Features = () => {
  return (
    <section className="relative w-full px-4 mx-auto max-w-5xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border ">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={index}
            totalItems={features.length}
          />
        ))}
      </div>
    </section>
  );
};
