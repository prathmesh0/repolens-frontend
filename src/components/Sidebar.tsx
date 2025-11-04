import { Assets } from '@/lib/Assets';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Plus,
  Search,
} from 'lucide-react';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';

import CustomInput from './CustomInput';
import { useRouter } from 'next/navigation';

interface ISidebar {
  isOpen: boolean;
  toggleSidebar: () => void;
}

function Sidebar({ isOpen, toggleSidebar }: ISidebar) {
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const router = useRouter();

  const chatHistory = [
    { id: 1, name: 'RepoLens Core API' },
    { id: 2, name: 'Frontend Refactor' },
    { id: 3, name: 'ML Integration' },
    { id: 4, name: 'RepoLens Core API' },
    { id: 5, name: 'Frontend Refactor' },
    { id: 6, name: 'ML Integration' },
    { id: 7, name: 'RepoLens Core API' },
    // { id: 8, name: 'Frontend Refactor' },
    // { id: 9, name: 'ML Integration' },
    // { id: 10, name: 'RepoLens Core API' },
    // { id: 11, name: 'Frontend Refactor' },
    // { id: 12, name: 'ML Integration' },
    // { id: 13, name: 'RepoLens Core API' },
    // { id: 14, name: 'Frontend Refactor' },
    // { id: 15, name: 'ML Integration' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'new') {
      router.push('/home');
    } else if (id === 'search') {
      setShowSearch((prev) => !prev);
    }
  };

  return (
    <aside
      className={cn(
        `fixed md:relative h-full bg-card border-r border-border transition-all duration-300 flex flex-col`,
        isOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Top section */}
      <div className="flex items-center justify-between px-2 h-[60.5px] border-b border-border bg-card sticky top-0 z-10">
        {isOpen ? (
          <Image
            src={Assets.LogoImg}
            alt="Repolens Logo"
            width={32}
            height={32}
            className="rounded"
          />
        ) : null}

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="hover:bg-muted"
        >
          {isOpen ? (
            <ChevronLeft className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          )}
        </Button>
      </div>
      {/* Navigation + Chat History */}
      <div className="p-3 flex-1 overflow-y-auto space-y-2">
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
              />
            </div>
          )}
        </div>

        {/* Chat History */}
        <div className="mt-3">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm transition-colors duration-200',
                activeChatId === chat.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              title={!isOpen ? chat.name : ''}
            >
              {isOpen ? (
                <>
                  <MessageSquare className="h-4 w-4" />
                  <span>{chat.name}</span>
                </>
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
