'use client';

import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

import CustomInput from './CustomInput';
import { usePathname, useRouter } from 'next/navigation';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { User } from '@/api/services';
import { RepoHistoryItem } from '@/types/repo';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';
import { spring } from '@/lib/motion';

interface ISidebar {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const WIDTH_OPEN = 272;
const WIDTH_RAIL = 68;

function Sidebar({ isOpen, isMobile, toggleSidebar }: ISidebar) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const pathname = usePathname();

  // Update activeChatId based on current path
  useEffect(() => {
    const match = pathname.match(/^\/chat\/([^\/]+)$/);
    if (match) {
      setActiveChatId(match[1]);
    } else {
      setActiveChatId(null); // clear highlight when not on chat route
    }
  }, [pathname]);

  const {
    data: repoHistoryResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['repoHistory', debouncedTerm],
    queryFn: async () => {
      const res = await User.getRepoHistory(debouncedTerm || '');
      return res?.data || [];
    },
    placeholderData: keepPreviousData,
  });

  const repoHistory: RepoHistoryItem[] = repoHistoryResponse || [];

  // Debounce the search term; the query key follows the debounced value
  useEffect(() => {
    const delay = setTimeout(() => setDebouncedTerm(searchTerm), 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleNavClick = (id: string) => {
    if (id === 'new') {
      if (isMobile) toggleSidebar();
      router.push('/home');
    } else if (id === 'search') {
      if (!isOpen) {
        toggleSidebar(); // open sidebar first
        setShowSearch(true); // show search input
      } else {
        setShowSearch((prev) => !prev); // toggle search input
      }
    }
  };

  const handleChatClick = (repo: RepoHistoryItem) => {
    setActiveChatId(repo.repoId);
    if (isMobile) {
      toggleSidebar();
    }
    router.push(`/chat/${repo.repoId}`);
  };

  // Desktop: width animates between full and icon rail.
  // Mobile: fixed drawer that slides in from the left.
  const animate = isMobile
    ? { x: isOpen ? 0 : '-100%', width: WIDTH_OPEN }
    : { x: 0, width: isOpen ? WIDTH_OPEN : WIDTH_RAIL };

  const expanded = isOpen;

  return (
    <motion.aside
      initial={false}
      animate={animate}
      transition={spring}
      className={cn(
        'flex h-full flex-col border-r border-border bg-sidebar',
        isMobile
          ? 'fixed inset-y-0 left-0 z-40 shadow-xl'
          : 'relative shrink-0 overflow-hidden'
      )}
      aria-label="Sidebar"
    >
      {/* Top: logo + collapse toggle */}
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        {expanded ? (
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ring-1 ring-border">
              <Image
                src="/favicon.ico"
                alt="Repolens"
                width={20}
                height={20}
              />
            </div>
            <span className="truncate text-[15px] font-semibold tracking-tight">
              Repolens
            </span>
          </div>
        ) : null}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSidebar}
            className={cn(
              'text-muted-foreground hover:text-foreground',
              !expanded && 'mx-auto'
            )}
            aria-label={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {expanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Actions + history */}
      <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden p-3">
        <Button
          onClick={() => handleNavClick('new')}
          className={cn(
            'w-full justify-start gap-2',
            !expanded && 'justify-center px-0'
          )}
          title="New analysis"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {expanded && <span>New analysis</span>}
        </Button>

        <Button
          variant="ghost"
          onClick={() => handleNavClick('search')}
          className={cn(
            'w-full justify-start gap-2 text-muted-foreground hover:text-foreground',
            !expanded && 'justify-center px-0'
          )}
          title="Search chats"
        >
          <Search className="h-4 w-4 shrink-0" />
          {expanded && <span>Search chats</span>}
        </Button>

        {showSearch && expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-0.5 pb-1"
          >
            <CustomInput
              placeholder="Search chats..."
              onStartIcon={<Search size={16} />}
              className="py-1.5 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </motion.div>
        )}

        {expanded && (
          <p className="px-2 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent
          </p>
        )}
        {!expanded && <div className="my-2 h-px bg-border" />}

        {isLoading ? (
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-2">
                <Skeleton className="h-4 w-4 shrink-0 rounded" />
                {expanded && <Skeleton className="h-4 w-32" />}
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="py-2 text-center text-sm text-destructive">
            Failed to load repo history.
          </p>
        ) : repoHistory.length === 0 ? (
          <p className="py-2 text-center text-sm text-muted-foreground">
            {expanded ? 'No repositories found.' : '-'}
          </p>
        ) : (
          <ul className="space-y-0.5">
            {repoHistory.map((repo) => {
              const active = activeChatId === repo.repoId;
              return (
                <li key={repo.repoId}>
                  <button
                    type="button"
                    onClick={() => handleChatClick(repo)}
                    title={repo.repoName}
                    className={cn(
                      'relative flex h-9 w-full items-center gap-2 rounded-lg px-2.5 text-left text-sm transition-colors duration-150',
                      active
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                      !expanded && 'justify-center px-0'
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="sidebar-active"
                        transition={spring}
                        className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                      />
                    )}
                    <MessageSquare className="h-4 w-4 shrink-0" />
                    {expanded && (
                      <span className="block min-w-0 flex-1 truncate">
                        {repo.repoName}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </motion.aside>
  );
}

export default Sidebar;
