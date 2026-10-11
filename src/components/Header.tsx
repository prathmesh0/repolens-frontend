'use client';

import { LogOut, Menu } from 'lucide-react';
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

import { useAppContext } from '@/providers/AppContextProvider';
import { useMe } from '@/lib/useMe';

interface IHeaderProps {
  toggleSidebar: () => void;
  isMobile: boolean;
}

export default function Header({ toggleSidebar, isMobile }: IHeaderProps) {
  const { handleLogout } = useAppContext();
  const { data: user } = useMe();
  const initial = user?.username?.charAt(0).toUpperCase() || '?';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/70 px-3 backdrop-blur-xl sm:px-4">
      {/* Left: menu button (mobile) + wordmark (mobile, sidebar is hidden) */}
      <div className="flex min-w-0 items-center gap-2">
        {isMobile && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="shrink-0 text-muted-foreground"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="truncate text-[15px] font-semibold tracking-tight">
              Repolens
            </span>
          </>
        )}
      </div>

      {/* Right: theme + profile */}
      <div className="flex shrink-0 items-center gap-1.5">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Account"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary ring-1 ring-primary/25">
                {initial}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" sideOffset={8} className="w-60">
            <DropdownMenuLabel className="font-normal">
              {user ? (
                <div className="flex flex-col gap-0.5">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.username}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  No user data
                </span>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
              className="cursor-pointer gap-2 rounded-lg text-destructive focus:text-destructive"
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
