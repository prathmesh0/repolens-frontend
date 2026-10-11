'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
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
  // Start in the right state for the viewport so mobile does not flash an open
  // sidebar. This layout only renders after /users/me resolves on the client.
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 768
  );

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
      <div className="flex h-dvh w-full bg-background">
        <Skeleton className="hidden h-full w-[272px] rounded-none md:block" />
        <div className="flex-1 space-y-4 p-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-dvh w-full flex-col items-center justify-center gap-3 bg-background text-foreground">
        <p className="text-sm text-muted-foreground">
          Could not reach the server.
        </p>
        <CustomButton onClick={() => refetch()}>Try again</CustomButton>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

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
            'flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar'
          )}
        >
          <div className="mx-auto h-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
