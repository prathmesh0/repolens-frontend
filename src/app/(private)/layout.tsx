'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 h-full">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 p-4',
            sidebarOpen ? 'ml-0 md:ml-0' : 'ml-0'
          )}
        >
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
