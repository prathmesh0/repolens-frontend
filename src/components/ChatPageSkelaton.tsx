'use client';

import { Skeleton } from './ui/skeleton';

export function ChatPageSkeleton() {
  return (
    <main className="h-full w-full flex flex-col bg-background text-foreground px-4 py-8">
      {/* Chat messages scroll area skeleton */}
      <section className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-4 md:p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="max-w-[80%] rounded-2xl shadow-sm p-3 bg-muted animate-pulse"
            style={{ minHeight: '56px' }}
          >
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </section>

      {/* Chat actions bar skeleton */}
      <div className="sticky bottom-0 left-0 right-0 bg-background px-4 py-2 flex flex-wrap gap-2 items-center justify-start animate-pulse">
        {['Basic Analysis', 'Get File Structure', 'AI Analysis'].map((_, i) => (
          <Skeleton key={i} className="rounded-full h-8 w-24 sm:w-28" />
        ))}
      </div>

      {/* Chat input skeleton */}
      <div className="px-4 pb-4 pt-2 animate-pulse">
        <Skeleton className="w-full h-12 rounded-xl" />
      </div>
    </main>
  );
}
