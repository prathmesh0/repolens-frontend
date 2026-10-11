'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import CustomButton from '@/components/CustomButton';
import { Skeleton } from '@/components/ui/skeleton';
import { ApiError } from '@/lib/apiMethods';
import { useMe } from '@/lib/useMe';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isPending, isError, error, refetch } = useMe();
  // Anything but a transient failure (network, 5xx) means "not logged in"
  const transient = error instanceof ApiError && error.status >= 500;
  const loggedOut = isError && !transient;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (loggedOut) router.replace('/login');
  }, [loggedOut, router]);

  if (isPending || loggedOut) {
    return (
      <div className="flex h-screen w-full bg-background">
        <Skeleton className="h-full w-64 hidden md:block rounded-none" />
        <div className="flex-1 p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          Could not reach the server.
        </p>
        <CustomButton onClick={() => refetch()}>Try again</CustomButton>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full w-full min-w-0">
        {/* Header */}
        <Header
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isMobile={isMobile}
        />

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden px-4 hide-scrollbar'
          )}
        >
          <div className="h-full max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
