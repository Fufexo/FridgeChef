'use client';

import { isWideCard } from '@/lib/utils';

export default function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse"
        >
          <div className={`rounded-3xl bg-surface-container ${isWideCard(i) ? 'aspect-video' : 'aspect-square'} mb-3`} />
          <div className="h-4 bg-surface-container rounded-full w-3/4 mb-3" />
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 bg-surface-container rounded-full" />
            <div className="h-5 w-20 bg-surface-container rounded-full" />
          </div>
          <div className="h-3 bg-surface-container rounded-full w-full mb-2" />
          <div className="h-3 bg-surface-container rounded-full w-4/5" />
        </div>
      ))}
    </div>
  );
}
