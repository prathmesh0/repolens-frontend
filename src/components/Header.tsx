'use client';

import { UserCircle, LogOut, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ThemeToggle } from './ThemeToggle';

import { useEffect, useState } from 'react';
import { useAppContext } from '@/providers/AppContextProvider';

interface IHeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function Header({ toggleSidebar, isMobile }: IHeaderProps) {
  const { handleLogout } = useAppContext();
  const [user, setUser] = useState<{ username: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error('Failed to parse user from localStorage');
      }
    }
  }, []);

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/60 backdrop-blur-md shadow-sm sticky top-0 z-10">
      {/* Left side: Name + Sidebar toggle */}
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-9 w-9 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md flex-shrink-0"
          >
            <Menu className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Button>
        )}

        <h2 className="font-semibold  text:lg md:text-xl tracking-wide text-primary hover:text-primary/80 transition-colors">
          Repolens
        </h2>
      </div>

      {/* Right side: Theme toggle + Profile */}
      <div className="flex items-center gap-3 md:gap-3 flex-shrink-0">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserCircle className="h-6 w-6 text-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-56 bg-card border border-border shadow-md rounded-lg"
          >
            <DropdownMenuLabel className="text-sm font-semibold text-primary">
              User Information
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {user ? (
              <>
                <DropdownMenuItem className="text-sm flex flex-col items-start">
                  <span className="font-medium text-foreground">
                    {user.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="text-sm text-muted-foreground">
                No user data
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive flex items-center gap-2 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
