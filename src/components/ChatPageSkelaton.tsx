'use client';

import { Skeleton } from './ui/skeleton';

export function ChatPageSkeleton() {
  return (
    <main className="flex h-full w-full flex-col bg-background text-foreground">
      {/* Conversation */}
      <section className="flex-1 overflow-hidden">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-3 py-6 sm:px-4">
          {/* assistant */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
          {/* user */}
          <div className="flex justify-end">
            <Skeleton className="h-10 w-2/5 rounded-2xl" />
          </div>
          {/* assistant */}
          <div className="flex items-start gap-3">
            <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </section>

      {/* Actions + input */}
      <div className="mx-auto w-full max-w-3xl space-y-3 px-3 pb-4 sm:px-4">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-14 w-full rounded-2xl" />
      </div>
    </main>
  );
}
