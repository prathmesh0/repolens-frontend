import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

import CustomInput from './CustomInput';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/api/services';
import { RepoHistoryItem } from '@/types/repo';
import { Skeleton } from './ui/skeleton';
import Image from 'next/image';

interface ISidebar {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, isMobile, toggleSidebar }: ISidebar) {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
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
    refetch,
  } = useQuery({
    queryKey: ['repoHistory', searchTerm],
    queryFn: async () => {
      const res = await User.getRepoHistory(searchTerm || '');
      return res?.data || [];
    },
  });

  const repoHistory: RepoHistoryItem[] = repoHistoryResponse || [];

  // ✅ Handle search debounce
  useEffect(() => {
    const delay = setTimeout(() => {
      refetch();
    }, 400); // debounce for 400ms
    return () => clearTimeout(delay);
  }, [searchTerm, refetch]);

  const handleNavClick = (id: string) => {
    if (id === 'new') {
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
    console.log('RepoId in Sidebar', repo.repoId);
    setActiveChatId(repo.repoId);
    if (isMobile) {
      toggleSidebar();
    }
    router.push(`/chat/${repo.repoId}`);
  };

  return (
    <aside
      className={cn(
        `${isMobile} ? 'fixed' : 'relative'`,
        ' h-full bg-card border-r border-border transition-all duration-300 flex flex-col',
        isOpen ? 'w-64' : isMobile ? 'w-0' : 'w-16',
        !isOpen && isMobile ? 'invisible' : 'visible'
      )}
    >
      {/* Top section */}
      <div className="flex items-center justify-between px-2 h-[60.5px] border-b border-border bg-card sticky top-0 z-10 min-w-0">
        {isOpen ? (
          <div
            className="flex items-center justify-center w-10 h-10 rounded-md bg-muted p-1"
            title="Repolens"
          >
            <Image
              src="/favicon.ico" // serve the favicon from your public folder root
              alt="Repolens Favicon"
              width={32}
              height={32}
            />
          </div>
        ) : null}

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-muted min-w-[40px] flex justify-center"
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation + Chat History */}
      <div
        className={cn(
          'p-3 flex-1 overflow-y-auto space-y-2 custom-scrollbar',
          !isOpen ? 'overflow-hidden' : ''
        )}
      >
        {/* Navigation options */}
        <div className="space-y-1">
          {/* Nav Items */}
          {[
            { id: 'new', name: 'New Chat', icon: <Plus className="h-4 w-4" /> },
            {
              id: 'search',
              name: 'Search Chats',
              icon: <Search className="h-4 w-4" />,
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200',
                'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={!isOpen ? item.name : ''}
            >
              {item.icon}
              {isOpen && <span>{item.name}</span>}
            </div>
          ))}

          {/* Search Input */}
          {showSearch && isOpen && (
            <div className="mt-2 px-1">
              <CustomInput
                placeholder="Search chats..."
                onStartIcon={<Search size={16} />}
                className="text-sm py-1.5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="mt-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2">
                  <Skeleton className="h-4 w-4 rounded" />
                  {isOpen && <Skeleton className="h-4 w-32" />}
                </div>
              ))}
            </div>
          ) : isError ? (
            <p className="text-center text-sm text-red-500 py-2">
              ⚠️ Failed to load repo history.
            </p>
          ) : repoHistory.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-2">
              {isOpen ? 'No repositories found.' : 'No repos'}
            </p>
          ) : (
            repoHistory.map((repo) => (
              <div
                key={repo.repoId}
                onClick={() => handleChatClick(repo)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200 h-9',
                  activeChatId === repo.repoId
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
                title={repo.repoName}
              >
                {isOpen ? (
                  <>
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate max-w-[150px] block">
                      {repo.repoName}
                    </span>
                  </>
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
