'use client';
import { Skeleton } from './ui/skeleton';

// Page Skeleton Loader
export function PageSkeleton() {
  return (
    <main className="h-full w-full flex flex-col items-center justify-between bg-background text-foreground px-4 py-8">
      {/* Hero Section Skeleton */}
      <section className="flex flex-col items-center text-center mt-12 sm:mt-16 md:mt-20 mb-8 sm:mb-10 space-y-4 sm:space-y-6 max-w-4xl w-full">
        <Skeleton className="h-12 sm:h-14 md:h-16 w-3/4 sm:w-2/3" />
        <Skeleton className="h-4 sm:h-5 w-full max-w-2xl" />
        <Skeleton className="h-4 sm:h-5 w-5/6 max-w-xl" />
      </section>

      {/* Input Section Skeleton */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 sm:mt-6 mb-12 sm:mb-16 md:mb-20 w-full max-w-md">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full sm:w-32" />
      </div>

      {/* Features Section Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-12 sm:mb-16 md:mb-20 max-w-6xl w-full">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6"
          >
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </section>

      {/* Footer Skeleton */}
      <div className="w-full text-center py-6 border-t border-border">
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>
    </main>
  );
}
